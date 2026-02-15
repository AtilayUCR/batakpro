// ============================================
// IAP SİSTEMİ - DEVRE DIŞI (v2'de aktif edilecek)
// Şu an hiçbir IAP/subscription özelliği yok
// ============================================

export const initializeStore = async (): Promise<boolean> => false;
export const isPremiumUser = (): boolean => false;
export const isAdFreePurchased = (): boolean => false;
export const restorePurchases = async (): Promise<boolean> => false;
