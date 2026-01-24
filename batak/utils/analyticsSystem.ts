// Firebase Analytics Sistemi
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { GameMode, Difficulty, Suit } from '../types';

// ============================================
// ANALYTICS BAŞLATMA
// ============================================
let isInitialized = false;

export const initializeAnalytics = async (): Promise<boolean> => {
  if (isInitialized) return true;
  
  try {
    await FirebaseAnalytics.setEnabled({ enabled: true });
    isInitialized = true;
    console.log('Firebase Analytics initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
    return false;
  }
};

// ============================================
// USER PROPERTIES
// ============================================
export const setUserProperties = async (props: {
  userId?: string;
  level?: number;
  totalGames?: number;
  isPremium?: boolean;
}): Promise<void> => {
  try {
    if (props.userId) {
      await FirebaseAnalytics.setUserId({ userId: props.userId });
    }
    if (props.level !== undefined) {
      await FirebaseAnalytics.setUserProperty({ key: 'player_level', value: String(props.level) });
    }
    if (props.totalGames !== undefined) {
      await FirebaseAnalytics.setUserProperty({ key: 'total_games', value: String(props.totalGames) });
    }
    if (props.isPremium !== undefined) {
      await FirebaseAnalytics.setUserProperty({ key: 'is_premium', value: props.isPremium ? 'true' : 'false' });
    }
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
};

// ============================================
// OYUN EVENT'LERİ
// ============================================

// Oyun başladığında
export const logGameStart = async (params: {
  mode: GameMode;
  difficulty: Difficulty;
  trumpSuit?: Suit;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'game_start',
      params: {
        game_mode: params.mode,
        difficulty: params.difficulty,
        trump_suit: params.trumpSuit || 'none',
      },
    });
  } catch (error) {
    console.error('Failed to log game_start:', error);
  }
};

// Oyun bittiğinde
export const logGameEnd = async (params: {
  mode: GameMode;
  result: 'win' | 'lose';
  coinsEarned: number;
  durationSeconds: number;
  tricksWon: number;
  bid?: number;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'game_end',
      params: {
        game_mode: params.mode,
        result: params.result,
        coins_earned: params.coinsEarned,
        duration_seconds: params.durationSeconds,
        tricks_won: params.tricksWon,
        bid: params.bid || 0,
      },
    });
  } catch (error) {
    console.error('Failed to log game_end:', error);
  }
};

// İhale verildiğinde
export const logBidMade = async (params: {
  mode: GameMode;
  bidValue: number;
  playerType: 'user' | 'bot';
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'bid_made',
      params: {
        game_mode: params.mode,
        bid_value: params.bidValue,
        player_type: params.playerType,
      },
    });
  } catch (error) {
    console.error('Failed to log bid_made:', error);
  }
};

// ============================================
// REKLAM EVENT'LERİ
// ============================================

// Ödüllü reklam izlendiğinde
export const logRewardedAdWatched = async (params: {
  rewardType: 'adfree30' | 'coins100' | 'coins200' | 'double';
  coinsEarned?: number;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'ad_rewarded_watched',
      params: {
        reward_type: params.rewardType,
        coins_earned: params.coinsEarned || 0,
      },
    });
  } catch (error) {
    console.error('Failed to log ad_rewarded_watched:', error);
  }
};

// Interstitial gösterildiğinde
export const logInterstitialShown = async (gameCount: number): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'ad_interstitial_shown',
      params: {
        game_count: gameCount,
      },
    });
  } catch (error) {
    console.error('Failed to log ad_interstitial_shown:', error);
  }
};

// Banner görüntülendiğinde
export const logBannerImpression = async (): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'ad_banner_impression',
      params: {},
    });
  } catch (error) {
    console.error('Failed to log ad_banner_impression:', error);
  }
};

// ============================================
// SATIN ALMA EVENT'LERİ
// ============================================

// Satın alma başladığında
export const logPurchaseStarted = async (productId: string): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'purchase_started',
      params: {
        product_id: productId,
      },
    });
  } catch (error) {
    console.error('Failed to log purchase_started:', error);
  }
};

// Satın alma tamamlandığında
export const logPurchaseCompleted = async (params: {
  productId: string;
  price: number;
  currency: string;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'purchase',
      params: {
        product_id: params.productId,
        value: params.price,
        currency: params.currency,
      },
    });
  } catch (error) {
    console.error('Failed to log purchase:', error);
  }
};

