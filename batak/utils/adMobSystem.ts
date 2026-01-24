// AdMob Gelişmiş Reklam Sistemi
import { 
  AdMob, 
  AdMobRewardItem, 
  RewardAdPluginEvents, 
  InterstitialAdPluginEvents,
  BannerAdPluginEvents,
  BannerAdSize,
  BannerAdPosition,
  AdMobBannerSize
} from '@capacitor-community/admob';

// TrackingAuthorizationStatus - iOS ATT için
enum TrackingAuthorizationStatus {
  notDetermined = 0,
  restricted = 1,
  denied = 2,
  authorized = 3,
}

// ============================================
// AD UNIT ID'LERİ - PRODUCTION
// ============================================
const AD_CONFIG = {
  ios: {
    banner: 'ca-app-pub-1248849491784311/1974413218',
    rewarded: 'ca-app-pub-1248849491784311/5131893747',
    interstitial: 'ca-app-pub-1248849491784311/9661331545',
    native: 'ca-app-pub-1248849491784311/7154571796',
  },
  android: {
    banner: 'ca-app-pub-1248849491784311/4377640305',
    rewarded: 'ca-app-pub-1248849491784311/1770005876',
    interstitial: 'ca-app-pub-1248849491784311/2779835214',
    native: 'ca-app-pub-1248849491784311/1714165556',
  },
};

// Platform belirleme
const getPlatform = (): 'ios' | 'android' => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'ios';
  }
  return 'android';
};

// ============================================
// REKLAMSIZ SÜRE YÖNETİMİ
// ============================================
interface AdFreeStatus {
  isAdFree: boolean;
  expiresAt: number | null; // timestamp
  isPremium: boolean;
}

export const getAdFreeStatus = (): AdFreeStatus => {
  // 1. Subscription kontrolü (App Store / Google Play satın alımları)
  const subscriptionData = localStorage.getItem('batakSubscription');
  if (subscriptionData) {
    const subscription = JSON.parse(subscriptionData);
    if (subscription.isSubscribed && (!subscription.expiresAt || subscription.expiresAt > Date.now())) {
      return { isAdFree: true, expiresAt: subscription.expiresAt, isPremium: true };
    }
  }
  
  // 2. Premium kontrolü (eski sistem)
  const premiumData = localStorage.getItem('batakPremium');
  if (premiumData) {
    const premium = JSON.parse(premiumData);
    if (premium.active && (!premium.expiresAt || premium.expiresAt > Date.now())) {
      return { isAdFree: true, expiresAt: premium.expiresAt, isPremium: true };
    }
  }
  
  // 3. Geçici reklamsız süre kontrolü (coin ile satın alınan)
  const adFreeData = localStorage.getItem('batakAdFree');
  if (adFreeData) {
    const adFree = JSON.parse(adFreeData);
    if (adFree.expiresAt > Date.now()) {
      return { isAdFree: true, expiresAt: adFree.expiresAt, isPremium: false };
    }
  }
  
  return { isAdFree: false, expiresAt: null, isPremium: false };
};

export const setAdFreeTime = (minutes: number): void => {
  const expiresAt = Date.now() + (minutes * 60 * 1000);
  localStorage.setItem('batakAdFree', JSON.stringify({ expiresAt }));
};

export const getRemainingAdFreeTime = (): number => {
  const status = getAdFreeStatus();
  if (!status.isAdFree || !status.expiresAt) return 0;
  return Math.max(0, Math.floor((status.expiresAt - Date.now()) / 1000));
};

export const formatRemainingTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Coin ile reklamsız satın alma
export const AD_FREE_PACKAGES = [
  { id: 'mini', duration: 60, coins: 3000, label: '1 Saat' },
  { id: 'standard', duration: 1440, coins: 15000, label: '1 Gün' },
  { id: 'mega', duration: 10080, coins: 80000, label: '1 Hafta' },
];

