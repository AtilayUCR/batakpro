// Rating & Review Sistemi
// iOS: Yılda max 3 kez (Apple kontrolünde)
// Android: Haftada 1 kez (daha agresif)

import { InAppReview } from '@capacitor-community/in-app-review';

// ============================================
// PLATFORM TESPİTİ
// ============================================
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

// ============================================
// GÖSTERIM KURALLARI (Platform Bazlı)
// ============================================
const RATING_CONFIG = {
  ios: {
    minWinsBeforePrompt: 3,          // Minimum 3 kazanç
    daysBetweenPrompts: 120,         // 4 ayda bir (yılda ~3 kez)
    daysAfterLater: 14,              // "Sonra" seçilirse 14 gün bekle
    daysAfterNegative: 90,           // Olumsuz seçilirse 90 gün bekle
    maxPromptsPerYear: 3,            // Apple limiti
  },
  android: {
    minWinsBeforePrompt: 3,          // Minimum 3 kazanç
    daysBetweenPrompts: 7,           // Haftada 1
    daysAfterLater: 3,               // "Sonra" seçilirse 3 gün bekle
    daysAfterNegative: 30,           // Olumsuz seçilirse 30 gün bekle
    maxPromptsPerYear: 52,           // Pratik limit yok
  },
};

// ============================================
// RATING STATE YÖNETİMİ
// ============================================
interface RatingState {
  hasRated: boolean;                  // Kullanıcı review verdi mi?
  lastPromptDate: number | null;      // Son gösterim tarihi
  promptCount: number;                // Toplam gösterim sayısı
  yearlyPromptCount: number;          // Yıllık gösterim sayısı
  yearStartDate: number;              // Yıl başlangıcı
  lastResponse: 'positive' | 'neutral' | 'negative' | 'later' | null;
  totalWins: number;                  // Toplam kazanç
}

const getDefaultState = (): RatingState => ({
  hasRated: false,
  lastPromptDate: null,
  promptCount: 0,
  yearlyPromptCount: 0,
  yearStartDate: Date.now(),
  lastResponse: null,
  totalWins: 0,
});

const getRatingState = (): RatingState => {
  const stored = localStorage.getItem('batakRatingState');
  if (stored) {
    const state = JSON.parse(stored);
    
    // Yıl kontrolü - yeni yıl başladıysa counter'ı sıfırla
    const yearStart = new Date(state.yearStartDate);
    const now = new Date();
    if (now.getFullYear() > yearStart.getFullYear()) {
      state.yearlyPromptCount = 0;
      state.yearStartDate = Date.now();
    }
    
    return state;
  }
  return getDefaultState();
};

const saveRatingState = (state: RatingState): void => {
  localStorage.setItem('batakRatingState', JSON.stringify(state));
};

// ============================================
// KAZANÇ KAYDI
// ============================================
export const recordWin = (): void => {
  const state = getRatingState();
  state.totalWins += 1;
  saveRatingState(state);
};

// ============================================
// GÖSTERIM KONTROLÜ
// ============================================
export const shouldShowRatingPrompt = (): boolean => {
  const platform = getPlatform();
  if (platform === 'web') return false;
  
  const config = RATING_CONFIG[platform];
  const state = getRatingState();
  
  // Zaten review verdiyse gösterme
  if (state.hasRated) {
    return false;
  }
  
  // Minimum kazanç kontrolü
  if (state.totalWins < config.minWinsBeforePrompt) {
    return false;
  }
  
  // iOS yıllık limit kontrolü
  if (platform === 'ios' && state.yearlyPromptCount >= config.maxPromptsPerYear) {
    return false;
  }
  
  // Son gösterimden bu yana geçen süre
  if (state.lastPromptDate) {
    const daysSinceLastPrompt = (Date.now() - state.lastPromptDate) / (1000 * 60 * 60 * 24);
    
    // Son yanıta göre bekleme süresi
    let requiredDays = config.daysBetweenPrompts;
    
    if (state.lastResponse === 'later') {
      requiredDays = config.daysAfterLater;
    } else if (state.lastResponse === 'negative' || state.lastResponse === 'neutral') {
      requiredDays = config.daysAfterNegative;
    }
    
    if (daysSinceLastPrompt < requiredDays) {
      return false;
    }
  }
  
  // Belirli kazanç milestones'larında göster
  const triggerWins = [3, 7, 15, 30, 50, 75, 100];
  if (triggerWins.includes(state.totalWins)) {
    return true;
  }
  
  // Veya normal aralıkta
  return true;
};

// ============================================
// RATING PROMPT SONUCU
// ============================================
export type RatingResponse = 'love' | 'like' | 'meh' | 'later';

export const handleRatingResponse = async (response: RatingResponse): Promise<boolean> => {
  const state = getRatingState();
  const platform = getPlatform();
  
  state.lastPromptDate = Date.now();
  state.promptCount += 1;
  state.yearlyPromptCount += 1;
  
  if (response === 'love' || response === 'like') {
    // Pozitif yanıt - Native review popup göster
    state.lastResponse = 'positive';
    saveRatingState(state);
    
    try {
      await InAppReview.requestReview();
      state.hasRated = true;
      saveRatingState(state);
      return true;
    } catch (error) {
      console.error('Failed to show native review:', error);
      return false;
    }
  } else if (response === 'meh') {
    // Nötr/Negatif - Review popup gösterme
    state.lastResponse = 'neutral';
    saveRatingState(state);
    return false;
  } else if (response === 'later') {
    // Sonra sor
    state.lastResponse = 'later';
    saveRatingState(state);
    return false;
  }
  
  return false;
};

// ============================================
// SPECIAL TRIGGER'LAR
// ============================================

// Batak yapınca (özel an!)
export const shouldShowAfterBatak = (): boolean => {
  const state = getRatingState();
  if (state.hasRated) return false;
  if (state.totalWins < 1) return false;
  
  // Batak özel bir an, normal kuralları biraz gevşet
  if (state.lastPromptDate) {
    const daysSinceLastPrompt = (Date.now() - state.lastPromptDate) / (1000 * 60 * 60 * 24);
    // En az 3 gün geçmiş olsun
    if (daysSinceLastPrompt < 3) return false;
  }
  
  return true;
};

// Level atlayınca
export const shouldShowAfterLevelUp = (): boolean => {
  const state = getRatingState();
  if (state.hasRated) return false;
  
  // Her 5 level'da bir şans
  return state.totalWins >= 3;
};

// Streak tamamlayınca
export const shouldShowAfterStreak = (streakDays: number): boolean => {
  const state = getRatingState();
  if (state.hasRated) return false;
  
  // 5 ve 7 günlük streak'lerde göster
  return (streakDays === 5 || streakDays === 7) && state.totalWins >= 3;
};

// ============================================
// İSTATİSTİKLER
// ============================================
export const getRatingStats = () => {
  const state = getRatingState();
  const platform = getPlatform();
  
  return {
    hasRated: state.hasRated,
    totalWins: state.totalWins,
    promptCount: state.promptCount,
    yearlyPromptCount: state.yearlyPromptCount,
    lastResponse: state.lastResponse,
    platform,
  };
};

// ============================================
// DEBUG / RESET (Development için)
// ============================================
export const resetRatingState = (): void => {
  localStorage.removeItem('batakRatingState');
};
