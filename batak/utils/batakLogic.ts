
import { Card, Player, Suit, Rank, PlayedCard, Difficulty, GameMode, HouseRules } from '../types';

export const createDeck = (): Card[] => {
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
  const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  let deck: Card[] = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ suit, rank: rank as Rank, id: `${suit}-${rank}` });
    });
  });
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  let newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const dealCards = (deck: Card[], playerCount: number = 4): Player['hand'][] => {
  const hands: Player['hand'][] = Array(playerCount).fill(null).map(() => []);
  
  if (playerCount === 2) {
    // Tekli Batak: 2 oyuncu, her birine 26 kart
    deck.forEach((card, index) => {
      hands[index % 2].push(card);
    });
  } else if (playerCount === 3) {
    // Üçlü Batak: 3 oyuncu, 17-17-17 kart (1 kart fazla kalır, atılır)
    const cardsToDeal = deck.slice(0, 51); // 51 kart dağıt
    cardsToDeal.forEach((card, index) => {
      hands[index % 3].push(card);
    });
  } else {
    // Normal: 4 oyuncu, 13-13-13-13 kart
    deck.forEach((card, index) => {
      hands[index % 4].push(card);
    });
  }
  
  return hands.map(h => sortHand(h));
};

export const sortHand = (hand: Card[]): Card[] => {
  const suitOrder = { [Suit.SPADES]: 4, [Suit.HEARTS]: 3, [Suit.CLUBS]: 2, [Suit.DIAMONDS]: 1 };
  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[b.suit] - suitOrder[a.suit];
    return b.rank - a.rank;
  });
};

export const isValidMove = (
  card: Card, 
  hand: Card[], 
  currentTrick: PlayedCard[], 
  trumpSuit: Suit | null,
  spadesBroken: boolean,
  trickCount: number,
  rules: HouseRules
): boolean => {
  // İlk elde koz yasağı
  if (rules.ilkElKozYasak && trickCount === 0 && card.suit === trumpSuit) {
      const otherCards = hand.filter(c => c.suit !== trumpSuit);
      if (otherCards.length > 0) return false;
  }

  if (currentTrick.length === 0) {
    // Lider oyuncu - koz kırılmadan koz atılamaz
    if (trumpSuit && card.suit === trumpSuit && !spadesBroken) {
        const hasNonTrump = hand.some(c => c.suit !== trumpSuit);
        if (hasNonTrump) return false;
    }
    return true;
  }

  const leadSuit = currentTrick[0].card.suit;
  const hasLeadSuit = hand.some(c => c.suit === leadSuit);

  if (hasLeadSuit) {
    // Aynı renkten atmak zorunlu
    if (card.suit !== leadSuit) return false;
    
    // Zorunlu yükseltme kuralı
    if (rules.zorunluYukseltme) {
      const currentWinningCard = getCurrentWinningCard(currentTrick, trumpSuit);
      if (currentWinningCard && currentWinningCard.card.suit === leadSuit) {
        // Aynı renkten daha yüksek kart var mı?
        const higherCards = hand.filter(c => 
          c.suit === leadSuit && c.rank > currentWinningCard.card.rank
        );
        if (higherCards.length > 0) {
          // Daha yüksek kart varsa, bu kartın yüksek olması lazım
          return card.rank > currentWinningCard.card.rank;
        }
      }
    }
    
    return true;
  }

  if (trumpSuit) {
    const hasTrump = hand.some(c => c.suit === trumpSuit);
    if (hasTrump) {
      if (card.suit !== trumpSuit) return false;
      
      // Zorunlu yükseltme kuralı - koz için de
      if (rules.zorunluYukseltme) {
        const currentWinningCard = getCurrentWinningCard(currentTrick, trumpSuit);
        if (currentWinningCard && currentWinningCard.card.suit === trumpSuit) {
          const higherTrumps = hand.filter(c => 
            c.suit === trumpSuit && c.rank > currentWinningCard.card.rank
          );
          if (higherTrumps.length > 0) {
            return card.rank > currentWinningCard.card.rank;
          }
        }
      }
      
      return true;
    }
  }

  return true;
};

