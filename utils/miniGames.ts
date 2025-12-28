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

