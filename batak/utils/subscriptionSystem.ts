// ============================================
// SUBSCRIPTION SİSTEMİ - DEVRE DIŞI
// İlk release'de IAP olmadan gideceğiz
// Sonra App Store / Google Play entegrasyonu ile aktif edilecek
// ============================================

// Subscription fiyatları (gösterim için - ileride kullanılacak)
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
// SUBSCRIPTION STATUS - MOCK (Her zaman false döner)
// ============================================
export interface SubscriptionStatus {
  isSubscribed: boolean;
  productId: string | null;
  expiresAt: number | null;
  tier: 'weekly' | 'monthly' | null;
}

export const getSubscriptionStatus = (): SubscriptionStatus => {
  // IAP devre dışı - her zaman false döner
  return { isSubscribed: false, productId: null, expiresAt: null, tier: null };
};

// ============================================
// MOCK FUNCTIONS - Hiçbir şey yapmaz
// ============================================

export const initializeStore = async (): Promise<boolean> => {
  console.log('IAP disabled for initial release');
  return false;
};

export const purchaseSubscription = async (_tier: 'weekly' | 'monthly'): Promise<boolean> => {
  console.log('IAP disabled - purchase not available');
  return false;
};

export const restorePurchases = async (): Promise<boolean> => {
  console.log('IAP disabled - restore not available');
  return false;
};

export const getProductInfo = async (tier: 'weekly' | 'monthly'): Promise<{
  price: string;
  title: string;
  description: string;
} | null> => {
  const priceInfo = SUBSCRIPTION_PRICES[tier];
  return {
    price: `${priceInfo.currency}${priceInfo.amount}/${priceInfo.period}`,
    title: `Batak Pro+ ${tier === 'weekly' ? 'Haftalık' : 'Aylık'}`,
    description: 'Reklamsız oyna, günlük bonus kazan!',
  };
};

// Premium kullanıcı mı? - Her zaman false
export const isPremiumUser = (): boolean => {
  return false;
};

// Günlük Undo hakkı - Premium olmadığı için 0
export const getPremiumDailyUndos = (): number => {
  return 0;
};

export const usePremiumUndo = (): boolean => {
  return false;
};

// Günlük bonus coin - Premium olmadığı için 0
export const claimPremiumDailyCoins = (): number => {
  return 0;
};

export const canClaimPremiumDailyCoins = (): boolean => {
  return false;
};

// ============================================
// ORIJINAL KOD - YORUM SATIRINDA (İLERİDE AKTİF EDİLECEK)
// ============================================

/*
// SUBSCRIPTION PRODUCT ID'LERİ
export const SUBSCRIPTION_PRODUCTS = {
  ios: {
    weekly: '21890626', // Haftalık subscription
    monthly: '21890868', // Aylık subscription
  },
  android: {
    weekly: 'batakpro.premium.weekly',
    monthly: 'batakpro.premium.monthly',
  },
};

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

export const initializeStore_ORIGINAL = async (): Promise<boolean> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    console.log('Store not available on web');
    return false;
  }
  
  try {
    // cordova-plugin-purchase kullanarak store'u başlat
    // @ts-ignore - Dynamic import için
    const storeModule = await import('cordova-plugin-purchase').catch(() => null);
    
    if (!storeModule || !storeModule.store) {
      console.warn('Store module not available - IAP disabled');
      return false;
    }
    
    const { store } = storeModule;
    
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
        setSubscriptionStatus_ORIGINAL(product.id, tier, days);
        
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

export const setSubscriptionStatus_ORIGINAL = (
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
*/