export const purchaseAdFreeWithCoins = (
  currentCoins: number, 
  packageId: string
): { success: boolean; newCoins: number; duration: number } => {
  const pkg = AD_FREE_PACKAGES.find(p => p.id === packageId);
  if (!pkg || currentCoins < pkg.coins) {
    return { success: false, newCoins: currentCoins, duration: 0 };
  }
  
  setAdFreeTime(pkg.duration);
  return { 
    success: true, 
    newCoins: currentCoins - pkg.coins, 
    duration: pkg.duration 
  };
};

// ============================================
// ATT (App Tracking Transparency) - iOS 14.5+
// ============================================
export const requestTrackingAuthorization = async (): Promise<boolean> => {
  const platform = getPlatform();
  
  // Sadece iOS'ta gerekli
  if (platform !== 'ios') {
    return true;
  }
  
  try {
    const status = await AdMob.trackingAuthorizationStatus();
    
    // Zaten izin verilmiş
    if (status.status === TrackingAuthorizationStatus.authorized) {
      console.log('Tracking already authorized');
      return true;
    }
    
    // Henüz sorulmamış - izin iste
    if (status.status === TrackingAuthorizationStatus.notDetermined) {
      const result = await AdMob.requestTrackingAuthorization();
      console.log('Tracking authorization result:', result.status);
      return result.status === TrackingAuthorizationStatus.authorized;
    }
    
    // Reddedilmiş veya kısıtlı - yine de reklam göster (non-personalized)
    console.log('Tracking not authorized, will show non-personalized ads');
    return false;
  } catch (error) {
    console.error('Failed to request tracking authorization:', error);
    return false;
  }
};

// ============================================
// ADMOB BAŞLATMA
// ============================================
let isInitialized = false;

export const initializeAdMob = async (): Promise<boolean> => {
  if (isInitialized) return true;
  
  try {
    const platform = getPlatform();
    
    // iOS'ta önce ATT izni iste
    if (platform === 'ios') {
      await requestTrackingAuthorization();
    }
    
    await AdMob.initialize({
      // Production mode - tüm platformlar için gerçek reklamlar
      initializeForTesting: false,
    });
    isInitialized = true;
    console.log('AdMob initialized successfully (PRODUCTION)');
    return true;
  } catch (error) {
    console.error('AdMob initialization failed:', error);
    return false;
  }
};

// ============================================
// BANNER ADS
// ============================================
let isBannerShowing = false;

export const showBannerAd = async (): Promise<boolean> => {
  // Reklamsız mı kontrol et
  if (getAdFreeStatus().isAdFree) {
    console.log('User is ad-free, skipping banner');
    return false;
  }
  
  if (isBannerShowing) return true;
  
  try {
    const platform = getPlatform();
    
    await AdMob.showBanner({
      adId: AD_CONFIG[platform].banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false, // Production mode
    });
    
    isBannerShowing = true;
    console.log('Banner ad shown');
    return true;
  } catch (error) {
    console.error('Failed to show banner ad:', error);
    return false;
  }
};

export const hideBannerAd = async (): Promise<void> => {
  if (!isBannerShowing) return;
  
  try {
    await AdMob.hideBanner();
    isBannerShowing = false;
    console.log('Banner ad hidden');
  } catch (error) {
    console.error('Failed to hide banner ad:', error);
  }
};

export const removeBannerAd = async (): Promise<void> => {
  try {
    await AdMob.removeBanner();
    isBannerShowing = false;
  } catch (error) {
    console.error('Failed to remove banner ad:', error);
  }
};

// ============================================
// REWARDED ADS
// ============================================
export const prepareRewardedAd = async (): Promise<boolean> => {
  try {
    const platform = getPlatform();
    await AdMob.prepareRewardVideoAd({
      adId: AD_CONFIG[platform].rewarded,
      isTesting: false, // Production mode
    });
    return true;
  } catch (error) {
    console.error('Failed to prepare rewarded ad:', error);
    return false;
  }
};