// ============================================
// KULLANICI AKSİYONLARI
// ============================================

// Günlük ödül alındığında
export const logDailyRewardClaimed = async (params: {
  streakDay: number;
  rewardCoins: number;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'daily_reward_claimed',
      params: {
        streak_day: params.streakDay,
        reward_coins: params.rewardCoins,
      },
    });
  } catch (error) {
    console.error('Failed to log daily_reward_claimed:', error);
  }
};

// Seviye atlandığında
export const logLevelUp = async (params: {
  newLevel: number;
  xpEarned: number;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'level_up',
      params: {
        new_level: params.newLevel,
        xp_earned: params.xpEarned,
      },
    });
  } catch (error) {
    console.error('Failed to log level_up:', error);
  }
};

// Onboarding tamamlandığında
export const logOnboardingCompleted = async (): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'tutorial_complete',
      params: {},
    });
  } catch (error) {
    console.error('Failed to log tutorial_complete:', error);
  }
};

// İlk oyun açılışı
export const logFirstOpen = async (): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'first_open',
      params: {},
    });
  } catch (error) {
    console.error('Failed to log first_open:', error);
  }
};

// Ekran görüntüleme
export const logScreenView = async (screenName: string): Promise<void> => {
  try {
    await FirebaseAnalytics.setCurrentScreen({
      screenName,
      screenClassOverride: screenName,
    });
  } catch (error) {
    console.error('Failed to log screen_view:', error);
  }
};

// ============================================
// OYUN MODU İSTATİSTİKLERİ
// ============================================

// Her mod için ayrı event (count every)
export const logGameModePlay = async (mode: GameMode): Promise<void> => {
  try {
    // Genel event
    await FirebaseAnalytics.logEvent({
      name: 'game_mode_played',
      params: {
        mode: mode,
      },
    });
    
    // Mod bazlı spesifik event (daha detaylı analiz için)
    const modeEventName = `play_${mode.toLowerCase().replace(/_/g, '_')}`;
    await FirebaseAnalytics.logEvent({
      name: modeEventName,
      params: {},
    });
  } catch (error) {
    console.error('Failed to log game_mode_play:', error);
  }
};

// Koz seçimi istatistiği
export const logTrumpSelected = async (suit: Suit, mode: GameMode): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'trump_selected',
      params: {
        trump_suit: suit,
        game_mode: mode,
      },
    });
  } catch (error) {
    console.error('Failed to log trump_selected:', error);
  }
};

// ============================================
// ENGAGEMENT EVENT'LERİ
// ============================================

// Oturum süresi
export const logSessionDuration = async (durationMinutes: number): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'session_duration',
      params: {
        duration_minutes: durationMinutes,
      },
    });
  } catch (error) {
    console.error('Failed to log session_duration:', error);
  }
};

// Ayar değişikliği
export const logSettingChanged = async (settingName: string, newValue: string): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'setting_changed',
      params: {
        setting_name: settingName,
        new_value: newValue,
      },
    });
  } catch (error) {
    console.error('Failed to log setting_changed:', error);
  }
};

// Coin harcama
export const logCoinSpent = async (params: {
  amount: number;
  itemType: string;
  itemId: string;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'spend_virtual_currency',
      params: {
        value: params.amount,
        virtual_currency_name: 'coins',
        item_name: params.itemType,
      },
    });
  } catch (error) {
    console.error('Failed to log spend_virtual_currency:', error);
  }
};

// Coin kazanma
export const logCoinEarned = async (params: {
  amount: number;
  source: 'game_win' | 'daily_reward' | 'rewarded_ad' | 'streak_bonus' | 'level_up' | 'premium_daily' | 'quest' | 'achievement';
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'earn_virtual_currency',
      params: {
        value: params.amount,
        virtual_currency_name: 'coins',
        source: params.source,
      },
    });
  } catch (error) {
    console.error('Failed to log earn_virtual_currency:', error);
  }
};

// ============================================
// MONETİZASYON ANALİTİKLERİ
// ============================================

// Coin bakiyesi takibi (periyodik)
export const logCoinBalance = async (balance: number): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'coin_balance',
      params: {
        balance: balance,
      },
    });
  } catch (error) {
    console.error('Failed to log coin_balance:', error);
  }
};

