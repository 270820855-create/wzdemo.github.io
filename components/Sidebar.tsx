import React from 'react';
import { CATEGORIES, PET_SKINS, BUILT_IN_GAMES } from '../constants';
import { Category, PetSkinId, GameId } from '../types';
import { Smile, Gamepad2, X } from 'lucide-react';

interface SidebarProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  currentPetId: PetSkinId;
  onSelectPet: (id: PetSkinId) => void;
  onOpenGame: (id: GameId) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategory, 
  onSelectCategory,
  currentPetId,
  onSelectPet,
  onOpenGame,
  onClose
}) => {
  return (
    <aside className="w-full h-full flex flex-col p-4 border-r-4 border-black bg-paper relative overflow-y-auto">
      {/* Background noise */}
      <div className="absolute inset-0 bg-scribble opacity-20 pointer-events-none"></div>

      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="md:hidden absolute top-2 right-2 p-2 bg-black text-white rounded-full hover:rotate-90 transition-transform z-50 shadow-[2px_2px_0_#CCFF00]"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="mb-6 md:mb-8 px-2 relative z-10 transform -rotate-1 mt-2 md:mt-0">
        <h2 className="font-anime text-4xl text-black drop-shadow-[2px_2px_0_#FF0055]">
          MENU
        </h2>
        <div className="h-2 bg-black w-24 mt-1 rough-border-sm bg-jinx-blue"></div>
      </div>
      
      <nav className="space-y-3 mb-8 relative z-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`
              w-full text-left px-4 py-2 font-anime text-xl transition-all duration-100
              flex items-center gap-3 border-2
              ${activeCategory === cat.id 
                ? 'bg-black text-white rough-border shadow-[4px_4px_0px_#CCFF00] -translate-y-1 rotate-1' 
                : 'bg-transparent text-black border-transparent hover:border-black hover:bg-white/50'
              }
            `}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="font-bold tracking-widest">{cat.label}</span>
          </button>
        ))}
      </nav>

      {/* Arcade */}
      <div className="mb-6 relative z-10">
         <div className="flex items-center gap-2 mb-4 px-2 text-black">
           <Gamepad2 size={24} strokeWidth={2.5} />
           <h3 className="font-anime text-2xl font-black">ARCADE</h3>
         </div>
         <div className="space-y-3">
            {BUILT_IN_GAMES.map(game => (
              <button
                key={game.id}
                onClick={() => onOpenGame(game.id)}
                className={`
                  w-full relative overflow-visible
                  ${game.color} border-2 border-black p-3
                  text-left transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_#000]
                  rough-border-sm
                `}
              >
                 <div className="flex justify-between items-center relative z-10">
                    <span className="text-2xl">{game.icon}</span>
                    <span className="font-anime font-black text-black text-lg">{game.name}</span>
                 </div>
              </button>
            ))}
         </div>
      </div>

      {/* Pet Switch */}
      <div className="mt-auto pt-6 border-t-4 border-black border-dashed relative z-10">
        <div className="flex items-center gap-2 mb-4 text-black">
          <Smile size={24} strokeWidth={2.5} />
          <h3 className="font-anime text-2xl font-black">PARTNER</h3>
        </div>
        
        <div className="flex gap-3 justify-center flex-wrap">
          {PET_SKINS.map((skin) => (
            <button
              key={skin.id}
              onClick={() => onSelectPet(skin.id)}
              className={`
                w-12 h-12 rounded-full border-2 border-black transition-all overflow-hidden
                ${currentPetId === skin.id 
                  ? 'ring-4 ring-jinx-pink ring-offset-2 scale-110' 
                  : 'hover:scale-110 opacity-80 hover:opacity-100'
                }
              `}
              style={{ backgroundColor: skin.avatarColor }}
              title={skin.name}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;