import { UserProfile, Quest, Achievement, DailyReward, GameMode } from '../types';

// --- COINS REWARDS ---
export const COINS_REWARDS = {
  DAILY_REWARD_BASE: 50,
  DAILY_REWARD_MULTIPLIER: 25, // Her gün +25
  STREAK_BONUS: 100, // 7 günlük streak bonusu
  WIN_GAME: 100,
  WIN_GAME_BONUS: 50, // İlk galibiyet bonusu
  COMPLETE_QUEST: 200,
  UNLOCK_ACHIEVEMENT: 500,
  LEVEL_UP: 1000,
  FIRST_GAME: 500,
  FIRST_WIN: 1000,
  PERFECT_GAME: 2000, // 13 el alma
  NO_BATAK_STREAK: 500, // 5 oyun batak yapmama
  LOSE_GAME: 20, // Kaybetme cezası (minimum)
  LOSE_BATAK: 50, // Batak yapma cezası
};

// Zorluk seviyesine göre coin ödülleri
export const getDifficultyCoins = (difficulty: string): { win: number; lose: number; batak: number } => {
  switch (difficulty) {
    case 'Acemi':
      return { win: 30, lose: 10, batak: 20 };
    case 'Oyuncu':
      return { win: 50, lose: 15, batak: 30 };
    case 'Usta':
      return { win: 80, lose: 20, batak: 40 };
    case 'EFSANE':
      return { win: 120, lose: 25, batak: 50 };
    case 'YENİLMEZ':
      return { win: 200, lose: 30, batak: 60 };
    default:
      return { win: 50, lose: 15, batak: 30 };
  }
};

// --- XP SYSTEM ---
export const XP_REWARDS = {
  WIN_GAME: 50,
  WIN_TRICK: 5,
  COMPLETE_QUEST: 25,
  UNLOCK_ACHIEVEMENT: 100,
  LEVEL_UP_BASE: 1000,
  LEVEL_UP_MULTIPLIER: 250, // Her seviye +250 XP daha fazla
};

export const calculateLevelXp = (level: number): number => {
  return XP_REWARDS.LEVEL_UP_BASE + (level * XP_REWARDS.LEVEL_UP_MULTIPLIER);
};

export const addXp = (profile: UserProfile, xp: number): { newProfile: UserProfile; leveledUp: boolean; newLevel?: number } => {
  let newXp = profile.currentXp + xp;
  let newLevel = profile.level;
  let leveledUp = false;
  let xpToNext = calculateLevelXp(newLevel + 1);

  while (newXp >= xpToNext) {
    newXp -= xpToNext;
    newLevel += 1;
    leveledUp = true;
    xpToNext = calculateLevelXp(newLevel + 1);
  }

  return {
    newProfile: {
      ...profile,
      level: newLevel,
      currentXp: newXp,
      xpToNextLevel: xpToNext,
    },
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  };
};

// --- DAILY REWARDS ---
export const getDailyRewards = (): DailyReward[] => {
  return [
    { day: 1, coins: 50, claimed: false },
    { day: 2, coins: 75, claimed: false },
    { day: 3, coins: 100, claimed: false },
    { day: 4, coins: 125, claimed: false },
    { day: 5, coins: 150, claimed: false },
    { day: 6, coins: 175, claimed: false },
    { day: 7, coins: 300, claimed: false }, // Streak bonusu
  ];
};

export const canClaimDailyReward = (profile: UserProfile): boolean => {
  const today = new Date().toDateString();
  if (!profile.lastDailyRewardDate) return true;
  const lastDate = new Date(profile.lastDailyRewardDate).toDateString();
  return today !== lastDate;
};

export const getCurrentStreakDay = (profile: UserProfile): number => {
  const today = new Date();
  const lastDate = profile.lastDailyRewardDate ? new Date(profile.lastDailyRewardDate) : null;
  
  if (!lastDate) {
    // İlk gün
    return 1;
  }
  
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Bugün zaten alınmış
    return profile.streakDays || 1;
  }
  if (diffDays === 1) {
    // Dün alınmış, bugün alınabilir
    return (profile.streakDays || 0) + 1;
  }
  // Streak kırıldı, yeni başlangıç
  return 1;
};

