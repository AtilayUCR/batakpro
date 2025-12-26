
import React, { Component, useState, useEffect, useCallback, useRef } from 'react';
import { Home, Settings, Trophy, Coins, Check, Play, BarChart3, ShieldCheck, Flame, User as UserIcon, X, Spade, AlertCircle, Skull, Zap, Heart, Layers, Gauge, Palette, ChevronDown, ChevronUp, MessageCircle, TrendingUp, Target, Award, Volume2, VolumeX, Music } from 'lucide-react';
import { Card, Suit, Rank, Player, GamePhase, PlayedCard, Difficulty, GameSettings, UserProfile, GameMode, HouseRules, CardBack, GameTheme, SoundPack } from './types';
import { createDeck, shuffleDeck, dealCards, isValidMove, getBotMove, determineTrickWinner, getThreeUniqueBotNames, evaluateHand, getBotQuote, getBotBid, calculateRoundScore, sortHandWithTrump } from './utils/batakLogic';
import { 
  claimDailyReward, canClaimDailyReward, getCurrentStreakDay, getDailyRewards,
  updateQuestProgress, generateDailyQuests, generateWeeklyQuests,
  checkAndUnlockAchievements, getAllAchievements,
  purchaseTheme, canAffordTheme, getThemePrices,
  addXp, COINS_REWARDS, XP_REWARDS, getDifficultyCoins
} from './utils/coinsSystem';

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
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Fix: Correctly extending Component with generics to ensure 'props' and 'state' are available, avoiding line 98 error.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(_: any): ErrorBoundaryState { 
    return { hasError: true }; 
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-[#022c22] flex flex-col items-center justify-center text-white text-center p-6">
          <AlertCircle size={48} className="text-emerald-400 mb-4" />
          <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">Sistem Hatası</h2>
          <button onClick={() => window.location.reload()} className="bg-emerald-500 px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">YENİDEN DENE</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- MAIN APP ---
const AppContent: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.LOBBY);
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.IHALELI);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number>(0);
  const [currentTrick, setCurrentTrick] = useState<PlayedCard[]>([]);
  const [visualTrick, setVisualTrick] = useState<PlayedCard[]>([]);
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
  const [showProfileEdit, setShowProfileEdit] = useState<boolean>(false);
  const [noBatakStreak, setNoBatakStreak] = useState<number>(0);
  const [playedModes, setPlayedModes] = useState<Set<string>>(new Set());

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    difficulty: Difficulty.MEDIUM,
    gameSpeed: 'normal',
    theme: 'kiraathane', 
    cardBack: 'green',
    houseRules: { macaCezasi: false, ilkElKozYasak: true, batakZorunlulugu: true, yanlisSaymaCezasi: false, onikiBatar: true },
    soundEnabled: true,
    soundPack: 'arcade', // Defaulted to Arcade as requested
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
        return parsed;
      } catch {
        // Hatalı kayıt, varsayılan değerleri kullan
      }
    }
    return {
      level: 1, 
      currentXp: 0, 
      xpToNextLevel: 1000,
      coins: 500, // Başlangıç coins
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
      dailyRewards: getDailyRewards(),
      streakDays: 0,
      quests: [...generateDailyQuests(), ...generateWeeklyQuests()],
      achievements: getAllAchievements(),
      totalCoinsEarned: 500,
      totalCoinsSpent: 0,
    };
  });

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

  // Günlük ödül kontrolü - lobby'de otomatik aç
  useEffect(() => {
    if (phase === GamePhase.LOBBY && canClaimDailyReward(userProfile)) {
      // İlk açılışta hemen açma, kullanıcı butona tıklasın
      // setShowDailyReward(true);
    }
  }, [phase, userProfile]);

  const playSfx = (key: 'deal' | 'play') => {
    if (!gameSettings.soundEnabled) return;
    const audio = audioRefs.current[key];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const getSpeedDelay = () => {
    switch (gameSettings.gameSpeed) {
        case 'slow': return 1500;
        case 'fast': return 400;
        case 'turbo': return 150;
        default: return 800;
    }
  };

  const triggerBotMessage = (playerId: number, type: 'win' | 'lose' | 'bid' | 'play') => {
    const msg = getBotQuote(type);
    setBotMessages(prev => ({...prev, [playerId]: msg}));
    setTimeout(() => {
      setBotMessages(prev => ({...prev, [playerId]: null}));
    }, 2500);
  };

  const getThemeStyles = (theme: GameTheme) => {
    switch (theme) {
      case 'kiraathane': return { 
          bg: 'bg-emerald-950', 
          pattern: 'felt-texture', 
          accent: '#064e3b', 
          name: 'Kıraathane HD',
          isHD: true 
      };
      case 'casino': return { bg: 'bg-[#0f172a]', pattern: "bg-[url('https://www.transparenttextures.com/patterns/felt.png')]", accent: '#10b981', name: 'Casino' };
      case 'wood': return { bg: 'bg-[#451a03]', pattern: "bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]", accent: '#fbbf24', name: 'Ahşap' };
      case 'royal': return { bg: 'bg-[#7f1d1d]', pattern: "bg-[url('https://www.transparenttextures.com/patterns/velvet.png')]", accent: '#f87171', name: 'Saray' };
      case 'midnight': return { bg: 'bg-[#020617]', pattern: "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]", accent: '#60a5fa', name: 'Gece' };
      case 'vintage': return { bg: 'bg-[#44403c]', pattern: "bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]", accent: '#a8a29e', name: 'Vintage' };
      default: return { bg: 'bg-[#064e3b]', pattern: "bg-[url('https://www.transparenttextures.com/patterns/felt.png')]", accent: '#10b981', name: 'Klasik' };
    }
  };

  const initGame = () => {
    playSfx('deal');
    const deck = shuffleDeck(createDeck());
    
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
    const botNames = getThreeUniqueBotNames();
    
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
        newPlayers.push({
          id: i,
          name: botNames[i - 1],
          isBot: true,
          hand: hands[i],
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

    // Oynanan modları kaydet
    setPlayedModes(prev => new Set([...prev, selectedMode]));

    if (selectedMode === GameMode.IHALELI || selectedMode === GameMode.ESLI || selectedMode === GameMode.TEKLI || selectedMode === GameMode.UCLU) {
      setIsBidding(true);
      setPhase(GamePhase.BIDDING);
    } else if (selectedMode === GameMode.KOZ_MACA) {
      setTrumpSuit(Suit.SPADES);
      setIsBidding(false);
      setPhase(GamePhase.PLAYING);
    } else if (selectedMode === GameMode.IHALESIZ) {
      // İhalesiz: İlk eli kazanan koz seçer, başlangıçta koz yok
      setTrumpSuit(null);
      setIsBidding(false);
      setPhase(GamePhase.PLAYING);
    } else if (selectedMode === GameMode.HIZLI) {
      // Hızlı oyun: 6 el, koz maça
      setTrumpSuit(Suit.SPADES);
      setIsBidding(false);
      setPhase(GamePhase.PLAYING);
    } else {
      setTrumpSuit(Suit.SPADES);
      setIsBidding(false);
      setPhase(GamePhase.PLAYING);
    }
  };

  const makeBid = (playerId: number, bid: number | null) => {
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
      const nextPlayer = (playerId + 1) % 4;
      setBiddingPlayerIdx(nextPlayer);
      
      return updated;
    });
  };

  // İhale bitiş kontrolü için ayrı useEffect
  useEffect(() => {
    if (phase === GamePhase.BIDDING && isBidding) {
      const activeBids = players.filter(p => p.currentBid > 0);
      const passCount = players.filter(p => p.currentBid === -1).length;
      const allBidded = players.every(p => p.currentBid !== 0);
      
      if (allBidded && (activeBids.length === 0 || passCount >= 3)) {
        // İhale bitti
        setTimeout(() => {
          if (bidWinnerId !== null) {
            // İhaleyi kazanan koz seçmeli
            const winner = players.find(p => p.id === bidWinnerId);
            if (winner && winner.isBot) {
              // Bot otomatik koz seçer
              const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
              const selectedSuit = suits[Math.floor(Math.random() * suits.length)];
              setTrumpSuit(selectedSuit);
              // Kartları koz rengine göre sırala
              setPlayers(prev => prev.map(p => ({
                ...p,
                hand: sortHandWithTrump(p.hand, selectedSuit)
              })));
              setIsBidding(false);
              setPhase(GamePhase.PLAYING);
              setCurrentPlayerIdx(bidWinnerId);
            } else if (winner) {
              // Kullanıcı koz seçmeli
              setShowTrumpSelection(true);
            }
          } else {
            // Hiç kimse ihale yapmadı, pas geçildi - koz maça olarak devam
    setTrumpSuit(Suit.SPADES); 
    setIsBidding(false);
            setPhase(GamePhase.PLAYING);
    setCurrentPlayerIdx(0);
          }
        }, 500);
      }
    }
  }, [phase, isBidding, players, bidWinnerId]);

  const startBidding = (bid: number) => {
    makeBid(0, bid);
  };

  const playCard = (playerId: number, card: Card) => {
    if (currentTrick.length >= 4 || isBidding) return;
    playSfx('play');
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, hand: p.hand.filter(c => c.id !== card.id) } : p));
    if (card.suit === trumpSuit) setSpadesBroken(true);
    const played = { playerId, card };
    setCurrentTrick(prev => [...prev, played]);
    setVisualTrick(prev => [...prev, played]);
    
    if (players[playerId].isBot && Math.random() > 0.7) {
      triggerBotMessage(playerId, 'play');
    }

    if (currentTrick.length < 3) setCurrentPlayerIdx((playerId + 1) % 4);
  };

  // Bot ihale mantığı
  useEffect(() => {
    if (phase === GamePhase.BIDDING && isBidding && players[biddingPlayerIdx]?.isBot && players[biddingPlayerIdx]?.currentBid === 0) {
      const delay = getSpeedDelay();
      const t = setTimeout(() => {
        const bot = players[biddingPlayerIdx];
        if (!bot) return;
        
        const botBid = getBotBid(
          bot.hand,
          highestBid,
          gameSettings.difficulty,
          biddingPlayerIdx
        );
        
        if (botBid) {
          if (Math.random() > 0.3) {
            triggerBotMessage(biddingPlayerIdx, 'bid');
          }
        } else {
          // Pas geçti
          if (Math.random() > 0.5) {
            setBotMessages(prev => ({...prev, [biddingPlayerIdx]: 'Pas'}));
            setTimeout(() => {
              setBotMessages(prev => ({...prev, [biddingPlayerIdx]: null}));
            }, 1500);
          }
        }
        
        makeBid(biddingPlayerIdx, botBid);
      }, delay);
      return () => clearTimeout(t);
    }
  }, [phase, isBidding, biddingPlayerIdx, players, highestBid, gameSettings.difficulty]);

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
    setPhase(GamePhase.PLAYING);
    if (bidWinnerId !== null) {
      setCurrentPlayerIdx(bidWinnerId);
    }
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

        setCurrentTrick([]);
        setVisualTrick([]);
          setTrickCount(prev => {
            const newCount = prev + 1;
            const maxTricks = selectedMode === GameMode.HIZLI ? 6 : 13;
            if (newCount === maxTricks) {
              // El tamamlandı, oyun bitti
              setTimeout(() => endRound(), getSpeedDelay());
            }
            return newCount;
          });
          setCurrentPlayerIdx(winnerId);
      }, getSpeedDelay());
    }
    }
  }, [currentTrick, trumpSuit, players, trickCount, selectedMode]);

  const renderLobby = () => (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 bg-gradient-to-b from-[#064e3b] to-[#022c22] relative z-10 overflow-hidden">
      <div className="w-full max-w-2xl flex justify-between items-center bg-white/5 backdrop-blur-2xl p-3 sm:p-4 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfileEdit(true)}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform text-xl">
            {userProfile.avatarId || <UserIcon size={20}/>}
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-bold text-xs sm:text-sm">{userProfile.username}</h3>
            <div className="flex items-center gap-1">
                <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">{userProfile.league} Lig</span>
                <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded">Lv. {userProfile.level}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                <Coins size={12} className="text-yellow-400"/><span className="text-yellow-500 font-black text-xs">{userProfile.coins.toLocaleString()}</span>
            </div>
            <button onClick={() => setShowThemeShop(true)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white transition-all shadow-lg" title="Tema Mağazası"><Palette size={18}/></button>
            <button onClick={() => setPhase(GamePhase.STATISTICS)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white transition-all shadow-lg"><BarChart3 size={18}/></button>
            <button onClick={() => setShowSettings(true)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white transition-all shadow-lg"><Settings size={18}/></button>
        </div>
      </div>

      <div className="text-center w-full px-6 py-4 flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-emerald-400"><Spade size={14} /></span>
          <span className="text-white/20 font-black text-[10px] uppercase tracking-[0.4em]">Legendary Card Game</span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none uppercase select-none drop-shadow-2xl">
          BATAK<span className="text-emerald-500">PRO</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-lg mb-6">
        {[
          { mode: GameMode.IHALELI, icon: <Zap />, label: 'İHALELİ' },
          { mode: GameMode.KOZ_MACA, icon: <Spade />, label: 'KOZ MAÇA' },
          { mode: GameMode.IHALESIZ, icon: <Flame />, label: 'İHALESİZ' },
          { mode: GameMode.ESLI, icon: <ShieldCheck />, label: 'EŞLİ' },
          { mode: GameMode.TEKLI, icon: <UserIcon />, label: 'TEKLİ' },
          { mode: GameMode.UCLU, icon: <Layers />, label: 'ÜÇLÜ' },
          { mode: GameMode.HIZLI, icon: <Zap />, label: 'HIZLI' }
        ].map(({ mode, icon, label }) => (
          <button 
            key={mode} 
            onClick={() => { 
              setSelectedMode(mode); 
              setPhase(GamePhase.RULES_SETUP);
              console.log('Mode selected:', mode, 'Phase:', GamePhase.RULES_SETUP);
            }}
            className={`group p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${selectedMode === mode ? 'bg-emerald-500/20 border-emerald-400 shadow-xl shadow-emerald-500/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
      
      {/* Günlük Ödül Butonu */}
      <div className="w-full max-w-lg mb-4 flex gap-2">
        <button 
          onClick={() => {
            setShowDailyReward(true);
          }}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black py-3 rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
        >
          <Trophy size={16} />
          GÜNLÜK ÖDÜL ({getCurrentStreakDay(userProfile) || 1}/7)
        </button>
        <button 
          onClick={() => setShowQuests(true)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black py-3 rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
        >
          <Target size={16} />
          GÖREVLER
        </button>
        <button 
          onClick={() => setShowAchievements(true)}
          className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black py-3 rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
        >
          <Award size={16} />
          BAŞARIMLAR
        </button>
      </div>
      
    </div>
  );

  const renderStatistics = () => (
    <div className="w-full h-full flex flex-col items-center p-6 bg-[#020617] relative z-10 overflow-y-auto">
        <div className="w-full max-w-md flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white italic">İSTATİSTİKLER</h2>
            <button onClick={() => setPhase(GamePhase.LOBBY)} className="p-2 bg-white/5 rounded-xl text-white/40"><X /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {[
                { icon: <Trophy className="text-yellow-400"/>, label: 'Toplam Galibiyet', value: userProfile.stats.totalWins, total: userProfile.stats.totalGames },
                { icon: <Zap className="text-emerald-400"/>, label: 'Kazanılan İhale', value: userProfile.stats.totalBidsWon, total: userProfile.stats.totalBidsWon + userProfile.stats.totalBidsLost },
                { icon: <Skull className="text-rose-400"/>, label: 'Batak Sayısı', value: userProfile.stats.totalBidsLost, color: 'text-rose-400' },
                { icon: <Target className="text-blue-400"/>, label: 'En Yüksek İhale', value: userProfile.stats.maxBidRecord },
                { icon: <TrendingUp className="text-orange-400"/>, label: 'Ortalama İhale', value: userProfile.stats.avgBid },
                { icon: <Award className="text-purple-400"/>, label: 'Toplam El', value: userProfile.stats.totalTricks }
            ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-3xl border border-white/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        {stat.icon}
                        {stat.total && <span className="text-[8px] text-white/20 font-black">%{Math.round((stat.value / stat.total) * 100)}</span>}
                    </div>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-[8px] text-white/40 font-black uppercase tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>

        <div className="w-full max-sm:w-full max-w-md bg-emerald-500/10 p-6 rounded-[2.5rem] border border-emerald-500/20 mt-6 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl"><ShieldCheck size={32}/></div>
             <h3 className="text-white font-black text-lg">USTALIK SEVİYESİ</h3>
             <p className="text-white/40 text-xs mt-2 leading-relaxed">Senin gibi oyuncular Elmas Ligi'nin %2'lik kısmında yer alıyor. Bir sonraki seviye için 2500 puan daha gerekli.</p>
             <div className="w-full h-2 bg-black/40 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%]"></div>
             </div>
             <div className="flex justify-between w-full mt-2 text-[9px] font-black text-emerald-400 tracking-widest">
                <span>SEVİYE {userProfile.level}</span>
                <span>SEVİYE {userProfile.level + 1}</span>
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
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setRoundResults(null);
                    setPhase(GamePhase.LOBBY);
                  }} 
                  className="flex-1 bg-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all uppercase tracking-widest"
                >
                  Menü
                </button>
                <button 
                  onClick={() => {
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
          <div className="fixed inset-0 z-[800] bg-black/80 flex items-center justify-center p-6 animate-pop-in backdrop-blur-md">
            <div className={`${themeStyles.bg} w-full max-sm:w-full max-w-sm rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl`}>
              <div className="bg-emerald-500 p-6 text-center shadow-lg flex items-center justify-between">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex-1">Kurallar</h2>
                <button onClick={() => setPhase(GamePhase.LOBBY)} className="p-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-3">
                {['ilkElKozYasak', 'macaCezasi', 'batakZorunlulugu', 'onikiBatar'].map(rule => (
                   <div key={rule} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-black/30 transition-all" onClick={() => setGameSettings(s => ({...s, houseRules: {...s.houseRules, [rule]: !(s.houseRules as any)[rule]}}))}>
                      <span className="text-white text-[11px] font-black uppercase tracking-wider">{rule.replace(/([A-Z])/g, ' $1')}</span>
                      <div className={`w-10 h-5 rounded-full transition-all relative ${ (gameSettings.houseRules as any)[rule] ? 'bg-emerald-400' : 'bg-slate-700' }`}><div className={`w-4 h-4 bg-white rounded-full transition-all mt-0.5 ml-0.5 ${ (gameSettings.houseRules as any)[rule] ? 'translate-x-5' : '' }`}></div></div>
                   </div>
                ))}
                <button onClick={() => {
                  initGame();
                }} className="w-full bg-white text-emerald-900 py-4 rounded-2xl font-black text-lg mt-4 shadow-xl active:scale-95 transition-all uppercase tracking-tighter">BAŞLA</button>
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
                       const isOwned = price === 0 || userProfile.ownedThemes.includes(`speed_${speed}`);
                       const canAfford = userProfile.coins >= price;
                       const isSelected = gameSettings.gameSpeed === speed;
                       
                       return (
                         <button 
                           key={speed} 
                           onClick={() => {
                             if (isOwned) {
                               setGameSettings(prev => ({...prev, gameSpeed: speed as any}));
                             } else if (canAfford) {
                               setUserProfile(prev => {
                                 const updated = {
                                   ...prev,
                                   coins: prev.coins - price,
                                   ownedThemes: [...prev.ownedThemes, `speed_${speed}`],
                                   totalCoinsSpent: prev.totalCoinsSpent + price
                                 };
                                 localStorage.setItem('batakProfile', JSON.stringify(updated));
                                 return updated;
                               });
                               setGameSettings(prev => ({...prev, gameSpeed: speed as any}));
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
                <div className="fixed inset-0 z-[400] bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300">
                  <div className={`bg-[#2d1a0a] p-8 rounded-[3rem] border border-white/10 w-full max-w-sm text-center shadow-2xl animate-pop-in wood-border`}>
                    <h2 className="text-2xl font-black text-white italic mb-2">İHALE</h2>
                    {biddingPlayerIdx === 0 ? (
                      <>
                        <div className="mb-4 text-white/60 text-sm">En Yüksek İhale: {highestBid > 0 ? highestBid : 'Yok'}</div>
                    <div className="grid grid-cols-3 gap-2">
                            {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(num => (
                              <button 
                                key={num} 
                                onClick={() => startBidding(num)} 
                                disabled={num <= highestBid}
                                className={`font-black py-4 rounded-2xl text-xl shadow-lg transition-all active:scale-95 ${
                                  num <= highestBid 
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                            <button onClick={() => makeBid(0, null)} className="col-span-3 bg-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all uppercase tracking-widest">PAS</button>
                    </div>
                      </>
                    ) : (
                      <div className="py-8">
                        <div className="text-white/60 text-lg mb-4">
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

             {/* RESIZED AND REPOSITIONED SCOREBOARD */}
             <div className="absolute top-4 left-2 z-[110] flex flex-col items-start scale-90 sm:scale-100 origin-left">
                <button 
                  onClick={() => setShowScoreboard(!showScoreboard)} 
                  className={`flex items-center gap-2 bg-black/40 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10 text-white transition-all shadow-xl hover:bg-black/60 ${showScoreboard ? 'rounded-b-none border-b-0' : ''}`}
                >
                  <BarChart3 size={16} className="text-emerald-400" />
                  <span className="text-[9px] font-black tracking-widest uppercase">SKORLAR</span>
                  {showScoreboard ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {showScoreboard && (
                  <div className="bg-black/60 backdrop-blur-xl rounded-xl rounded-tl-none p-3 border border-white/10 border-t-0 text-white min-w-[140px] shadow-2xl animate-pop-in">
                    {players.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-[10px] mb-1.5 last:mb-0 gap-3">
                        <span className={`font-bold truncate flex-1 ${p.id === 0 ? 'text-emerald-400' : 'text-white/60'}`}>{p.name}</span>
                        <span className="font-black bg-white/10 px-1.5 py-0.5 rounded text-[9px]">{p.tricksWon} / {p.currentBid}</span>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="absolute top-4 right-4 z-[100] flex gap-3">
                <button onClick={() => setShowSettings(true)} className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg hover:bg-black/60"><Settings size={20}/></button>
                <button onClick={() => setPhase(GamePhase.LOBBY)} className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg hover:bg-black/60"><Home size={20}/></button>
             </div>

             <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 flex items-center justify-center pointer-events-none">
                {visualTrick.map(pt => (
                  <div key={pt.card.id} style={{ animation: `throw-in-${pt.playerId} 0.5s forwards` }} className="absolute">
                    <CardUI card={pt.card} small />
                  </div>
                ))}
             </div>

             {players.filter(p => p.id !== 0).map(p => (
               <div key={p.id} className={`absolute flex flex-col items-center transition-all ${p.position === 'top' ? 'top-8 inset-x-0' : p.position === 'left' ? 'left-4 top-[41.5%] -translate-y-1/2' : 'right-4 top-[41.5%] -translate-y-1/2'}`}>
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
                          <div className={`absolute -top-3 -left-3 w-10 h-10 bg-emerald-600 rounded-full border-2 border-white/40 flex items-center justify-center text-xs font-black text-white shadow-xl z-20 animate-pop-in`}>
                            {p.tricksWon}
                          </div>
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center bg-black/60 backdrop-blur-lg shadow-2xl transition-all ${currentPlayerIdx === p.id && !isBidding ? 'border-emerald-400 scale-110 shadow-emerald-500/20' : 'border-white/5 opacity-80'}`}>
                            <UserIcon size={24} className={currentPlayerIdx === p.id && !isBidding ? 'text-emerald-400' : 'text-white/20'} />
                          </div>
                      </div>
                      
                      <span className={`text-white font-black text-[10px] uppercase mt-3 tracking-wider text-center ${gameSettings.theme === 'kiraathane' ? '' : 'bg-black/20 px-3 py-1 rounded-lg backdrop-blur shadow-sm'}`}>
                        {p.name}
                      </span>
                  </div>
               </div>
             ))}

             <div className="absolute bottom-6 inset-x-0 flex flex-col items-center z-[50]">
                <div className={`relative mb-6 flex flex-col items-center ${gameSettings.theme === 'kiraathane' ? 'scale-110' : ''}`}>
                   {gameSettings.theme === 'kiraathane' && (
                     <div className="absolute inset-x-[-40px] inset-y-[-10px] bg-gradient-to-b from-[#8b4513] to-[#451a03] rounded-[2.5rem] wood-border -z-10 shadow-2xl"></div>
                   )}
                   <div className="relative">
                       <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-sm font-black text-white shadow-xl z-20">
                          {players[0]?.tricksWon}
                       </div>
                       <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center bg-black/60 backdrop-blur-lg shadow-2xl transition-all ${currentPlayerIdx === 0 && !isBidding ? 'border-emerald-400 scale-110 shadow-emerald-500/20' : 'border-white/5'}`}>
                          <UserIcon size={24} className={currentPlayerIdx === 0 && !isBidding ? 'text-emerald-400' : 'text-white/20'} />
                       </div>
                   </div>
                   <span className="text-white font-black text-[11px] uppercase mt-2 tracking-widest">{userProfile.username}</span>
                </div>
                
                <div className="flex flex-col gap-[-45px] items-center">
                   <div className="flex justify-center -space-x-12 mb-[-65px]">
                      {players[0]?.hand.slice(0, 7).map(card => {
                        const valid = isValidMove(card, players[0].hand, currentTrick, trumpSuit, spadesBroken, trickCount, gameSettings.houseRules);
                        return <CardUI key={card.id} card={card} playable={valid && currentPlayerIdx === 0 && !isBidding} onClick={() => playCard(0, card)} className="shadow-2xl hover:scale-105" />
                      })}
                   </div>
                   <div className="flex justify-center -space-x-12 z-[60]">
                      {players[0]?.hand.slice(7).map(card => {
                        const valid = isValidMove(card, players[0].hand, currentTrick, trumpSuit, spadesBroken, trickCount, gameSettings.houseRules);
                        return <CardUI key={card.id} card={card} playable={valid && currentPlayerIdx === 0 && !isBidding} onClick={() => playCard(0, card)} className="shadow-2xl hover:scale-105" />
                      })}
                   </div>
                </div>
             </div>

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
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden`}>
              {/* Arka plan efekti */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-white italic mb-1">GÜNLÜK ÖDÜL</h2>
                    <div className="flex items-center gap-2">
                      <div className="text-emerald-400 font-bold text-sm">Gün {getCurrentStreakDay(userProfile) || 1}/7</div>
                      {userProfile.streakDays >= 7 && (
                        <div className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">🔥 STREAK!</div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setShowDailyReward(false)} className="bg-white/5 p-2 rounded-xl text-white/40 hover:bg-white/10 transition-all"><X size={20}/></button>
                </div>
                
                {canClaimDailyReward(userProfile) ? (
                  <>
                    <div className="text-center mb-6 p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl border-2 border-yellow-400/50">
                      <div className="text-5xl font-black text-yellow-400 mb-2 flex items-center justify-center gap-2">
                        <Coins size={40} className="text-yellow-400" />
                        +{getDailyRewards()[Math.min(Math.max(0, (getCurrentStreakDay(userProfile) || 1) - 1), 6)].coins}
                      </div>
                      {(getCurrentStreakDay(userProfile) || 1) === 7 && (
                        <div className="text-lg font-black text-yellow-300 mt-2">
                          +{COINS_REWARDS.STREAK_BONUS} Bonus! 🎉
                        </div>
                      )}
                      <div className="text-white/60 text-xs mt-2">Toplam: {getDailyRewards()[Math.min(Math.max(0, (getCurrentStreakDay(userProfile) || 1) - 1), 6)].coins + ((getCurrentStreakDay(userProfile) || 1) === 7 ? COINS_REWARDS.STREAK_BONUS : 0)} Coins</div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const result = claimDailyReward(userProfile);
                        if (result.coinsEarned > 0) {
                          setUserProfile(result.newProfile);
                          setTimeout(() => setShowDailyReward(false), 2000);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-lg mb-6 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Trophy size={20} />
                        ÖDÜLÜ AL
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  </>
                ) : (
                  <div className="text-center mb-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-white/60 font-bold">Bugünkü ödülün zaten alındı!</div>
                    <div className="text-white/40 text-xs mt-2">Yarın tekrar gel!</div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center mb-2">7 GÜNLÜK STREAK</div>
                  <div className="grid grid-cols-7 gap-2">
                    {getDailyRewards().map((reward, idx) => {
                      const day = idx + 1;
                      const isClaimed = userProfile.dailyRewards[idx]?.claimed || false;
                      const currentDay = getCurrentStreakDay(userProfile) || 1;
                      const isToday = day === currentDay && canClaimDailyReward(userProfile);
                      const isPast = day < currentDay;
                      const isFuture = day > currentDay;
                      
                      return (
                        <div 
                          key={day}
                          className={`p-3 rounded-xl border-2 text-center transition-all relative ${
                            isClaimed 
                              ? 'bg-emerald-500/30 border-emerald-400 shadow-lg shadow-emerald-500/20' 
                              : isToday 
                                ? 'bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-105 animate-pulse' 
                                : isPast
                                  ? 'bg-white/5 border-white/10 opacity-50'
                                  : 'bg-white/5 border-white/10'
                          }`}
                        >
                          {isClaimed && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                          {isToday && (
                            <div className="absolute -top-1 -left-1 bg-yellow-500 rounded-full w-3 h-3 animate-ping"></div>
                          )}
                          <div className={`text-xs font-black mb-1 ${isClaimed ? 'text-emerald-300' : isToday ? 'text-yellow-300' : 'text-white/60'}`}>
                            Gün {day}
                          </div>
                          <div className={`text-xl font-black ${isClaimed ? 'text-emerald-400' : isToday ? 'text-yellow-400' : 'text-yellow-400/60'}`}>
                            {reward.coins}
                          </div>
                          {day === 7 && (
                            <div className="text-[7px] text-emerald-400 font-black mt-1 bg-emerald-500/20 px-1 py-0.5 rounded">BONUS</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center text-white/40 text-[9px] mt-2">
                    {userProfile.streakDays > 0 && (
                      <span>🔥 {userProfile.streakDays} günlük streak devam ediyor!</span>
                    )}
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
          <div className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className={`${themeStyles.bg} w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white italic">PROFİL DÜZENLE</h2>
                <button onClick={() => setShowProfileEdit(false)} className="bg-white/5 p-2 rounded-xl text-white/40"><X size={20}/></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 block">KULLANICI ADI</label>
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
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-sm focus:outline-none focus:border-emerald-400 transition-all"
                    placeholder="Kullanıcı adınız"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 block">AVATAR</label>
                  <div className="grid grid-cols-6 gap-2">
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
                        className={`p-3 rounded-xl border-2 text-2xl transition-all ${
                          userProfile.avatarId === emoji
                            ? 'border-emerald-400 bg-emerald-500/20 scale-110'
                            : 'border-white/10 bg-black/20 hover:border-white/20'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowProfileEdit(false)}
                  className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest hover:bg-emerald-400 transition-all"
                >
                  KAYDET
                </button>
              </div>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

const App: React.FC = () => <AppContent />;
export default App;

