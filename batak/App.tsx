
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Home, Settings, Trophy, Coins, Check, Play, BarChart3, ShieldCheck, Flame, User as UserIcon, X, Spade, AlertCircle, Skull, Zap, Heart, Layers, Gauge, Palette, ChevronDown, ChevronUp, MessageCircle, TrendingUp, Target, Award, Volume2, VolumeX, Music, Undo2, Lightbulb, Shield, Smartphone, RotateCcw } from 'lucide-react';
import { Card, Suit, Rank, Player, GamePhase, PlayedCard, Difficulty, GameSettings, UserProfile, GameMode, HouseRules, CardBack, GameTheme, SoundPack, BidHistoryEntry, LastGameResult, DailyChallenge, GameHistoryEntry, ModeStats, TrumpStats, HourlyStats } from './types';
import { createDeck, shuffleDeck, dealCards, isValidMove, getBotMove, determineTrickWinner, getThreeUniqueBotNames, evaluateHand, getBotQuote, getBotBid, calculateRoundScore, sortHandWithTrump, getCurrentWinningCard } from './utils/batakLogic';
import { 
  claimDailyReward, canClaimDailyReward, getCurrentStreakDay, getDailyRewards,
  updateQuestProgress, generateDailyQuests, generateWeeklyQuests,
  checkAndUnlockAchievements, getAllAchievements,
  purchaseTheme, canAffordTheme, getThemePrices,
  addXp, COINS_REWARDS, XP_REWARDS, getDifficultyCoins,
  resetQuests, shouldResetDailyQuests, shouldResetWeeklyQuests,
  generateDailyChallenge, shouldResetDailyChallenge, resetDailyChallenge,
  purchasePowerUp, usePowerUp, POWER_UPS,
  purchaseGameSpeed, GAME_SPEED_PRICES
} from './utils/coinsSystem';
import { 
  BOT_PERSONALITIES, getThreeUniqueBotPersonalities, getBotQuote as getAdvancedBotQuote,
  BotPersonality
} from './utils/botPersonalities';
import { PATTERNS, THEME_PATTERNS, getPatternCSS } from './utils/patterns';
import { 
  loadLeaderboard, updateLeaderboard, populateWithBots, getTopPlayers,
  Leaderboard, LeaderboardEntry 
} from './utils/leaderboard';
import {
  generateGuessGame, checkGuess, generateWeeklyQuiz, answerQuizQuestion,
  isGuessGameExpired, isQuizExpired, GuessGame, Quiz
} from './utils/miniGames';
import {
  initializeAdMob, prepareRewardedAd, showRewardedAd,
  prepareInterstitialAd, showInterstitialAd, shouldShowInterstitialAd,
  canWatchRewardedAd, incrementRewardedAdCount, getRemainingRewardedAds,
  showBannerAd, hideBannerAd,
  getAdFreeStatus, setAdFreeTime, getRemainingAdFreeTime, formatRemainingTime,
  AD_FREE_PACKAGES, purchaseAdFreeWithCoins,
  incrementGameCount, markInterstitialShown, canShowInterstitialAd, incrementInterstitialAdCount,
  isFirstGameOfDay, claimFirstGameBonus, markDayPlayed
} from './utils/adMobSystem';
import {
  initializeStore, purchaseSubscription, restorePurchases,
  getSubscriptionStatus, isPremiumUser, 
  getPremiumDailyUndos, usePremiumUndo,
  claimPremiumDailyCoins, canClaimPremiumDailyCoins,
  SUBSCRIPTION_PRICES
} from './utils/subscriptionSystem';
import {
  initializeAnalytics, logGameStart, logGameEnd, logGameModePlay,
  logRewardedAdWatched, logInterstitialShown, logDailyRewardClaimed,
  logLevelUp, logOnboardingCompleted, logTrumpSelected, logCoinEarned,
  logCoinSpent, logSettingChanged, logScreenView, setUserProperties
} from './utils/analyticsSystem';
import { initializeCrashlytics, logGameState, setUserId as setCrashlyticsUserId } from './utils/crashlyticsSystem';
import { initializePushNotifications, getFCMToken } from './utils/pushNotificationSystem';
import { 
  shouldShowRatingPrompt, handleRatingResponse, recordWin, 
  shouldShowAfterBatak, RatingResponse 
} from './utils/ratingSystem';

// --- AUDIO HELPERS ---
const SOUND_PACKS: Record<SoundPack, { deal: string; play: string }> = {
  classic: {
    deal: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    play: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  },
  modern: {
    deal: 'https://assets.mixkit.co/active_storage/sfx/2011/2011-preview.mp3',
    play: 'https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3',
  },
  retro: {
    deal: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
    play: 'https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3',
  },
  arcade: {
    deal: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
    play: 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',
  },
};

// --- CARD COMPONENT ---
interface CardProps {
  card: Card;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  playable?: boolean;
  small?: boolean;
}

const getSuitColor = (suit: Suit) => (suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'text-rose-600' : 'text-slate-900');
const getRankSymbol = (rank: Rank) => {
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  if (rank === 14) return 'A';
  return rank.toString();
};

const CardUI: React.FC<CardProps> = ({ card, onClick, className = '', style = {}, playable = false, small = false }) => {
  const widthClass = small ? 'w-14 h-20 sm:w-16 sm:h-24' : 'w-20 h-32 sm:w-24 sm:h-36';
  return (
    <div 
      onClick={playable ? onClick : undefined}
      style={style}
      className={`relative ${widthClass} bg-white rounded-xl shadow-2xl border border-slate-200 select-none transition-all duration-300 ${playable ? 'cursor-pointer hover:z-50 hover:-translate-y-4' : 'brightness-95'} ${className}`}
    >
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
        <span className={`${small ? 'text-sm' : 'text-xl'} font-black ${getSuitColor(card.suit)}`}>{getRankSymbol(card.rank)}</span>
        <span className={`${small ? 'text-[8px]' : 'text-xs'} ${getSuitColor(card.suit)}`}>{card.suit}</span>
      </div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${small ? 'text-2xl' : 'text-4xl'} ${getSuitColor(card.suit)} opacity-80`}>
        {card.suit}
      </div>
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className={`${small ? 'text-sm' : 'text-xl'} font-black ${getSuitColor(card.suit)}`}>{getRankSymbol(card.rank)}</span>
        <span className={`${small ? 'text-[8px]' : 'text-xs'} ${getSuitColor(card.suit)}`}>{card.suit}</span>
      </div>
      <div className="absolute inset-0 bg-black/5 rounded-xl pointer-events-none"></div>
    </div>
  );
};

// --- ERROR BOUNDARY ---
// @ts-ignore - Class component için gerekli
class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } { 
    return { hasError: true }; 
  }
  
  render(): React.ReactNode {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-[#022c22] flex flex-col items-center justify-center text-white text-center p-6">
          <AlertCircle size={48} className="text-emerald-400 mb-4" />
          <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">Sistem Hatası</h2>
          <button onClick={() => window.location.reload()} className="bg-emerald-500 px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">YENİDEN DENE</button>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}

// --- CONFETTI COMPONENT ---
const Confetti: React.FC = () => {
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    duration: Math.random() * 2 + 2,
  }));
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti linear forwards; }
      `}</style>
    </div>
  );
};

// --- AVATAR OPTIONS ---
const AVATAR_OPTIONS = [
  { id: 'gamepad', icon: '🎮', label: 'Oyuncu' },
  { id: 'crown', icon: '👑', label: 'Kral' },
  { id: 'fire', icon: '🔥', label: 'Ateşli' },
  { id: 'star', icon: '⭐', label: 'Yıldız' },
  { id: 'diamond', icon: '💎', label: 'Elmas' },
  { id: 'heart', icon: '❤️', label: 'Kalp' },
  { id: 'spade', icon: '♠️', label: 'Maça' },
  { id: 'club', icon: '♣️', label: 'Sinek' },
  { id: 'thunder', icon: '⚡', label: 'Şimşek' },
  { id: 'trophy', icon: '🏆', label: 'Şampiyon' },
  { id: 'rocket', icon: '🚀', label: 'Roket' },
  { id: 'ninja', icon: '🥷', label: 'Ninja' },
];

