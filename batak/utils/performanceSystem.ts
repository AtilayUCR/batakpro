// Performans Optimizasyon Sistemi

// ============================================
// SES CACHE SİSTEMİ
// ============================================

class SoundCache {
  private cache: Map<string, HTMLAudioElement[]> = new Map();
  private poolSize = 3; // Her ses için havuz boyutu
  private loading: Set<string> = new Set();
  
  // Ses yükle ve cache'e al
  async preload(url: string): Promise<void> {
    if (this.cache.has(url) || this.loading.has(url)) return;
    
    this.loading.add(url);
    
    try {
      const pool: HTMLAudioElement[] = [];
      
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio();
        audio.preload = 'auto';
        
        await new Promise<void>((resolve, reject) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject();
          audio.src = url;
        });
        
        pool.push(audio);
      }
      
      this.cache.set(url, pool);
    } catch (error) {
      console.warn(`Failed to preload sound: ${url}`);
    } finally {
      this.loading.delete(url);
    }
  }
  
  // Ses çal (havuzdan al)
  play(url: string, volume: number = 1): void {
    const pool = this.cache.get(url);
    if (!pool || pool.length === 0) {
      // Fallback: Yeni audio oluştur
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(() => {});
      return;
    }
    
    // Müsait audio bul veya klonla
    let audio = pool.find(a => a.paused || a.ended);
    
    if (!audio) {
      // Hepsi çalıyorsa, birini klonla
      audio = pool[0].cloneNode(true) as HTMLAudioElement;
    }
    
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {});
  }
  
  // Cache temizle
  clear(): void {
    this.cache.forEach(pool => {
      pool.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    });
    this.cache.clear();
  }
}

export const soundCache = new SoundCache();

// ============================================
// MEMORY LEAK PREVENTION
// ============================================

// Interval/Timeout tracker
const activeTimers: Set<number> = new Set();

export const safeSetInterval = (callback: () => void, ms: number): number => {
  const id = window.setInterval(callback, ms);
  activeTimers.add(id);
  return id;
};

export const safeSetTimeout = (callback: () => void, ms: number): number => {
  const id = window.setTimeout(() => {
    activeTimers.delete(id);
    callback();
  }, ms);
  activeTimers.add(id);
  return id;
};

export const safeClearInterval = (id: number): void => {
  clearInterval(id);
  activeTimers.delete(id);
};

export const safeClearTimeout = (id: number): void => {
  clearTimeout(id);
  activeTimers.delete(id);
};

// Tüm aktif timer'ları temizle
export const clearAllTimers = (): void => {
  activeTimers.forEach(id => {
    clearInterval(id);
    clearTimeout(id);
  });
  activeTimers.clear();
};

// ============================================
// THROTTLE & DEBOUNCE
// ============================================

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

// ============================================
// ANIMATION FRAME OPTIMIZER
// ============================================

let animationFrameId: number | null = null;
const animationCallbacks: Map<string, () => void> = new Map();

const runAnimationLoop = () => {
  animationCallbacks.forEach(callback => callback());
  
  if (animationCallbacks.size > 0) {
    animationFrameId = requestAnimationFrame(runAnimationLoop);
  } else {
    animationFrameId = null;
  }
};

export const registerAnimation = (id: string, callback: () => void): void => {
  animationCallbacks.set(id, callback);
  
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(runAnimationLoop);
  }
};

export const unregisterAnimation = (id: string): void => {
  animationCallbacks.delete(id);
  
  if (animationCallbacks.size === 0 && animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// ============================================
// LAZY IMAGE LOADING
// ============================================

export const lazyLoadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// ============================================
// PERFORMANS METRİKLERİ
// ============================================

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number | null;
  renderTime: number;
}

let lastFrameTime = performance.now();
let frameCount = 0;
let currentFPS = 60;

// FPS hesapla
export const measureFPS = (): number => {
  const now = performance.now();
  frameCount++;
  
  if (now - lastFrameTime >= 1000) {
    currentFPS = frameCount;
    frameCount = 0;
    lastFrameTime = now;
  }
  
  return currentFPS;
};

// Performans metrikleri al
export const getPerformanceMetrics = (): PerformanceMetrics => {
  const memory = (performance as any).memory;
  
  return {
    fps: currentFPS,
    memoryUsage: memory ? memory.usedJSHeapSize / (1024 * 1024) : null,
    renderTime: 0,
  };
};

// ============================================
// RENDER OPTİMİZASYONU
// ============================================

// CSS will-change optimizasyonu için helper
export const optimizeForAnimation = (element: HTMLElement | null): void => {
  if (!element) return;
  element.style.willChange = 'transform, opacity';
};

export const resetAnimationOptimization = (element: HTMLElement | null): void => {
  if (!element) return;
  element.style.willChange = 'auto';
};

// ============================================
// LOCALSTORAGE OPTİMİZASYONU
// ============================================

// LocalStorage boyutunu kontrol et
export const getLocalStorageSize = (): number => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
    }
  }
  return total / 1024; // KB cinsinden
};

// Eski verileri temizle
export const cleanupOldData = (maxAgeDays: number = 30): void => {
  const now = Date.now();
  const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
  
  // Oyun geçmişini temizle (son 100 oyun tut)
  const profileStr = localStorage.getItem('batakProfile');
  if (profileStr) {
    try {
      const profile = JSON.parse(profileStr);
      if (profile.gameHistory && profile.gameHistory.length > 100) {
        profile.gameHistory = profile.gameHistory.slice(-100);
        localStorage.setItem('batakProfile', JSON.stringify(profile));
      }
    } catch {}
  }
  
  // Eski transaction loglarını temizle
  const txStr = localStorage.getItem('secure_coinTransactions');
  if (txStr) {
    try {
      const transactions = JSON.parse(txStr);
      if (Array.isArray(transactions)) {
        const filtered = transactions.filter((tx: any) => 
          tx.timestamp && (now - tx.timestamp) < maxAge
        );
        if (filtered.length !== transactions.length) {
          localStorage.setItem('secure_coinTransactions', JSON.stringify(filtered));
        }
      }
    } catch {}
  }
};

// ============================================
// COMPONENT UNMOUNT CLEANUP
// ============================================

export const createCleanupManager = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup);
    },
    
    cleanup: () => {
      cleanupFunctions.forEach(fn => fn());
      cleanupFunctions.length = 0;
    }
  };
};
