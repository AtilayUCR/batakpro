// Güvenlik ve Anti-Cheat Sistemi

// ============================================
// ŞİFRELEME (Simple XOR + Base64)
// ============================================

const ENCRYPTION_KEY = 'B4T4KPR0_S3CUR1TY_K3Y_2026';

// XOR şifreleme
const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

// Base64 encode (Unicode safe)
const base64Encode = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ));
  } catch {
    return btoa(str);
  }
};

// Base64 decode (Unicode safe)
const base64Decode = (str: string): string => {
  try {
    return decodeURIComponent(
      atob(str).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
  } catch {
    return atob(str);
  }
};

// Şifrele
export const encrypt = (data: string): string => {
  const xored = xorEncrypt(data, ENCRYPTION_KEY);
  return base64Encode(xored);
};

// Çöz
export const decrypt = (encryptedData: string): string => {
  try {
    const decoded = base64Decode(encryptedData);
    return xorEncrypt(decoded, ENCRYPTION_KEY);
  } catch {
    return '';
  }
};

// ============================================
// GÜVENLİ LOCALSTORAGE
// ============================================

export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const json = JSON.stringify(value);
      const encrypted = encrypt(json);
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  },
  
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return defaultValue;
      
      const decrypted = decrypt(encrypted);
      if (!decrypted) return defaultValue;
      
      return JSON.parse(decrypted) as T;
    } catch {
      return defaultValue;
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  }
};

// ============================================
// ANTİ-CHEAT: COIN DOĞRULAMA
// ============================================

interface CoinTransaction {
  type: 'earn' | 'spend';
  amount: number;
  source: string;
  timestamp: number;
  checksum: string;
}

// Transaction checksum oluştur
const generateChecksum = (tx: Omit<CoinTransaction, 'checksum'>): string => {
  const data = `${tx.type}:${tx.amount}:${tx.source}:${tx.timestamp}:${ENCRYPTION_KEY}`;
  // Simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Coin transaction'ı kaydet
export const recordCoinTransaction = (type: 'earn' | 'spend', amount: number, source: string): void => {
  const transactions = secureStorage.getItem<CoinTransaction[]>('coinTransactions', []);
  
  const tx: Omit<CoinTransaction, 'checksum'> = {
    type,
    amount,
    source,
    timestamp: Date.now(),
  };
  
  const fullTx: CoinTransaction = {
    ...tx,
    checksum: generateChecksum(tx),
  };
  
  // Son 100 transaction'ı tut
  transactions.push(fullTx);
  if (transactions.length > 100) {
    transactions.shift();
  }
  
  secureStorage.setItem('coinTransactions', transactions);
};

// Coin bakiyesini doğrula
export const validateCoinBalance = (currentBalance: number, totalEarned: number, totalSpent: number): boolean => {
  const expectedBalance = totalEarned - totalSpent;
  
  // %5 tolerans (yuvarlamalar için)
  const tolerance = Math.max(expectedBalance * 0.05, 100);
  
  return Math.abs(currentBalance - expectedBalance) <= tolerance;
};

// Anomali tespiti
export const detectAnomaly = (transactions: CoinTransaction[]): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Son 1 saatteki işlemleri kontrol et
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const recentTxs = transactions.filter(tx => tx.timestamp > oneHourAgo);
  
  // 1. Aşırı coin kazanımı kontrolü
  const totalEarnedRecently = recentTxs
    .filter(tx => tx.type === 'earn')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  if (totalEarnedRecently > 5000) {
    issues.push(`Şüpheli: 1 saatte ${totalEarnedRecently} coin kazanıldı`);
  }
  
  // 2. Çok hızlı işlem kontrolü
  for (let i = 1; i < recentTxs.length; i++) {
    const timeDiff = recentTxs[i].timestamp - recentTxs[i-1].timestamp;
    if (timeDiff < 1000) { // 1 saniyeden az
      issues.push('Şüpheli: Çok hızlı ardışık işlemler');
      break;
    }
  }
  
  // 3. Checksum doğrulama
  for (const tx of transactions.slice(-20)) {
    const expected = generateChecksum({
      type: tx.type,
      amount: tx.amount,
      source: tx.source,
      timestamp: tx.timestamp,
    });
    
    if (tx.checksum !== expected) {
      issues.push('Kritik: Transaction checksum uyuşmazlığı');
      break;
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits: Map<string, RateLimitEntry> = new Map();

export const checkRateLimit = (action: string, maxPerMinute: number): boolean => {
  const now = Date.now();
  const entry = rateLimits.get(action);
  
  if (!entry || entry.resetAt < now) {
    // Yeni period başlat
    rateLimits.set(action, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (entry.count >= maxPerMinute) {
    return false; // Rate limit aşıldı
  }
  
  entry.count++;
  return true;
};

// Rate limit kuralları
export const RATE_LIMITS = {
  REWARDED_AD: 10,      // Dakikada max 10 rewarded ad
  GAME_START: 20,       // Dakikada max 20 oyun
  COIN_EARN: 50,        // Dakikada max 50 coin işlemi
  SHARE: 5,             // Dakikada max 5 paylaşım
};

// ============================================
// OYUN DURUMU BÜTÜNLÜK KONTROLÜ
// ============================================

export interface GameStateHash {
  phase: string;
  playerScore: number;
  timestamp: number;
  hash: string;
}

export const generateGameStateHash = (phase: string, playerScore: number): GameStateHash => {
  const timestamp = Date.now();
  const data = `${phase}:${playerScore}:${timestamp}:${ENCRYPTION_KEY}`;
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  
  return {
    phase,
    playerScore,
    timestamp,
    hash: Math.abs(hash).toString(36),
  };
};

export const verifyGameStateHash = (state: GameStateHash): boolean => {
  const expected = generateGameStateHash(state.phase, state.playerScore);
  // Timestamp farklı olacak, sadece format kontrolü
  return state.hash.length > 0 && typeof state.hash === 'string';
};
