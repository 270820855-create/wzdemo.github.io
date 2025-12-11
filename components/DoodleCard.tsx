import React from 'react';
import { NavLink } from '../types';
import { Trash2, ExternalLink } from 'lucide-react';
import { playSfx } from '../utils/audio';

interface DoodleCardProps {
  link: NavLink;
  onDelete: (id: string) => void;
  index: number;
}

const DoodleCard: React.FC<DoodleCardProps> = ({ link, onDelete, index }) => {
  // Random rotation for that messy look
  const rotation = React.useMemo(() => Math.floor(Math.random() * 6) - 3, []);

  const handleCardClick = () => {
    playSfx('click');
    window.open(link.url, '_blank');
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`
        relative group rough-border bg-white p-4
        transition-all duration-200 ease-out transform
        hover:-translate-y-1 hover:scale-105 hover:shadow-sketch-hover shadow-sketch
        flex flex-col justify-between min-h-[160px]
        overflow-visible z-10 hover:z-20 cursor-pointer
      `}
      style={{ 
        // Use CSS variable for rotation so it composes with hover transforms (like scale)
        '--tw-rotate': `${rotation}deg` 
      } as React.CSSProperties}
    >
      {/* Messy Background Scribbles */}
      <div className="absolute inset-0 opacity-10 bg-scribble pointer-events-none"></div>
      
      {/* Tape/Tag */}
      <div className="absolute -top-3 -right-2 transform rotate-3 z-20">
         <span className={`text-xs font-black px-3 py-1 bg-black text-white rough-border-sm`}>
           {link.category}
         </span>
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div className={`
          w-14 h-14 flex items-center justify-center text-3xl
          ${link.color} text-black border-2 border-black
          shadow-[3px_3px_0px_#000] rounded-full
          group-hover:animate-sketch-shake
        `}>
          {link.icon}
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(link.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-black hover:text-jinx-pink transform hover:scale-125"
        >
          <Trash2 size={20} strokeWidth={3} />
        </button>
      </div>
      
      <div className="relative z-10 mt-4">
        <h3 className="font-anime text-xl mb-2 text-black leading-tight break-all border-b-2 border-black/10 pb-1">
          {link.title}
        </h3>
        {/* Anchor tag remains for accessibility and right-click options, but click is handled by parent too */}
        <a 
          href={link.url} 
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
             e.stopPropagation();
             playSfx('click');
          }}
          className="
            inline-flex items-center gap-1 px-2 py-0.5
            text-black font-black text-sm uppercase tracking-widest
            hover:text-jinx-blue hover:underline decoration-wavy decoration-2
          "
        >
          LINK <ExternalLink size={12} strokeWidth={3} />
        </a>
      </div>

      {/* Rough Number Stamping */}
      <div className="absolute -bottom-2 -right-2 text-6xl font-black text-black/5 pointer-events-none select-none -rotate-12 font-sans">
        {index + 1}
      </div>
    </div>
  );
};

export default DoodleCard;