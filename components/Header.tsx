import React from 'react';
import { Settings, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onToggleMenu }) => {
  return (
    <header className="h-16 md:h-24 bg-paper border-b-4 border-black flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 relative overflow-hidden">
       {/* Background Paint Splatters */}
       <div className="absolute top-0 left-20 w-32 h-32 bg-jinx-pink rounded-full blur-xl opacity-20 pointer-events-none"></div>
       <div className="absolute bottom-0 right-40 w-40 h-10 bg-jinx-blue rotate-12 blur-xl opacity-20 pointer-events-none"></div>

       {/* Left: Mobile Menu & Logo */}
       <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={onToggleMenu}
            className="md:hidden p-2 -ml-2 text-black hover:scale-110 transition-transform"
          >
            <Menu size={28} strokeWidth={3} />
          </button>

          <div className="w-10 h-10 md:w-12 md:h-12 bg-black flex items-center justify-center transform -rotate-6 shadow-[3px_3px_0_#CCFF00] md:shadow-[4px_4px_0_#CCFF00] rough-border-sm">
            <span className="text-white text-2xl md:text-3xl font-anime">X</span>
          </div>
          <div className="flex flex-col -space-y-1 md:-space-y-2">
            <h1 className="text-2xl md:text-4xl font-anime font-black text-black tracking-tighter" style={{ textShadow: '2px 2px 0 #00E5FF' }}>
              DOODLE
            </h1>
            <span className="hidden sm:block text-sm md:text-xl font-anime text-jinx-pink tracking-widest font-bold transform rotate-1 ml-1">
              NAVIGATOR
            </span>
          </div>
       </div>

       {/* Right: Actions */}
       <div className="flex items-center gap-2 md:gap-4 relative z-10">
          <button className="p-2 hover:rotate-12 transition-transform">
            <Bell size={24} md:size={28} strokeWidth={2.5} className="text-black" />
          </button>
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-2 bg-jinx-blue text-black px-3 py-1.5 md:px-6 md:py-2 font-anime font-black text-sm md:text-lg rough-border-sm hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all"
          >
            <Settings size={18} md:size={20} strokeWidth={2.5} />
            <span className="hidden sm:inline">SETUP</span>
          </button>
       </div>
    </header>
  );
};

export default Header;