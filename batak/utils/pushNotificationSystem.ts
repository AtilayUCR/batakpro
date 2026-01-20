// Push Notification Sistemi
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';

// ============================================
// PUSH NOTIFICATIONS BAŞLATMA
// ============================================
let isInitialized = false;
let fcmToken: string | null = null;

export const initializePushNotifications = async (): Promise<boolean> => {
  if (isInitialized) return true;
  
  try {
    // İzin durumunu kontrol et
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    
    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied');
      return false;
    }
    
    // Push notifications'ı kaydet
    await PushNotifications.register();
    
    // Event listener'ları ekle
    setupListeners();
    
    isInitialized = true;
    console.log('Push Notifications initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Push Notifications:', error);
    return false;
  }
};

// ============================================
// EVENT LISTENERS
// ============================================
const setupListeners = (): void => {
  // Token alındığında
  PushNotifications.addListener('registration', (token: Token) => {
    console.log('Push registration success, token:', token.value);
    fcmToken = token.value;
    
    // Token'ı localStorage'a kaydet (backend'e göndermek için)
    localStorage.setItem('batakFCMToken', token.value);
  });
  
  // Kayıt hatası
  PushNotifications.addListener('registrationError', (error: any) => {
    console.error('Push registration error:', error);
  });
  
  // Uygulama açıkken bildirim geldiğinde
  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('Push notification received:', notification);
    handleNotification(notification);
  });
  
  // Bildirime tıklandığında
  PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    console.log('Push notification action performed:', action);
    handleNotificationAction(action);
  });
};

// ============================================
// BİLDİRİM İŞLEME
// ============================================
const handleNotification = (notification: PushNotificationSchema): void => {
  // Bildirim türüne göre işlem yap
  const data = notification.data;
  
  if (data?.type === 'daily_reward') {
    // Günlük ödül hatırlatması
    console.log('Daily reward notification received');
  } else if (data?.type === 'streak_warning') {
    // Seri kaybetme uyarısı
    console.log('Streak warning notification received');
  } else if (data?.type === 'special_event') {
    // Özel etkinlik
    console.log('Special event notification received');
  }
};

const handleNotificationAction = (action: ActionPerformed): void => {
  const data = action.notification.data;
  
  // Bildirime tıklandığında yapılacak işlemler
  if (data?.type === 'daily_reward') {
    // Günlük ödül sayfasına yönlendir
    localStorage.setItem('batakOpenDailyReward', 'true');
  }
};

// ============================================
// FCM TOKEN
// ============================================
export const getFCMToken = (): string | null => {
  return fcmToken || localStorage.getItem('batakFCMToken');
};

// ============================================
// LOCAL NOTIFICATIONS (Yerel Bildirimler)
// ============================================

// Günlük ödül hatırlatması için yerel bildirim planla
export const scheduleDailyRewardReminder = async (): Promise<void> => {
  // Bu özellik için @capacitor/local-notifications gerekli
  // Şimdilik sadece console log
  console.log('Daily reward reminder scheduled');
};

// ============================================
// BİLDİRİM TÜRLERİ (Backend'den gönderilecek)
// ============================================
/*
Önerilen bildirim türleri:

1. GÜNLÜK ÖDÜL HATIRLATMASI
{
  "title": "Günlük Ödülün Hazır! 🎁",
  "body": "Giriş yap ve ödülünü al!",
  "data": { "type": "daily_reward" }
}

2. SERİ KAYBETME UYARISI
{
  "title": "Serini Kaybetme! 🔥",
  "body": "Bugün giriş yapmazsan X günlük serin sıfırlanacak!",
  "data": { "type": "streak_warning", "streak_days": 5 }
}

3. ÖZEL ETKİNLİK
{
  "title": "2x Coin Etkinliği! 💰",
  "body": "Bugün tüm kazançlar 2 katı!",
  "data": { "type": "special_event", "event_id": "double_coins" }
}

4. TURNUVA HATIRLATMASI
{
  "title": "Turnuva Başlıyor! 🏆",
  "body": "Haftalık turnuva 1 saat içinde başlıyor!",
  "data": { "type": "tournament", "tournament_id": "weekly_001" }
}

5. GERİ DÖN MESAJI (7 gün aktif olmayanlara)
{
  "title": "Seni Özledik! 🃏",
  "body": "Geri dön ve 500 bonus coin kazan!",
  "data": { "type": "win_back", "bonus_coins": 500 }
}
*/

export const NOTIFICATION_TYPES = {
  DAILY_REWARD: 'daily_reward',
  STREAK_WARNING: 'streak_warning',
  SPECIAL_EVENT: 'special_event',
  TOURNAMENT: 'tournament',
  WIN_BACK: 'win_back',
} as const;
