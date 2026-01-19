// Lokal Liderlik Tablosu Sistemi

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  score: number;
  wins: number;
  games: number;
  level: number;
  date: string;
}

export interface Leaderboard {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
  lastUpdated: string;
}

const STORAGE_KEY = 'batakLeaderboard';

// Boş liderlik tablosu
const emptyLeaderboard = (): Leaderboard => ({
  daily: [],
  weekly: [],
  allTime: [],
  lastUpdated: new Date().toISOString(),
});

// Liderlik tablosunu yükle
export const loadLeaderboard = (): Leaderboard => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyLeaderboard();
    
    const leaderboard = JSON.parse(saved) as Leaderboard;
    
    // Günlük ve haftalık sıfırlama kontrolü
    const now = new Date();
    const lastUpdated = new Date(leaderboard.lastUpdated);
    
    // Günlük sıfırlama (gece yarısı)
    if (now.toDateString() !== lastUpdated.toDateString()) {
      leaderboard.daily = [];
    }
    
    // Haftalık sıfırlama (pazartesi)
    const getWeekNumber = (d: Date) => {
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    };
    
    if (getWeekNumber(now) !== getWeekNumber(lastUpdated) || now.getFullYear() !== lastUpdated.getFullYear()) {
      leaderboard.weekly = [];
    }
    
    leaderboard.lastUpdated = now.toISOString();
    saveLeaderboard(leaderboard);
    
    return leaderboard;
  } catch {
    return emptyLeaderboard();
  }
};

// Liderlik tablosunu kaydet
export const saveLeaderboard = (leaderboard: Leaderboard): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
  } catch {
    console.warn('Liderlik tablosu kaydedilemedi');
  }
};

// Skor ekle/güncelle
export const updateLeaderboard = (
  username: string,
  avatar: string,
  stats: {
    score: number;
    wins: number;
    games: number;
    level: number;
  }
): Leaderboard => {
  const leaderboard = loadLeaderboard();
  
  const entry: LeaderboardEntry = {
    id: `player_${username.toLowerCase().replace(/\s/g, '_')}`,
    username,
    avatar,
    score: stats.score,
    wins: stats.wins,
    games: stats.games,
    level: stats.level,
    date: new Date().toISOString(),
  };
  
  // Her liste için güncelle
  ['daily', 'weekly', 'allTime'].forEach((period) => {
    const list = leaderboard[period as keyof Pick<Leaderboard, 'daily' | 'weekly' | 'allTime'>];
    const existingIndex = list.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      // Mevcut kayıt varsa güncelle
      list[existingIndex] = entry;
    } else {
      // Yeni kayıt ekle
      list.push(entry);
    }
    
    // Skora göre sırala ve ilk 100'ü tut
    list.sort((a, b) => b.score - a.score);
    if (list.length > 100) {
      list.splice(100);
    }
  });
  
  saveLeaderboard(leaderboard);
  return leaderboard;
};

// Sıralama al
export const getPlayerRank = (
  leaderboard: Leaderboard,
  playerId: string,
  period: 'daily' | 'weekly' | 'allTime'
): number => {
  const list = leaderboard[period];
  const index = list.findIndex(e => e.id === playerId);
  return index >= 0 ? index + 1 : -1;
};

// En iyi oyuncuları al
export const getTopPlayers = (
  leaderboard: Leaderboard,
  period: 'daily' | 'weekly' | 'allTime',
  count: number = 10
): LeaderboardEntry[] => {
  return leaderboard[period].slice(0, count);
};

// Bot skorları ekle (daha gerçekçi liderlik tablosu için)
export const populateWithBots = (leaderboard: Leaderboard): Leaderboard => {
  const botNames = [
    { name: 'Ahmet Usta', avatar: '👴', level: 45, wins: 892 },
    { name: 'Zeynep', avatar: '👩', level: 38, wins: 654 },
    { name: 'Mehmet Bey', avatar: '🧔', level: 52, wins: 1203 },
    { name: 'Fatma Hanım', avatar: '👵', level: 33, wins: 445 },
    { name: 'Kaan', avatar: '😎', level: 28, wins: 321 },
    { name: 'Elif', avatar: '👩‍🦰', level: 41, wins: 756 },
    { name: 'Burak', avatar: '🧑', level: 35, wins: 512 },
    { name: 'Seda', avatar: '👱‍♀️', level: 29, wins: 287 },
    { name: 'Oğuz', avatar: '🧔‍♂️', level: 47, wins: 934 },
    { name: 'Melis', avatar: '👩‍🦱', level: 31, wins: 398 },
  ];
  
  botNames.forEach(bot => {
    const entry: LeaderboardEntry = {
      id: `bot_${bot.name.toLowerCase().replace(/\s/g, '_')}`,
      username: bot.name,
      avatar: bot.avatar,
      score: bot.wins * 10 + bot.level * 100,
      wins: bot.wins,
      games: Math.floor(bot.wins * 1.8),
      level: bot.level,
      date: new Date().toISOString(),
    };
    
    // Sadece allTime'a ekle
    const existing = leaderboard.allTime.findIndex(e => e.id === entry.id);
    if (existing < 0) {
      leaderboard.allTime.push(entry);
    }
  });
  
  leaderboard.allTime.sort((a, b) => b.score - a.score);
  saveLeaderboard(leaderboard);
  
  return leaderboard;
};