export const claimDailyReward = (profile: UserProfile): { newProfile: UserProfile; coinsEarned: number } => {
  if (!canClaimDailyReward(profile)) {
    return { newProfile: profile, coinsEarned: 0 };
  }

  const streakDay = getCurrentStreakDay(profile);
  const dayIndex = Math.min(Math.max(0, streakDay - 1), 6); // 0-6 arası, max 7 gün
  const rewards = getDailyRewards();
  const reward = rewards[dayIndex] || rewards[0];
  
  const newStreakDays = streakDay;
  const coinsEarned = reward.coins + (newStreakDays === 7 ? COINS_REWARDS.STREAK_BONUS : 0);
  
  const updatedRewards = profile.dailyRewards.map((r, idx) => 
    idx === dayIndex ? { ...r, claimed: true, claimedDate: new Date().toISOString() } : r
  );

  return {
    newProfile: {
      ...profile,
      coins: profile.coins + coinsEarned,
      totalCoinsEarned: profile.totalCoinsEarned + coinsEarned,
      dailyRewards: updatedRewards,
      lastDailyRewardDate: new Date().toISOString(),
      streakDays: newStreakDays,
    },
    coinsEarned,
  };
};

// --- QUESTS ---
export const generateDailyQuests = (): Quest[] => {
  return [
    {
      id: 'daily_win_3',
      type: 'daily',
      title: '3 Oyun Kazan',
      description: '3 oyun kazanarak görevi tamamla',
      target: 3,
      progress: 0,
      reward: 200,
      completed: false,
    },
    {
      id: 'daily_play_5',
      type: 'daily',
      title: '5 Oyun Oyna',
      description: '5 oyun oynayarak görevi tamamla',
      target: 5,
      progress: 0,
      reward: 150,
      completed: false,
    },
    {
      id: 'daily_tricks_30',
      type: 'daily',
      title: '30 El Al',
      description: 'Toplam 30 el al',
      target: 30,
      progress: 0,
      reward: 250,
      completed: false,
    },
    {
      id: 'daily_no_batak',
      type: 'daily',
      title: 'Batak Yapma',
      description: 'Bir oyunda batak yapmadan kazan',
      target: 1,
      progress: 0,
      reward: 300,
      completed: false,
    },
  ];
};

export const generateWeeklyQuests = (): Quest[] => {
  return [
    {
      id: 'weekly_win_20',
      type: 'weekly',
      title: '20 Oyun Kazan',
      description: 'Bu hafta 20 oyun kazan',
      target: 20,
      progress: 0,
      reward: 1000,
      completed: false,
    },
    {
      id: 'weekly_play_50',
      type: 'weekly',
      title: '50 Oyun Oyna',
      description: 'Bu hafta 50 oyun oyna',
      target: 50,
      progress: 0,
      reward: 800,
      completed: false,
    },
    {
      id: 'weekly_perfect_3',
      type: 'weekly',
      title: '3 Mükemmel Oyun',
      description: '3 oyunda 13 el al',
      target: 3,
      progress: 0,
      reward: 1500,
      completed: false,
    },
  ];
};

export const updateQuestProgress = (
  profile: UserProfile,
  questId: string,
  progress: number
): { newProfile: UserProfile; completed: boolean; coinsEarned: number } => {
  const quest = profile.quests.find(q => q.id === questId);
  if (!quest || quest.completed) {
    return { newProfile: profile, completed: false, coinsEarned: 0 };
  }

  const newProgress = Math.min(quest.progress + progress, quest.target);
  const completed = newProgress >= quest.target;
  const coinsEarned = completed ? quest.reward : 0;

  const updatedQuests = profile.quests.map(q => {
    if (q.id === questId) {
      return {
        ...q,
        progress: newProgress,
        completed,
        completedDate: completed ? new Date().toISOString() : undefined,
      };
    }
    return q;
  });

  return {
    newProfile: {
      ...profile,
      quests: updatedQuests,
      coins: profile.coins + coinsEarned,
      totalCoinsEarned: profile.totalCoinsEarned + coinsEarned,
    },
    completed,
    coinsEarned,
  };
};