// Mevcut kazanan kartı bul
export const getCurrentWinningCard = (trick: PlayedCard[], trumpSuit: Suit | null): PlayedCard | null => {
  if (trick.length === 0) return null;
  
  let winningCard = trick[0];
  const leadSuit = winningCard.card.suit;

  for (let i = 1; i < trick.length; i++) {
    const challenger = trick[i];
    if (trumpSuit && challenger.card.suit === trumpSuit) {
      if (winningCard.card.suit !== trumpSuit || challenger.card.rank > winningCard.card.rank) {
        winningCard = challenger;
      }
    } else if (challenger.card.suit === leadSuit) {
      if (trumpSuit && winningCard.card.suit === trumpSuit) continue;
      if (challenger.card.rank > winningCard.card.rank) winningCard = challenger;
    }
  }
  return winningCard;
};

export const determineTrickWinner = (trick: PlayedCard[], trumpSuit: Suit | null): number => {
  let winningCard = trick[0];
  const leadSuit = winningCard.card.suit;

  for (let i = 1; i < trick.length; i++) {
    const challenger = trick[i];
    if (trumpSuit && challenger.card.suit === trumpSuit) {
        if (winningCard.card.suit !== trumpSuit || challenger.card.rank > winningCard.card.rank) {
            winningCard = challenger;
        }
    } else if (challenger.card.suit === leadSuit) {
        if (trumpSuit && winningCard.card.suit === trumpSuit) continue;
        if (challenger.card.rank > winningCard.card.rank) winningCard = challenger;
    }
  }
  return winningCard.playerId;
};