export const showRewardedAd = async (onReward: (reward: number) => void): Promise<boolean> => {
  // Reklamsız mı kontrol et - Rewarded her zaman izlenebilir (ödül için)
  
  try {
    const rewardListener = AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
      console.log('User earned reward:', reward);
      onReward(reward.amount || 50);
      rewardListener.remove();
    });

    const failedListener = AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
      console.error('Rewarded ad failed to show');
      failedListener.remove();
    });

    const dismissedListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      console.log('Rewarded ad dismissed');
      dismissedListener.remove();
      prepareRewardedAd(); // Yeni reklam hazırla
    });

    await AdMob.showRewardVideoAd();
    return true;
  } catch (error) {
    console.error('Failed to show rewarded ad:', error);
    prepareRewardedAd();
    return false;
  }
};

// ============================================
// INTERSTITIAL ADS
// ============================================
export const prepareInterstitialAd = async (): Promise<boolean> => {
  try {
    const platform = getPlatform();
    await AdMob.prepareInterstitial({
      adId: AD_CONFIG[platform].interstitial,
      isTesting: false, // Production mode
    });
    return true;
  } catch (error) {
    console.error('Failed to prepare interstitial ad:', error);
    return false;
  }
};

export const showInterstitialAd = async (): Promise<boolean> => {
  // Reklamsız mı kontrol et
  if (getAdFreeStatus().isAdFree) {
    console.log('User is ad-free, skipping interstitial');
    return false;
  }
  
  try {
    const dismissedListener = AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      console.log('Interstitial ad dismissed');
      dismissedListener.remove();
      prepareInterstitialAd(); // Yeni reklam hazırla
    });

    const failedListener = AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
      console.error('Interstitial ad failed to show');
      failedListener.remove();
    });

    await AdMob.showInterstitial();
    return true;
  } catch (error) {
    console.error('Failed to show interstitial ad:', error);
    prepareInterstitialAd();
    return false;
  }
};

// ============================================
// INTERSTITIAL ZAMANLAMA (Artan Sıklık)
// ============================================
interface InterstitialState {
  gameCount: number;
  lastShownAt: number;
  showAtGames: number[]; // Hangi oyunlarda gösterilecek
}

const INTERSTITIAL_SCHEDULE = [3, 5, 7, 9, 11, 13, 15, 17, 19]; // Sonra her 2'de bir

const getInterstitialState = (): InterstitialState => {
  const stored = localStorage.getItem('batakInterstitialState');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    gameCount: 0,
    lastShownAt: 0,
    showAtGames: INTERSTITIAL_SCHEDULE,
  };
};

const saveInterstitialState = (state: InterstitialState): void => {
  localStorage.setItem('batakInterstitialState', JSON.stringify(state));
};

export const incrementGameCount = (): void => {
  const state = getInterstitialState();
  state.gameCount += 1;
  saveInterstitialState(state);
};

export const shouldShowInterstitialAd = (didWin: boolean): boolean => {
  // Sadece kazandığında göster (kaybedince kullanıcı zaten sinirli)
  if (!didWin) return false;
  
  // Reklamsız mı kontrol et
  if (getAdFreeStatus().isAdFree) return false;
  
  const state = getInterstitialState();
  const gameNum = state.gameCount;
  
  // Programda var mı?
  if (state.showAtGames.includes(gameNum)) {
    return true;
  }
  
  // 19'dan sonra her 2 oyunda bir
  if (gameNum > 19 && gameNum % 2 === 1) {
    return true;
  }
  
  return false;
};

export const markInterstitialShown = (): void => {
  const state = getInterstitialState();
  state.lastShownAt = Date.now();
  saveInterstitialState(state);
};

// ============================================
// GÜNLÜK REKLAM LİMİTLERİ
// ============================================
const MAX_REWARDED_ADS_PER_DAY = 15;
const MAX_INTERSTITIAL_ADS_PER_DAY = 20;

interface DailyAdCounts {
  date: string;
  rewarded: number;
  interstitial: number;
}

const getDailyAdCounts = (): DailyAdCounts => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('batakDailyAdCounts');
  
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) {
      return data;
    }
  }
  
  return { date: today, rewarded: 0, interstitial: 0 };
};