// --- ACHIEVEMENTS ---
export const getAllAchievements = (): Achievement[] => {
  return [
    {
      id: 'first_game',
      title: 'İlk Adım',
      description: 'İlk oyununu oyna',
      icon: '🎮',
      reward: COINS_REWARDS.FIRST_GAME,
      unlocked: false,
      progress: 0,
      target: 1,
    },
    {
      id: 'first_win',
      title: 'İlk Zafer',
      description: 'İlk oyununu kazan',
      icon: '🏆',
      reward: COINS_REWARDS.FIRST_WIN,
      unlocked: false,
      progress: 0,
      target: 1,
    },
    {
      id: 'win_10',
      title: 'Onluk',
      description: '10 oyun kazan',
      icon: '⭐',
      reward: 500,
      unlocked: false,
      progress: 0,
      target: 10,
    },
    {
      id: 'win_50',
      title: 'Yarı Yol',
      description: '50 oyun kazan',
      icon: '🌟',
      reward: 1000,
      unlocked: false,
      progress: 0,
      target: 50,
    },
    {
      id: 'win_100',
      title: 'Yüzler',
      description: '100 oyun kazan',
      icon: '💫',
      reward: 2000,
      unlocked: false,
      progress: 0,
      target: 100,
    },
    {
      id: 'perfect_game',
      title: 'Mükemmel',
      description: 'Bir oyunda 13 el al',
      icon: '👑',
      reward: COINS_REWARDS.PERFECT_GAME,
      unlocked: false,
      progress: 0,
      target: 1,
    },
    {
      id: 'no_batak_5',
      title: 'Batak Yok',
      description: '5 oyun üst üste batak yapmadan kazan',
      icon: '🛡️',
      reward: COINS_REWARDS.NO_BATAK_STREAK,
      unlocked: false,
      progress: 0,
      target: 5,
    },
    {
      id: 'bid_13',
      title: 'Maksimum',
      description: '13 ihale yap ve kazan',
      icon: '🎯',
      reward: 1500,
      unlocked: false,
      progress: 0,
      target: 1,
    },
    {
      id: 'play_100',
      title: 'Deneyimli',
      description: '100 oyun oyna',
      icon: '📊',
      reward: 800,
      unlocked: false,
      progress: 0,
      target: 100,
    },
    {
      id: 'play_500',
      title: 'Uzman',
      description: '500 oyun oyna',
      icon: '🎖️',
      reward: 3000,
      unlocked: false,
      progress: 0,
      target: 500,
    },
    {
      id: 'level_10',
      title: 'Seviye 10',
      description: '10. seviyeye ulaş',
      icon: '🔟',
      reward: 1000,
      unlocked: false,
      progress: 0,
      target: 10,
    },
    {
      id: 'level_25',
      title: 'Seviye 25',
      description: '25. seviyeye ulaş',
      icon: '🔢',
      reward: 2500,
      unlocked: false,
      progress: 0,
      target: 25,
    },
    {
      id: 'all_modes',
      title: 'Mod Ustası',
      description: 'Tüm oyun modlarını dene',
      icon: '🎲',
      reward: 2000,
      unlocked: false,
      progress: 0,
      target: 7, // Tüm modlar
    },
    {
      id: 'coins_10000',
      title: 'Zengin',
      description: '10.000 coin biriktir',
      icon: '💰',
      reward: 1000,
      unlocked: false,
      progress: 0,
      target: 10000,
    },
    {
      id: 'tricks_1000',
      title: 'El Ustası',
      description: 'Toplam 1000 el al',
      icon: '🃏',
      reward: 1500,
      unlocked: false,
      progress: 0,
      target: 1000,
    },
  ];
};

