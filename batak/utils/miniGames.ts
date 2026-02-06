// Mini Oyunlar Sistemi

import { Card, Suit, Rank } from '../types';

// --- TAHMİN ET OYUNU ---
export interface GuessGameCard {
  card: Card;
  isTrump: boolean;
}

export interface GuessGame {
  id: string;
  cards: GuessGameCard[];
  correctAnswerId: string;
  trumpSuit: Suit;
  reward: number;
  played: boolean;
  correct: boolean;
  expiresAt: string;
}

// Rastgele kart oluştur
const createRandomCard = (): Card => {
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
  const ranks = [Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN, 
                 Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
  
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  
  return {
    id: `${suit}_${rank}_${Math.random()}`,
    suit,
    rank,
  };
};

// Kazanan kartı belirle
const determineWinner = (cards: GuessGameCard[], trumpSuit: Suit, leadSuit: Suit): number => {
  let winnerIdx = 0;
  let winningCard = cards[0];
  
  for (let i = 1; i < cards.length; i++) {
    const challenger = cards[i];
    
    // Koz her zaman kazanır
    if (challenger.card.suit === trumpSuit && winningCard.card.suit !== trumpSuit) {
      winnerIdx = i;
      winningCard = challenger;
    } else if (challenger.card.suit === trumpSuit && winningCard.card.suit === trumpSuit) {
      // İki koz varsa büyük olan kazanır
      if (challenger.card.rank > winningCard.card.rank) {
        winnerIdx = i;
        winningCard = challenger;
      }
    } else if (challenger.card.suit === leadSuit && winningCard.card.suit !== trumpSuit) {
      // İlk renk (koz yoksa)
      if (winningCard.card.suit !== leadSuit || challenger.card.rank > winningCard.card.rank) {
        winnerIdx = i;
        winningCard = challenger;
      }
    }
  }
  
  return winnerIdx;
};

// Günlük tahmin oyunu oluştur
export const generateGuessGame = (): GuessGame => {
  const trumpSuits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
  const trumpSuit = trumpSuits[Math.floor(Math.random() * trumpSuits.length)];
  
  // 4 kart oluştur
  const cards: GuessGameCard[] = [];
  for (let i = 0; i < 4; i++) {
    const card = createRandomCard();
    cards.push({
      card,
      isTrump: card.suit === trumpSuit,
    });
  }
  
  // İlk kart lead suit
  const leadSuit = cards[0].card.suit;
  
  // Kazananı bul
  const winnerIdx = determineWinner(cards, trumpSuit, leadSuit);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return {
    id: `guess_${Date.now()}`,
    cards,
    correctAnswerId: cards[winnerIdx].card.id,
    trumpSuit,
    reward: 100,
    played: false,
    correct: false,
    expiresAt: tomorrow.toISOString(),
  };
};

// Tahmin kontrol
export const checkGuess = (game: GuessGame, selectedCardId: string): boolean => {
  return game.correctAnswerId === selectedCardId;
};

// --- QUIZ OYUNU ---
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  correctAnswers: number;
  reward: number;
  completed: boolean;
  expiresAt: string;
}

