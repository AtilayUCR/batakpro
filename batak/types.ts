
export enum Suit {
  SPADES = '♠',
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
}

export enum Rank {
  TWO = 2, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING, ACE
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export enum Difficulty {
  EASY = 'Acemi',
  MEDIUM = 'Oyuncu',
  HARD = 'Usta',
  LEGEND = 'EFSANE',
  INVINCIBLE = 'YENİLMEZ'
}

export enum GameMode {
  IHALELI = 'İhaleli',
  IHALESIZ = 'İhalesiz',
  KOZ_MACA = 'Koz Maça',
  ESLI = 'Eşli Batak',
  TEKLI = 'Tekli Batak',
  UCLU = 'Üçlü Batak',
  HIZLI = 'Hızlı Oyun',
  YERE_BATAK = 'Yere Batak',
  ACIK_KOZ = 'Açık Koz',
  CAPOT = 'Capot',
  KUMANDA = 'Kumanda Batak',
}

export interface HouseRules {
  macaCezasi: boolean;
  ilkElKozYasak: boolean;
  batakZorunlulugu: boolean;
  yanlisSaymaCezasi: boolean;
  onikiBatar: boolean;
  zorunluYukseltme: boolean; // Üstteki karttan yüksek atmak zorunlu
  bonusEl: boolean; // Son el 2 puan
}

export interface PlayerStats {
    totalGames: number;
    totalWins: number;
    totalBidsWon: number;
    totalBidsLost: number;
    maxBidRecord: number;
    totalTricks: number;
    batakRate: number;
    avgBid: number;
    highestTricksInOneRound: number;
}

export interface DailyReward {
  day: number;
  coins: number;
  claimed: boolean;
  claimedDate?: string;
}

export interface Quest {
  id: string;
  type: 'daily' | 'weekly' | 'achievement';
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  completedDate?: string;
  resetDate?: string; // Sıfırlanma tarihi
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  target?: number;
}

export interface ThemeShop {
  id: string;
  name: string;
  price: number;
  owned: boolean;
  premium?: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  mode?: GameMode;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  expiresAt: string; // ISO date
}

export interface LastGameResult {
  mode: GameMode;
  won: boolean;
  coinsEarned: number;
  tricksWon: number;
  bid: number;
  wasBatak: boolean;
  timestamp: string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  owned: number; // Kaç adet var
}

export interface BidHistoryEntry {
  playerId: number;
  playerName: string;
  bid: number | null; // null = pas
  timestamp: number;
}

export interface UserProfile {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  coins: number; 
  stats: PlayerStats;
  username: string;
  avatarId: string;
  ownedTables: string[]; 
  ownedThemes: string[];
  ownedGameSpeeds: string[]; // Sahip olunan oyun hızları
  ownedPowerUps: PowerUp[]; // Sahip olunan power-up'lar
  league: string;
  dailyRewards: DailyReward[];
  lastDailyRewardDate?: string;
  streakDays: number;
  quests: Quest[];
  questsLastResetDate?: string; // Görevlerin son sıfırlanma tarihi
  weeklyQuestsLastResetDate?: string; // Haftalık görevlerin son sıfırlanma tarihi
  achievements: Achievement[];
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  dailyChallenge?: DailyChallenge;
  lastGameResult?: LastGameResult;
  vibrationEnabled: boolean;
  botNames?: string[]; // Özelleştirilmiş bot isimleri
  undoCount: number; // Kullanılabilir undo sayısı
  hintCount: number; // Kullanılabilir ipucu sayısı
  streakProtectionCount: number; // Streak koruma sayısı
}

export interface Player {
  id: number;
  name: string;
  isBot: boolean;
  hand: Card[];
  tricksWon: number;
  currentBid: number; 
  position: 'bottom' | 'left' | 'top' | 'right'; 
  totalScore: number;
  personality?: 'AGGRESSIVE' | 'CAUTIOUS' | 'BALANCED';
}

export enum GamePhase {
  LOBBY = 'LOBBY', 
  STATISTICS = 'STATISTICS',
  MODE_SELECTION = 'MODE_SELECTION',
  RULES_SETUP = 'RULES_SETUP',
  BIDDING = 'BIDDING', 
  TRUMP_SELECTION = 'TRUMP_SELECTION',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT'
}

export interface PlayedCard {
  playerId: number;
  card: Card;
}

export type CardBack = 'blue' | 'red' | 'black' | 'orange' | 'green' | 'purple' | 'gold';

export type GameTheme = 'classic' | 'casino' | 'wood' | 'royal' | 'midnight' | 'forest' | 'ocean' | 'lava' | 'sunset' | 'space' | 'desert' | 'neon' | 'vintage' | 'kiraathane';

export type SoundPack = 'classic' | 'modern' | 'retro' | 'arcade';

export interface GameSettings {
  difficulty: Difficulty;
  gameSpeed: 'slow' | 'normal' | 'fast' | 'turbo';
  theme: GameTheme;
  cardBack: CardBack;
  houseRules: HouseRules;
  soundEnabled: boolean;
  soundPack: SoundPack;
  vibrationEnabled: boolean;
  botChatEnabled: boolean; // Bot mesajları gösterilsin mi
}