export const getBotMove = (
  hand: Card[], 
  currentTrick: PlayedCard[], 
  trumpSuit: Suit | null, 
  spadesBroken: boolean,
  trickCount: number,
  rules: HouseRules,
  difficulty: Difficulty = Difficulty.MEDIUM,
  currentBid?: number,
  tricksWon?: number
): Card => {
  const legalMoves = hand.filter(card => isValidMove(card, hand, currentTrick, trumpSuit, spadesBroken, trickCount, rules));
  
  // Difficulty Logic
  if (difficulty === Difficulty.EASY) {
    // Acemi: Rastgele bir kart oynar
    return legalMoves[Math.floor(Math.random() * legalMoves.length)] || hand[0];
  }
  
  if (difficulty === Difficulty.MEDIUM) {
    // Oyuncu: Elindeki en yüksek kartı oynar (klasik bot)
    legalMoves.sort((a,b) => b.rank - a.rank);
    return legalMoves[0] || hand[0];
  }

  // Usta ve üzeri için stratejik seçim
  legalMoves.sort((a,b) => {
    // Önce koz, sonra renk, sonra rank
    const suitA = trumpSuit && a.suit === trumpSuit ? 100 : (a.suit === currentTrick[0]?.card.suit ? 50 : 0);
    const suitB = trumpSuit && b.suit === trumpSuit ? 100 : (b.suit === currentTrick[0]?.card.suit ? 50 : 0);
    if (suitA !== suitB) return suitB - suitA;
    return b.rank - a.rank;
  });
  
  if (currentTrick.length === 0) {
    // Liderse
    if (difficulty === Difficulty.HARD) {
      // Usta: En büyük kartını çıkar
      return legalMoves[0];
    } else if (difficulty === Difficulty.LEGEND || difficulty === Difficulty.INVINCIBLE) {
      // Efsane/Yenilmez: Stratejik liderlik
      // Eğer hedefe yakınsa, küçük kartları sakla
      const remainingTricks = 13 - trickCount;
      const neededTricks = currentBid ? currentBid - (tricksWon || 0) : 0;
      
      if (neededTricks <= remainingTricks && neededTricks > 0) {
        // Hedefe ulaşmak için yeterli el var, küçük kartları sakla
        return legalMoves[legalMoves.length - 1];
      }
      return legalMoves[0];
    }
    return legalMoves[0];
  } else {
    // Takipçiyse
    const leadSuit = currentTrick[0].card.suit;
    const currentWinnerId = determineTrickWinner(currentTrick, trumpSuit);
    const winningCard = currentTrick.find(pt => pt.playerId === currentWinnerId)?.card;

    if (winningCard) {
      const winnerSuit = winningCard.suit;
      const winnerRank = winningCard.rank;

      const winningMoves = legalMoves.filter(m => {
        if (trumpSuit && m.suit === trumpSuit) {
          return winnerSuit !== trumpSuit || m.rank > winnerRank;
        }
        return m.suit === leadSuit && m.rank > winnerRank;
      });

      if (winningMoves.length > 0) {
        if (difficulty === Difficulty.HARD) {
          // Usta: En küçük kazananı seç
          return winningMoves[winningMoves.length - 1];
        } else if (difficulty === Difficulty.LEGEND || difficulty === Difficulty.INVINCIBLE) {
          // Efsane/Yenilmez: Daha akıllı seçim
          const remainingTricks = 13 - trickCount;
          const neededTricks = currentBid ? currentBid - (tricksWon || 0) : 0;
          
          // Eğer hedefe ulaştıysa, gereksiz yere büyük kart atma
          if (neededTricks <= 0 && remainingTricks > 0) {
            // Hedefe ulaştı, en küçük kazananı seç
            return winningMoves[winningMoves.length - 1];
          }
          
          // Hedefe ulaşmak için gerekliyse, en küçük kazananı seç
          if (neededTricks > 0 && neededTricks <= remainingTricks) {
            return winningMoves[winningMoves.length - 1];
          }
          
          // Normal durumda en küçük kazananı seç
          return winningMoves[winningMoves.length - 1];
        }
        return winningMoves[winningMoves.length - 1];
      }
    }
    
    // Kazanamıyorsa
    if (difficulty === Difficulty.LEGEND || difficulty === Difficulty.INVINCIBLE) {
      // Efsane/Yenilmez: Kazanamıyorsa en küçük değersiz kartı at
      const nonTrumpMoves = legalMoves.filter(m => m.suit !== trumpSuit && m.suit !== leadSuit);
      if (nonTrumpMoves.length > 0) {
        nonTrumpMoves.sort((a, b) => a.rank - b.rank);
        return nonTrumpMoves[0];
      }
    }
    
    // En küçük kartını at
    return legalMoves[legalMoves.length - 1];
  }
};

export const getBotQuote = (type: 'win' | 'lose' | 'bid' | 'play'): string => {
    const q = {
        win: ["Sıra bende.", "İyi eldi.", "Affetmem.", "Gelsin puanlar.", "😎", "Gördüğünüz gibi.", "Tekrar bekleriz."],
        lose: ["Tebrikler.", "Hata yaptım.", "Şanslıydın.", "🤔", "Güzel hamle.", "Bu el senin olsun.", "Şansım yok."],
        bid: ["Bu turu alacağım.", "Koz benim.", "Pas!", "Görüyorum.", "Artırıyorum!", "Eli bana bırakın.", "Zor olacak."],
        play: ["Hadi bakalım.", "Düşünelim.", "Şunu atalım.", "Sıra kimde?", "Odaklandım.", "Batak yok.", "Asıl şimdi başlıyoruz."]
    };
    const list = q[type] || q.win;
    return list[Math.floor(Math.random() * list.length)];
};

