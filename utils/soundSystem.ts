// Gelişmiş Ses Sistemi - Lokal Dosya Desteği

export type SoundType = 
  | 'card_deal' 
  | 'card_play' 
  | 'card_shuffle' 
  | 'trick_win' 
  | 'game_win' 
  | 'game_lose' 
  | 'bid_place' 
  | 'bid_pass' 
  | 'coin_earn' 
  | 'level_up' 
  | 'button_click' 
  | 'notification';

// Fallback ses URL'leri (internet varsa kullanılır, yoksa sessiz)
const FALLBACK_SOUNDS: Record<SoundType, string> = {
  card_deal: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  card_play: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  card_shuffle: 'https://assets.mixkit.co/active_storage/sfx/2011/2011-preview.mp3',
  trick_win: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  game_win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  game_lose: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
  bid_place: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  bid_pass: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  coin_earn: 'https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3',
  level_up: 'https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3',
  button_click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  notification: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
};

// Lokal ses dosya yolları
const LOCAL_SOUNDS: Record<SoundType, string> = {
  card_deal: '/sounds/card_deal.mp3',
  card_play: '/sounds/card_play.mp3',
  card_shuffle: '/sounds/card_shuffle.mp3',
  trick_win: '/sounds/trick_win.mp3',
  game_win: '/sounds/game_win.mp3',
  game_lose: '/sounds/game_lose.mp3',
  bid_place: '/sounds/bid_place.mp3',
  bid_pass: '/sounds/bid_pass.mp3',
  coin_earn: '/sounds/coin_earn.mp3',
  level_up: '/sounds/level_up.mp3',
  button_click: '/sounds/button_click.mp3',
  notification: '/sounds/notification.mp3',
};

// Ses önbelleği
const audioCache: Map<string, HTMLAudioElement> = new Map();
let localSoundsAvailable = false;
let checkedLocalSounds = false;

// Lokal seslerin varlığını kontrol et
const checkLocalSounds = async (): Promise<boolean> => {
  if (checkedLocalSounds) return localSoundsAvailable;
  
  try {
    const response = await fetch('/sounds/card_play.mp3', { method: 'HEAD' });
    localSoundsAvailable = response.ok;
  } catch {
    localSoundsAvailable = false;
  }
  
  checkedLocalSounds = true;
  return localSoundsAvailable;
};

// Ses URL'ini al
const getSoundUrl = async (type: SoundType): Promise<string> => {
  const hasLocal = await checkLocalSounds();
  return hasLocal ? LOCAL_SOUNDS[type] : FALLBACK_SOUNDS[type];
};

// Ses yükle ve önbelleğe al
const loadSound = async (type: SoundType): Promise<HTMLAudioElement | null> => {
  const cacheKey = type;
  
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }
  
  try {
    const url = await getSoundUrl(type);
    const audio = new Audio(url);
    audio.preload = 'auto';
    
    // Yüklenmeyi bekle
    await new Promise((resolve, reject) => {
      audio.oncanplaythrough = resolve;
      audio.onerror = reject;
      setTimeout(reject, 3000); // 3 saniye timeout
    });
    
    audioCache.set(cacheKey, audio);
    return audio;
  } catch {
    console.warn(`Ses yüklenemedi: ${type}`);
    return null;
  }
};

// Ses çal
export const playSound = async (
  type: SoundType, 
  options?: { 
    volume?: number; 
    playbackRate?: number;
  }
): Promise<void> => {
  try {
    const audio = await loadSound(type);
    if (!audio) return;
    
    // Yeni bir Audio instance oluştur (aynı anda birden fazla çalabilmek için)
    const soundInstance = audio.cloneNode() as HTMLAudioElement;
    soundInstance.volume = options?.volume ?? 0.5;
    soundInstance.playbackRate = options?.playbackRate ?? 1;
    
    await soundInstance.play();
  } catch (error) {
    // Ses çalma hatası - sessiz geç
    console.warn('Ses çalınamadı:', type);
  }
};

// Tüm sesleri önceden yükle
export const preloadAllSounds = async (): Promise<void> => {
  const types: SoundType[] = [
    'card_deal', 'card_play', 'card_shuffle', 'trick_win',
    'game_win', 'game_lose', 'bid_place', 'bid_pass',
    'coin_earn', 'level_up', 'button_click', 'notification'
  ];
  
  await Promise.allSettled(types.map(type => loadSound(type)));
};

// Ses önbelleğini temizle
export const clearSoundCache = (): void => {
  audioCache.clear();
  checkedLocalSounds = false;
  localSoundsAvailable = false;
};

// Lokal seslerin durumunu kontrol et
export const hasLocalSounds = async (): Promise<boolean> => {
  return await checkLocalSounds();
};