// Quiz soruları
const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Kolay
  {
    id: 'q1',
    question: 'Batak oyununda en yüksek kart hangisidir?',
    options: ['Kral (K)', 'As (A)', 'Vale (J)', 'Kız (Q)'],
    correctIndex: 1,
    explanation: 'As (A) tüm kart oyunlarında en yüksek karttır.',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    question: 'Batak oyununda kaç el oynanır?',
    options: ['10 el', '12 el', '13 el', '15 el'],
    correctIndex: 2,
    explanation: '52 kart 4 oyuncuya eşit dağıtıldığında her oyuncuya 13 kart düşer, yani 13 el oynanır.',
    difficulty: 'easy',
  },
  {
    id: 'q3',
    question: 'Koz maça modunda koz rengi nedir?',
    options: ['Kupa ♥', 'Karo ♦', 'Maça ♠', 'Sinek ♣'],
    correctIndex: 2,
    explanation: 'Koz Maça modunda koz her zaman maçadır (♠).',
    difficulty: 'easy',
  },
  {
    id: 'q4',
    question: '"Batak" olmak ne demektir?',
    options: ['Oyunu kazanmak', 'En yüksek ihaleyi vermek', 'İhaleyi tutturamamak', 'Tüm elleri almak'],
    correctIndex: 2,
    explanation: 'Batak, verdiğin ihale kadar eli alamamak demektir.',
    difficulty: 'easy',
  },
  
  // Orta
  {
    id: 'q5',
    question: 'İhaleli batakta minimum ihale kaçtır?',
    options: ['1', '2', '4', '5'],
    correctIndex: 2,
    explanation: 'İhaleli batakta minimum ihale 4\'tür.',
    difficulty: 'medium',
  },
  {
    id: 'q6',
    question: 'Eşli batakta takım arkadaşın hangi pozisyondadır?',
    options: ['Solunda', 'Sağında', 'Karşısında', 'Hiçbiri'],
    correctIndex: 2,
    explanation: 'Eşli batakta takım arkadaşın karşı karşıya oturur (0-2, 1-3 takımları).',
    difficulty: 'medium',
  },
  {
    id: 'q7',
    question: 'İhalesiz batakta koz nasıl belirlenir?',
    options: ['Rastgele', 'Her zaman maça', 'İlk eli kazanan seçer', 'Koz yoktur'],
    correctIndex: 2,
    explanation: 'İhalesiz batakta ilk eli kazanan oyuncu koz rengini seçer.',
    difficulty: 'medium',
  },
  {
    id: 'q8',
    question: '12 Batar kuralı ne anlama gelir?',
    options: ['12 el alan kazanır', '12 ihale veren kaybeder', '12 ihale verip tutturamayan ekstra ceza alır', '12. elde koz açılır'],
    correctIndex: 2,
    explanation: '12 Batar kuralında, 12 ihale verip tutturamayan oyuncu ekstra ceza alır.',
    difficulty: 'medium',
  },
  
  // Zor
  {
    id: 'q9',
    question: 'Zorunlu yükseltme kuralı ne demektir?',
    options: ['Her zaman koz atmalısın', 'Elinde varsa daha yüksek kart atmalısın', 'İhaleyi artırmalısın', 'Aynı renkten atmalısın'],
    correctIndex: 1,
    explanation: 'Zorunlu yükseltme kuralında, aynı renkten daha yüksek kartın varsa onu atmalısın.',
    difficulty: 'hard',
  },
  {
    id: 'q10',
    question: 'Capot modunda amaç nedir?',
    options: ['13 el almak', 'Hiç el almamak', 'Sadece koz elleri almak', 'Takım arkadaşına vermek'],
    correctIndex: 1,
    explanation: 'Capot modunda amaç hiç el almamaktır (ters batak).',
    difficulty: 'hard',
  },
  {
    id: 'q11',
    question: 'Kumanda batakta pas geçmek ne olur?',
    options: ['Normal devam', 'Cezalıdır (-50 puan)', 'Oyundan çıkarsın', 'İhale sana geçer'],
    correctIndex: 1,
    explanation: 'Kumanda batakta pas geçmek cezalıdır, -50 puan alırsın.',
    difficulty: 'hard',
  },
  {
    id: 'q12',
    question: 'Maça cezası kuralı ne zaman uygulanır?',
    options: ['Maça koz olduğunda', 'Maça ile el alındığında', 'Oyuncu hiç el almadığında', 'Maça ile ihale yapıldığında'],
    correctIndex: 2,
    explanation: 'Maça cezası, bir oyuncu hiç el almadığında (0 el) ek ceza olarak uygulanır.',
    difficulty: 'hard',
  },
];