const BOT_NAMES = [
  'Kamil', 'Meliha', 'Ziya', 'Saniye', 'Cevdet', 'Refika', 'Hikmet', 'Naciye', 'Mümtaz', 'Perihan',
  'İhsan', 'Süreyya', 'Hayrettin', 'Mualla', 'Ferit', 'Leman', 'Rıza', 'Şükran', 'Nurettin', 'Vahide',
  'Galip', 'Sabiha', 'Fikret', 'Bedriye', 'Necati', 'Nebahat', 'Rasim', 'Melek', 'Halit', 'Güzin',
  'Mazhar', 'Seniha', 'Behzat', 'Emine', 'Tevfik', 'Hatice', 'Kazım', 'Fatma', 'Cemal', 'Zehra',
  'Enver', 'Ayşe', 'Sabri', 'Leyla', 'Refik', 'Münevver', 'Osman', 'Gülten', 'Adnan', 'Belkıs',
  'Kemal', 'Handan', 'Selim', 'Süheyla', 'Emin', 'Neriman', 'Kenan', 'Saadet', 'Metin', 'Türkan',
  'Turgut', 'Hülya', 'Cüneyt', 'Filiz', 'Tarık', 'Gülşen', 'Kadir', 'Müjde', 'Kartal', 'Hale',
  'Sadri', 'Itır', 'Ayhan', 'Nebahat', 'Ekrem', 'Meral', 'Erol', 'Semra', 'Fahrettin', 'Arzu',
  'Yılmaz', 'Hülya', 'Ediz', 'Fatma', 'Murat', 'Nazan', 'Zeki', 'Emel', 'Metin', 'Ajda',
  'Ceyda', 'Burak', 'Aslı', 'Mert', 'Melis', 'Can', 'Ece', 'Deniz', 'Selin', 'Kaan',
  'Elif', 'Oğuz', 'Zeynep', 'Bora', 'Irmak', 'Arda', 'Duru', 'Emre', 'Pelin', 'Kaya',
  'Suat', 'Nalan', 'Sarp', 'Seda', 'Levent', 'Arzu', 'Koray', 'Berna', 'Yavuz', 'Gonca',
  'Mete', 'Tülin', 'Okan', 'Şebnem', 'Alper', 'Nilay', 'Berkay', 'Oya', 'Serkan', 'Esra',
  'Tamer', 'Demet', 'Hakan', 'Yasemin', 'Sinan', 'Ayça', 'Gökhan', 'Ebru', 'Uğur', 'Özlem',
  'İlker', 'Tuba', 'Cenk', 'Bahar', 'Bülent', 'Mine', 'Cem', 'İpek', 'Onur', 'Gaye',
  'Faruk', 'Suna', 'Vedat', 'Pınar', 'Tekin', 'Melike', 'Orhan', 'Didem', 'Sait', 'Fulya',
  'Recep', 'Hale', 'Şaban', 'Jale', 'Ramazan', 'Lale', 'Muharrem', 'Gül', 'Bekir', 'Seda',
  'Durmuş', 'Canan', 'Saffet', 'Nevin', 'Hamdi', 'Sevinç', 'Ruşen', 'Sevgi', 'Zihni', 'Süeda'
];

export const getRandomBotName = (excludeNames: string[] = []): string => {
  const availableNames = BOT_NAMES.filter(name => !excludeNames.includes(name));
  return availableNames[Math.floor(Math.random() * availableNames.length)];
};

export const getThreeUniqueBotNames = (): string[] => {
  const results: string[] = [];
  for (let i = 0; i < 3; i++) {
    const name = getRandomBotName(results);
    results.push(name);
  }
  return results;
};

export const evaluateHand = (hand: Card[]): number => {
  let score = 0;
  hand.forEach(c => {
    if (c.rank >= Rank.JACK) score += 1;
    if (c.suit === Suit.SPADES) score += 0.5;
  });
  return Math.floor(score);
};