const saveDailyAdCounts = (counts: DailyAdCounts): void => {
  localStorage.setItem('batakDailyAdCounts', JSON.stringify(counts));
};

export const canWatchRewardedAd = (): boolean => {
  const counts = getDailyAdCounts();
  return counts.rewarded < MAX_REWARDED_ADS_PER_DAY;
};

export const incrementRewardedAdCount = (): void => {
  const counts = getDailyAdCounts();
  counts.rewarded += 1;
  saveDailyAdCounts(counts);
};

export const getRemainingRewardedAds = (): number => {
  const counts = getDailyAdCounts();
  return Math.max(0, MAX_REWARDED_ADS_PER_DAY - counts.rewarded);
};

export const canShowInterstitialAd = (): boolean => {
  const counts = getDailyAdCounts();
  return counts.interstitial < MAX_INTERSTITIAL_ADS_PER_DAY;
};

export const incrementInterstitialAdCount = (): void => {
  const counts = getDailyAdCounts();
  counts.interstitial += 1;
  saveDailyAdCounts(counts);
};

// ============================================
// FIRST-TIME USER EXPERIENCE
// ============================================
export const isFirstTimeUser = (): boolean => {
  return !localStorage.getItem('batakFirstAdSeen');
};

export const markFirstAdSeen = (): void => {
  localStorage.setItem('batakFirstAdSeen', 'true');
};

// İlk 3 oyunda reklam gösterme
export const shouldSkipAdsForNewUser = (): boolean => {
  const state = getInterstitialState();
  return state.gameCount < 3;
};

// ============================================
// GÜNÜN İLK OYUNU BONUSU
// ============================================
export const isFirstGameOfDay = (): boolean => {
  const today = new Date().toDateString();
  const lastPlayDate = localStorage.getItem('batakLastPlayDate');
  return lastPlayDate !== today;
};

export const markDayPlayed = (): void => {
  const today = new Date().toDateString();
  localStorage.setItem('batakLastPlayDate', today);
};

export const claimFirstGameBonus = (): boolean => {
  if (!isFirstGameOfDay()) return false;
  
  markDayPlayed();
  setAdFreeTime(15); // 15 dk reklamsız
  return true;
};

// ============================================
// PREMIUM SUBSCRIPTION
// ============================================
export interface PremiumStatus {
  active: boolean;
  expiresAt: number | null;
  tier: 'weekly' | 'monthly' | 'yearly' | 'lifetime' | null;
}

export const getPremiumStatus = (): PremiumStatus => {
  const stored = localStorage.getItem('batakPremium');
  if (!stored) {
    return { active: false, expiresAt: null, tier: null };
  }
  
  const data = JSON.parse(stored);
  
  // Süre dolmuş mu?
  if (data.expiresAt && data.expiresAt < Date.now()) {
    return { active: false, expiresAt: null, tier: null };
  }
  
  return data;
};

export const setPremiumStatus = (tier: PremiumStatus['tier'], durationDays: number | null): void => {
  const expiresAt = durationDays ? Date.now() + (durationDays * 24 * 60 * 60 * 1000) : null;
  localStorage.setItem('batakPremium', JSON.stringify({
    active: true,
    expiresAt,
    tier,
  }));
};

// Premium günlük Undo hakkı
export const getPremiumDailyUndos = (): number => {
  const premium = getPremiumStatus();
  if (!premium.active) return 0;
  
  const today = new Date().toDateString();
  const stored = localStorage.getItem('batakPremiumUndos');
  
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) {
      return data.remaining;
    }
  }
  
  // Yeni gün, 3 undo ver
  const newData = { date: today, remaining: 3 };
  localStorage.setItem('batakPremiumUndos', JSON.stringify(newData));
  return 3;
};

export const usePremiumUndo = (): boolean => {
  const remaining = getPremiumDailyUndos();
  if (remaining <= 0) return false;
  
  const today = new Date().toDateString();
  localStorage.setItem('batakPremiumUndos', JSON.stringify({
    date: today,
    remaining: remaining - 1,
  }));
  return true;
};