// Haftalık quiz oluştur
export const generateWeeklyQuiz = (): Quiz => {
  // 5 rastgele soru seç (karışık zorluk)
  const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, 5);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return {
    id: `quiz_${Date.now()}`,
    questions: selectedQuestions,
    currentQuestionIndex: 0,
    correctAnswers: 0,
    reward: 250, // Base ödül, her doğru +50
    completed: false,
    expiresAt: nextWeek.toISOString(),
  };
};

// Quiz cevap kontrolü
export const answerQuizQuestion = (quiz: Quiz, selectedIndex: number): { correct: boolean; quiz: Quiz } => {
  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const correct = selectedIndex === currentQuestion.correctIndex;
  
  const updatedQuiz: Quiz = {
    ...quiz,
    correctAnswers: correct ? quiz.correctAnswers + 1 : quiz.correctAnswers,
    currentQuestionIndex: quiz.currentQuestionIndex + 1,
    completed: quiz.currentQuestionIndex + 1 >= quiz.questions.length,
  };
  
  // Ödül hesapla
  if (updatedQuiz.completed) {
    updatedQuiz.reward = 100 + updatedQuiz.correctAnswers * 50; // 100 base + 50/doğru
  }
  
  return { correct, quiz: updatedQuiz };
};

// Quiz tamamlandı mı kontrol
export const isQuizExpired = (quiz: Quiz): boolean => {
  return new Date() >= new Date(quiz.expiresAt);
};

// Guess game süresi doldu mu kontrol
export const isGuessGameExpired = (game: GuessGame): boolean => {
  return new Date() >= new Date(game.expiresAt);
};

// ============================================
// --- LUCKY WHEEL (ŞANS ÇARKI) ---
// ============================================

export interface WheelSlice {
  id: string;
  reward: number;
  type: 'coins' | 'xp' | 'powerup' | 'empty';
  label: string;
  color: string;
  probability: number; // 0-100 arası
}

export interface LuckyWheel {
  id: string;
  lastSpinDate: string | null;
  totalSpins: number;
  totalWinnings: number;
}

// Çark dilimleri
export const WHEEL_SLICES: WheelSlice[] = [
  { id: 'coins_50', reward: 50, type: 'coins', label: '50 🪙', color: '#22c55e', probability: 25 },
  { id: 'coins_100', reward: 100, type: 'coins', label: '100 🪙', color: '#eab308', probability: 20 },
  { id: 'coins_200', reward: 200, type: 'coins', label: '200 🪙', color: '#f97316', probability: 10 },
  { id: 'coins_500', reward: 500, type: 'coins', label: '500 🪙', color: '#ef4444', probability: 3 },
  { id: 'xp_25', reward: 25, type: 'xp', label: '25 XP', color: '#8b5cf6', probability: 15 },
  { id: 'xp_50', reward: 50, type: 'xp', label: '50 XP', color: '#a855f7', probability: 10 },
  { id: 'powerup_undo', reward: 1, type: 'powerup', label: '↩️ Undo', color: '#06b6d4', probability: 5 },
  { id: 'powerup_hint', reward: 1, type: 'powerup', label: '💡 İpucu', color: '#14b8a6', probability: 5 },
  { id: 'empty', reward: 0, type: 'empty', label: 'Boş 😢', color: '#64748b', probability: 7 },
];

// Günlük spin hakkı var mı?
export const canSpinWheel = (): boolean => {
  const stored = localStorage.getItem('batakLuckyWheel');
  if (!stored) return true;
  
  const wheel: LuckyWheel = JSON.parse(stored);
  if (!wheel.lastSpinDate) return true;
  
  const lastSpin = new Date(wheel.lastSpinDate).toDateString();
  const today = new Date().toDateString();
  
  return lastSpin !== today;
};