export const checkAndUnlockAchievements = (
  profile: UserProfile,
  stats: {
    gamesPlayed?: number;
    gamesWon?: number;
    tricksWon?: number;
    perfectGame?: boolean;
    noBatakStreak?: number;
    bid13?: boolean;
    level?: number;
    modesPlayed?: string[];
    coins?: number;
  }
): { newProfile: UserProfile; unlockedAchievements: Achievement[]; coinsEarned: number } => {
  let coinsEarned = 0;
  const unlockedAchievements: Achievement[] = [];
  
  const updatedAchievements = profile.achievements.map(achievement => {
    if (achievement.unlocked) return achievement;

    let newProgress = achievement.progress || 0;
    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first_game':
        if (stats.gamesPlayed && stats.gamesPlayed >= 1) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;
      case 'first_win':
        if (stats.gamesWon && stats.gamesWon >= 1) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;
      case 'win_10':
        if (stats.gamesWon) {
          newProgress = Math.min(stats.gamesWon, 10);
          shouldUnlock = newProgress >= 10;
        }
        break;
      case 'win_50':
        if (stats.gamesWon) {
          newProgress = Math.min(stats.gamesWon, 50);
          shouldUnlock = newProgress >= 50;
        }
        break;
      case 'win_100':
        if (stats.gamesWon) {
          newProgress = Math.min(stats.gamesWon, 100);
          shouldUnlock = newProgress >= 100;
        }
        break;
      case 'perfect_game':
        if (stats.perfectGame) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;
      case 'no_batak_5':
        if (stats.noBatakStreak) {
          newProgress = Math.min(stats.noBatakStreak, 5);
          shouldUnlock = newProgress >= 5;
        }
        break;
      case 'bid_13':
        if (stats.bid13) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;
      case 'play_100':
        if (stats.gamesPlayed) {
          newProgress = Math.min(stats.gamesPlayed, 100);
          shouldUnlock = newProgress >= 100;
        }
        break;
      case 'play_500':
        if (stats.gamesPlayed) {
          newProgress = Math.min(stats.gamesPlayed, 500);
          shouldUnlock = newProgress >= 500;
        }
        break;
      case 'level_10':
        if (stats.level) {
          newProgress = Math.min(stats.level, 10);
          shouldUnlock = newProgress >= 10;
        }
        break;
      case 'level_25':
        if (stats.level) {
          newProgress = Math.min(stats.level, 25);
          shouldUnlock = newProgress >= 25;
        }
        break;
      case 'all_modes':
        if (stats.modesPlayed) {
          newProgress = Math.min(stats.modesPlayed.length, 7);
          shouldUnlock = newProgress >= 7;
        }
        break;
      case 'coins_10000':
        if (stats.coins) {
          newProgress = Math.min(stats.coins, 10000);
          shouldUnlock = newProgress >= 10000;
        }
        break;
      case 'tricks_1000':
        if (stats.tricksWon) {
          newProgress = Math.min(stats.tricksWon, 1000);
          shouldUnlock = newProgress >= 1000;
        }
        break;
    }

    if (shouldUnlock) {
      coinsEarned += achievement.reward;
      unlockedAchievements.push({ ...achievement, unlocked: true, progress: newProgress });
      return {
        ...achievement,
        unlocked: true,
        progress: newProgress,
        unlockedDate: new Date().toISOString(),
      };
    }

    return {
      ...achievement,
      progress: newProgress,
    };
  });

  return {
    newProfile: {
      ...profile,
      achievements: updatedAchievements,
      coins: profile.coins + coinsEarned,
      totalCoinsEarned: profile.totalCoinsEarned + coinsEarned,
    },
    unlockedAchievements,
    coinsEarned,
  };
};

// --- THEME SHOP ---
export const getThemePrices = (): Record<string, number> => {
  return {
    kiraathane: 0, // Ücretsiz
    classic: 0,
    casino: 500,
    wood: 300,
    royal: 800,
    midnight: 400,
    vintage: 350,
    forest: 600,
    ocean: 550,
    lava: 700,
    sunset: 450,
    space: 900,
    desert: 500,
    neon: 1000,
  };
};

export const canAffordTheme = (profile: UserProfile, themeId: string): boolean => {
  if (profile.ownedThemes.includes(themeId)) return true;
  const prices = getThemePrices();
  return profile.coins >= (prices[themeId] || 0);
};

export const purchaseTheme = (profile: UserProfile, themeId: string): { newProfile: UserProfile; success: boolean } => {
  if (profile.ownedThemes.includes(themeId)) {
    return { newProfile: profile, success: false };
  }

  const prices = getThemePrices();
  const price = prices[themeId] || 0;

  if (profile.coins < price) {
    return { newProfile: profile, success: false };
  }

  return {
    newProfile: {
      ...profile,
      coins: profile.coins - price,
      ownedThemes: [...profile.ownedThemes, themeId],
      totalCoinsSpent: profile.totalCoinsSpent + price,
    },
    success: true,
  };
};

