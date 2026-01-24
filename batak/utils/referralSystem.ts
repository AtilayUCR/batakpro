// Referral (Davet) Sistemi
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

// ============================================
// REFERRAL KOD YÖNETİMİ
// ============================================

// Referral kodu oluştur (kullanıcı adından unique kod)
export const generateReferralCode = (username: string): string => {
  const base = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${random}`;
};

// Referral kodunu kaydet/al
export const getReferralCode = (username: string): string => {
  const stored = localStorage.getItem('batakReferralCode');
  if (stored) return stored;
  
  const newCode = generateReferralCode(username);
  localStorage.setItem('batakReferralCode', newCode);
  return newCode;
};

// ============================================
// REFERRAL İSTATİSTİKLERİ
// ============================================

export interface ReferralStats {
  totalInvites: number;          // Toplam paylaşım sayısı
  successfulReferrals: number;   // Başarılı davetler (gerçek indirme)
  coinsEarned: number;           // Kazanılan toplam coin
  lastShareDate: string | null;  // Son paylaşım tarihi
}

export const getReferralStats = (): ReferralStats => {
  const stored = localStorage.getItem('batakReferralStats');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    totalInvites: 0,
    successfulReferrals: 0,
    coinsEarned: 0,
    lastShareDate: null,
  };
};

export const updateReferralStats = (updates: Partial<ReferralStats>): ReferralStats => {
  const current = getReferralStats();
  const updated = { ...current, ...updates };
  localStorage.setItem('batakReferralStats', JSON.stringify(updated));
  return updated;
};

// ============================================
// PAYLAŞIM FONKSİYONLARI
// ============================================

export interface ShareResult {
  success: boolean;
  platform?: string;
}

// Genel davet paylaşımı
export const shareInvite = async (referralCode: string, username: string): Promise<ShareResult> => {
  const appStoreUrl = 'https://apps.apple.com/app/batak-pro/id6740013498';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.batakpro.app';
  
  // Platform'a göre URL seç
  const platform = Capacitor.getPlatform();
  const storeUrl = platform === 'ios' ? appStoreUrl : playStoreUrl;
  
  const shareText = `🃏 Batak Pro ile profesyonel batak oynuyorum! 
    
Sen de katıl ve birlikte oynayalım! 👇
${storeUrl}

Davet kodum: ${referralCode}
(Kayıt olurken gir, ikimiz de bonus coin kazanalım!)`;

  try {
    await Share.share({
      title: 'Batak Pro - Davet',
      text: shareText,
      dialogTitle: 'Arkadaşlarını Davet Et',
    });
    
    // Paylaşım istatistiğini güncelle
    const stats = getReferralStats();
    updateReferralStats({
      totalInvites: stats.totalInvites + 1,
      lastShareDate: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Share failed:', error);
    return { success: false };
  }
};

// Oyun sonucu paylaşımı (kazanınca)
export const shareVictory = async (params: {
  mode: string;
  score: number;
  username: string;
  referralCode: string;
}): Promise<ShareResult> => {
  const appStoreUrl = 'https://apps.apple.com/app/batak-pro/id6740013498';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.batakpro.app';
  
  const platform = Capacitor.getPlatform();
  const storeUrl = platform === 'ios' ? appStoreUrl : playStoreUrl;
  
  const shareText = `🏆 Batak Pro'da ${params.mode} modunda kazandım!
  
Skor: ${params.score} puan
  
Sen de meydan okumak ister misin? 🃏
${storeUrl}

Davet kodum: ${params.referralCode}`;

  try {
    await Share.share({
      title: 'Batak Pro - Zafer!',
      text: shareText,
      dialogTitle: 'Başarını Paylaş',
    });
    
    const stats = getReferralStats();
    updateReferralStats({
      totalInvites: stats.totalInvites + 1,
      lastShareDate: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Share failed:', error);
    return { success: false };
  }
};

// Batak/Özel başarı paylaşımı
export const shareBatakVictory = async (params: {
  batakCount: number;
  username: string;
  referralCode: string;
}): Promise<ShareResult> => {
  const appStoreUrl = 'https://apps.apple.com/app/batak-pro/id6740013498';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.batakpro.app';
  
  const platform = Capacitor.getPlatform();
  const storeUrl = platform === 'ios' ? appStoreUrl : playStoreUrl;
  
  const shareText = `🔥 Batak Pro'da rakibimi BATAK yaptım!

Toplam ${params.batakCount} kez batak yaptım! 💪

Cesaretiniz varsa gelin! 🃏
${storeUrl}`;

  try {
    await Share.share({
      title: 'Batak Pro - BATAK!',
      text: shareText,
      dialogTitle: 'Başarını Paylaş',
    });
    
    return { success: true };
  } catch (error) {
    console.error('Share failed:', error);
    return { success: false };
  }
};

// ============================================
// REFERRAL KOD KULLANIMI
// ============================================

// Kullanıcı başka birinin kodunu girdiğinde
export const applyReferralCode = (code: string): { success: boolean; message: string } => {
  const usedCodes = JSON.parse(localStorage.getItem('batakUsedReferralCodes') || '[]');
  const myCode = localStorage.getItem('batakReferralCode');
  
  // Kendi kodunu kullanmaya çalışıyor mu?
  if (code === myCode) {
    return { success: false, message: 'Kendi davet kodunu kullanamazsın!' };
  }
  
  // Daha önce bir kod kullandı mı?
  if (usedCodes.length > 0) {
    return { success: false, message: 'Zaten bir davet kodu kullandın!' };
  }
  
  // Kodu kaydet ve ödül ver
  usedCodes.push({
    code,
    date: new Date().toISOString(),
  });
  localStorage.setItem('batakUsedReferralCodes', JSON.stringify(usedCodes));
  
  // Ödül: Hem davet eden hem davet edilen kazanır
  // Not: Gerçek bir backend olmadan, sadece davet edilen kişi ödül alabilir
  // Backend olsaydı, davet edenin coin'i de artırılırdı
  
  return { 
    success: true, 
    message: 'Davet kodu uygulandı! +500 bonus coin kazandın!' 
  };
};

// Referral bonus miktarları
export const REFERRAL_REWARDS = {
  INVITER_BONUS: 1000,   // Davet eden kişi kazanır (backend gerekli)
  INVITEE_BONUS: 500,    // Davet edilen kişi kazanır
  DAILY_SHARE_BONUS: 50, // Günlük ilk paylaşım bonusu
};

// Günlük paylaşım bonusu kontrolü
export const canClaimDailyShareBonus = (): boolean => {
  const stats = getReferralStats();
  if (!stats.lastShareDate) return true;
  
  const lastShare = new Date(stats.lastShareDate).toDateString();
  const today = new Date().toDateString();
  
  return lastShare !== today;
};

// Günlük paylaşım bonusu al
export const claimDailyShareBonus = (): number => {
  if (!canClaimDailyShareBonus()) return 0;
  
  const stats = getReferralStats();
  updateReferralStats({
    coinsEarned: stats.coinsEarned + REFERRAL_REWARDS.DAILY_SHARE_BONUS,
  });
  
  return REFERRAL_REWARDS.DAILY_SHARE_BONUS;
};