// Çarkı çevir ve sonuç al
export const spinWheel = (): { slice: WheelSlice; wheel: LuckyWheel } => {
  // Olasılık bazlı seçim
  const totalProbability = WHEEL_SLICES.reduce((sum, s) => sum + s.probability, 0);
  let random = Math.random() * totalProbability;
  
  let selectedSlice = WHEEL_SLICES[0];
  for (const slice of WHEEL_SLICES) {
    random -= slice.probability;
    if (random <= 0) {
      selectedSlice = slice;
      break;
    }
  }
  
  // Wheel state güncelle
  const stored = localStorage.getItem('batakLuckyWheel');
  let wheel: LuckyWheel = stored ? JSON.parse(stored) : {
    id: 'wheel_1',
    lastSpinDate: null,
    totalSpins: 0,
    totalWinnings: 0,
  };
  
  wheel.lastSpinDate = new Date().toISOString();
  wheel.totalSpins += 1;
  if (selectedSlice.type === 'coins') {
    wheel.totalWinnings += selectedSlice.reward;
  }
  
  localStorage.setItem('batakLuckyWheel', JSON.stringify(wheel));
  
  return { slice: selectedSlice, wheel };
};

// ============================================
// --- SPEED MATCH (HIZLI EŞLEŞTIRME) ---
// ============================================

export interface SpeedMatchCard {
  id: string;
  suit: Suit;
  rank: Rank;
  isMatched: boolean;
  isFlipped: boolean;
}

export interface SpeedMatch {
  id: string;
  cards: SpeedMatchCard[];
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  startTime: number;
  endTime: number | null;
  completed: boolean;
  reward: number;
  bestTime: number | null;
}

// Speed Match oyunu oluştur
export const generateSpeedMatch = (pairs: number = 6): SpeedMatch => {
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
  const ranks = [Rank.ACE, Rank.KING, Rank.QUEEN, Rank.JACK, Rank.TEN, Rank.NINE];
  
  // Rastgele kartlar seç
  const selectedCards: { suit: Suit; rank: Rank }[] = [];
  while (selectedCards.length < pairs) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    
    // Aynı kart yoksa ekle
    if (!selectedCards.some(c => c.suit === suit && c.rank === rank)) {
      selectedCards.push({ suit, rank });
    }
  }
  
  // Her kartı çiftleyip karıştır
  const cards: SpeedMatchCard[] = [];
  selectedCards.forEach((card, idx) => {
    cards.push({
      id: `card_${idx}_a`,
      suit: card.suit,
      rank: card.rank,
      isMatched: false,
      isFlipped: false,
    });
    cards.push({
      id: `card_${idx}_b`,
      suit: card.suit,
      rank: card.rank,
      isMatched: false,
      isFlipped: false,
    });
  });
  
  // Karıştır
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  // Best time
  const stored = localStorage.getItem('batakSpeedMatchBest');
  const bestTime = stored ? parseInt(stored) : null;
  
  return {
    id: `speedmatch_${Date.now()}`,
    cards,
    matchedPairs: 0,
    totalPairs: pairs,
    moves: 0,
    startTime: Date.now(),
    endTime: null,
    completed: false,
    reward: 150, // Base ödül
    bestTime,
  };
};

