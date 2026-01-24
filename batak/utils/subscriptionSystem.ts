// Subscription Sistemi - iOS App Store In-App Purchase
// Product ID'ler App Store Connect'te oluşturulmalı

// ============================================
// SUBSCRIPTION PRODUCT ID'LERİ
// ============================================
export const SUBSCRIPTION_PRODUCTS = {
  ios: {
    weekly: '21890626', // Haftalık subscription
    monthly: '21890868', // Aylık subscription
  },
  android: {
    // Android ID'leri sonra eklenecek
    weekly: 'batakpro.premium.weekly',
    monthly: 'batakpro.premium.monthly',
  },
};

// Subscription fiyatları (gösterim için)
export const SUBSCRIPTION_PRICES = {
  weekly: {
    amount: 29.99,
    currency: '₺',
    period: 'hafta',
  },
  monthly: {
    amount: 49.99,
    currency: '₺',
    period: 'ay',
  },
};

// ============================================
// SUBSCRIPTION STATUS
// ============================================
export interface SubscriptionStatus {
  isSubscribed: boolean;
  productId: string | null;
  expiresAt: number | null;
  tier: 'weekly' | 'monthly' | null;
}

export const getSubscriptionStatus = (): SubscriptionStatus => {
  const stored = localStorage.getItem('batakSubscription');
  if (!stored) {
    return { isSubscribed: false, productId: null, expiresAt: null, tier: null };
  }
  
  const data = JSON.parse(stored);
  
  // Süre dolmuş mu kontrol et
  if (data.expiresAt && data.expiresAt < Date.now()) {
    // Subscription expired
    localStorage.removeItem('batakSubscription');
    return { isSubscribed: false, productId: null, expiresAt: null, tier: null };
  }
  
  return data;
};

export const setSubscriptionStatus = (
  productId: string,
  tier: 'weekly' | 'monthly',
  durationDays: number
): void => {
  const expiresAt = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
  const status: SubscriptionStatus = {
    isSubscribed: true,
    productId,
    expiresAt,
    tier,
  };
  localStorage.setItem('batakSubscription', JSON.stringify(status));
};

export const clearSubscription = (): void => {
  localStorage.removeItem('batakSubscription');
};

// ============================================
// IN-APP PURCHASE FUNCTIONS
// ============================================

// Platform kontrolü
const getPlatform = (): 'ios' | 'android' | 'web' => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'ios';
  }
  if (userAgent.includes('android')) {
    return 'android';
  }
  return 'web';
};

// Subscription Store hazır mı?
let storeReady = false;

export const initializeStore = async (): Promise<boolean> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    console.log('Store not available on web');
    return false;
  }
  
  try {
    // cordova-plugin-purchase kullanarak store'u başlat
    const { store } = await import('cordova-plugin-purchase');
    
    if (!store) {
      console.error('Store not available');
      return false;
    }
    
    // Ürünleri kaydet
    store.register([
      {
        id: SUBSCRIPTION_PRODUCTS[platform].weekly,
        type: store.PAID_SUBSCRIPTION,
      },
      {
        id: SUBSCRIPTION_PRODUCTS[platform].monthly,
        type: store.PAID_SUBSCRIPTION,
      },
    ]);
    
    // Satın alma onaylandığında
    store.when('product')
      .approved((product: any) => {
        console.log('Purchase approved:', product.id);
        product.verify();
      })
      .verified((product: any) => {
        console.log('Purchase verified:', product.id);
        
        // Subscription'ı aktif et
        const tier = product.id.includes('weekly') ? 'weekly' : 'monthly';
        const days = tier === 'weekly' ? 7 : 30;
        setSubscriptionStatus(product.id, tier, days);
        
        product.finish();
      })
      .cancelled((product: any) => {
        console.log('Purchase cancelled:', product.id);
      })
      .error((error: any) => {
        console.error('Purchase error:', error);
      });
    
    // Store'u güncelle
    await store.refresh();
    storeReady = true;
    
    console.log('Store initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize store:', error);
    return false;
  }
};

// Subscription satın al
export const purchaseSubscription = async (tier: 'weekly' | 'monthly'): Promise<boolean> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    console.error('Cannot purchase on web');
    return false;
  }
  
  if (!storeReady) {
    console.error('Store not ready');
    return false;
  }
  
  try {
    const { store } = await import('cordova-plugin-purchase');
    const productId = SUBSCRIPTION_PRODUCTS[platform][tier];
    
    console.log('Purchasing:', productId);
    store.order(productId);
    
    return true;
  } catch (error) {
    console.error('Purchase failed:', error);
    return false;
  }
};

// Satın alımları geri yükle
export const restorePurchases = async (): Promise<boolean> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return false;
  }
  
  try {
    const { store } = await import('cordova-plugin-purchase');
    await store.refresh();
    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    return false;
  }
};

// Ürün bilgilerini al
export const getProductInfo = async (tier: 'weekly' | 'monthly'): Promise<{
  price: string;
  title: string;
  description: string;
} | null> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    // Web için varsayılan fiyatları göster
    const priceInfo = SUBSCRIPTION_PRICES[tier];
    return {
      price: `${priceInfo.currency}${priceInfo.amount}/${priceInfo.period}`,
      title: `Batak Pro+ ${tier === 'weekly' ? 'Haftalık' : 'Aylık'}`,
      description: 'Reklamsız oyna, günlük bonus kazan!',
    };
  }
  
  try {
    const { store } = await import('cordova-plugin-purchase');
    const productId = SUBSCRIPTION_PRODUCTS[platform][tier];
    const product = store.get(productId);
    
    if (product) {
      return {
        price: product.price,
        title: product.title,
        description: product.description,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get product info:', error);
    return null;
  }
};

// ============================================
// PREMIUM ÖZELLİKLERİ
// ============================================

// Premium kullanıcı mı?
export const isPremiumUser = (): boolean => {
  const status = getSubscriptionStatus();
  return status.isSubscribed;
};

// Günlük Undo hakkı (Premium için)
export const getPremiumDailyUndos = (): number => {
  if (!isPremiumUser()) return 0;
  
  const today = new Date().toDateString();
  const stored = localStorage.getItem('batakPremiumDailyUndos');
  
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) {
      return data.remaining;
    }
  }
  
  // Yeni gün - 5 undo hakkı (Premium)
  const newData = { date: today, remaining: 5 };
  localStorage.setItem('batakPremiumDailyUndos', JSON.stringify(newData));
  return 3;
};

export const usePremiumUndo = (): boolean => {
  const remaining = getPremiumDailyUndos();
  if (remaining <= 0) return false;
  
  const today = new Date().toDateString();
  localStorage.setItem('batakPremiumDailyUndos', JSON.stringify({
    date: today,
    remaining: remaining - 1,
  }));
  
  return true;
};

// Günlük bonus coin (Premium için)
export const claimPremiumDailyCoins = (): number => {
  if (!isPremiumUser()) return 0;
  
  const today = new Date().toDateString();
  const stored = localStorage.getItem('batakPremiumDailyCoins');
  
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today && data.claimed) {
      return 0; // Bugün zaten alınmış
    }
  }
  
  // 500 coin ver (Premium)
  localStorage.setItem('batakPremiumDailyCoins', JSON.stringify({
    date: today,
    claimed: true,
  }));
  
  return 500;
};

export const canClaimPremiumDailyCoins = (): boolean => {
  if (!isPremiumUser()) return false;
  
  const today = new Date().toDateString();
  const stored = localStorage.getItem('batakPremiumDailyCoins');
  
  if (!stored) return true;
  
  const data = JSON.parse(stored);
  return data.date !== today || !data.claimed;
};
