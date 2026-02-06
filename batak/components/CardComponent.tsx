
import React from 'react';
import { Card, Suit, Rank, CardBack } from '../types';

interface CardProps {
  card: Card;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  playable?: boolean;
  hidden?: boolean;
  small?: boolean;
  cardBack?: CardBack;
}

const getSuitColor = (suit: Suit) => {
  return suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'text-rose-600' : 'text-slate-900';
};

const getRankSymbol = (rank: Rank) => {
  switch (rank) {
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    case 14: return 'A';
    default: return rank.toString();
  }
};

export const CardComponent: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  className = '', 
  style = {},
  playable = false, 
  hidden = false, 
  small = false,
  cardBack = 'green'
}) => {
  // Sizing constants
  const widthClass = small ? 'w-16 h-24 sm:w-20 sm:h-28' : 'w-24 h-36 sm:w-28 sm:h-40';
  
  // Font sizing
  const rankSize = small ? 'text-lg font-bold' : 'text-3xl font-black tracking-tighter';
  const suitSizeCorner = small ? 'text-[10px]' : 'text-base';
  const centerSize = small ? 'text-3xl' : 'text-6xl';

  if (hidden) {
    let backColorClass = 'bg-emerald-800 border-emerald-600';
    // Inline SVG pattern - external URL yerine lokal pattern kullan
    let pattern = "bg-[url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 8L8 0L16 8L8 16z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E\")]";

    switch(cardBack) {
        case 'red': backColorClass = 'bg-rose-800 border-rose-600'; break;
        case 'black': backColorClass = 'bg-slate-900 border-slate-700'; break;
        case 'gold': backColorClass = 'bg-yellow-600 border-yellow-400'; break;
        default: backColorClass = 'bg-emerald-800 border-emerald-600';
    }

    return (
      <div 
        className={`${widthClass} ${backColorClass} rounded-2xl shadow-xl border-[2px] border-white/20 flex items-center justify-center ${className} overflow-hidden`}
        style={style}
      >
        <div className={`w-full h-full rounded opacity-30 ${pattern} bg-repeat`}></div>
      </div>
    );
  }

  return (
    <div 
      onClick={playable ? onClick : undefined}
      style={style}
      className={`
        relative ${widthClass} bg-white rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.4)] 
        border-[1px] border-slate-200
        select-none
        transition-all duration-300
        ${playable ? 'cursor-pointer hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]' : ''}
        ${className}
      `}
    >
      {/* 3D Depth Effect Edge */}
      <div className="absolute inset-0 rounded-2xl border-b-4 border-slate-100 opacity-50 pointer-events-none"></div>

      {/* Top Left Corner */}
      <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
          <span className={`${rankSize} ${getSuitColor(card.suit)}`}>
            {getRankSymbol(card.rank)}
          </span>
          <span className={`${suitSizeCorner} ${getSuitColor(card.suit)} font-black`}>
            {card.suit}
          </span>
      </div>
      
      {/* Center Suit */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${centerSize} ${getSuitColor(card.suit)} opacity-80 group-hover:scale-110 transition-transform`}>
        {card.suit}
      </div>

      {/* Bottom Right Corner */}
      <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180">
          <span className={`${rankSize} ${getSuitColor(card.suit)}`}>
            {getRankSymbol(card.rank)}
          </span>
          <span className={`${suitSizeCorner} ${getSuitColor(card.suit)} font-black`}>
            {card.suit}
          </span>
      </div>
      
      {/* Fine-tuned Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none rounded-2xl"></div>
    </div>
  );
};