// --- MAIN APP ---
const AppContent: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.LOBBY);
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.IHALELI);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number>(0);
  const [currentTrick, setCurrentTrick] = useState<PlayedCard[]>([]);
  const [visualTrick, setVisualTrick] = useState<PlayedCard[]>([]);
  const [isCollectingTrick, setIsCollectingTrick] = useState<boolean>(false);
  const [trickWinnerId, setTrickWinnerId] = useState<number | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [trumpSuit, setTrumpSuit] = useState<Suit | null>(null);
  const [spadesBroken, setSpadesBroken] = useState<boolean>(false);
  const [trickCount, setTrickCount] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false); 
  const [botMessages, setBotMessages] = useState<Record<number, string | null>>({});
  const [isBidding, setIsBidding] = useState<boolean>(false);
  const [biddingPlayerIdx, setBiddingPlayerIdx] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [bidWinnerId, setBidWinnerId] = useState<number | null>(null);
  const [showTrumpSelection, setShowTrumpSelection] = useState<boolean>(false);
  const [roundResults, setRoundResults] = useState<{ scores: number[], batakPlayers: number[], winnerId?: number } | null>(null);
  const [lastGameCoins, setLastGameCoins] = useState<number>(0);
  const [showDailyReward, setShowDailyReward] = useState<boolean>(false);
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showThemeShop, setShowThemeShop] = useState<boolean>(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState<boolean>(false);
  const [ratingContext, setRatingContext] = useState<'win' | 'batak' | 'level' | 'streak'>('win');
  const [showProfileEdit, setShowProfileEdit] = useState<boolean>(false);
  const [noBatakStreak, setNoBatakStreak] = useState<number>(0);
  const [playedModes, setPlayedModes] = useState<Set<string>>(new Set());
  
  // Yeni state'ler
  const [bidHistory, setBidHistory] = useState<BidHistoryEntry[]>([]);
  const [lastTrickWinnerId, setLastTrickWinnerId] = useState<number | undefined>(undefined);
  const [showPowerUps, setShowPowerUps] = useState<boolean>(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState<boolean>(false);
  const [lastPlayedCard, setLastPlayedCard] = useState<{ playerId: number; card: Card } | null>(null);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [hintCard, setHintCard] = useState<Card | null>(null);
  
  // Bot kişilikleri
  const [botPersonalities, setBotPersonalities] = useState<{ personality: BotPersonality; name: string }[]>([]);
  
  // İhale bitiş kontrolü için ref (race condition önlemek için)
  const biddingEndingRef = useRef<boolean>(false);
  
  // Liderlik tablosu
  const [leaderboard, setLeaderboard] = useState<Leaderboard>(() => {
    const lb = loadLeaderboard();
    return populateWithBots(lb);
  });
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [lobbyTab, setLobbyTab] = useState<'game' | 'daily' | 'shop'>('game');
  
  // Mini oyunlar
  const [guessGame, setGuessGame] = useState<GuessGame | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showGuessGame, setShowGuessGame] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  
  // AdMob
  const [isAdReady, setIsAdReady] = useState<boolean>(false);
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [adRewardPending, setAdRewardPending] = useState<'coins' | 'double' | 'powerup' | 'adfree30' | null>(null);
  const [adFreeTimeLeft, setAdFreeTimeLeft] = useState<number>(0);
  const [showAdFreeShop, setShowAdFreeShop] = useState<boolean>(false);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [firstGameBonusClaimed, setFirstGameBonusClaimed] = useState<boolean>(false);

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    difficulty: Difficulty.MEDIUM,
    gameSpeed: 'normal',
    theme: 'kiraathane', 
    cardBack: 'green',
    houseRules: { macaCezasi: false, ilkElKozYasak: true, batakZorunlulugu: true, yanlisSaymaCezasi: false, onikiBatar: true, zorunluYukseltme: false, bonusEl: false },
    soundEnabled: true,
    soundPack: 'arcade',
    vibrationEnabled: true,
    botChatEnabled: false, // Botların konuşması - varsayılan kapalı
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    // LocalStorage'dan yükle veya varsayılan değerleri kullan
    const saved = localStorage.getItem('batakProfile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Eski profilleri yeni formata çevir
        if (!parsed.ownedThemes) parsed.ownedThemes = ['kiraathane', 'classic'];
        if (!parsed.dailyRewards) parsed.dailyRewards = getDailyRewards();
        if (!parsed.quests) parsed.quests = [...generateDailyQuests(), ...generateWeeklyQuests()];
        if (!parsed.achievements) parsed.achievements = getAllAchievements();
        if (!parsed.totalCoinsEarned) parsed.totalCoinsEarned = parsed.coins || 0;
        if (!parsed.totalCoinsSpent) parsed.totalCoinsSpent = 0;
        if (!parsed.streakDays) parsed.streakDays = 0;
        if (!parsed.xpToNextLevel) parsed.xpToNextLevel = 1000 + (parsed.level || 1) * 250;
        if (!parsed.ownedGameSpeeds) parsed.ownedGameSpeeds = ['slow', 'normal'];
        if (!parsed.ownedPowerUps) parsed.ownedPowerUps = [];
        if (parsed.vibrationEnabled === undefined) parsed.vibrationEnabled = true;
        if (!parsed.undoCount) parsed.undoCount = 0;
        if (!parsed.hintCount) parsed.hintCount = 0;
        if (!parsed.streakProtectionCount) parsed.streakProtectionCount = 0;
        // Yeni özellikler
        if (parsed.isOnboarded === undefined) parsed.isOnboarded = parsed.stats?.totalGames > 0; // Eski kullanıcılar için
        if (!parsed.gameHistory) parsed.gameHistory = [];
        if (!parsed.modeStats) parsed.modeStats = {};
        if (!parsed.trumpStats) parsed.trumpStats = {};
        if (!parsed.hourlyStats) parsed.hourlyStats = {};
        if (!parsed.themeMode) parsed.themeMode = 'system';
        return parsed;
      } catch {
        // Hatalı kayıt, varsayılan değerleri kullan
      }
    }
    return {
      level: 1, 
      currentXp: 0, 
      xpToNextLevel: 1000,
      coins: 500,
      username: 'OYUNCU', 
      avatarId: '', 
      league: 'Bronz',
      stats: { 
        totalGames: 0, 
        totalWins: 0, 
        totalBidsWon: 0, 
        totalBidsLost: 0, 
        maxBidRecord: 0, 
        totalTricks: 0, 
        batakRate: 0, 
        avgBid: 0, 
        highestTricksInOneRound: 0 
      },
      ownedTables: ['default'],
      ownedThemes: ['kiraathane', 'classic'],
      ownedGameSpeeds: ['slow', 'normal'],
      ownedPowerUps: [],
      dailyRewards: getDailyRewards(),
      streakDays: 0,
      quests: [...generateDailyQuests(), ...generateWeeklyQuests()],
      achievements: getAllAchievements(),
      totalCoinsEarned: 500,
      totalCoinsSpent: 0,
      vibrationEnabled: true,
      undoCount: 0,
      hintCount: 0,
      streakProtectionCount: 0,
      // Yeni özellikler
      isOnboarded: false,
      gameHistory: [],
      modeStats: {},
      trumpStats: {},
      hourlyStats: {},
      themeMode: 'system' as const,
    };
  });
  
  // Onboarding ve UI state'leri
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [onboardingName, setOnboardingName] = useState<string>('');
  const [onboardingAvatar, setOnboardingAvatar] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [gameEndMessage, setGameEndMessage] = useState<{ type: 'win' | 'lose' | 'batak'; coins: number } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const updateUserStats = (results: { scores: number[], batakPlayers: number[], winnerId?: number }, currentPlayers: Player[]) => {
    setUserProfile(prev => {
      const newStats = { ...prev.stats };
      newStats.totalGames += 1;
      
      const userPlayer = currentPlayers[0];
      if (!userPlayer) return prev;
      
      const isUserBatak = results.batakPlayers.includes(0);
      const isUserWinner = results.winnerId === 0 || (selectedMode === GameMode.ESLI && (results.winnerId === 0 || results.winnerId === 2));
      
      if (isUserWinner) {
        newStats.totalWins += 1;
      }
      
      if (userPlayer.currentBid > 0) {
        if (isUserBatak) {
          newStats.totalBidsLost += 1;
        } else {
          newStats.totalBidsWon += 1;
        }
        
        if (userPlayer.currentBid > newStats.maxBidRecord) {
          newStats.maxBidRecord = userPlayer.currentBid;
        }
        
        if (userPlayer.tricksWon > newStats.highestTricksInOneRound) {
          newStats.highestTricksInOneRound = userPlayer.tricksWon;
        }
      }
      
      newStats.totalTricks += userPlayer.tricksWon;
      
      const totalBids = newStats.totalBidsWon + newStats.totalBidsLost;
      if (totalBids > 0) {
        newStats.batakRate = Math.round((newStats.totalBidsLost / totalBids) * 100);
        // Ortalama ihale hesaplama (basitleştirilmiş)
        const avgBidSum = (newStats.totalBidsWon + newStats.totalBidsLost) * 7;
        newStats.avgBid = Math.round((avgBidSum / totalBids) * 10) / 10;
      }
      
      const updated = { ...prev, stats: newStats };
      localStorage.setItem('batakProfile', JSON.stringify(updated));
      return updated;
    });
  };

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const loadSounds = useCallback((pack: SoundPack) => {
    audioRefs.current = {
      deal: new Audio(SOUND_PACKS[pack].deal),
      play: new Audio(SOUND_PACKS[pack].play),
    };
  }, []);

  useEffect(() => {
    loadSounds(gameSettings.soundPack);
  }, [gameSettings.soundPack, loadSounds]);

  // AdMob, Analytics, Crashlytics, Push ve Store başlatma
  useEffect(() => {
    const setupServices = async () => {
      // Firebase Analytics başlat
      await initializeAnalytics();
      
      // Firebase Crashlytics başlat
      await initializeCrashlytics();
      setCrashlyticsUserId(userProfile.username || 'anonymous');
      
      // Push Notifications başlat
      await initializePushNotifications();
      
      // AdMob başlat (iOS'ta ATT izni de istenir)
      const initialized = await initializeAdMob();
      if (initialized) {
        await prepareRewardedAd();
        await prepareInterstitialAd();
        setIsAdReady(true);
      }
      
      // In-App Purchase store'u başlat
      await initializeStore();
      
      // User properties güncelle
      setUserProperties({
        level: userProfile.level,
        totalGames: userProfile.gamesPlayed,
        isPremium: isPremiumUser(),
      });
    };
    setupServices();
    
    // Günün ilk oyunu bonusu kontrolü
    if (isFirstGameOfDay()) {
      setFirstGameBonusClaimed(false);
    }
  }, []);

  // Banner kontrolü - Lobby ve Ayarlar'da göster, Oyun sırasında gizle
  useEffect(() => {
    if (!isAdReady) return;
    
    const adFreeStatus = getAdFreeStatus();
    
    // Tüm ekranlarda banner ads göster (reklamsız değilse)
    if (!adFreeStatus.isAdFree) {
      showBannerAd();
    } else {
      hideBannerAd();
    }
  }, [phase, isAdReady]);

  // Reklamsız süre geri sayımı
  useEffect(() => {
    const updateAdFreeTime = () => {
      const remaining = getRemainingAdFreeTime();
      setAdFreeTimeLeft(remaining);
    };
    
    updateAdFreeTime();
    const interval = setInterval(updateAdFreeTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Reklam izleme fonksiyonu
  const handleWatchAd = async (rewardType: 'coins' | 'double' | 'powerup' | 'adfree30') => {
    if (!canWatchRewardedAd()) {
      setMessage('Bugünkü reklam limitine ulaştın!');
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setAdRewardPending(rewardType);
    
    const success = await showRewardedAd((reward) => {
      incrementRewardedAdCount();
      
      // Analytics: Rewarded ad izlendi
      const analyticsRewardType = rewardType === 'coins' ? 'coins100' : 
                                  rewardType === 'double' ? 'double' : 
                                  rewardType === 'adfree30' ? 'adfree30' : 'coins100';
      logRewardedAdWatched({ 
        rewardType: analyticsRewardType as 'adfree30' | 'coins100' | 'coins200' | 'double',
        coinsEarned: rewardType === 'coins' ? 50 : rewardType === 'double' ? lastGameCoins : 0
      });
      
      if (rewardType === 'adfree30') {
        // 30 dakika reklamsız
        setAdFreeTime(30);
        hideBannerAd();
        setMessage('30 dakika reklamsız!');
        setTimeout(() => setMessage(null), 2000);
      } else {
        setUserProfile(prev => {
          let updated = { ...prev };
          
          if (rewardType === 'coins') {
            updated.coins += 50;
            updated.totalCoinsEarned += 50;
            logCoinEarned({ amount: 50, source: 'rewarded_ad' });
          } else if (rewardType === 'double' && lastGameCoins > 0) {
            updated.coins += lastGameCoins;
            updated.totalCoinsEarned += lastGameCoins;
            logCoinEarned({ amount: lastGameCoins, source: 'rewarded_ad' });
          } else if (rewardType === 'powerup') {
            updated.undoCount += 1;
          }
          
          localStorage.setItem('batakProfile', JSON.stringify(updated));
          return updated;
        });
        
        setMessage(rewardType === 'coins' ? '+50 Coin!' : rewardType === 'double' ? 'Coinler 2x!' : '+1 Geri Al!');
        setTimeout(() => setMessage(null), 2000);
      }
    });
    
    if (!success) {
      setMessage('Reklam yüklenemedi');
      setTimeout(() => setMessage(null), 2000);
    }
    
    setAdRewardPending(null);
  };
  
  // Günün ilk oyunu bonusu
  const handleFirstGameBonus = () => {
    if (claimFirstGameBonus()) {
      setFirstGameBonusClaimed(true);
      hideBannerAd();
      setMessage('🎁 15 dakika reklamsız!');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Oyun sonu interstitial reklam (artan sıklık) ve analytics
  const handleGameEndAd = async (didWin: boolean, coinsEarned: number = 0) => {
    incrementGameCount();
    
    // Analytics: Oyun sonu event'i
    logGameEnd({
      mode: selectedMode,
      result: didWin ? 'win' : 'lose',
      coinsEarned: coinsEarned,
      durationSeconds: Math.floor((Date.now() - (gameStartTime || Date.now())) / 1000),
      tricksWon: players[0]?.tricksWon || 0,
      bid: highestBid,
    });
    
    // Interstitial reklam
    if (shouldShowInterstitialAd(didWin) && canShowInterstitialAd()) {
      const shown = await showInterstitialAd();
      if (shown) {
        markInterstitialShown();
        incrementInterstitialAdCount();
        logInterstitialShown(incrementGameCount.length || 0);
      }
    }
  };
  
  // Coin ile reklamsız satın al
  const handleBuyAdFreeWithCoins = (packageId: string) => {
    const result = purchaseAdFreeWithCoins(userProfile.coins, packageId);
    
    if (result.success) {
      setUserProfile(prev => {
        const updated = {
          ...prev,
          coins: result.newCoins,
          totalCoinsSpent: prev.totalCoinsSpent + (prev.coins - result.newCoins),
        };
        localStorage.setItem('batakProfile', JSON.stringify(updated));
        return updated;
      });
      
      hideBannerAd();
      setShowAdFreeShop(false);
      
      const pkg = AD_FREE_PACKAGES.find(p => p.id === packageId);
      setMessage(`✅ ${pkg?.label} reklamsız aktif!`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage('Yetersiz coin!');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  // Günlük ödül kontrolü - lobby'de otomatik aç
  useEffect(() => {
    if (phase === GamePhase.LOBBY && canClaimDailyReward(userProfile)) {
      // İlk açılışta hemen açma, kullanıcı butona tıklasın
      // setShowDailyReward(true);
    }
  }, [phase, userProfile]);

  // Görev sıfırlama kontrolü
  useEffect(() => {
    if (phase === GamePhase.LOBBY) {
      // Günlük ve haftalık görevleri kontrol et
      if (shouldResetDailyQuests(userProfile) || shouldResetWeeklyQuests(userProfile)) {
        const updated = resetQuests(userProfile);
        setUserProfile(updated);
        localStorage.setItem('batakProfile', JSON.stringify(updated));
      }
      
      // Günlük challenge kontrolü
      if (shouldResetDailyChallenge(userProfile)) {
        const updated = resetDailyChallenge(userProfile);
        setUserProfile(updated);
        localStorage.setItem('batakProfile', JSON.stringify(updated));
      }
    }
  }, [phase]);
  
  // Vibrasyon fonksiyonu - çeşitli pattern'lar
  const vibrate = (type: 'tap' | 'win' | 'lose' | 'batak' | 'levelup' = 'tap') => {
    if (!gameSettings.vibrationEnabled || !userProfile.vibrationEnabled || !navigator.vibrate) return;
    
    const patterns: Record<string, number | number[]> = {
      tap: 20,
      win: [50, 50, 100, 50, 150], // Mutlu titreşim
      lose: [100, 50, 100], // Üzgün titreşim
      batak: [200, 100, 200, 100, 200], // Ağır titreşim
      levelup: [50, 30, 50, 30, 100, 50, 150], // Kutlama titreşimi
    };
    navigator.vibrate(patterns[type] || 20);
  };
  
  // Gece modu algılama
  useEffect(() => {
    const checkDarkMode = () => {
      if (userProfile.themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(isDark);
      } else {
        setIsDarkMode(userProfile.themeMode === 'dark');
      }
    };
    
    checkDarkMode();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    return () => mediaQuery.removeEventListener('change', checkDarkMode);
  }, [userProfile.themeMode]);
  
  // Onboarding kontrolü
  useEffect(() => {
    if (!userProfile.isOnboarded && phase === GamePhase.LOBBY) {
      setShowOnboarding(true);
    }
  }, [userProfile.isOnboarded, phase]);

  const playSfx = (key: 'deal' | 'play') => {
    if (!gameSettings.soundEnabled) return;
    const audio = audioRefs.current[key];
    if (audio) {
      // Yeni bir audio klonu oluştur - kesinti önlemek için
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = audio.volume;
      clone.play().catch(() => {});
      // Çalma bittikten sonra temizle
      clone.onended = () => clone.remove();
    }
  };

  // Bot düşünme süresi - değişkenlik eklenmiş
  const getSpeedDelay = (isHardDecision: boolean = false) => {
    const baseDelay = (() => {
    switch (gameSettings.gameSpeed) {
        case 'slow': return 1500;
        case 'fast': return 400;
        case 'turbo': return 150;
        default: return 800;
    }
    })();
    
    // Zor kararlarda %50 daha uzun düşün
    const multiplier = isHardDecision ? 1.5 : 1;
    // %20 rastgele değişkenlik ekle
    const randomVariation = 0.8 + Math.random() * 0.4;
    
    return Math.round(baseDelay * multiplier * randomVariation);
  };
  
  // Adaptive difficulty - son 5 oyuna göre zorluk ayarla
  const getAdaptiveDifficulty = (): Difficulty => {
    const history = userProfile.gameHistory || [];
    if (history.length < 3) return gameSettings.difficulty;
    
    const last5 = history.slice(0, 5);
    const winCount = last5.filter(g => g.won).length;
    const winRate = winCount / last5.length;
    
    // %80+ kazanma - zorlaştır
    if (winRate >= 0.8) {
      const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.LEGEND, Difficulty.INVINCIBLE];
      const currentIdx = difficulties.indexOf(gameSettings.difficulty);
      if (currentIdx < difficulties.length - 1) {
        return difficulties[currentIdx + 1];
      }
    }
    // %20- kazanma - kolaylaştır
    else if (winRate <= 0.2) {
      const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.LEGEND, Difficulty.INVINCIBLE];
      const currentIdx = difficulties.indexOf(gameSettings.difficulty);
      if (currentIdx > 0) {
        return difficulties[currentIdx - 1];
      }
    }
    
    return gameSettings.difficulty;
  };

  const triggerBotMessage = (playerId: number, type: 'win' | 'lose' | 'bid' | 'play') => {
    // Bot konuşmaları kapalıysa çık
    if (!gameSettings.botChatEnabled) return;
    
    // Gelişmiş bot kişilik sistemi kullan
    const botData = botPersonalities[playerId - 1];
    let msg: string;
    
    if (botData) {
      // Bağlama duyarlı cümle al
      const player = players[playerId];
      const isWinning = player && player.tricksWon > (trickCount / 2);
      
      const quoteType = type === 'win' ? 'trickWin' : 
                        type === 'lose' ? 'trickLose' : 
                        type === 'bid' ? 'bidHigh' : 'playFirst';
      
      msg = getAdvancedBotQuote(botData.personality, quoteType, {
        isWinning,
        tricksWon: player?.tricksWon || 0,
        trickCount,
      });
    } else {
      // Fallback - eski sistem
      msg = getBotQuote(type);
    }
    
    setBotMessages(prev => ({...prev, [playerId]: msg}));
    setTimeout(() => {
      setBotMessages(prev => ({...prev, [playerId]: null}));
    }, 2500);
  };

  const getThemeStyles = (theme: GameTheme) => {
    // Lokal SVG pattern'leri kullan (internetsiz çalışır)
    const patternStyle = `bg-[${getPatternCSS(theme)}]`;
    
    switch (theme) {
      case 'kiraathane': return { 
          bg: 'bg-emerald-950', 
          pattern: 'felt-texture', 
          accent: '#064e3b', 
          name: 'Kıraathane HD',
          isHD: true 
      };
      case 'casino': return { bg: 'bg-[#0f172a]', pattern: patternStyle, accent: '#10b981', name: 'Casino' };
      case 'wood': return { bg: 'bg-[#451a03]', pattern: patternStyle, accent: '#fbbf24', name: 'Ahşap' };
      case 'royal': return { bg: 'bg-[#7f1d1d]', pattern: patternStyle, accent: '#f87171', name: 'Saray' };
      case 'midnight': return { bg: 'bg-[#020617]', pattern: patternStyle, accent: '#60a5fa', name: 'Gece' };
      case 'vintage': return { bg: 'bg-[#44403c]', pattern: patternStyle, accent: '#a8a29e', name: 'Vintage' };
      case 'forest': return { bg: 'bg-[#14532d]', pattern: patternStyle, accent: '#22c55e', name: 'Orman' };
      case 'ocean': return { bg: 'bg-[#0c4a6e]', pattern: patternStyle, accent: '#0ea5e9', name: 'Okyanus' };
      case 'lava': return { bg: 'bg-[#7f1d1d]', pattern: patternStyle, accent: '#ef4444', name: 'Lav' };
      case 'sunset': return { bg: 'bg-[#7c2d12]', pattern: patternStyle, accent: '#f97316', name: 'Gün Batımı' };
      case 'space': return { bg: 'bg-[#030712]', pattern: patternStyle, accent: '#a855f7', name: 'Uzay' };
      case 'desert': return { bg: 'bg-[#78350f]', pattern: patternStyle, accent: '#fbbf24', name: 'Çöl' };
      case 'neon': return { bg: 'bg-[#0f172a]', pattern: patternStyle, accent: '#22d3ee', name: 'Neon' };
      default: return { bg: 'bg-[#064e3b]', pattern: patternStyle, accent: '#10b981', name: 'Klasik' };
    }
  };

  const initGame = () => {
    playSfx('deal');
    const deck = shuffleDeck(createDeck());
    
    // Analytics: Oyun başlangıç zamanı ve mod tracking
    setGameStartTime(Date.now());
    logGameModePlay(selectedMode);
    
    // Moda göre oyuncu sayısı belirle
    let playerCount = 4;
    let positions: Array<'bottom' | 'left' | 'top' | 'right'> = ['bottom', 'left', 'top', 'right'];
    
    if (selectedMode === GameMode.TEKLI) {
      playerCount = 2;
      positions = ['bottom', 'top'];
    } else if (selectedMode === GameMode.UCLU) {
      playerCount = 3;
      positions = ['bottom', 'left', 'top'];
    }
    
    const hands = dealCards(deck, playerCount);
    
    // Gelişmiş bot kişilikleri
    const botPersonalitiesData = getThreeUniqueBotPersonalities();
    setBotPersonalities(botPersonalitiesData);
    
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      if (i === 0) {
        newPlayers.push({
          id: 0,
          name: userProfile.username,
          isBot: false,
          hand: hands[0],
          tricksWon: 0,
          currentBid: 0,
          position: positions[0],
          totalScore: 0
        });
      } else {
        const botData = botPersonalitiesData[i - 1];
        newPlayers.push({
          id: i,
          name: botData?.name || `Bot ${i}`,
          isBot: true,
          hand: hands[i],
          personality: botData?.personality.style === 'aggressive' ? 'AGGRESSIVE' : 
                       botData?.personality.style === 'cautious' ? 'CAUTIOUS' : 'BALANCED',
          tricksWon: 0,
          currentBid: 0,
          position: positions[i],
          totalScore: 0
        });
      }
    }
    
    setPlayers(newPlayers);
    setTrickCount(0);
    setSpadesBroken(false);
    setCurrentTrick([]);
    setVisualTrick([]);
    setRoundResults(null);
    setShowScoreboard(false); 
    setBidWinnerId(null);
    setHighestBid(0);
    setBiddingPlayerIdx(0);
    setLastGameCoins(0);
    setBidHistory([]); // İhale geçmişini sıfırla
    setLastTrickWinnerId(undefined);
    setLastPlayedCard(null);
    setCanUndo(false);
    setHintCard(null);
    biddingEndingRef.current = false; // İhale bitiş flag'ini sıfırla

    // Oynanan modları kaydet
    setPlayedModes(prev => new Set([...prev, selectedMode]));

    // Mod bazlı başlangıç ayarları
    const biddingModes = [GameMode.IHALELI, GameMode.ESLI, GameMode.TEKLI, GameMode.UCLU, GameMode.KUMANDA];
    const noTrumpModes = [GameMode.IHALESIZ, GameMode.YERE_BATAK];
    const spadeTrumpModes = [GameMode.KOZ_MACA, GameMode.HIZLI, GameMode.ACIK_KOZ];
    
    if (biddingModes.includes(selectedMode)) {
      setIsBidding(true);
      setPhase(GamePhase.BIDDING);
      // Açık Koz modunda koz açıkça gösterilir
      if (selectedMode === GameMode.ACIK_KOZ) {
        const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
        setTrumpSuit(suits[Math.floor(Math.random() * suits.length)]);
      }
    } else if (noTrumpModes.includes(selectedMode)) {
      // İhalesiz ve Yere Batak: İlk eli kazanan koz seçer
      setTrumpSuit(null);
      setIsBidding(false);
      setPhase(GamePhase.PLAYING);
      logGameStart({ mode: selectedMode, difficulty: gameSettings.difficulty });
    } else if (spadeTrumpModes.includes(selectedMode)) {
      setTrumpSuit(Suit.SPADES);
      setIsBidding(false);
      setPhase(GamePhase.PLAYING);
      logGameStart({ mode: selectedMode, difficulty: gameSettings.difficulty, trumpSuit: Suit.SPADES });
    } else if (selectedMode === GameMode.CAPOT) {
      // Capot: Koz yok veya rastgele
      setTrumpSuit(null);
      setIsBidding(false);
      setPhase(GamePhase.PLAYING);
      logGameStart({ mode: selectedMode, difficulty: gameSettings.difficulty });
    } else {
      setTrumpSuit(Suit.SPADES);
      setIsBidding(false);
      setPhase(GamePhase.PLAYING);
      logGameStart({ mode: selectedMode, difficulty: gameSettings.difficulty, trumpSuit: Suit.SPADES });
    }
  };

  const makeBid = (playerId: number, bid: number | null) => {
    // İhale geçmişine ekle
    const playerName = players[playerId]?.name || `Oyuncu ${playerId}`;
    setBidHistory(prev => [...prev, {
      playerId,
      playerName,
      bid,
      timestamp: Date.now(),
    }]);
    
    vibrate('tap'); // Haptic feedback
    
    setPlayers(prev => {
      const updated = prev.map(p => {
        if (p.id === playerId) {
          if (bid === null) {
            return { ...p, currentBid: -1 };
          } else {
            return { ...p, currentBid: bid };
          }
        }
        return p;
      });
      
      // En yüksek ihaleyi bul ve güncelle
      let newHighestBid = highestBid;
      let newBidWinnerId = bidWinnerId;
      
      if (bid !== null && bid > newHighestBid) {
        newHighestBid = bid;
        newBidWinnerId = playerId;
        setHighestBid(bid);
        setBidWinnerId(playerId);
      }
      
      // Sıradaki oyuncuya geç
      const playerCount = prev.length;
      const nextPlayer = (playerId + 1) % playerCount;
      setBiddingPlayerIdx(nextPlayer);
      
      return updated;
    });
  };

  // İhale bitiş kontrolü için ayrı useEffect
  useEffect(() => {
    if (phase === GamePhase.BIDDING && isBidding && !biddingEndingRef.current) {
      const playerCount = players.length;
      const passCount = players.filter(p => p.currentBid === -1).length;
      const activeBidders = players.filter(p => p.currentBid > 0);
      
      // İhale bitiş koşulları:
      // 1. Sadece 1 kişi aktif ihale vermiş ve diğer herkes pas geçmiş
      // 2. VEYA herkes pas geçmiş
      const shouldEndBidding = 
        (activeBidders.length === 1 && passCount === playerCount - 1) || // 1 kazanan, kalanlar pas
        (passCount === playerCount); // Herkes pas
      
      if (shouldEndBidding) {
        // İhale bitiyor - ref'i işaretle (race condition önlemek için)
        biddingEndingRef.current = true;
        
        // İhale bitti
        setTimeout(() => {
          if (bidWinnerId !== null && activeBidders.length > 0) {
            // İhaleyi kazanan koz seçmeli
            const winner = players.find(p => p.id === bidWinnerId);
            if (winner && winner.isBot) {
              // Bot otomatik koz seçer
              const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
              const selectedSuit = suits[Math.floor(Math.random() * suits.length)];
              setTrumpSuit(selectedSuit);
              setPlayers(prev => prev.map(p => ({
                ...p,
                hand: sortHandWithTrump(p.hand, selectedSuit)
              })));
              setIsBidding(false);
              biddingEndingRef.current = false; // Sıfırla
              setPhase(GamePhase.PLAYING);
              setCurrentPlayerIdx(bidWinnerId);
            } else if (winner) {
              // Kullanıcı koz seçmeli
              setShowTrumpSelection(true);
            }
          } else {
            // Hiç kimse ihale yapmadı - koz maça olarak devam
    setTrumpSuit(Suit.SPADES); 
    setIsBidding(false);
            biddingEndingRef.current = false; // Sıfırla
            setPhase(GamePhase.PLAYING);
    setCurrentPlayerIdx(0);
          }
        }, 300);
      }
    }
  }, [phase, isBidding, players, bidWinnerId, biddingPlayerIdx]);

  const startBidding = (bid: number) => {
    makeBid(0, bid);
  };

  const playCard = (playerId: number, card: Card) => {
    const playerCount = players.length;
    if (currentTrick.length >= playerCount || isBidding) return;
    
    playSfx('play');
    vibrate('tap');
    
    // Undo için son hamleyi kaydet (sadece kullanıcı için)
    if (playerId === 0 && currentTrick.length === 0) {
      setLastPlayedCard({ playerId, card });
      setCanUndo(true);
    } else {
      setCanUndo(false);
    }
    
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, hand: p.hand.filter(c => c.id !== card.id) } : p));
    if (card.suit === trumpSuit) setSpadesBroken(true);
    const played = { playerId, card };
    setCurrentTrick(prev => [...prev, played]);
    setVisualTrick(prev => [...prev, played]);
    
    if (players[playerId].isBot && Math.random() > 0.7) {
      triggerBotMessage(playerId, 'play');
    }

    if (currentTrick.length < playerCount - 1) setCurrentPlayerIdx((playerId + 1) % playerCount);
  };
  
  // Geri al (Undo) fonksiyonu
  const handleUndo = () => {
    if (!canUndo || !lastPlayedCard || userProfile.undoCount <= 0) return;
    
    // Power-up kullan
    const result = usePowerUp(userProfile, 'undo');
    if (!result.success) return;
    
    setUserProfile(result.newProfile);
    localStorage.setItem('batakProfile', JSON.stringify(result.newProfile));
    
    // Kartı geri ekle
    setPlayers(prev => prev.map(p => {
      if (p.id === lastPlayedCard.playerId) {
        return { ...p, hand: [...p.hand, lastPlayedCard.card] };
      }
      return p;
    }));
    
    // Trick'ten kaldır
    setCurrentTrick(prev => prev.filter(pt => pt.card.id !== lastPlayedCard.card.id));
    setVisualTrick(prev => prev.filter(pt => pt.card.id !== lastPlayedCard.card.id));
    
    setCanUndo(false);
    setLastPlayedCard(null);
    setCurrentPlayerIdx(0);
  };
  
  // İpucu fonksiyonu
  const handleHint = () => {
    if (userProfile.hintCount <= 0 || currentPlayerIdx !== 0) return;
    
    // Power-up kullan
    const result = usePowerUp(userProfile, 'hint');
    if (!result.success) return;
    
    setUserProfile(result.newProfile);
    localStorage.setItem('batakProfile', JSON.stringify(result.newProfile));
    
    // En iyi kartı bul
    const hand = players[0]?.hand || [];
    const legalMoves = hand.filter(card => 
      isValidMove(card, hand, currentTrick, trumpSuit, spadesBroken, trickCount, gameSettings.houseRules)
    );
    
    if (legalMoves.length > 0) {
      // Basit strateji: en yüksek kartı öner
      legalMoves.sort((a, b) => b.rank - a.rank);
      setHintCard(legalMoves[0]);
      
      // 3 saniye sonra ipucunu kaldır
      setTimeout(() => setHintCard(null), 3000);
    }
  };

  // Kullanıcı pas geçtiyse veya en yüksek ihale verdiyse sırayı otomatik geç
  useEffect(() => {
    // İhale bitiyorsa işlem yapma
    if (biddingEndingRef.current) return;
    
    if (phase === GamePhase.BIDDING && isBidding && biddingPlayerIdx === 0) {
      const user = players[0];
      if (!user) return;
      
      // Kullanıcı pas geçtiyse sırayı geç
      if (user.currentBid === -1) {
        const nextPlayer = (biddingPlayerIdx + 1) % players.length;
        setTimeout(() => {
          if (!biddingEndingRef.current) {
            setBiddingPlayerIdx(nextPlayer);
          }
        }, 300);
      }
      // Kullanıcı en yüksek ihaleyi verdiyse ve bekliyor
      else if (user.currentBid === highestBid && highestBid > 0) {
        // Bekle, diğerleri cevap versin - sırayı geç
        const nextPlayer = (biddingPlayerIdx + 1) % players.length;
        setTimeout(() => {
          if (!biddingEndingRef.current) {
            setBiddingPlayerIdx(nextPlayer);
          }
        }, 500);
      }
    }
  }, [phase, isBidding, biddingPlayerIdx, players, highestBid]);

  // Bot ihale mantığı
  useEffect(() => {
    // İhale bitiyorsa işlem yapma
    if (biddingEndingRef.current) return;
    
    if (phase === GamePhase.BIDDING && isBidding && players[biddingPlayerIdx]?.isBot) {
      const bot = players[biddingPlayerIdx];
      if (!bot) return;
      
      // Bot pas geçtiyse (-1) bir daha ihale yapamaz
      if (bot.currentBid === -1) {
        const nextPlayer = (biddingPlayerIdx + 1) % players.length;
        setTimeout(() => {
          if (!biddingEndingRef.current) {
            setBiddingPlayerIdx(nextPlayer);
          }
        }, 300);
        return;
      }
      
      // Bot zaten en yüksek ihaleyi verdiyse bekle
      if (bot.currentBid > 0 && bot.currentBid === highestBid && bidWinnerId === bot.id) {
        const nextPlayer = (biddingPlayerIdx + 1) % players.length;
        setTimeout(() => {
          if (!biddingEndingRef.current) {
            setBiddingPlayerIdx(nextPlayer);
          }
        }, 300);
        return;
      }
      
      // Bot ihale yapabilir (henüz yapmadı veya birisi daha yüksek yaptı)
      const delay = getSpeedDelay();
      const t = setTimeout(() => {
        if (biddingEndingRef.current) return;
        
          const botBid = getBotBid(
            bot.hand,
            highestBid,
            gameSettings.difficulty,
            biddingPlayerIdx
          );
          
        // botBid null ise veya highestBid'den büyük değilse pas geç
        if (!botBid || botBid <= highestBid) {
            // Pas geçti
            if (Math.random() > 0.5) {
              setBotMessages(prev => ({...prev, [biddingPlayerIdx]: 'Pas'}));
            setTimeout(() => setBotMessages(prev => ({...prev, [biddingPlayerIdx]: null})), 1500);
            }
          makeBid(biddingPlayerIdx, null);
        } else {
          // İhale yap
          if (Math.random() > 0.3) {
            triggerBotMessage(biddingPlayerIdx, 'bid');
          }
          makeBid(biddingPlayerIdx, botBid);
        }
      }, delay);
      return () => clearTimeout(t);
      }
  }, [phase, isBidding, biddingPlayerIdx, players, highestBid, bidWinnerId, gameSettings.difficulty]);

  // Bot kart oynama mantığı
  useEffect(() => {
    if (phase === GamePhase.PLAYING && !isBidding && !showTrumpSelection && players[currentPlayerIdx]?.isBot && currentTrick.length < 4) {
      const delay = getSpeedDelay();
      const t = setTimeout(() => {
        const bot = players[currentPlayerIdx];
        const card = getBotMove(
          bot.hand, 
          currentTrick, 
          trumpSuit, 
          spadesBroken, 
          trickCount, 
          gameSettings.houseRules,
          gameSettings.difficulty,
          bot.currentBid,
          bot.tricksWon
        );
        playCard(currentPlayerIdx, card);
      }, delay);
      return () => clearTimeout(t);
    }
  }, [phase, isBidding, showTrumpSelection, currentPlayerIdx, currentTrick, players, trumpSuit, spadesBroken, trickCount, gameSettings]);

  const selectTrumpSuit = (suit: Suit) => {
    setTrumpSuit(suit);
    // Kartları koz rengine göre sırala
    setPlayers(prev => prev.map(p => ({
      ...p,
      hand: sortHandWithTrump(p.hand, suit)
    })));
    setShowTrumpSelection(false);
    setIsBidding(false);
    biddingEndingRef.current = false; // İhale bitiş flag'ini sıfırla
    setPhase(GamePhase.PLAYING);
    if (bidWinnerId !== null) {
      setCurrentPlayerIdx(bidWinnerId);
    }
    
    // Analytics: Koz seçimi ve oyun başlangıcı
    logTrumpSelected(suit, selectedMode);
    logGameStart({
      mode: selectedMode,
      difficulty: gameSettings.difficulty,
      trumpSuit: suit
    });
  };

  const endRound = () => {
    setPlayers(currentPlayers => {
      const totalTricks = selectedMode === GameMode.HIZLI ? 6 : 13;
      const results = calculateRoundScore(currentPlayers, selectedMode, gameSettings.houseRules, totalTricks);
      setRoundResults(results);
      
      const userPlayer = currentPlayers[0];
      const isUserWinner = results.winnerId === 0 || (selectedMode === GameMode.ESLI && (results.winnerId === 0 || results.winnerId === 2));
      const isUserBatak = results.batakPlayers.includes(0);
      const perfectGame = userPlayer.tricksWon === totalTricks;
      const bid13 = userPlayer.currentBid === 13 && !isUserBatak;
      
      // Rating sistemi: Kazanç kaydet ve uygun anı kontrol et
      if (isUserWinner) {
        recordWin();
        
        // Batak yapıp kazandıysa özel trigger
        if (results.batakPlayers.some(id => id !== 0) && perfectGame) {
          if (shouldShowAfterBatak()) {
            setTimeout(() => {
              setRatingContext('batak');
              setShowRatingPrompt(true);
            }, 2000);
          }
        } else if (shouldShowRatingPrompt()) {
          // Normal kazanç sonrası rating prompt
          setTimeout(() => {
            setRatingContext('win');
            setShowRatingPrompt(true);
          }, 2000);
        }
      }
      
      // Zorluk seviyesine göre coin ödülleri
      const difficultyCoins = getDifficultyCoins(gameSettings.difficulty);
      
      // Coins kazanma/kaybetme
      let coinsEarned = 0;
      if (isUserWinner) {
        coinsEarned += difficultyCoins.win; // Zorluk seviyesine göre
        if (userProfile.stats.totalWins === 0) {
          coinsEarned += COINS_REWARDS.WIN_GAME_BONUS; // İlk galibiyet bonusu
        }
        if (perfectGame) {
          coinsEarned += COINS_REWARDS.PERFECT_GAME;
        }
      } else {
        // Kaybetme durumu
        if (isUserBatak) {
          coinsEarned = -difficultyCoins.batak; // Batak yapma cezası
        } else {
          coinsEarned = -difficultyCoins.lose; // Normal kaybetme cezası
        }
      }
      
      // XP kazanma
      let xpEarned = 0;
      if (isUserWinner) {
        xpEarned += XP_REWARDS.WIN_GAME;
      }
      xpEarned += userPlayer.tricksWon * XP_REWARDS.WIN_TRICK;
      
      // Batak streak güncelle
      if (isUserBatak) {
        setNoBatakStreak(0);
      } else if (isUserWinner) {
        setNoBatakStreak(prev => prev + 1);
      }
      
      // Son oyun coin'lerini kaydet
      setLastGameCoins(coinsEarned);
      
      // Profil güncelle
      setUserProfile(prev => {
        let updated = { ...prev };
        
        // Coins ekle/çıkar (negatif olabilir)
        updated.coins = Math.max(0, updated.coins + coinsEarned); // Negatif olamaz
        if (coinsEarned > 0) {
          updated.totalCoinsEarned += coinsEarned;
        } else {
          updated.totalCoinsSpent += Math.abs(coinsEarned);
        }
        
        // XP ekle ve seviye kontrolü
        const xpResult = addXp(updated, xpEarned);
        updated = xpResult.newProfile;
        if (xpResult.leveledUp && xpResult.newLevel) {
          updated.coins += COINS_REWARDS.LEVEL_UP;
          updated.totalCoinsEarned += COINS_REWARDS.LEVEL_UP;
        }
        
        // İstatistikleri güncelle
        updated.stats.totalGames += 1;
        if (isUserWinner) {
          updated.stats.totalWins += 1;
        }
        if (userPlayer.currentBid > 0) {
          if (isUserBatak) {
            updated.stats.totalBidsLost += 1;
          } else {
            updated.stats.totalBidsWon += 1;
          }
          if (userPlayer.currentBid > updated.stats.maxBidRecord) {
            updated.stats.maxBidRecord = userPlayer.currentBid;
          }
        }
        updated.stats.totalTricks += userPlayer.tricksWon;
        if (userPlayer.tricksWon > updated.stats.highestTricksInOneRound) {
          updated.stats.highestTricksInOneRound = userPlayer.tricksWon;
        }
        
        const totalBids = updated.stats.totalBidsWon + updated.stats.totalBidsLost;
        if (totalBids > 0) {
          updated.stats.batakRate = Math.round((updated.stats.totalBidsLost / totalBids) * 100);
        }
        
        // Görevleri güncelle
        let questCoins = 0;
        updated.quests = updated.quests.map(quest => {
          if (quest.completed) return quest;
          
          let newProgress = quest.progress;
          if (quest.id === 'daily_win_3' && isUserWinner) {
            newProgress += 1;
          } else if (quest.id === 'daily_play_5') {
            newProgress += 1;
          } else if (quest.id === 'daily_tricks_30') {
            newProgress += userPlayer.tricksWon;
          } else if (quest.id === 'daily_no_batak' && isUserWinner && !isUserBatak) {
            newProgress = 1;
          } else if (quest.id === 'weekly_win_20' && isUserWinner) {
            newProgress += 1;
          } else if (quest.id === 'weekly_play_50') {
            newProgress += 1;
          } else if (quest.id === 'weekly_perfect_3' && perfectGame) {
            newProgress += 1;
          }
          
          const completed = newProgress >= quest.target;
          if (completed && !quest.completed) {
            questCoins += quest.reward;
          }
          
          return {
            ...quest,
            progress: Math.min(newProgress, quest.target),
            completed,
            completedDate: completed && !quest.completed ? new Date().toISOString() : quest.completedDate,
          };
        });
        
        updated.coins += questCoins;
        updated.totalCoinsEarned += questCoins;
        
        // Başarımları kontrol et
        const achievementResult = checkAndUnlockAchievements(updated, {
          gamesPlayed: updated.stats.totalGames,
          gamesWon: updated.stats.totalWins,
          tricksWon: updated.stats.totalTricks,
          perfectGame,
          noBatakStreak: noBatakStreak + (isUserWinner && !isUserBatak ? 1 : 0),
          bid13,
          level: updated.level,
          modesPlayed: Array.from(playedModes),
          coins: updated.coins,
        });
        updated = achievementResult.newProfile;
        
        // Son oyun sonucunu kaydet
        updated.lastGameResult = {
          mode: selectedMode,
          won: isUserWinner,
          coinsEarned,
          tricksWon: userPlayer.tricksWon,
          bid: userPlayer.currentBid,
          wasBatak: isUserBatak,
          timestamp: new Date().toISOString(),
          trumpSuit: trumpSuit || undefined,
        };
        
        // Oyun geçmişine ekle (son 5 oyun)
        const historyEntry = {
          mode: selectedMode,
          won: isUserWinner,
          coinsEarned,
          tricksWon: userPlayer.tricksWon,
          bid: userPlayer.currentBid,
          wasBatak: isUserBatak,
          trumpSuit: trumpSuit || undefined,
          timestamp: new Date().toISOString(),
          difficulty: gameSettings.difficulty,
        };
        updated.gameHistory = [historyEntry, ...(updated.gameHistory || [])].slice(0, 5);
        
        // Mod istatistiklerini güncelle
        const modeKey = selectedMode;
        if (!updated.modeStats) updated.modeStats = {};
        if (!updated.modeStats[modeKey]) {
          updated.modeStats[modeKey] = { played: 0, won: 0, totalTricks: 0 };
        }
        updated.modeStats[modeKey].played += 1;
        if (isUserWinner) updated.modeStats[modeKey].won += 1;
        updated.modeStats[modeKey].totalTricks += userPlayer.tricksWon;
        
        // Koz istatistiklerini güncelle
        if (trumpSuit) {
          if (!updated.trumpStats) updated.trumpStats = {};
          if (!updated.trumpStats[trumpSuit]) {
            updated.trumpStats[trumpSuit] = { used: 0, won: 0 };
          }
          updated.trumpStats[trumpSuit].used += 1;
          if (isUserWinner) updated.trumpStats[trumpSuit].won += 1;
        }
        
        // Saatlik istatistikler
        const currentHour = new Date().getHours();
        if (!updated.hourlyStats) updated.hourlyStats = {};
        updated.hourlyStats[currentHour] = (updated.hourlyStats[currentHour] || 0) + 1;
        
        // Günlük challenge progress
        if (updated.dailyChallenge && !updated.dailyChallenge.completed) {
          let challengeProgress = updated.dailyChallenge.progress;
          const challenge = updated.dailyChallenge;
          
          if (challenge.id.includes('win') && isUserWinner) {
            if (!challenge.mode || challenge.mode === selectedMode) {
              challengeProgress += 1;
            }
          } else if (challenge.id.includes('play')) {
            challengeProgress += 1;
          } else if (challenge.id.includes('tricks')) {
            challengeProgress += userPlayer.tricksWon;
          } else if (challenge.id.includes('no_batak') && !isUserBatak) {
            challengeProgress += 1;
          } else if (challenge.id.includes('perfect') && perfectGame) {
            challengeProgress = 1;
          }
          
          const challengeCompleted = challengeProgress >= challenge.target;
          updated.dailyChallenge = {
            ...challenge,
            progress: challengeProgress,
            completed: challengeCompleted,
          };
          
          if (challengeCompleted && !challenge.completed) {
            updated.coins += challenge.reward;
            updated.totalCoinsEarned += challenge.reward;
          }
        }
        
        // LocalStorage'a kaydet
        localStorage.setItem('batakProfile', JSON.stringify(updated));
        
        return updated;
      });
      
      // İstatistikleri güncelle (eski fonksiyon)
      updateUserStats(results, currentPlayers);
      
      // Skorları güncelle
      const updated = currentPlayers.map((p, idx) => ({
        ...p,
        totalScore: p.totalScore + (results.scores[idx] || 0)
      }));
      
      // Oyun sonu mesajı ve efektler
      const userWon = results.winnerId === 0 || (selectedMode === GameMode.ESLI && (results.winnerId === 0 || results.winnerId === 2));
      const userBatak = results.batakPlayers.includes(0);
      const endCoins = getDifficultyCoins(gameSettings.difficulty);
      
      if (userWon) {
        setShowConfetti(true);
        vibrate('win');
        setGameEndMessage({ type: 'win', coins: endCoins.win });
        setTimeout(() => setShowConfetti(false), 4000);
      } else if (userBatak) {
        vibrate('batak');
        setGameEndMessage({ type: 'batak', coins: -endCoins.batak });
      } else {
        vibrate('lose');
        setGameEndMessage({ type: 'lose', coins: -endCoins.lose });
      }
      
      // Mesajı temizle
      setTimeout(() => setGameEndMessage(null), 5000);
      
      setPhase(GamePhase.RESULT);
      return updated;
    });
  };

  useEffect(() => {
    if (currentTrick.length === 4 || (selectedMode === GameMode.TEKLI && currentTrick.length === 2) || (selectedMode === GameMode.UCLU && currentTrick.length === 3)) {
      const requiredTricks = selectedMode === GameMode.TEKLI ? 2 : selectedMode === GameMode.UCLU ? 3 : 4;
      
      if (currentTrick.length === requiredTricks) {
      setTimeout(() => {
        const winnerId = determineTrickWinner(currentTrick, trumpSuit);
        setPlayers(prev => prev.map(p => p.id === winnerId ? { ...p, tricksWon: p.tricksWon + 1 } : p));
        
        if (players[winnerId].isBot && Math.random() > 0.5) {
          triggerBotMessage(winnerId, 'win');
        }

          // İhalesiz mod: İlk eli kazanan koz seçer
          if (selectedMode === GameMode.IHALESIZ && trickCount === 0 && !trumpSuit) {
            if (winnerId === 0) {
              // Kullanıcı kazandı, koz seçmeli
              setShowTrumpSelection(true);
            } else {
              // Bot kazandı, otomatik koz seç
              const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
              const selectedSuit = suits[Math.floor(Math.random() * suits.length)];
              setTrumpSuit(selectedSuit);
              setPlayers(prev => prev.map(p => ({
                ...p,
                hand: sortHandWithTrump(p.hand, selectedSuit)
              })));
            }
        }

        // Kart toplama animasyonunu başlat
        setTrickWinnerId(winnerId);
        setIsCollectingTrick(true);
        
        // Animasyon süresi sonunda kartları temizle
        setTimeout(() => {
        setCurrentTrick([]);
        setVisualTrick([]);
          setIsCollectingTrick(false);
          setTrickWinnerId(null);
        }, 500); // Animasyon süresi
        
          setTrickCount(prev => {
            const newCount = prev + 1;
            const maxTricks = selectedMode === GameMode.HIZLI ? 6 : 13;
            if (newCount === maxTricks) {
              // El tamamlandı, oyun bitti
              setTimeout(() => endRound(), getSpeedDelay() + 500);
            }
            return newCount;
          });
          setCurrentPlayerIdx(winnerId);
      }, getSpeedDelay());
    }
    }
  }, [currentTrick, trumpSuit, players, trickCount, selectedMode]);

  const renderLobby = () => (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#064e3b] to-[#022c22] relative z-10">
      {/* Header - Sabit */}
      <div className="flex-shrink-0 p-4 pt-12">
        <div className="w-full max-w-2xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-2xl p-3 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowProfileEdit(true)}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg text-lg">
              {userProfile.avatarId || <UserIcon size={18}/>}
          </div>
          <div className="flex flex-col">
              <h3 className="text-white font-bold text-xs">{userProfile.username}</h3>
              <span className="text-[8px] text-emerald-400 font-black">Lv.{userProfile.level} • {userProfile.league}</span>
          </div>
        </div>
        
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
              <Coins size={10} className="text-yellow-400"/><span className="text-yellow-500 font-black text-[10px]">{userProfile.coins.toLocaleString()}</span>
            </div>
            <button onClick={() => setPhase(GamePhase.STATISTICS)} className="bg-white/10 p-2 rounded-lg text-white"><BarChart3 size={16}/></button>
            <button onClick={() => setShowSettings(true)} className="bg-white/10 p-2 rounded-lg text-white"><Settings size={16}/></button>
        </div>
      </div>
        </div>

      {/* Content - Scrollable - Tab bar (~50px) + Banner (~50px) için padding */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <div className="w-full max-w-2xl mx-auto">
          {/* Logo */}
          <div className="text-center py-3">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl">
          BATAK<span className="text-emerald-500">PRO</span>
        </h1>
      </div>

          {/* Tab Content */}
          {lobbyTab === 'game' && (
            <>
              {/* Oyun Modları - Büyütülmüş */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { mode: GameMode.IHALELI, icon: <Zap size={24}/>, label: 'İHALELİ' },
                  { mode: GameMode.KOZ_MACA, icon: <Spade size={24}/>, label: 'KOZ MAÇA' },
                  { mode: GameMode.IHALESIZ, icon: <Flame size={24}/>, label: 'İHALESİZ' },
                  { mode: GameMode.ESLI, icon: <ShieldCheck size={24}/>, label: 'EŞLİ' },
                  { mode: GameMode.TEKLI, icon: <UserIcon size={24}/>, label: 'TEKLİ' },
                  { mode: GameMode.UCLU, icon: <Layers size={24}/>, label: 'ÜÇLÜ' },
                  { mode: GameMode.HIZLI, icon: <Zap size={24}/>, label: 'HIZLI' },
                  { mode: GameMode.YERE_BATAK, icon: <Target size={24}/>, label: 'YERE' },
                  { mode: GameMode.ACIK_KOZ, icon: <Award size={24}/>, label: 'AÇIK KOZ' },
                  { mode: GameMode.CAPOT, icon: <Skull size={24}/>, label: 'CAPOT' },
                  { mode: GameMode.KUMANDA, icon: <Trophy size={24}/>, label: 'KUMANDA' },
                ].map(({ mode, icon, label }) => (
          <button 
            key={mode} 
                    onClick={() => { setSelectedMode(mode); setPhase(GamePhase.RULES_SETUP); }}
                    className={`group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${selectedMode === mode ? 'bg-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400">{icon}</div>
                    <span className="text-white font-black uppercase text-[9px] tracking-wide text-center">{label}</span>
          </button>
        ))}
      </div>
      
              {/* Günlük Challenge - Kompakt */}
              {userProfile.dailyChallenge && !userProfile.dailyChallenge.completed && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-400/30 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold text-xs flex items-center gap-1"><Flame size={12} className="text-orange-400" /> {userProfile.dailyChallenge.title}</span>
                    <span className="text-yellow-400 font-black text-xs">{userProfile.dailyChallenge.reward}🪙</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: `${Math.min((userProfile.dailyChallenge.progress / userProfile.dailyChallenge.target) * 100, 100)}%` }}/>
                  </div>
                </div>
              )}

              {/* Günün İlk Oyunu Bonusu */}
              {isFirstGameOfDay() && !firstGameBonusClaimed && (
        <button 
                  onClick={handleFirstGameBonus}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-3 rounded-xl shadow-xl hover:scale-105 transition-all uppercase tracking-wide text-xs flex items-center justify-center gap-2 mb-4 animate-pulse"
                >
                  <span className="text-lg">🎁</span>
                  GÜNÜN İLK OYUNU = 15 DK REKLAMSIZ
                </button>
              )}

              {/* Reklamsız Mod Göstergesi */}
              {adFreeTimeLeft > 0 && (
                <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-400/30 mb-4 flex items-center justify-between">
                  <span className="text-white font-bold text-xs flex items-center gap-2">🛡️ REKLAMSIZ</span>
                  <span className="text-emerald-400 font-black text-sm">{formatRemainingTime(adFreeTimeLeft)}</span>
                </div>
              )}
            </>
          )}

          {lobbyTab === 'daily' && (
            <div className="space-y-3">
              {/* Günlük Ödül */}
              <button 
                onClick={() => setShowDailyReward(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black py-4 rounded-xl shadow-xl hover:scale-105 transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-2"
              >
                <Trophy size={18} />
          GÜNLÜK ÖDÜL ({getCurrentStreakDay(userProfile) || 1}/7)
        </button>

              {/* Görevler */}
        <button 
          onClick={() => setShowQuests(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black py-4 rounded-xl shadow-xl hover:scale-105 transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-2"
        >
                <Target size={18} />
          GÖREVLER
        </button>

              {/* Başarımlar */}
        <button 
          onClick={() => setShowAchievements(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black py-4 rounded-xl shadow-xl hover:scale-105 transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-2"
        >
                <Award size={18} />
          BAŞARIMLAR
        </button>

              {/* Liderlik */}
              <button 
                onClick={() => setShowLeaderboard(true)}
                className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Trophy size={18} className="text-yellow-400" />
                LİDERLİK TABLOSU
              </button>

              {/* Mini Oyunlar */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button 
                  onClick={() => { if (!guessGame || isGuessGameExpired(guessGame)) setGuessGame(generateGuessGame()); setShowGuessGame(true); }}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-white font-bold py-3 rounded-xl text-xs flex flex-col items-center gap-1"
                >
                  <span className="text-xl">🎯</span>
                  TAHMİN ET <span className="text-yellow-400 text-[10px]">+100🪙</span>
                </button>
                <button 
                  onClick={() => { if (!quiz || isQuizExpired(quiz)) setQuiz(generateWeeklyQuiz()); setShowQuiz(true); }}
                  className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-white font-bold py-3 rounded-xl text-xs flex flex-col items-center gap-1"
                >
                  <span className="text-xl">📝</span>
                  HAFTALIK QUIZ <span className="text-yellow-400 text-[10px]">+250🪙</span>
                </button>
            </div>
        </div>
      )}
      
          {lobbyTab === 'shop' && (
            <div className="space-y-3">
              {/* Power-Up'lar */}
        <button 
          onClick={() => setShowPowerUps(true)}
                className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 text-white font-black py-4 rounded-xl hover:scale-105 transition-all text-sm flex items-center justify-center gap-2"
        >
                <Zap size={18} className="text-yellow-400" />
          POWER-UP'LAR
          {(userProfile.undoCount + userProfile.hintCount + userProfile.streakProtectionCount) > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
              {userProfile.undoCount + userProfile.hintCount + userProfile.streakProtectionCount}
            </span>
          )}
        </button>

              {/* Tema Mağazası */}
        <button 
                onClick={() => setShowThemeShop(true)}
                className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-white font-black py-4 rounded-xl hover:scale-105 transition-all text-sm flex items-center justify-center gap-2"
        >
                <Palette size={18} className="text-purple-400" />
                TEMA MAĞAZASI
        </button>

              {/* Reklam Seçenekleri */}
              {adFreeTimeLeft === 0 && (
                <>
                  {canWatchRewardedAd() && (
        <button 
                      onClick={() => handleWatchAd('adfree30')}
                      disabled={adRewardPending !== null}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black py-4 rounded-xl shadow-xl hover:scale-105 transition-all uppercase tracking-wide text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      🎬 REKLAM İZLE = 30 DK REKLAMSIZ
        </button>
                  )}
                  {canWatchRewardedAd() && (
        <button 
                      onClick={() => handleWatchAd('coins')}
                      disabled={adRewardPending !== null}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-3 rounded-xl shadow-xl hover:scale-105 transition-all uppercase tracking-wide text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      🎬 REKLAM İZLE = 50 COİN <span className="text-white/60 text-[10px]">({getRemainingRewardedAds()} kaldı)</span>
        </button>
                  )}
                  <button 
                    onClick={() => setShowAdFreeShop(true)}
                    className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all text-xs flex items-center justify-center gap-2"
                  >
                    <Coins size={14} className="text-yellow-400" />
                    COİN İLE REKLAMSIZ SATIN AL
                  </button>
                </>
              )}

              {/* Reklamsız durum */}
              {adFreeTimeLeft > 0 && (
                <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-400/30 text-center">
                  <span className="text-white font-bold text-sm">🛡️ REKLAMSIZ MOD AKTİF</span>
                  <div className="text-emerald-400 font-black text-2xl mt-1">{formatRemainingTime(adFreeTimeLeft)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Section - Tab Bar + Banner Ad */}
      <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 flex flex-col">
        {/* Banner Ad Alanı - EN ALTTA (AdMob banner buraya render edilecek) */}
        <div className="h-[50px] bg-black/40" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}></div>
        
        {/* Tab Bar - Banner'ın ÜSTÜNDE */}
        <div className="absolute bottom-[50px] left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-2" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="flex justify-around max-w-lg mx-auto">
            <button 
              onClick={() => setLobbyTab('game')}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-xl transition-all ${lobbyTab === 'game' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50'}`}
            >
              <Play size={18} />
              <span className="text-[8px] font-bold uppercase">Oyna</span>
            </button>
            <button 
              onClick={() => setLobbyTab('daily')}
              className={`relative flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-xl transition-all ${lobbyTab === 'daily' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50'}`}
            >
              <Trophy size={18} />
              <span className="text-[8px] font-bold uppercase">Günlük</span>
              {canClaimDailyReward(userProfile) && <span className="absolute top-0 right-4 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <button 
              onClick={() => setLobbyTab('shop')}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-xl transition-all ${lobbyTab === 'shop' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50'}`}
            >
              <Coins size={18} />
              <span className="text-[8px] font-bold uppercase">Dükkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="w-full h-full flex flex-col items-center px-4 pt-14 pb-6 bg-[#020617] relative z-10 overflow-y-auto">
        {/* Safe area için üst boşluk */}
        <div className="w-full max-w-md flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white italic">İSTATİSTİKLER</h2>
            <button onClick={() => setPhase(GamePhase.LOBBY)} className="p-2 bg-white/10 rounded-xl text-white/60 hover:bg-white/20"><X /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {[
                { icon: <Trophy className="text-yellow-400"/>, label: 'Toplam Galibiyet', value: userProfile.stats.totalWins, total: userProfile.stats.totalGames },
                { icon: <Zap className="text-emerald-400"/>, label: 'Kazanılan İhale', value: userProfile.stats.totalBidsWon, total: userProfile.stats.totalBidsWon + userProfile.stats.totalBidsLost },
                { icon: <Skull className="text-rose-400"/>, label: 'Batak Sayısı', value: userProfile.stats.totalBidsLost },
                { icon: <Target className="text-blue-400"/>, label: 'En Yüksek İhale', value: userProfile.stats.maxBidRecord },
                { icon: <TrendingUp className="text-orange-400"/>, label: 'Ortalama İhale', value: userProfile.stats.avgBid },
                { icon: <Award className="text-purple-400"/>, label: 'Toplam El', value: userProfile.stats.totalTricks }
            ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        {stat.icon}
                        {stat.total !== undefined && stat.total > 0 && (
                          <span className="text-[8px] text-white/40 font-black">%{Math.round((stat.value / stat.total) * 100)}</span>
                        )}
                    </div>
                    <div className="text-2xl font-black text-emerald-400">{stat.value}</div>
                    <div className="text-[9px] text-white/50 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>

        <div className="w-full max-sm:w-full max-w-md bg-emerald-500/10 p-6 rounded-[2.5rem] border border-emerald-500/20 mt-6 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl"><ShieldCheck size={32}/></div>
             <h3 className="text-white font-black text-lg">SEVİYE {userProfile.level}</h3>
             <p className="text-white/40 text-xs mt-2 leading-relaxed">
               {userProfile.xpToNextLevel - userProfile.currentXp} XP daha kazanarak Seviye {userProfile.level + 1}'e ulaşabilirsin!
             </p>
             <div className="w-full h-2 bg-black/40 rounded-full mt-6 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min((userProfile.currentXp / userProfile.xpToNextLevel) * 100, 100)}%` }}
                ></div>
             </div>
             <div className="flex justify-between w-full mt-2 text-[9px] font-black text-emerald-400 tracking-widest">
                <span>{userProfile.currentXp} XP</span>
                <span>{userProfile.xpToNextLevel} XP</span>
             </div>
        </div>

        {/* Kazanma Trendi Grafiği */}
        <div className="w-full max-w-md bg-white/5 p-6 rounded-[2rem] border border-white/10 mt-6">
          <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            KAZANMA TRENDİ
          </h3>
          <div className="flex items-end justify-between h-24 gap-1">
            {(() => {
              const winRate = userProfile.stats.totalGames > 0 
                ? Math.round((userProfile.stats.totalWins / userProfile.stats.totalGames) * 100) 
                : 0;
              // Simüle edilmiş son 7 günlük trend (gerçek veri yoksa)
              const trendData = [
                Math.max(20, winRate - 15 + Math.floor(Math.random() * 10)),
                Math.max(25, winRate - 10 + Math.floor(Math.random() * 10)),
                Math.max(30, winRate - 5 + Math.floor(Math.random() * 10)),
                Math.max(35, winRate + Math.floor(Math.random() * 10)),
                Math.max(40, winRate + 5 + Math.floor(Math.random() * 5)),
                Math.max(45, winRate + 8 + Math.floor(Math.random() * 5)),
                winRate,
              ];
              const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
              return trendData.map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${idx === 6 ? 'bg-emerald-500' : 'bg-white/20'}`}
                    style={{ height: `${value}%` }}
                  ></div>
                  <span className="text-[8px] text-white/40">{days[idx]}</span>
                </div>
              ));
            })()}
          </div>
          <div className="flex justify-between mt-4">
            <div className="text-center">
              <div className="text-xl font-black text-emerald-400">
                {userProfile.stats.totalGames > 0 
                  ? Math.round((userProfile.stats.totalWins / userProfile.stats.totalGames) * 100) 
                  : 0}%
              </div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider">Kazanma Oranı</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-yellow-400">{userProfile.stats.totalWins}</div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider">Galibiyet</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-rose-400">{userProfile.stats.totalGames - userProfile.stats.totalWins}</div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider">Mağlubiyet</div>
            </div>
          </div>
        </div>

        {/* Son 5 Oyun Geçmişi */}
        {userProfile.gameHistory && userProfile.gameHistory.length > 0 && (
          <div className="w-full max-w-md bg-white/5 p-6 rounded-[2rem] border border-white/10 mt-6">
            <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
              <RotateCcw size={16} className="text-purple-400" />
              SON 5 OYUN
            </h3>
            <div className="space-y-2">
              {userProfile.gameHistory.slice(0, 5).map((game, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${game.won ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${game.won ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {game.won ? '🏆' : game.wasBatak ? '💀' : '❌'}
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold">{game.mode}</div>
                      <div className="text-white/40 text-[10px]">{game.tricksWon} el | {game.difficulty}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-black ${game.coinsEarned >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {game.coinsEarned >= 0 ? '+' : ''}{game.coinsEarned}🪙
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mod Bazlı İstatistikler - Gerçek Veriler */}
        <div className="w-full max-w-md bg-white/5 p-6 rounded-[2rem] border border-white/10 mt-6">
          <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            MOD BAZLI PERFORMANS
          </h3>
          <div className="space-y-3">
            {(() => {
              const modeStats = userProfile.modeStats || {};
              type ModeStatEntry = { played: number; won: number; totalTricks: number };
              const modes = Object.entries(modeStats).sort((a, b) => (b[1] as ModeStatEntry).played - (a[1] as ModeStatEntry).played).slice(0, 5) as [string, ModeStatEntry][];
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
              
              if (modes.length === 0) {
                return (
                  <div className="text-center text-white/40 py-4">
                    Henüz oyun oynamadın
                  </div>
                );
              }
              
              return modes.map(([mode, stats], idx) => {
                const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
                return (
                  <div key={mode} className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${colors[idx % colors.length]} rounded-lg flex items-center justify-center text-white text-xs font-black`}>
                      {winRate}%
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white text-xs font-bold">{mode}</span>
                        <span className="text-white/40 text-[10px]">{stats.won}/{stats.played} galibiyet</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors[idx % colors.length]} rounded-full transition-all`}
                          style={{ width: `${winRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Favori Koz Renkleri */}
        <div className="w-full max-w-md bg-white/5 p-6 rounded-[2rem] border border-white/10 mt-6">
          <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
            <Spade size={16} className="text-yellow-400" />
            FAVORİ KOZ RENKLERİ
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS].map((suit) => {
              const stats = userProfile.trumpStats?.[suit] || { used: 0, won: 0 };
              const winRate = stats.used > 0 ? Math.round((stats.won / stats.used) * 100) : 0;
              return (
                <div key={suit} className="bg-black/20 p-3 rounded-xl text-center border border-white/5">
                  <div className={`text-3xl ${suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'text-rose-500' : 'text-white'}`}>
                    {suit}
                  </div>
                  <div className="text-white/60 text-[10px] mt-1">{stats.used} kullanım</div>
                  <div className="text-emerald-400 text-xs font-black">{winRate}% kazanç</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saatlik Oyun Aktivitesi */}
        <div className="w-full max-w-md bg-white/5 p-6 rounded-[2rem] border border-white/10 mt-6">
          <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
            ⏰ EN AKTİF SAATLER
          </h3>
          <div className="flex items-end justify-between h-16 gap-0.5">
            {Array.from({ length: 24 }, (_, hour) => {
              const count = userProfile.hourlyStats?.[hour] || 0;
              const hourlyValues = Object.values(userProfile.hourlyStats || {}) as number[];
              const maxCount = Math.max(...(hourlyValues.length > 0 ? hourlyValues : [1]), 1);
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t ${count > 0 ? 'bg-emerald-500' : 'bg-white/10'}`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[8px] text-white/40">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Haftalık Performans */}
        <div className="w-full max-w-md bg-white/5 p-6 rounded-[2rem] border border-white/10 mt-6 mb-6">
          <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-orange-400" />
            HAFTALIK ÖZET
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center">
              <div className="text-2xl font-black text-emerald-400">
                {Math.min(userProfile.stats.totalGames, 7)}
              </div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider mt-1">Oyun</div>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 text-center">
              <div className="text-2xl font-black text-yellow-400">
                {Math.floor(userProfile.stats.totalTricks / Math.max(userProfile.stats.totalGames, 1))}
              </div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider mt-1">Ort. El</div>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 text-center">
              <div className="text-2xl font-black text-purple-400">
                {userProfile.coins.toLocaleString()}
              </div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider mt-1">Coins</div>
            </div>
          </div>
          
          {/* En İyi Performans */}
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white">
                <Trophy size={24} />
              </div>
              <div>
                <div className="text-white font-black text-sm">EN İYİ PERFORMANS</div>
                <div className="text-white/60 text-xs">
                  Tek elde {userProfile.stats.highestTricksInOneRound} el kazandın!
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );

  const themeStyles = getThemeStyles(gameSettings.theme);

  return (
    <div className={`w-full h-full fixed inset-0 ${themeStyles.bg} overflow-hidden font-['Plus_Jakarta_Sans']`}>
      <ErrorBoundary>
        {phase === GamePhase.LOBBY && renderLobby()}
        {phase === GamePhase.STATISTICS && renderStatistics()}
        
        {phase === GamePhase.RESULT && roundResults && (
          <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">EL SONU</h2>
                {roundResults.winnerId !== undefined && (
                  <p className="text-emerald-400 font-bold text-lg">
                    {selectedMode === GameMode.ESLI 
                      ? `Takım ${roundResults.winnerId === 0 ? '0-2' : '1-3'} Kazandı!`
                      : `${players[roundResults.winnerId]?.name} Kazandı!`
                    }
                  </p>
                )}
                {lastGameCoins !== 0 && (
                  <div className={`mt-3 flex items-center justify-center gap-2 ${
                    lastGameCoins > 0 ? 'text-yellow-400' : 'text-rose-400'
                  }`}>
                    <Coins size={20} />
                    <span className="font-black text-xl">
                      {lastGameCoins > 0 ? '+' : ''}{lastGameCoins} Coins
                    </span>
                    <span className="text-white/60 text-sm">
                      ({gameSettings.difficulty})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mb-6">
                {players.map((player, idx) => {
                  const score = roundResults.scores[idx] || 0;
                  const isBatak = roundResults.batakPlayers.includes(idx);
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border-2 ${
                        isBatak 
                          ? 'bg-rose-500/20 border-rose-500/50' 
                          : score > 0 
                            ? 'bg-emerald-500/20 border-emerald-500/50' 
                            : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                            idx === 0 ? 'border-emerald-400' : 'border-white/20'
                          }`}>
                            <UserIcon size={20} className={idx === 0 ? 'text-emerald-400' : 'text-white/40'} />
                          </div>
                          <div>
                            <div className="text-white font-black text-sm">{player.name}</div>
                            <div className="text-white/40 text-xs">
                              {player.currentBid > 0 ? `İhale: ${player.currentBid}` : 'Pas'} • El: {player.tricksWon}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-black ${
                            isBatak ? 'text-rose-400' : score > 0 ? 'text-emerald-400' : 'text-white/40'
                          }`}>
                            {score > 0 ? '+' : ''}{score}
                          </div>
                          {isBatak && <div className="text-rose-400 text-xs font-black uppercase">BATAK</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Reklam İzle - Coinleri 2x Yap */}
              {isAdReady && lastGameCoins > 0 && canWatchRewardedAd() && (
                <button 
                  onClick={() => handleWatchAd('double')}
                  disabled={adRewardPending !== null}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
                >
                  <span className="text-xl">🎬</span>
                  REKLAM İZLE = COİNLERİ 2X YAP (+{lastGameCoins})
                </button>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const didWin = roundResults?.winnerId === 0 || (selectedMode === GameMode.ESLI && (roundResults?.winnerId === 0 || roundResults?.winnerId === 2));
                    handleGameEndAd(didWin);
                    setRoundResults(null);
                    setPhase(GamePhase.LOBBY);
                  }} 
                  className="flex-1 bg-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all uppercase tracking-widest"
                >
                  Menü
                </button>
                <button 
                  onClick={() => {
                    const didWin = roundResults?.winnerId === 0 || (selectedMode === GameMode.ESLI && (roundResults?.winnerId === 0 || roundResults?.winnerId === 2));
                    handleGameEndAd(didWin);
                    initGame();
                  }} 
                  className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest shadow-xl"
                >
                  Tekrar Oyna
                </button>
              </div>
            </div>
          </div>
        )}
        
        {phase === GamePhase.RULES_SETUP && (
          <div className="fixed inset-0 z-[800] bg-black/90 flex items-center justify-center p-4 animate-pop-in backdrop-blur-md">
            <div className={`${themeStyles.bg} w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl`}>
              <div className="bg-emerald-500 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-black text-white italic uppercase tracking-tight">Kurallar</h2>
                <button onClick={() => setPhase(GamePhase.LOBBY)} className="p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { key: 'ilkElKozYasak', label: 'İlk El Koz Yasak', desc: 'İlk elde koz atılamaz' },
                  { key: 'macaCezasi', label: 'Maça Cezası', desc: '0 el alana ek ceza' },
                  { key: 'batakZorunlulugu', label: 'Batak Zorunlu', desc: 'İhale tutturulmalı' },
                  { key: 'onikiBatar', label: '12 Batar', desc: '12 ihale özel ceza' },
                  { key: 'zorunluYukseltme', label: 'Zorunlu Yükseltme', desc: 'Daha yüksek kart atmalı' },
                  { key: 'bonusEl', label: 'Bonus El', desc: 'Son el +20 puan' },
                ].map(({ key, label, desc }) => (
                   <div key={key} className="flex justify-between items-center bg-black/20 px-3 py-2.5 rounded-xl border border-white/5 cursor-pointer hover:bg-black/30 transition-all" onClick={() => setGameSettings(s => ({...s, houseRules: {...s.houseRules, [key]: !(s.houseRules as any)[key]}}))}>
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-[10px] font-black uppercase tracking-wide block">{label}</span>
                        <span className="text-white/40 text-[8px]">{desc}</span>
                      </div>
                      <div className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ml-2 ${ (gameSettings.houseRules as any)[key] ? 'bg-emerald-400' : 'bg-slate-700' }`}><div className={`w-4 h-4 bg-white rounded-full transition-all mt-0.5 ml-0.5 ${ (gameSettings.houseRules as any)[key] ? 'translate-x-4' : '' }`}></div></div>
                   </div>
                ))}
                <button onClick={() => {
                  initGame();
                }} className="w-full bg-white text-emerald-900 py-3 rounded-xl font-black text-base mt-3 shadow-xl active:scale-95 transition-all uppercase tracking-tight">BAŞLA</button>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-sm rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-white italic tracking-tight">AYARLAR</h2><button onClick={() => setShowSettings(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button></div>
              <div className="space-y-6">
                 {/* SOUND ENABLED */}
                 <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-black/30 transition-all" onClick={() => setGameSettings(s => ({...s, soundEnabled: !s.soundEnabled}))}>
                   <div className="flex items-center gap-3">
                     {gameSettings.soundEnabled ? <Volume2 size={18} className="text-emerald-400"/> : <VolumeX size={18} className="text-white/20"/>}
                     <span className="text-white text-[11px] font-black uppercase tracking-wider">SES EFEKTLERİ</span>
                   </div>
                   <div className={`w-10 h-5 rounded-full transition-all relative ${ gameSettings.soundEnabled ? 'bg-emerald-400' : 'bg-slate-700' }`}><div className={`w-4 h-4 bg-white rounded-full transition-all mt-0.5 ml-0.5 ${ gameSettings.soundEnabled ? 'translate-x-5' : '' }`}></div></div>
                 </div>
                 
                 {/* VIBRATION */}
                 <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-black/30 transition-all" onClick={() => {
                   setGameSettings(s => ({...s, vibrationEnabled: !s.vibrationEnabled}));
                   setUserProfile(p => {
                     const updated = {...p, vibrationEnabled: !p.vibrationEnabled};
                     localStorage.setItem('batakProfile', JSON.stringify(updated));
                     return updated;
                   });
                 }}>
                   <div className="flex items-center gap-3">
                     <Smartphone size={18} className={gameSettings.vibrationEnabled ? 'text-emerald-400' : 'text-white/20'}/>
                     <span className="text-white text-[11px] font-black uppercase tracking-wider">TİTREŞİM</span>
                   </div>
                   <div className={`w-10 h-5 rounded-full transition-all relative ${ gameSettings.vibrationEnabled ? 'bg-emerald-400' : 'bg-slate-700' }`}><div className={`w-4 h-4 bg-white rounded-full transition-all mt-0.5 ml-0.5 ${ gameSettings.vibrationEnabled ? 'translate-x-5' : '' }`}></div></div>
                 </div>
                 
                 {/* BOT CHAT */}
                 <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-black/30 transition-all" onClick={() => setGameSettings(s => ({...s, botChatEnabled: !s.botChatEnabled}))}>
                   <div className="flex items-center gap-3">
                     <MessageCircle size={18} className={gameSettings.botChatEnabled ? 'text-emerald-400' : 'text-white/20'}/>
                     <span className="text-white text-[11px] font-black uppercase tracking-wider">BOT KONUŞMALARI</span>
                   </div>
                   <div className={`w-10 h-5 rounded-full transition-all relative ${ gameSettings.botChatEnabled ? 'bg-emerald-400' : 'bg-slate-700' }`}><div className={`w-4 h-4 bg-white rounded-full transition-all mt-0.5 ml-0.5 ${ gameSettings.botChatEnabled ? 'translate-x-5' : '' }`}></div></div>
                 </div>

                 {/* THEME MODE - Gece/Gündüz */}
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">🌓 GÖRÜNÜM MODU</label>
                   <div className="grid grid-cols-3 gap-2">
                     {[
                       { mode: 'light' as const, icon: '☀️', label: 'Açık' },
                       { mode: 'dark' as const, icon: '🌙', label: 'Koyu' },
                       { mode: 'system' as const, icon: '⚙️', label: 'Sistem' },
                     ].map(({ mode, icon, label }) => (
                       <button
                         key={mode}
                         onClick={() => {
                           setUserProfile(p => {
                             const updated = { ...p, themeMode: mode };
                             localStorage.setItem('batakProfile', JSON.stringify(updated));
                             return updated;
                           });
                         }}
                         className={`py-3 rounded-xl font-black text-[9px] uppercase border-2 transition-all flex flex-col items-center gap-1 ${
                           userProfile.themeMode === mode 
                             ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
                             : 'bg-black/20 border-white/5 text-white/40'
                         }`}
                       >
                         <span className="text-lg">{icon}</span>
                         {label}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* DIFFICULTY */}
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2"><Trophy size={14}/> OYUN ZORLUĞU</label>
                   <div className="grid grid-cols-2 gap-2">
                      {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.LEGEND, Difficulty.INVINCIBLE].map(d => (
                        <button 
                          key={d} 
                          onClick={() => setGameSettings(prev => ({...prev, difficulty: d}))} 
                          className={`py-3 rounded-xl font-black text-[9px] uppercase border-2 transition-all ${gameSettings.difficulty === d ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-black/20 border-white/5 text-white/40'}`}
                        >
                          {d}
                        </button>
                      ))}
                   </div>
                 </div>

                 {/* THEME SELECTION */}
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2"><Palette size={14}/> TEMA SEÇİMİ</label>
                   <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {['kiraathane', 'classic', 'casino', 'wood', 'royal', 'midnight', 'vintage', 'forest', 'ocean', 'lava', 'sunset', 'space', 'desert', 'neon'].map(t => {
                        const styles = getThemeStyles(t as GameTheme);
                        const isSelected = gameSettings.theme === t;
                        const isOwned = userProfile.ownedThemes.includes(t);
                        const price = getThemePrices()[t] || 0;
                        
                        return (
                          <button 
                            key={t} 
                            onClick={() => {
                              if (isOwned) {
                                setGameSettings(s => ({...s, theme: t as GameTheme}));
                              } else {
                                setShowSettings(false);
                                setShowThemeShop(true);
                              }
                            }}
                            className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all relative ${
                              isSelected 
                                ? 'border-emerald-400 bg-emerald-500/10 scale-105 shadow-xl shadow-emerald-500/10' 
                                : isOwned
                                  ? 'border-white/5 bg-black/20 hover:border-white/20'
                                  : 'border-white/5 bg-black/20 opacity-50 hover:opacity-70'
                            }`}
                          >
                             {!isOwned && (
                               <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-0.5 z-10">
                                 <Coins size={8} className="text-white" />
                               </div>
                             )}
                             <div className={`w-full aspect-square rounded-xl relative overflow-hidden flex items-center justify-center ${styles.bg}`}>
                               <div className={`absolute inset-0 opacity-40 ${styles.pattern} bg-cover`}></div>
                               <div className="w-6 h-6 rounded-full border-2 border-white/40 shadow-lg" style={{ backgroundColor: styles.accent }}></div>
                               {isSelected && (
                                 <div className="absolute top-1 left-1 bg-emerald-500 rounded-full p-1">
                                   <Check size={10} className="text-white" />
                                 </div>
                               )}
                             </div>
                             <span className="text-[8px] text-white font-bold uppercase truncate w-full text-center tracking-tighter">{styles.name}</span>
                             {!isOwned && (
                               <div className="flex items-center gap-0.5">
                                 <Coins size={8} className="text-yellow-400" />
                                 <span className="text-[7px] text-yellow-400 font-black">{price}</span>
                               </div>
                             )}
                          </button>
                        );
                      })}
                   </div>
                 </div>

                 {/* GAME SPEED */}
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2"><Gauge size={14}/> OYUN HIZI</label>
                   <div className="grid grid-cols-2 gap-2">
                     {[
                       { speed: 'slow', price: 0, label: 'slow' },
                       { speed: 'normal', price: 0, label: 'normal' },
                       { speed: 'fast', price: 50, label: 'fast' },
                       { speed: 'turbo', price: 100, label: 'turbo' }
                     ].map(({ speed, price, label }) => {
                       const ownedSpeeds = userProfile.ownedGameSpeeds || ['slow', 'normal'];
                       const isOwned = price === 0 || ownedSpeeds.includes(speed);
                       const canAfford = userProfile.coins >= price;
                       const isSelected = gameSettings.gameSpeed === speed;
                       
                       return (
                         <button 
                           key={speed} 
                           onClick={() => {
                             if (isOwned) {
                               setGameSettings(prev => ({...prev, gameSpeed: speed as any}));
                             } else if (canAfford) {
                               const result = purchaseGameSpeed(userProfile, speed);
                               if (result.success) {
                                 setUserProfile(result.newProfile);
                                 localStorage.setItem('batakProfile', JSON.stringify(result.newProfile));
                                 setGameSettings(prev => ({...prev, gameSpeed: speed as any}));
                               }
                             } else {
                               setShowSettings(false);
                               setShowThemeShop(true);
                             }
                           }}
                           className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 tracking-widest transition-all relative ${
                             isSelected 
                               ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
                               : isOwned
                                 ? 'bg-black/20 border-white/5 text-white/40 hover:border-white/20'
                                 : canAfford
                                   ? 'bg-black/20 border-white/5 text-white/40 hover:border-yellow-400'
                                   : 'bg-black/20 border-white/5 text-white/20 opacity-50'
                           }`}
                         >
                           {label}
                           {price > 0 && !isOwned && (
                             <div className="absolute -top-1 -right-1 flex items-center gap-0.5 bg-yellow-500 rounded-full px-1.5 py-0.5">
                               <Coins size={8} className="text-white" />
                               <span className="text-[8px] text-white font-black">{price}</span>
                             </div>
                           )}
                         </button>
                       );
                     })}
                   </div>
                 </div>

                 {/* Reklamsız Seçenekleri */}
                 {adFreeTimeLeft > 0 ? (
                   <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-400/30 mb-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="text-xl">🛡️</span>
                         <span className="text-white font-bold text-sm">REKLAMSIZ</span>
                       </div>
                       <span className="text-emerald-400 font-black">{formatRemainingTime(adFreeTimeLeft)}</span>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-2 mb-4">
                     {canWatchRewardedAd() && (
                       <button 
                         onClick={() => {
                           setShowSettings(false);
                           handleWatchAd('adfree30');
                         }}
                         className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                       >
                         <span className="text-lg">🎬</span>
                         REKLAM İZLE = 30 DK REKLAMSIZ
                       </button>
                     )}
                     <button 
                       onClick={() => {
                         setShowSettings(false);
                         setShowAdFreeShop(true);
                       }}
                       className="w-full bg-white/10 text-white font-bold py-3 rounded-2xl hover:bg-white/20 transition-all text-xs flex items-center justify-center gap-2"
                     >
                       <Coins size={14} className="text-yellow-400" />
                       COİN İLE REKLAMSIZ
                     </button>
                   </div>
                 )}
                 
                 {/* Premium Butonu */}
                 <button 
                   onClick={() => {
                     setShowSettings(false);
                     setShowPremiumModal(true);
                   }}
                   className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black py-4 rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 mb-4"
                 >
                   <span className="text-xl">👑</span>
                   BATAK PRO+ OL
                 </button>

                 <button onClick={() => setShowSettings(false)} className="w-full bg-white text-emerald-900 py-5 rounded-2xl font-black shadow-xl uppercase tracking-tighter active:scale-95 transition-all">KAYDET</button>
              </div>
            </div>
          </div>
        )}

        {(phase === GamePhase.PLAYING || phase === GamePhase.BIDDING) && (
          <div className={`w-full h-full relative ${themeStyles.bg} transition-colors duration-1000`}>
             {gameSettings.theme === 'kiraathane' ? (
                <div className="absolute inset-0 felt-texture bg-emerald-950 opacity-90 pointer-events-none"></div>
             ) : (
                <div className={`absolute inset-0 opacity-20 ${themeStyles.pattern}`}></div>
             )}
             
             {phase === GamePhase.BIDDING && isBidding && (
                <div className="fixed inset-0 z-[600] bg-black/60 flex items-center justify-center p-6 transition-all duration-300">
                  <div className={`bg-[#2d1a0a] p-6 rounded-[2rem] border border-white/10 w-full max-w-sm text-center shadow-2xl animate-pop-in wood-border`}>
                    <h2 className="text-2xl font-black text-white italic mb-2">İHALE</h2>
                    
                    {/* İhale Geçmişi - Daha kompakt */}
                    {bidHistory.length > 0 && (
                      <div className="mb-3 max-h-32 overflow-y-auto bg-black/20 rounded-xl p-2 text-[11px]">
                        {bidHistory.slice(-8).map((entry, idx) => (
                          <div key={idx} className="flex justify-between py-0.5 border-b border-white/5 last:border-0">
                            <span className={`font-bold ${entry.playerId === 0 ? 'text-emerald-400' : 'text-white/60'}`}>{entry.playerName}</span>
                            <span className={entry.bid ? 'text-yellow-400 font-bold' : 'text-rose-400'}>
                              {entry.bid ? entry.bid : 'PAS'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {biddingPlayerIdx === 0 && players[0]?.currentBid !== -1 ? (
                      players[0]?.currentBid === highestBid && highestBid > 0 ? (
                        // Kullanıcı zaten en yüksek ihaleyi vermiş, bekliyor
                        <div className="py-6">
                          <div className="text-emerald-400 text-lg font-bold mb-2">En yüksek ihale sizde: {highestBid}</div>
                          <div className="text-white/40 text-sm">Diğer oyuncuların cevabı bekleniyor...</div>
                        </div>
                      ) : (
                      <>
                        <div className="mb-4 text-white/60 text-sm">En Yüksek İhale: {highestBid > 0 ? highestBid : 'Yok'}</div>
                    <div className="grid grid-cols-5 gap-2">
                            {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(num => (
                              <button 
                                key={num} 
                                onClick={() => startBidding(num)} 
                                disabled={num <= highestBid}
                                className={`font-black py-3 rounded-xl text-lg shadow-lg transition-all active:scale-95 ${
                                  num <= highestBid 
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                    </div>
                          <button onClick={() => makeBid(0, null)} className="w-full mt-3 bg-rose-500/20 border border-rose-500/50 text-rose-400 font-black py-3 rounded-2xl hover:bg-rose-500/30 transition-all uppercase tracking-widest">PAS GEÇ</button>
                      </>
                      )
                    ) : (
                      <div className="py-6">
                        <div className="text-white/60 text-lg mb-2">
                          {players[biddingPlayerIdx]?.name} düşünüyor...
                        </div>
                        <div className="text-white/40 text-sm">En Yüksek İhale: {highestBid > 0 ? highestBid : 'Yok'}</div>
                      </div>
                    )}
                  </div>
                </div>
             )}

             {showTrumpSelection && (
                <div className="fixed inset-0 z-[400] bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300">
                  <div className={`bg-[#2d1a0a] p-8 rounded-[3rem] border border-white/10 w-full max-w-sm text-center shadow-2xl animate-pop-in wood-border`}>
                    <h2 className="text-2xl font-black text-white italic mb-6">KOZ SEÇİN</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS].map(suit => (
                          <button 
                            key={suit} 
                            onClick={() => selectTrumpSuit(suit)} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-2xl text-3xl shadow-lg transition-all active:scale-95"
                          >
                            {suit}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
             )}

             {/* Üst Bar - Sol: Skorlar, Sağ: Butonlar */}
             <div className="absolute left-2 z-[110]" style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}>
               {/* Sol - Skorlar */}
               <div className="flex flex-col items-start">
                <button 
                  onClick={() => setShowScoreboard(!showScoreboard)} 
                   className={`flex items-center gap-1.5 bg-black/60 backdrop-blur-xl px-2 py-1.5 rounded-lg border border-white/10 text-white transition-all ${showScoreboard ? 'rounded-b-none border-b-0' : ''}`}
                >
                   <BarChart3 size={14} className="text-emerald-400" />
                   <ChevronDown size={10} className={`transition-transform ${showScoreboard ? 'rotate-180' : ''}`} />
                </button>
                {showScoreboard && (
                   <div className="bg-black/80 backdrop-blur-xl rounded-lg rounded-tl-none p-2 border border-white/10 border-t-0 text-white min-w-[120px] shadow-2xl">
                    {players.map(p => (
                       <div key={p.id} className="flex justify-between items-center text-[9px] mb-1 last:mb-0 gap-2">
                         <span className={`font-bold truncate ${p.id === 0 ? 'text-emerald-400' : 'text-white/60'}`}>{p.name}</span>
                         <span className="font-black bg-white/10 px-1 py-0.5 rounded text-[8px]">{p.tricksWon}/{p.currentBid > 0 ? p.currentBid : '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
             </div>
             </div>

             {/* Sağ üst - Butonlar ve El/Koz Bilgisi */}
             <div className="absolute right-2 z-[110] flex flex-col items-end gap-1.5" style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}>
               {/* Butonlar */}
               <div className="flex gap-1.5">
                 <button onClick={() => setShowSettings(true)} className="w-8 h-8 bg-black/60 backdrop-blur-xl rounded-lg flex items-center justify-center text-white border border-white/10"><Settings size={14}/></button>
                 <button onClick={() => setPhase(GamePhase.LOBBY)} className="w-8 h-8 bg-black/60 backdrop-blur-xl rounded-lg flex items-center justify-center text-white border border-white/10"><Home size={14}/></button>
                 </div>
                 
               {/* El ve Koz Bilgisi - Butonların altında sabit */}
               <div className="bg-black/70 px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 mt-1">
                 <span className="text-white font-black text-sm">{trickCount + 1}</span>
                 <span className="text-white/50 text-[10px]">/{selectedMode === GameMode.HIZLI ? 6 : 13}</span>
                 {trumpSuit && (
                   <>
                     <span className="text-white/30">|</span>
                     <span className={`text-base ${trumpSuit === Suit.HEARTS || trumpSuit === Suit.DIAMONDS ? 'text-rose-500' : 'text-white'}`}>
                       {trumpSuit}
                     </span>
                   </>
                 )}
                 <span className="text-white/30">|</span>
                 <span className="text-emerald-400 text-[9px] font-black uppercase">{selectedMode.replace('_', ' ')}</span>
               </div>
             </div>
             
             {/* Power-Up Butonları - Oyun sırasında */}
             {currentPlayerIdx === 0 && phase === GamePhase.PLAYING && (
               <div className="absolute bottom-32 left-4 flex flex-col gap-2 z-[100]">
                 {/* Geri Al */}
                 {canUndo && userProfile.undoCount > 0 && (
                   <button 
                     onClick={handleUndo}
                     className="bg-orange-500/90 text-white p-3 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-2"
                   >
                     <Undo2 size={16} />
                     <span className="text-xs font-bold">{userProfile.undoCount}</span>
                   </button>
                 )}
                 
                 {/* İpucu */}
                 {userProfile.hintCount > 0 && (
                   <button 
                     onClick={handleHint}
                     className="bg-yellow-500/90 text-white p-3 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-2"
                   >
                     <Lightbulb size={16} />
                     <span className="text-xs font-bold">{userProfile.hintCount}</span>
                   </button>
                 )}
               </div>
             )}
             
             {/* İpucu Göstergesi */}
             {hintCard && (
               <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-sm z-[150] animate-pulse">
                 💡 Önerilen: {hintCard.rank > 10 ? ['J', 'Q', 'K', 'A'][hintCard.rank - 11] : hintCard.rank}{hintCard.suit}
               </div>
             )}

             <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 flex items-center justify-center pointer-events-none">
                {visualTrick.map(pt => {
                  // Kart toplama animasyonu aktifse, kazanana doğru uçur
                  const animationName = isCollectingTrick && trickWinnerId !== null
                    ? `collect-to-${trickWinnerId}`
                    : `throw-in-${pt.playerId}`;
                  const animationDuration = isCollectingTrick ? '0.5s' : '0.5s';
                  
                  return (
                    <div 
                      key={pt.card.id} 
                      style={{ 
                        animation: `${animationName} ${animationDuration} forwards`,
                        '--start-x': pt.playerId === 0 ? '0px' : pt.playerId === 1 ? '-50px' : pt.playerId === 2 ? '0px' : '50px',
                        '--start-y': pt.playerId === 0 ? '30px' : pt.playerId === 2 ? '-30px' : '0px',
                        '--start-rotation': pt.playerId === 1 ? '15deg' : pt.playerId === 3 ? '-15deg' : '0deg',
                      } as React.CSSProperties} 
                      className="absolute"
                    >
                    <CardUI card={pt.card} small />
                  </div>
                  );
                })}
             </div>

             {players.filter(p => p.id !== 0).map(p => (
               <div 
                 key={p.id} 
                 className={`absolute flex flex-col items-center transition-all ${p.position === 'left' ? 'left-4 top-[41.5%] -translate-y-1/2' : p.position === 'right' ? 'right-4 top-[41.5%] -translate-y-1/2' : 'inset-x-0'}`}
                 style={p.position === 'top' ? { top: 'calc(max(2.5rem, env(safe-area-inset-top, 2.5rem)) + 3rem)' } : undefined}
               >
                  {botMessages[p.id] && (
                    <div className={`absolute -top-14 bg-white text-emerald-900 px-4 py-2 rounded-2xl shadow-xl border-2 border-emerald-400 max-w-[150px] whitespace-normal z-[200] animate-pop-in ${p.position === 'right' ? 'right-0' : p.position === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}>
                      <span className="text-[9px] font-black italic block leading-tight">{botMessages[p.id]}</span>
                      <div className={`absolute -bottom-1.5 w-3 h-3 bg-white border-r-2 border-b-2 border-emerald-400 rotate-45 ${p.position === 'right' ? 'right-4' : p.position === 'left' ? 'left-4' : 'left-1/2 -translate-x-1/2'}`}></div>
                    </div>
                  )}

                  <div className={`relative flex flex-col items-center group ${gameSettings.theme === 'kiraathane' ? 'scale-110' : ''}`}>
                      {gameSettings.theme === 'kiraathane' && (
                        <div className={`absolute inset-x-[-30px] inset-y-[-10px] bg-gradient-to-b from-[#8b4513] to-[#451a03] rounded-[2rem] wood-border -z-10 shadow-2xl`}></div>
                      )}

                      <div className="relative">
                          <div className={`absolute -top-2 -left-2 w-8 h-8 bg-emerald-600 rounded-full border-2 border-white/40 flex items-center justify-center text-[10px] font-black text-white shadow-xl z-20 animate-pop-in`}>
                            {p.tricksWon}
                          </div>
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 flex items-center justify-center bg-black/60 backdrop-blur-lg shadow-2xl transition-all ${currentPlayerIdx === p.id && !isBidding ? 'border-emerald-400 scale-110 shadow-emerald-500/20' : 'border-white/5 opacity-80'}`}>
                            <UserIcon size={20} className={currentPlayerIdx === p.id && !isBidding ? 'text-emerald-400' : 'text-white/20'} />
                          </div>
                      </div>
                      
                      <span className={`text-white font-black text-[9px] uppercase mt-2 tracking-wider text-center ${gameSettings.theme === 'kiraathane' ? '' : 'bg-black/20 px-2 py-0.5 rounded-lg backdrop-blur shadow-sm'}`}>
                        {p.name}
                      </span>
                  </div>
               </div>
             ))}

             {/* Kullanıcı kartları - Banner ads için yukarı taşındı */}
             <div className="absolute bottom-20 inset-x-0 flex flex-col items-center z-[50]">
                <div className={`relative mb-4 flex flex-col items-center ${gameSettings.theme === 'kiraathane' ? 'scale-100' : ''}`}>
                   {gameSettings.theme === 'kiraathane' && (
                     <div className="absolute inset-x-[-30px] inset-y-[-8px] bg-gradient-to-b from-[#8b4513] to-[#451a03] rounded-[2rem] wood-border -z-10 shadow-2xl"></div>
                   )}
                   <div className="relative">
                       <div className="absolute -top-2 -left-2 w-8 h-8 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-xl z-20">
                          {players[0]?.tricksWon}
                       </div>
                       <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 flex items-center justify-center bg-black/60 backdrop-blur-lg shadow-2xl transition-all ${currentPlayerIdx === 0 && !isBidding ? 'border-emerald-400 scale-110 shadow-emerald-500/20' : 'border-white/5'}`}>
                          <UserIcon size={20} className={currentPlayerIdx === 0 && !isBidding ? 'text-emerald-400' : 'text-white/20'} />
                       </div>
                   </div>
                   <span className="text-white font-black text-[9px] uppercase mt-2 tracking-widest">{userProfile.username}</span>
                </div>
                
                <div className="flex flex-col gap-[-40px] items-center">
                   {/* Tekli/Üçlü modda 3 satır, normal modda 2 satır */}
                   {selectedMode === GameMode.TEKLI ? (
                     // Tekli mod: 26 kart - 3 satır (9+9+8)
                     <>
                       <div className="flex justify-center -space-x-12 mb-[-50px]">
                         {players[0]?.hand.slice(0, 9).map(card => {
                           const valid = isValidMove(card, players[0].hand, currentTrick, trumpSuit, spadesBroken, trickCount, gameSettings.houseRules);
                           return <CardUI key={card.id} card={card} playable={valid && currentPlayerIdx === 0 && !isBidding} onClick={() => playCard(0, card)} className="shadow-2xl hover:scale-105 scale-[0.85]" />
                         })}
                       </div>
                       <div className="flex justify-center -space-x-12 mb-[-50px] z-[55]">
                         {players[0]?.hand.slice(9, 18).map(card => {
                           const valid = isValidMove(card, players[0].hand, currentTrick, trumpSuit, spadesBroken, trickCount, gameSettings.houseRules);
                           return <CardUI key={card.id} card={card} playable={valid && currentPlayerIdx === 0 && !isBidding} onClick={() => playCard(0, card)} className="shadow-2xl hover:scale-105 scale-[0.85]" />
                         })}
                       </div>
                       <div className="flex justify-center -space-x-12 z-[60]">
                         {players[0]?.hand.slice(18).map(card => {
                           const valid = isValidMove(card, players[0].hand, currentTrick, trumpSuit, spadesBroken, trickCount, gameSettings.houseRules);
                           return <CardUI key={card.id} card={card} playable={valid && currentPlayerIdx === 0 && !isBidding} onClick={() => playCard(0, card)} className="shadow-2xl hover:scale-105 scale-[0.85]" />
                         })}
                       </div>
                     </>
                   ) : (
                     // Normal mod: 13 kart - 2 satır (7+6)
                     <>
                       <div className="flex justify-center -space-x-11 mb-[-60px]">
                      {players[0]?.hand.slice(0, 7).map(card => {
                        const valid = isValidMove(card, players[0].hand, currentTrick, trumpSuit, spadesBroken, trickCount, gameSettings.houseRules);
                        return <CardUI key={card.id} card={card} playable={valid && currentPlayerIdx === 0 && !isBidding} onClick={() => playCard(0, card)} className="shadow-2xl hover:scale-105" />
                      })}
                   </div>
                       <div className="flex justify-center -space-x-11 z-[60]">
                      {players[0]?.hand.slice(7).map(card => {
                        const valid = isValidMove(card, players[0].hand, currentTrick, trumpSuit, spadesBroken, trickCount, gameSettings.houseRules);
                        return <CardUI key={card.id} card={card} playable={valid && currentPlayerIdx === 0 && !isBidding} onClick={() => playCard(0, card)} className="shadow-2xl hover:scale-105" />
                      })}
                   </div>
                     </>
                   )}
                </div>
             </div>
             
             {/* Banner Ad Alanı - Oyun ekranı */}
             <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-black/30 z-[40]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}></div>

             {message && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
                  <div className="bg-emerald-600 text-white px-12 py-6 rounded-[2rem] shadow-2xl border-4 border-white/20 animate-pop-in">
                    <span className="text-4xl font-black italic tracking-tighter uppercase">{message}</span>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* Günlük Ödül Modal */}
        {showDailyReward && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl relative overflow-hidden`}>
              {/* Arka plan efekti */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-black text-white italic">GÜNLÜK ÖDÜL</h2>
                    <div className="text-emerald-400 font-bold text-xs">Gün {getCurrentStreakDay(userProfile) || 1}/7</div>
                    </div>
                  <button onClick={() => setShowDailyReward(false)} className="bg-white/5 p-2 rounded-xl text-white/40 hover:bg-white/10 transition-all"><X size={18}/></button>
                </div>
                
                {canClaimDailyReward(userProfile) ? (
                  <>
                    <div className="text-center mb-4 p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border-2 border-yellow-400/50">
                      <div className="text-4xl font-black text-yellow-400 flex items-center justify-center gap-2">
                        <Coins size={32} className="text-yellow-400" />
                        +{getDailyRewards()[Math.min(Math.max(0, (getCurrentStreakDay(userProfile) || 1) - 1), 6)].coins}
                      </div>
                      <div className="text-white/60 text-[10px] mt-1">Toplam: {getDailyRewards()[Math.min(Math.max(0, (getCurrentStreakDay(userProfile) || 1) - 1), 6)].coins} Coins</div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const result = claimDailyReward(userProfile);
                        if (result.coinsEarned > 0) {
                          setUserProfile(result.newProfile);
                          // Analytics: Günlük ödül alındı
                          logDailyRewardClaimed({
                            streakDay: getCurrentStreakDay(userProfile) || 1,
                            rewardCoins: result.coinsEarned
                          });
                          logCoinEarned({ amount: result.coinsEarned, source: 'daily_reward' });
                          setTimeout(() => setShowDailyReward(false), 2000);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black py-3 rounded-xl shadow-xl hover:scale-105 transition-all uppercase tracking-wide text-sm mb-4 flex items-center justify-center gap-2"
                    >
                      <Trophy size={18} />
                        ÖDÜLÜ AL
                    </button>
                  </>
                ) : (
                  <div className="text-center mb-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-white/60 font-bold text-sm">Bugünkü ödül alındı!</div>
                    <div className="text-white/40 text-[10px] mt-1">Yarın tekrar gel!</div>
                  </div>
                )}
                
                <div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-wide text-center mb-2">7 GÜNLÜK STREAK</div>
                  <div className="grid grid-cols-7 gap-1">
                    {getDailyRewards().map((reward, idx) => {
                      const day = idx + 1;
                      const isClaimed = userProfile.dailyRewards[idx]?.claimed || false;
                      const currentDay = getCurrentStreakDay(userProfile) || 1;
                      const isToday = day === currentDay && canClaimDailyReward(userProfile);
                      const isPast = day < currentDay;
                      
                      return (
                        <div 
                          key={day}
                          className={`py-2 px-1 rounded-lg border text-center transition-all ${
                            isClaimed 
                              ? 'bg-emerald-500/30 border-emerald-400' 
                              : isToday 
                                ? 'bg-yellow-500/30 border-yellow-400' 
                                : isPast
                                  ? 'bg-white/5 border-white/10 opacity-50'
                                  : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className={`text-[8px] font-bold ${isClaimed ? 'text-emerald-300' : isToday ? 'text-yellow-300' : 'text-white/50'}`}>
                            {day}
                            </div>
                          <div className={`text-sm font-black ${isClaimed ? 'text-emerald-400' : isToday ? 'text-yellow-400' : 'text-yellow-400/60'}`}>
                            {reward.coins}
                          </div>
                          {day === 7 && (
                            <div className="text-[6px] text-emerald-400 font-bold">BONUS</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Görevler Modal */}
        {showQuests && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">GÖREVLER</h2>
                <button onClick={() => setShowQuests(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              <div className="space-y-3">
                {userProfile.quests.map(quest => (
                  <div 
                    key={quest.id}
                    className={`p-4 rounded-2xl border-2 ${
                      quest.completed 
                        ? 'bg-emerald-500/20 border-emerald-400' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-black text-sm">{quest.title}</div>
                        <div className="text-white/60 text-xs">{quest.description}</div>
                      </div>
                      <div className="text-yellow-400 font-black text-sm">{quest.reward} 🪙</div>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          quest.completed ? 'bg-emerald-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-white/40 text-xs mt-1">
                      {quest.progress} / {quest.target}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Başarımlar Modal */}
        {showAchievements && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">BAŞARIMLAR</h2>
                <button onClick={() => setShowAchievements(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {userProfile.achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-2xl border-2 ${
                      achievement.unlocked 
                        ? 'bg-emerald-500/20 border-emerald-400' 
                        : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
                    <div className="text-white font-black text-xs mb-1 text-center">{achievement.title}</div>
                    <div className="text-white/60 text-[10px] text-center mb-2">{achievement.description}</div>
                    {achievement.target && (
                      <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.min(((achievement.progress || 0) / achievement.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                    <div className="text-yellow-400 font-black text-xs text-center">{achievement.reward} 🪙</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Power-Up'lar Modal */}
        {showPowerUps && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">POWER-UP'LAR</h2>
                <button onClick={() => setShowPowerUps(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              {/* Mevcut Power-Up'lar */}
              <div className="mb-6 bg-white/5 rounded-2xl p-4">
                <h3 className="text-white font-bold text-sm mb-3">Sahip Olduklarım</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl mb-1">↩️</div>
                    <div className="text-white text-xs font-bold">Geri Al</div>
                    <div className="text-emerald-400 font-black">{userProfile.undoCount || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💡</div>
                    <div className="text-white text-xs font-bold">İpucu</div>
                    <div className="text-emerald-400 font-black">{userProfile.hintCount || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🛡️</div>
                    <div className="text-white text-xs font-bold">Streak Koruma</div>
                    <div className="text-emerald-400 font-black">{userProfile.streakProtectionCount || 0}</div>
                  </div>
                </div>
              </div>
              
              {/* Satın Alınabilir Power-Up'lar */}
              <h3 className="text-white font-bold text-sm mb-3">Satın Al</h3>
              <div className="space-y-3">
                {POWER_UPS.map(powerUp => (
                  <div 
                    key={powerUp.id}
                    className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{powerUp.icon}</div>
                      <div>
                        <div className="text-white font-bold text-sm">{powerUp.name}</div>
                        <div className="text-white/40 text-[10px]">{powerUp.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const result = purchasePowerUp(userProfile, powerUp.id);
                        if (result.success) {
                          setUserProfile(result.newProfile);
                          localStorage.setItem('batakProfile', JSON.stringify(result.newProfile));
                          vibrate('tap');
                        }
                      }}
                      disabled={userProfile.coins < powerUp.price}
                      className={`px-4 py-2 rounded-xl font-black text-sm ${
                        userProfile.coins >= powerUp.price
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      {powerUp.price} 🪙
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Liderlik Tablosu Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">🏆 LİDERLİK</h2>
                <button onClick={() => setShowLeaderboard(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {['daily', 'weekly', 'allTime'].map((period, idx) => (
                  <button key={period} className={`flex-1 py-2 rounded-xl text-xs font-bold ${idx === 2 ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60'}`}>
                    {period === 'daily' ? 'GÜNLÜK' : period === 'weekly' ? 'HAFTALIK' : 'TÜM ZAMANLAR'}
                  </button>
                ))}
              </div>
              
              {/* Leaderboard List */}
              <div className="space-y-2">
                {getTopPlayers(leaderboard, 'allTime', 10).map((entry, idx) => (
                  <div 
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${idx < 3 ? 'bg-yellow-500/10 border border-yellow-400/30' : 'bg-white/5'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                      idx === 0 ? 'bg-yellow-400 text-black' :
                      idx === 1 ? 'bg-gray-300 text-black' :
                      idx === 2 ? 'bg-orange-400 text-black' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="text-2xl">{entry.avatar}</div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm">{entry.username}</div>
                      <div className="text-white/40 text-[10px]">Lv.{entry.level} • {entry.wins} galibiyet</div>
                    </div>
                    <div className="text-yellow-400 font-black">{entry.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tahmin Et Mini Oyunu Modal */}
        {showGuessGame && guessGame && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">🎯 TAHMİN ET</h2>
                <button onClick={() => setShowGuessGame(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              {guessGame.played ? (
                <div className="text-center py-8">
                  {guessGame.correct ? (
                    <>
                      <div className="text-6xl mb-4">🎉</div>
                      <div className="text-emerald-400 text-2xl font-black mb-2">DOĞRU!</div>
                      <div className="text-yellow-400 font-bold">+{guessGame.reward} 🪙 kazandın!</div>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">😔</div>
                      <div className="text-rose-400 text-2xl font-black mb-2">YANLIŞ!</div>
                      <div className="text-white/60">Yarın tekrar dene!</div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-white/60 text-sm mb-2">Bu 4 karttan hangisi eli alır?</div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-white/60 text-xs">Koz:</span>
                      <span className={`text-2xl ${guessGame.trumpSuit === '♥' || guessGame.trumpSuit === '♦' ? 'text-rose-500' : 'text-white'}`}>
                        {guessGame.trumpSuit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {guessGame.cards.map((gc, idx) => (
                      <button
                        key={gc.card.id}
                        onClick={() => {
                          const correct = checkGuess(guessGame, gc.card.id);
                          setGuessGame({ ...guessGame, played: true, correct });
                          
                          if (correct) {
                            setUserProfile(prev => {
                              const updated = {
                                ...prev,
                                coins: prev.coins + guessGame.reward,
                                totalCoinsEarned: prev.totalCoinsEarned + guessGame.reward,
                              };
                              localStorage.setItem('batakProfile', JSON.stringify(updated));
                              return updated;
                            });
                          }
                        }}
                        className={`p-6 rounded-2xl border-2 ${gc.isTrump ? 'border-yellow-400' : 'border-white/10'} bg-white/5 hover:bg-white/10 transition-all`}
                      >
                        <div className={`text-4xl font-bold ${gc.card.suit === '♥' || gc.card.suit === '♦' ? 'text-rose-500' : 'text-white'}`}>
                          {gc.card.rank > 10 ? ['J', 'Q', 'K', 'A'][gc.card.rank - 11] : gc.card.rank}
                          {gc.card.suit}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quiz Modal */}
        {showQuiz && quiz && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">📝 HAFTALIK QUIZ</h2>
                <button onClick={() => setShowQuiz(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              {quiz.completed ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎓</div>
                  <div className="text-white text-2xl font-black mb-2">Quiz Tamamlandı!</div>
                  <div className="text-emerald-400 font-bold text-lg mb-2">{quiz.correctAnswers} / {quiz.questions.length} Doğru</div>
                  <div className="text-yellow-400 font-bold">+{quiz.reward} 🪙 kazandın!</div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-white/60 text-xs mb-2">
                      <span>Soru {quiz.currentQuestionIndex + 1} / {quiz.questions.length}</span>
                      <span>{quiz.correctAnswers} doğru</span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${((quiz.currentQuestionIndex) / quiz.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-white font-bold text-lg mb-6">
                    {quiz.questions[quiz.currentQuestionIndex].question}
                  </div>
                  
                  <div className="space-y-3">
                    {quiz.questions[quiz.currentQuestionIndex].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const result = answerQuizQuestion(quiz, idx);
                          setQuiz(result.quiz);
                          
                          if (result.quiz.completed) {
                            setUserProfile(prev => {
                              const updated = {
                                ...prev,
                                coins: prev.coins + result.quiz.reward,
                                totalCoinsEarned: prev.totalCoinsEarned + result.quiz.reward,
                              };
                              localStorage.setItem('batakProfile', JSON.stringify(updated));
                              return updated;
                            });
                          }
                        }}
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white text-left hover:bg-white/10 transition-all"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tema Mağazası Modal */}
        {showThemeShop && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-2xl rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">TEMA MAĞAZASI</h2>
                <button onClick={() => setShowThemeShop(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {['kiraathane', 'classic', 'casino', 'wood', 'royal', 'midnight', 'vintage', 'forest', 'ocean', 'lava', 'sunset', 'space', 'desert', 'neon']
                  .map(themeId => ({
                    id: themeId,
                    price: getThemePrices()[themeId] || 0
                  }))
                  .sort((a, b) => a.price - b.price)
                  .map(({ id: themeId }) => {
                  const styles = getThemeStyles(themeId as GameTheme);
                  const isOwned = userProfile.ownedThemes.includes(themeId);
                  const price = getThemePrices()[themeId] || 0;
                  const canAfford = userProfile.coins >= price;
                  
                  return (
                    <div 
                      key={themeId}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 ${
                        isOwned 
                          ? 'bg-emerald-500/20 border-emerald-400' 
                          : canAfford 
                            ? 'bg-white/5 border-white/10 hover:border-white/20' 
                            : 'bg-white/5 border-white/5 opacity-50'
                      }`}
                    >
                      <div className={`w-full aspect-square rounded-xl relative overflow-hidden flex items-center justify-center ${styles.bg}`}>
                        <div className={`absolute inset-0 opacity-40 ${styles.pattern} bg-cover`}></div>
                        <div className="w-8 h-8 rounded-full border-2 border-white/40 shadow-lg" style={{ backgroundColor: styles.accent }}></div>
                        {isOwned && (
                          <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-1">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] text-white font-bold uppercase truncate w-full text-center">{styles.name}</span>
                      {!isOwned && (
                        <div className="flex items-center gap-1">
                          <Coins size={10} className="text-yellow-400" />
                          <span className={`text-xs font-black ${canAfford ? 'text-yellow-400' : 'text-white/40'}`}>
                            {price}
                          </span>
                        </div>
                      )}
                      {!isOwned && canAfford && (
                        <button
                          onClick={() => {
                            const result = purchaseTheme(userProfile, themeId);
                            if (result.success) {
                              setUserProfile(result.newProfile);
                              setGameSettings(prev => ({ ...prev, theme: themeId as GameTheme }));
                            }
                          }}
                          className="w-full bg-emerald-500 text-white font-black py-1.5 rounded-lg text-[10px] uppercase hover:bg-emerald-400 transition-all"
                        >
                          SATIN AL
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Profil Düzenleme Modal */}
        {showProfileEdit && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-black text-white italic">PROFİL DÜZENLE</h2>
                <button onClick={() => setShowProfileEdit(false)} className="bg-white/5 p-2 rounded-lg text-white/40 hover:bg-white/10"><X size={18}/></button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 block">KULLANICI ADI</label>
                  <input
                    type="text"
                    value={userProfile.username}
                    onChange={(e) => {
                      const newUsername = e.target.value.slice(0, 20);
                      setUserProfile(prev => {
                        const updated = { ...prev, username: newUsername };
                        localStorage.setItem('batakProfile', JSON.stringify(updated));
                        return updated;
                      });
                    }}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-emerald-400 transition-all"
                    placeholder="Kullanıcı adınız"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 block">AVATAR</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {['👤', '🎮', '👑', '🎯', '🃏', '⭐', '🔥', '💎', '🏆', '🎲', '⚡', '🌟'].map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setUserProfile(prev => {
                            const updated = { ...prev, avatarId: emoji };
                            localStorage.setItem('batakProfile', JSON.stringify(updated));
                            return updated;
                          });
                        }}
                        className={`aspect-square flex items-center justify-center rounded-lg border-2 text-xl transition-all ${
                          userProfile.avatarId === emoji
                            ? 'border-emerald-400 bg-emerald-500/20'
                            : 'border-white/10 bg-black/20 hover:border-white/30'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowProfileEdit(false)}
                  className="w-full bg-emerald-500 text-white font-black py-3.5 rounded-xl shadow-xl uppercase tracking-wide text-sm hover:bg-emerald-400 transition-all"
                >
                  KAYDET
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coin ile Reklamsız Satın Al Modal */}
        {showAdFreeShop && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">🛡️ REKLAMSIZ PAKETLER</h2>
                <button onClick={() => setShowAdFreeShop(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              <div className="mb-4 text-center">
                <div className="text-white/60 text-sm">Mevcut Coin</div>
                <div className="text-2xl font-black text-yellow-400 flex items-center justify-center gap-2">
                  <Coins size={24} />
                  {userProfile.coins.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-3">
                {AD_FREE_PACKAGES.map(pkg => {
                  const canAfford = userProfile.coins >= pkg.coins;
                  return (
                    <div 
                      key={pkg.id}
                      className={`p-4 rounded-2xl border-2 ${canAfford ? 'bg-white/5 border-white/10' : 'bg-white/5 border-white/5 opacity-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
                            {pkg.id === 'mini' ? '⏱️' : pkg.id === 'standard' ? '📅' : '📆'}
                          </div>
                          <div>
                            <div className="text-white font-black text-lg">{pkg.label}</div>
                            <div className="text-white/60 text-xs">Reklamsız oyna</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuyAdFreeWithCoins(pkg.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-1 ${
                            canAfford
                              ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          <Coins size={14} />
                          {pkg.coins.toLocaleString()}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center text-white/40 text-xs">
                Veya <button onClick={() => { setShowAdFreeShop(false); handleWatchAd('adfree30'); }} className="text-orange-400 underline">reklam izleyerek</button> 30 dk bedava kazan!
              </div>
            </div>
          </div>
        )}

        {/* Premium Subscription Modal */}
        {showPremiumModal && (
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden`}>
              {/* Arka plan efekti */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white italic flex items-center gap-2">
                    <span className="text-3xl">👑</span> BATAK PRO+
                  </h2>
                  <button onClick={() => setShowPremiumModal(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
                </div>
                
                {/* Premium kullanıcı ise */}
                {isPremiumUser() ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">👑</div>
                    <h3 className="text-2xl font-black text-yellow-400 mb-2">Premium Üyesin!</h3>
                    <p className="text-white/60 text-sm mb-6">Tüm premium özelliklerin aktif.</p>
                    
                    <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-400/30 mb-4">
                      <div className="text-white/60 text-xs mb-2">Kalan Geri Al Hakkı</div>
                      <div className="text-3xl font-black text-yellow-400">{getPremiumDailyUndos()}/3</div>
                    </div>
                    
                    {canClaimPremiumDailyCoins() && (
                      <button 
                        onClick={() => {
                          const coins = claimPremiumDailyCoins();
                          if (coins > 0) {
                            setUserProfile(prev => ({ ...prev, coins: prev.coins + coins }));
                            setMessage(`+${coins} bonus coin alındı! 🪙`);
                            setTimeout(() => setMessage(null), 3000);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black py-3 rounded-2xl mb-4"
                      >
                        🪙 Günlük 200 Coin Al
                      </button>
                    )}
                    
                    <button onClick={() => setShowPremiumModal(false)} className="text-white/40 text-sm">
                      Kapat
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Premium Özellikleri */}
                    <div className="bg-yellow-500/10 p-6 rounded-2xl border border-yellow-400/30 mb-6">
                      <h3 className="text-white font-black text-sm mb-4">PREMİUM ÖZELLİKLER</h3>
                      <div className="space-y-3">
                        {[
                          { icon: '🚫', text: 'Tüm reklamlar kaldırılır' },
                          { icon: '↩️', text: 'Günlük 3 Geri Al (Undo) hakkı' },
                          { icon: '🪙', text: 'Günlük 200 bonus coin' },
                          { icon: '🎨', text: '5 özel premium tema' },
                          { icon: '👤', text: 'Özel "PRO" rozeti' },
                          { icon: '📊', text: 'Gelişmiş istatistikler' },
                        ].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-xl">{feature.icon}</span>
                            <span className="text-white text-sm">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Fiyatlandırma */}
                    <div className="space-y-3">
                      {/* Aylık - En Popüler */}
                      <button 
                        onClick={async () => {
                          setMessage('Satın alma başlatılıyor...');
                          const success = await purchaseSubscription('monthly');
                          if (success) {
                            setMessage('Satın alma işlemi başlatıldı!');
                          } else {
                            setMessage('Satın alma başlatılamadı. Lütfen tekrar deneyin.');
                          }
                          setTimeout(() => setMessage(null), 3000);
                        }}
                        className="w-full p-4 rounded-2xl border-2 border-yellow-400 bg-yellow-500/20 relative text-left hover:bg-yellow-500/30 transition-all"
                      >
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                          EN POPÜLER
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-black">Aylık</div>
                            <div className="text-white/60 text-xs">Her ay yenilenir</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-yellow-400">₺{SUBSCRIPTION_PRICES.monthly.amount}</div>
                            <div className="text-white/40 text-xs">/ay</div>
                          </div>
                        </div>
                      </button>
                      
                      {/* Haftalık */}
                      <button 
                        onClick={async () => {
                          setMessage('Satın alma başlatılıyor...');
                          const success = await purchaseSubscription('weekly');
                          if (success) {
                            setMessage('Satın alma işlemi başlatıldı!');
                          } else {
                            setMessage('Satın alma başlatılamadı. Lütfen tekrar deneyin.');
                          }
                          setTimeout(() => setMessage(null), 3000);
                        }}
                        className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-left hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-black">Haftalık</div>
                            <div className="text-white/60 text-xs">Her hafta yenilenir</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-white">₺{SUBSCRIPTION_PRICES.weekly.amount}</div>
                            <div className="text-white/40 text-xs">/hafta</div>
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    <div className="mt-6 text-center text-white/40 text-[10px]">
                      Abonelikler App Store / Google Play üzerinden yönetilir.
                      <br />İstediğin zaman iptal edebilirsin.
                    </div>
                    
                    {/* Satın alımları geri yükle */}
                    <button 
                      onClick={async () => {
                        setMessage('Satın alımlar geri yükleniyor...');
                        const success = await restorePurchases();
                        if (success) {
                          setMessage('Satın alımlar başarıyla yüklendi!');
                        } else {
                          setMessage('Satın alım bulunamadı.');
                        }
                        setTimeout(() => setMessage(null), 3000);
                      }}
                      className="w-full text-center text-white/40 text-xs mt-4 hover:text-white/60"
                    >
                      Satın alımları geri yükle
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONFETTI */}
        {showConfetti && <Confetti />}

        {/* GAME END MESSAGE */}
        {gameEndMessage && (
          <div className="fixed inset-0 z-[900] flex items-center justify-center pointer-events-none">
            <div className={`animate-bounce px-8 py-6 rounded-3xl shadow-2xl border-4 ${
              gameEndMessage.type === 'win' 
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-300' 
                : gameEndMessage.type === 'batak'
                  ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-400'
                  : 'bg-gradient-to-br from-gray-600 to-slate-700 border-gray-400'
            }`}>
              <div className="text-center">
                <div className="text-5xl mb-2">
                  {gameEndMessage.type === 'win' ? '🎉' : gameEndMessage.type === 'batak' ? '💀' : '😔'}
                </div>
                <div className="text-3xl font-black text-white mb-1">
                  {gameEndMessage.type === 'win' ? 'KAZANDIN!' : gameEndMessage.type === 'batak' ? 'BATAK!' : 'KAYBETTİN'}
                </div>
                <div className={`text-xl font-bold ${gameEndMessage.coins >= 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                  {gameEndMessage.coins >= 0 ? '+' : ''}{gameEndMessage.coins} 🪙
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RATING PROMPT MODAL */}
        {showRatingPrompt && (
          <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-3xl p-6 border border-white/10 shadow-2xl animate-fade-in">
              <div className="text-center">
                {/* Üst Icon */}
                <div className="text-5xl mb-4">
                  {ratingContext === 'batak' ? '🏆' : ratingContext === 'level' ? '⭐' : '🃏'}
                </div>
                
                {/* Başlık */}
                <h2 className="text-xl font-black text-white mb-2">
                  {ratingContext === 'batak' 
                    ? 'Muhteşem Oyun!' 
                    : ratingContext === 'level' 
                    ? 'Tebrikler!' 
                    : 'Batak Pro\'yu Nasıl Buldun?'}
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  {ratingContext === 'batak'
                    ? 'Bu performansı değerlendirir misin?'
                    : 'Görüşlerin bizim için çok değerli!'}
                </p>
                
                {/* Emoji Seçenekleri */}
                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={async () => {
                      await handleRatingResponse('love');
                      setShowRatingPrompt(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/30 border border-white/10 hover:bg-emerald-500/30 hover:border-emerald-400 transition-all active:scale-95"
                  >
                    <span className="text-4xl">😍</span>
                    <span className="text-white text-xs font-bold">Harika!</span>
                  </button>
                  
                  <button
                    onClick={async () => {
                      await handleRatingResponse('like');
                      setShowRatingPrompt(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/30 border border-white/10 hover:bg-emerald-500/30 hover:border-emerald-400 transition-all active:scale-95"
                  >
                    <span className="text-4xl">😊</span>
                    <span className="text-white text-xs font-bold">İyi</span>
                  </button>
                  
                  <button
                    onClick={async () => {
                      await handleRatingResponse('meh');
                      setShowRatingPrompt(false);
                      setMessage('Geri bildiriminiz için teşekkürler!');
                      setTimeout(() => setMessage(null), 2000);
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/30 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                  >
                    <span className="text-4xl">😐</span>
                    <span className="text-white/60 text-xs font-bold">Eh işte</span>
                  </button>
                </div>
                
                {/* Sonra Sor Butonu */}
                <button
                  onClick={async () => {
                    await handleRatingResponse('later');
                    setShowRatingPrompt(false);
                  }}
                  className="text-white/40 text-sm hover:text-white/60 transition-colors"
                >
                  Sonra Sor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ONBOARDING MODAL */}
        {showOnboarding && (
          <div className="fixed inset-0 z-[1000] bg-gradient-to-b from-[#064e3b] to-[#022c22] flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              {onboardingStep === 0 && (
                <div className="text-center animate-fade-in">
                  <div className="text-6xl mb-6">🃏</div>
                  <h1 className="text-4xl font-black text-white italic mb-2">
                    BATAK<span className="text-emerald-400">PRO</span>
                  </h1>
                  <p className="text-white/60 mb-8">Türkiye'nin en iyi Batak oyunu!</p>
                  <button 
                    onClick={() => setOnboardingStep(1)}
                    className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl text-lg hover:bg-emerald-400 transition-all shadow-xl"
                  >
                    BAŞLA
                  </button>
                </div>
              )}
              
              {onboardingStep === 1 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-black text-white text-center mb-6">İsmini Gir</h2>
                  <input
                    type="text"
                    value={onboardingName}
                    onChange={(e) => setOnboardingName(e.target.value.toUpperCase().slice(0, 12))}
                    placeholder="OYUNCU ADI"
                    className="w-full bg-black/30 border-2 border-white/20 rounded-2xl px-4 py-4 text-white text-center font-black text-xl placeholder:text-white/30 focus:border-emerald-400 focus:outline-none mb-6"
                    maxLength={12}
                  />
                  <button 
                    onClick={() => {
                      if (onboardingName.trim()) {
                        setUserProfile(p => {
                          const updated = {
                            ...p,
                            username: onboardingName.trim() || 'OYUNCU',
                            avatarId: 'spade', // Varsayılan avatar
                            isOnboarded: true,
                          };
                          localStorage.setItem('batakProfile', JSON.stringify(updated));
                          logOnboardingCompleted();
                          return updated;
                        });
                        setShowOnboarding(false);
                      }
                    }}
                    disabled={!onboardingName.trim()}
                    className={`w-full font-black py-4 rounded-2xl text-lg transition-all shadow-xl ${
                      onboardingName.trim() 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    OYUNA BAŞLA 🎮
                  </button>
                </div>
              )}
            </div>
            <style>{`
              @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
              .animate-fade-in { animation: fade-in 0.5s ease-out; }
            `}</style>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

const App: React.FC = () => <AppContent />;
export default App;