// Kart çevir ve eşleşme kontrolü
export const flipSpeedMatchCard = (
  game: SpeedMatch, 
  cardId: string, 
  firstFlippedId: string | null
): { game: SpeedMatch; isMatch: boolean | null; firstFlippedId: string | null } => {
  const cardIndex = game.cards.findIndex(c => c.id === cardId);
  if (cardIndex === -1 || game.cards[cardIndex].isMatched || game.cards[cardIndex].isFlipped) {
    return { game, isMatch: null, firstFlippedId };
  }
  
  // Deep copy kartları
  let updatedCards = game.cards.map(c => ({ ...c }));
  updatedCards[cardIndex] = { ...updatedCards[cardIndex], isFlipped: true };
  
  if (!firstFlippedId) {
    // İlk kart çevrildi
    return {
      game: { ...game, cards: updatedCards },
      isMatch: null,
      firstFlippedId: cardId,
    };
  }
  
  // İkinci kart çevrildi - eşleşme kontrolü
  const firstCard = updatedCards.find(c => c.id === firstFlippedId)!;
  const secondCard = updatedCards[cardIndex];
  
  const isMatch = firstCard.suit === secondCard.suit && firstCard.rank === secondCard.rank;
  
  if (isMatch) {
    // Eşleşti
    updatedCards.forEach(c => {
      if (c.id === firstFlippedId || c.id === cardId) {
        c.isMatched = true;
      }
    });
  }
  
  const matchedPairs = isMatch ? game.matchedPairs + 1 : game.matchedPairs;
  const completed = matchedPairs >= game.totalPairs;
  
  let updatedGame: SpeedMatch = {
    ...game,
    cards: updatedCards,
    matchedPairs,
    moves: game.moves + 1,
    completed,
    endTime: completed ? Date.now() : null,
  };
  
  // Ödül hesapla
  if (completed) {
    const timeTaken = (updatedGame.endTime! - updatedGame.startTime) / 1000;
    // Hızlı tamamlama bonusu
    if (timeTaken < 30) {
      updatedGame.reward = 300;
    } else if (timeTaken < 60) {
      updatedGame.reward = 200;
    } else {
      updatedGame.reward = 100;
    }
    
    // En iyi süre
    if (!updatedGame.bestTime || timeTaken < updatedGame.bestTime) {
      localStorage.setItem('batakSpeedMatchBest', String(Math.floor(timeTaken)));
    }
  }
  
  return {
    game: updatedGame,
    isMatch,
    firstFlippedId: null,
  };
};

// Eşleşmeyen kartları geri çevir
export const resetUnmatchedCards = (game: SpeedMatch): SpeedMatch => {
  const updatedCards = game.cards.map(c => ({
    ...c,
    isFlipped: c.isMatched ? true : false,
  }));
  
  return { ...game, cards: updatedCards };
};

// ============================================
// --- KOZ TAHMİNİ ---
// ============================================

export interface TrumpGuess {
  id: string;
  cards: Card[];
  correctTrump: Suit;
  played: boolean;
  correct: boolean;
  reward: number;
  expiresAt: string;
  streak: number;
}

// Koz tahmini oyunu oluştur
export const generateTrumpGuess = (): TrumpGuess => {
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
  const ranks = [Rank.ACE, Rank.KING, Rank.QUEEN, Rank.JACK, Rank.TEN, Rank.NINE, Rank.EIGHT, Rank.SEVEN];
  
  // 4 rastgele kart oluştur
  const cards: Card[] = [];
  for (let i = 0; i < 4; i++) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    cards.push({
      id: `trump_card_${i}`,
      suit,
      rank,
    });
  }
  
  // Kozu belirle (en çok tekrar eden suit veya rastgele)
  const suitCounts = suits.map(s => ({
    suit: s,
    count: cards.filter(c => c.suit === s).length,
  }));
  const maxCount = Math.max(...suitCounts.map(s => s.count));
  const possibleTrumps = suitCounts.filter(s => s.count === maxCount).map(s => s.suit);
  const correctTrump = possibleTrumps[Math.floor(Math.random() * possibleTrumps.length)];
  
  // Streak bilgisi
  const stored = localStorage.getItem('batakTrumpGuessStreak');
  const streak = stored ? parseInt(stored) : 0;
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return {
    id: `trumpguess_${Date.now()}`,
    cards,
    correctTrump,
    played: false,
    correct: false,
    reward: 75 + (streak * 25), // Streak bonusu
    expiresAt: tomorrow.toISOString(),
    streak,
  };
};

// Koz tahmini kontrol
export const checkTrumpGuess = (game: TrumpGuess, selectedSuit: Suit): TrumpGuess => {
  const correct = selectedSuit === game.correctTrump;
  
  // Streak güncelle
  const newStreak = correct ? game.streak + 1 : 0;
  localStorage.setItem('batakTrumpGuessStreak', String(newStreak));
  
  return {
    ...game,
    played: true,
    correct,
    streak: newStreak,
    reward: correct ? game.reward : 0,
  };
};

// Koz tahmini süresi doldu mu
export const isTrumpGuessExpired = (game: TrumpGuess): boolean => {
  return new Date() >= new Date(game.expiresAt);
};