// Subscription satın alındığında
export const logSubscriptionPurchased = async (params: {
  tier: 'weekly' | 'monthly';
  price: number;
  currency: string;
  isSpecialOffer: boolean;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'subscription_purchased',
      params: {
        subscription_tier: params.tier,
        price: params.price,
        currency: params.currency,
        is_special_offer: params.isSpecialOffer ? 'true' : 'false',
      },
    });
    
    // Firebase'e revenue olarak da gönder
    await FirebaseAnalytics.logEvent({
      name: 'purchase',
      params: {
        value: params.price,
        currency: params.currency,
        items: [{ item_id: `subscription_${params.tier}`, item_name: `Premium ${params.tier}`, price: params.price }],
      },
    });
  } catch (error) {
    console.error('Failed to log subscription_purchased:', error);
  }
};

// Reklamsız paket coin ile alındığında
export const logAdFreePurchasedWithCoins = async (params: {
  packageId: string;
  coinsCost: number;
  durationMinutes: number;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'adfree_purchased_coins',
      params: {
        package_id: params.packageId,
        coins_cost: params.coinsCost,
        duration_minutes: params.durationMinutes,
      },
    });
  } catch (error) {
    console.error('Failed to log adfree_purchased_coins:', error);
  }
};

// Özel teklif gösterildiğinde
export const logSpecialOfferShown = async (offerType: 'day3' | 'day14'): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'special_offer_shown',
      params: {
        offer_type: offerType,
      },
    });
  } catch (error) {
    console.error('Failed to log special_offer_shown:', error);
  }
};

// Özel teklif kabul/red edildiğinde
export const logSpecialOfferResponse = async (params: {
  offerType: 'day3' | 'day14';
  accepted: boolean;
}): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'special_offer_response',
      params: {
        offer_type: params.offerType,
        accepted: params.accepted ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error('Failed to log special_offer_response:', error);
  }
};

// Premium modal açıldığında
export const logPremiumModalOpened = async (): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'premium_modal_opened',
      params: {},
    });
  } catch (error) {
    console.error('Failed to log premium_modal_opened:', error);
  }
};

// Rewarded ad butonu tıklandığında (izlenmeden önce)
export const logRewardedAdClicked = async (rewardType: string): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'rewarded_ad_clicked',
      params: {
        reward_type: rewardType,
      },
    });
  } catch (error) {
    console.error('Failed to log rewarded_ad_clicked:', error);
  }
};

// Referral paylaşımı
export const logReferralShare = async (shareType: 'invite' | 'victory' | 'batak'): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'referral_share',
      params: {
        share_type: shareType,
      },
    });
  } catch (error) {
    console.error('Failed to log referral_share:', error);
  }
};

// Referral kodu uygulandı
export const logReferralCodeApplied = async (): Promise<void> => {
  try {
    await FirebaseAnalytics.logEvent({
      name: 'referral_code_applied',
      params: {},
    });
  } catch (error) {
    console.error('Failed to log referral_code_applied:', error);
  }
};

// Kullanıcı segmenti güncelleme
export const updateUserSegment = async (params: {
  daysSinceFirstPlay: number;
  totalCoinsEarned: number;
  totalGames: number;
  isPremium: boolean;
}): Promise<void> => {
  try {
    // Kullanıcı segmenti belirleme
    let segment = 'new'; // 0-3 gün
    if (params.daysSinceFirstPlay >= 30) segment = 'veteran';
    else if (params.daysSinceFirstPlay >= 7) segment = 'regular';
    else if (params.daysSinceFirstPlay >= 3) segment = 'returning';
    
    await FirebaseAnalytics.setUserProperty({ key: 'user_segment', value: segment });
    await FirebaseAnalytics.setUserProperty({ key: 'total_coins_earned', value: String(params.totalCoinsEarned) });
    await FirebaseAnalytics.setUserProperty({ key: 'is_premium', value: params.isPremium ? 'true' : 'false' });
    
    // Harcama potansiyeli segmenti
    let spendPotential = 'low';
    if (params.totalGames >= 100 && !params.isPremium) spendPotential = 'high';
    else if (params.totalGames >= 30) spendPotential = 'medium';
    
    await FirebaseAnalytics.setUserProperty({ key: 'spend_potential', value: spendPotential });
  } catch (error) {
    console.error('Failed to update user segment:', error);
  }
};
