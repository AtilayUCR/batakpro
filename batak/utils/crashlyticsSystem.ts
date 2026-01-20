// Firebase Crashlytics Sistemi
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';

// ============================================
// CRASHLYTICS BAŞLATMA
// ============================================
let isInitialized = false;

export const initializeCrashlytics = async (): Promise<boolean> => {
  if (isInitialized) return true;
  
  try {
    // Crashlytics'i etkinleştir
    await FirebaseCrashlytics.setEnabled({ enabled: true });
    isInitialized = true;
    console.log('Firebase Crashlytics initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Crashlytics:', error);
    return false;
  }
};

// ============================================
// KULLANICI BİLGİLERİ
// ============================================
export const setUserId = async (userId: string): Promise<void> => {
  try {
    await FirebaseCrashlytics.setUserId({ userId });
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
};

export const setCustomKey = async (key: string, value: string): Promise<void> => {
  try {
    await FirebaseCrashlytics.setCustomKey({ key, value, type: 'string' });
  } catch (error) {
    console.error('Failed to set custom key:', error);
  }
};

// ============================================
// HATA KAYDI
// ============================================
export const logError = async (message: string, error?: Error): Promise<void> => {
  try {
    await FirebaseCrashlytics.log({ message });
    
    if (error) {
      await FirebaseCrashlytics.recordException({
        message: error.message,
        stacktrace: error.stack,
      });
    }
  } catch (e) {
    console.error('Failed to log error to Crashlytics:', e);
  }
};

export const recordException = async (error: Error): Promise<void> => {
  try {
    await FirebaseCrashlytics.recordException({
      message: error.message,
      stacktrace: error.stack,
    });
  } catch (e) {
    console.error('Failed to record exception:', e);
  }
};

// ============================================
// ÖZEL LOG MESAJLARI
// ============================================
export const log = async (message: string): Promise<void> => {
  try {
    await FirebaseCrashlytics.log({ message });
  } catch (error) {
    console.error('Failed to log message:', error);
  }
};

// ============================================
// OYUN DURUMU KAYDI
// ============================================
export const logGameState = async (state: {
  gameMode?: string;
  phase?: string;
  playerCount?: number;
  trickCount?: number;
}): Promise<void> => {
  try {
    if (state.gameMode) {
      await FirebaseCrashlytics.setCustomKey({ key: 'game_mode', value: state.gameMode, type: 'string' });
    }
    if (state.phase) {
      await FirebaseCrashlytics.setCustomKey({ key: 'game_phase', value: state.phase, type: 'string' });
    }
    if (state.playerCount !== undefined) {
      await FirebaseCrashlytics.setCustomKey({ key: 'player_count', value: String(state.playerCount), type: 'string' });
    }
    if (state.trickCount !== undefined) {
      await FirebaseCrashlytics.setCustomKey({ key: 'trick_count', value: String(state.trickCount), type: 'string' });
    }
  } catch (error) {
    console.error('Failed to log game state:', error);
  }
};

// ============================================
// TEST CRASH (Sadece test için)
// ============================================
export const testCrash = async (): Promise<void> => {
  try {
    await FirebaseCrashlytics.crash({ message: 'Test crash from Batak Pro' });
  } catch (error) {
    console.error('Test crash failed:', error);
  }
};