export const getBotBid = (
  hand: Card[],
  currentHighestBid: number,
  difficulty: Difficulty,
  playerPosition: number
): number | null => {
  const handValue = evaluateHand(hand);
  const baseBid = Math.max(4, Math.min(13, handValue + Math.floor(Math.random() * 3) - 1));
  
  // Minimum ihale: currentHighestBid + 1 (ihale her zaman artırılmalı)
  const minBid = currentHighestBid > 0 ? currentHighestBid + 1 : 4;
  
  // 13'ten fazla ihale yapılamaz
  if (minBid > 13) return null;
  
  if (difficulty === Difficulty.EASY) {
    // Acemi: Düşük ihaleler, çabuk pas
    if (minBid > baseBid) return null;
    return minBid;
  }
  
  if (difficulty === Difficulty.MEDIUM) {
    // Oyuncu: Orta seviye ihaleler
    if (minBid > baseBid + 1) return null;
    return minBid;
  }
  
  if (difficulty === Difficulty.HARD) {
    // Usta: Daha agresif
    if (minBid > baseBid + 2) return null;
    return minBid;
  }
  
  if (difficulty === Difficulty.LEGEND) {
    // Efsane: Çok agresif, blöf yapabilir
    if (minBid > baseBid + 3) return null;
    return minBid;
  }
  
  if (difficulty === Difficulty.INVINCIBLE) {
    // Yenilmez: Maksimum agresiflik
    if (minBid > baseBid + 4) return null;
    return minBid;
  }
  
  return minBid;
};

