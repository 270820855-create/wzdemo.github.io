import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Pet from './components/Pet';
import SearchBar from './components/SearchBar';
import DoodleCard from './components/DoodleCard';
import AddLinkModal from './components/AddLinkModal';
import SettingsModal from './components/SettingsModal';
import GameCenterModal from './components/GameCenterModal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { NavLink, PetMood, Category, PetSkinId, GameId } from './types';
import { DEFAULT_LINKS } from './constants';
import { playSfx } from './utils/audio';

const App: React.FC = () => {
  const [links, setLinks] = useState<NavLink[]>(() => {
    const saved = localStorage.getItem('doodle-links');
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const [petMood, setPetMood] = useState<PetMood>(PetMood.IDLE);
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [currentPetId, setCurrentPetId] = useState<PetSkinId>('girl-white');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);

  // New State for Pet Scale
  const [petScale, setPetScale] = useState<number>(() => {
    const saved = localStorage.getItem('doodle-pet-scale');
    // Default smaller scale for mobile if not set
    const defaultScale = window.innerWidth < 768 ? 0.6 : 1.0;
    return saved ? parseFloat(saved) : defaultScale;
  });

  useEffect(() => {
    localStorage.setItem('doodle-links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('doodle-pet-scale', petScale.toString());
  }, [petScale]);

  const handleAddLink = (newLink: Omit<NavLink, 'id'>) => {
    playSfx('success');
    const link: NavLink = { ...newLink, id: Date.now().toString() };
    setLinks([...links, link]);
    setPetMood(PetMood.HAPPY); 
  };

  const handleDeleteLink = (id: string) => {
    playSfx('delete');
    setLinks(links.filter(l => l.id !== id));
    setPetMood(PetMood.SURPRISED);
  };

  const filteredLinks = activeCategory === 'ALL' ? links : links.filter(link => link.category === activeCategory);

  return (
    <div className="h-[100dvh] flex flex-col font-anime text-gray-800 bg-transparent overflow-hidden">
      <Header 
        onOpenSettings={() => { setIsSettingsOpen(true); playSfx('open'); }} 
        onToggleMenu={() => { setIsMobileMenuOpen(true); playSfx('scribble'); }}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Responsive Wrapper */}
        <div className={`
            fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-out
            md:relative md:translate-x-0 md:z-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            activeCategory={activeCategory} 
            onSelectCategory={(c) => { setActiveCategory(c); playSfx('click'); setIsMobileMenuOpen(false); }}
            currentPetId={currentPetId}
            onSelectPet={(id) => { setCurrentPetId(id); playSfx('pop'); }}
            onOpenGame={(id) => { setActiveGameId(id); playSfx('open'); setIsMobileMenuOpen(false); }}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        <main className="flex-1 overflow-y-auto relative p-4 md:p-8 scroll-smooth w-full">
           <div className="mt-4 md:mt-8">
             <SearchBar />
           </div>

           <div className="max-w-6xl mx-auto pb-40 px-2 md:px-4">
             <div className="mb-8 border-b-4 border-black pb-2 flex items-end justify-between transform rotate-1">
                <h3 className="text-3xl md:text-5xl font-black text-black break-words" style={{ textShadow: '4px 4px 0 #CCFF00' }}>
                  {activeCategory === 'ALL' ? 'DASHBOARD' : activeCategory}
                </h3>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
               {filteredLinks.map((link, index) => (
                 <DoodleCard 
                   key={link.id} 
                   link={link} 
                   onDelete={handleDeleteLink}
                   index={index}
                 />
               ))}

               <button 
                 onClick={() => { setIsModalOpen(true); playSfx('scribble'); }}
                 className="
                   min-h-[160px] rough-border border-dashed border-4 border-gray-400 
                   bg-transparent hover:bg-white hover:border-black hover:border-solid
                   flex flex-col items-center justify-center 
                   text-gray-400 hover:text-jinx-pink transition-all
                   group
                 "
               >
                 <Plus size={48} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                 <span className="text-2xl font-bold mt-2">ADD NEW</span>
               </button>
             </div>
           </div>
        </main>
      </div>

      <Pet 
        mood={petMood} 
        setMood={setPetMood} 
        skinId={currentPetId} 
        scale={petScale} 
      />

      <AddLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddLink} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        links={links} 
        onImport={(l) => { setLinks(l); playSfx('success'); }}
        onReset={() => { setLinks(DEFAULT_LINKS); playSfx('delete'); }}
        petScale={petScale}
        onScaleChange={setPetScale}
      />
      <GameCenterModal gameId={activeGameId} onClose={() => setActiveGameId(null)} />
    </div>
  );
};

export default App;