export const calculateRoundScore = (
  players: Player[],
  gameMode: GameMode,
  rules: HouseRules,
  totalTricks?: number, // Hızlı oyun için
  lastTrickWinnerId?: number // Bonus el için son eli kazanan
): { scores: number[], batakPlayers: number[], winnerId?: number } => {
  const maxTricks = totalTricks || 13;
  const scores: number[] = new Array(players.length).fill(0);
  const batakPlayers: number[] = [];
  
  // Bonus el kuralı - son eli kazanana +20 puan
  const bonusElPoints = rules.bonusEl && lastTrickWinnerId !== undefined ? 20 : 0;
  
  if (gameMode === GameMode.CAPOT) {
    // Capot: Hiç el almama hedefi (ters batak)
    let winnerId = 0;
    let minTricks = Infinity;
    
    players.forEach((player, idx) => {
      // Capot'ta en az el alan kazanır
      if (player.tricksWon === 0) {
        scores[idx] = 130; // Hiç el almadı = maksimum puan
      } else {
        scores[idx] = Math.max(0, 130 - player.tricksWon * 10);
      }
      
      if (player.tricksWon < minTricks) {
        minTricks = player.tricksWon;
        winnerId = idx;
      }
    });
    
    return { scores, batakPlayers, winnerId };
  }
  
  if (gameMode === GameMode.YERE_BATAK || gameMode === GameMode.ACIK_KOZ) {
    // Yere Batak ve Açık Koz: İhalesiz gibi çalışır, en çok el alan kazanır
    let winnerId = 0;
    let maxTricksWon = 0;
    
    players.forEach((player, idx) => {
      let score = player.tricksWon * 10;
      
      // Bonus el
      if (rules.bonusEl && lastTrickWinnerId === idx) {
        score += bonusElPoints;
      }
      
      scores[idx] = score;
      if (player.tricksWon > maxTricksWon) {
        maxTricksWon = player.tricksWon;
        winnerId = idx;
      }
    });
    
    return { scores, batakPlayers, winnerId };
  }
  
  if (gameMode === GameMode.KUMANDA) {
    // Kumanda Batak: Turnuva formatı - ihaleli gibi ama daha sert kurallar
    let winnerId = 0;
    let maxScore = -Infinity;
    
    players.forEach((player, idx) => {
      if (player.currentBid === 0) {
        scores[idx] = -50; // Kumanda'da pas geçmek cezalı
        return;
      }
      
      if (player.tricksWon < player.currentBid) {
        // Batak - Kumanda'da 2x ceza
        let penalty = -player.currentBid * 20;
        scores[idx] = Math.floor(penalty);
        batakPlayers.push(idx);
      } else {
        // Başarılı
        let score = player.currentBid * 10;
        // Fazla el bonusu
        const extraTricks = player.tricksWon - player.currentBid;
        score += extraTricks * 5;
        
        // Bonus el
        if (rules.bonusEl && lastTrickWinnerId === idx) {
          score += bonusElPoints;
        }
        
        scores[idx] = score;
      }
      
      if (scores[idx] > maxScore) {
        maxScore = scores[idx];
        winnerId = idx;
      }
    });
    
    return { scores, batakPlayers, winnerId };
  }
  
  if (gameMode === GameMode.ESLI) {
    // Eşli Batak: Takım 0-2 vs 1-3
    const team0Score = players[0].tricksWon + players[2].tricksWon;
    const team1Score = players[1].tricksWon + players[3].tricksWon;
    const team0Bid = players[0].currentBid + players[2].currentBid;
    const team1Bid = players[1].currentBid + players[3].currentBid;
    
    // Takım 0-2
    if (team0Score < team0Bid) {
      // Batak
      scores[0] = -team0Bid * 10;
      scores[2] = -team0Bid * 10;
      batakPlayers.push(0, 2);
    } else {
      scores[0] = team0Bid * 10;
      scores[2] = team0Bid * 10;
    }
    
    // Takım 1-3
    if (team1Score < team1Bid) {
      // Batak
      scores[1] = -team1Bid * 10;
      scores[3] = -team1Bid * 10;
      batakPlayers.push(1, 3);
    } else {
      scores[1] = team1Bid * 10;
      scores[3] = team1Bid * 10;
    }
    
    // Kazanan takım
    const winnerId = scores[0] + scores[2] > scores[1] + scores[3] ? 0 : 1;
    return { scores, batakPlayers, winnerId };
  } else if (gameMode === GameMode.IHALESIZ) {
    // İhalesiz Batak: En çok el alan kazanır, koz ilk eli kazanan seçer
    // Skorlama: Her el = 10 puan, en çok puan kazanır
    let winnerId = 0;
    let maxTricks = 0;
    
    players.forEach((player, idx) => {
      scores[idx] = player.tricksWon * 10; // Her el 10 puan
      if (player.tricksWon > maxTricks) {
        maxTricks = player.tricksWon;
        winnerId = idx;
      }
    });
    
    return { scores, batakPlayers, winnerId };
  } else if (gameMode === GameMode.TEKLI) {
    // Tekli Batak (1v1): 2 oyuncu
    const player0 = players[0];
    const player1 = players[1];
    
    if (player0.currentBid === 0 || player1.currentBid === 0) {
      // Pas geçildi, en çok el alan kazanır
      if (player0.tricksWon > player1.tricksWon) {
        scores[0] = player0.tricksWon * 10;
        scores[1] = 0;
        return { scores, batakPlayers, winnerId: 0 };
      } else if (player1.tricksWon > player0.tricksWon) {
        scores[0] = 0;
        scores[1] = player1.tricksWon * 10;
        return { scores, batakPlayers, winnerId: 1 };
      } else {
        return { scores: [0, 0], batakPlayers, winnerId: 0 }; // Berabere
      }
    }
    
    // Normal skorlama
    if (player0.tricksWon < player0.currentBid) {
      scores[0] = -player0.currentBid * 10;
      batakPlayers.push(0);
    } else {
      scores[0] = player0.currentBid * 10;
    }
    
    if (player1.tricksWon < player1.currentBid) {
      scores[1] = -player1.currentBid * 10;
      batakPlayers.push(1);
    } else {
      scores[1] = player1.currentBid * 10;
    }
    
    const winnerId = scores[0] > scores[1] ? 0 : 1;
    return { scores, batakPlayers, winnerId };
  } else if (gameMode === GameMode.UCLU) {
    // Üçlü Batak: 3 oyuncu
    let winnerId = 0;
    let maxScore = -Infinity;
    
    players.forEach((player, idx) => {
      if (player.currentBid === 0) {
        scores[idx] = 0;
        return;
      }
      
      if (player.tricksWon < player.currentBid) {
        if (rules.batakZorunlulugu) {
          let penalty = -player.currentBid * 10;
          
          // Yanlış sayma cezası
          if (rules.yanlisSaymaCezasi) {
            const missedBy = player.currentBid - player.tricksWon;
            penalty -= missedBy * 5;
          }
          
          if (rules.onikiBatar && player.currentBid === 12 && player.tricksWon === 0) {
            penalty = -120;
          }
          if (rules.macaCezasi && player.tricksWon === 0) {
            penalty *= 1.5;
          }
          scores[idx] = Math.floor(penalty);
          batakPlayers.push(idx);
        } else {
          scores[idx] = player.tricksWon * 5;
        }
      } else {
        scores[idx] = player.currentBid * 10;
      }
      
      if (scores[idx] > maxScore) {
        maxScore = scores[idx];
        winnerId = idx;
      }
    });
    
    return { scores, batakPlayers, winnerId };
  } else if (gameMode === GameMode.HIZLI) {
    // Hızlı Oyun: 6 el, en çok el alan kazanır
    let winnerId = 0;
    let maxTricks = 0;
    
    players.forEach((player, idx) => {
      scores[idx] = player.tricksWon * 10; // Her el 10 puan
      if (player.tricksWon > maxTricks) {
        maxTricks = player.tricksWon;
        winnerId = idx;
      }
    });
    
    return { scores, batakPlayers, winnerId };
  } else {
    // Normal modlar (İhaleli, Koz Maça): Her oyuncu kendi başına
    let winnerId = 0;
    let maxScore = -Infinity;
    
    players.forEach((player, idx) => {
      if (player.currentBid === 0) {
        // Pas geçti, skor yok
        scores[idx] = 0;
        return;
      }
      
      if (player.tricksWon < player.currentBid) {
        // Batak
        if (rules.batakZorunlulugu) {
          // Batak zorunlu - tam ceza uygulanır
          let penalty = -player.currentBid * 10;
          
          // Yanlış sayma cezası - ihaleyi ne kadar kaçırdıysan ekstra ceza
          if (rules.yanlisSaymaCezasi) {
            const missedBy = player.currentBid - player.tricksWon;
            penalty -= missedBy * 5; // Her kaçırılan el için -5 ekstra
          }
          
          if (rules.onikiBatar && player.currentBid === 12 && player.tricksWon === 0) {
            penalty = -120; // 12 batak özel ceza
          }
          
          if (rules.macaCezasi && player.tricksWon === 0) {
            penalty *= 1.5; // Maça cezası
          }
          
          scores[idx] = Math.floor(penalty);
          batakPlayers.push(idx);
        } else {
          // Batak zorunlu değil - sadece aldığı elin puanı (pozitif olabilir)
          scores[idx] = player.tricksWon * 5; // Her el için 5 puan
        }
      } else {
        // Başarılı - ihaleyi tutturdu
        let score = player.currentBid * 10;
        
        // Yanlış sayma cezası aktifse, fazla el alınca bonus yok (sadece ihale puanı)
        // Değilse normal puan
        if (!rules.yanlisSaymaCezasi) {
          // Fazla el bonusu (opsiyonel - bazı varyantlarda var)
          // const extraTricks = player.tricksWon - player.currentBid;
          // score += extraTricks * 2;
        }
        
        scores[idx] = score;
      }
      
      if (scores[idx] > maxScore) {
        maxScore = scores[idx];
        winnerId = idx;
      }
    });
    
    return { scores, batakPlayers, winnerId };
  }
};

export const sortHandWithTrump = (hand: Card[], trumpSuit: Suit | null): Card[] => {
  const suitOrder = trumpSuit 
    ? { [trumpSuit]: 5, [Suit.SPADES]: 4, [Suit.HEARTS]: 3, [Suit.CLUBS]: 2, [Suit.DIAMONDS]: 1 }
    : { [Suit.SPADES]: 4, [Suit.HEARTS]: 3, [Suit.CLUBS]: 2, [Suit.DIAMONDS]: 1 };
  
  return [...hand].sort((a, b) => {
    const suitA = suitOrder[a.suit] || 0;
    const suitB = suitOrder[b.suit] || 0;
    if (suitA !== suitB) return suitB - suitA;
    return b.rank - a.rank;
  });
};
