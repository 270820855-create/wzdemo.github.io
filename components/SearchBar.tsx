import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SEARCH_ENGINES } from '../constants';
import { playSfx } from '../utils/audio';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeEngine, setActiveEngine] = useState(SEARCH_ENGINES[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      playSfx('click');
      window.open(`${activeEngine.url}${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 md:mb-16 relative z-20 px-2 md:px-4">
      {/* Engine Tabs as rough tape */}
      <div className="flex flex-wrap gap-1 md:gap-2 mb-2 pl-2 md:pl-4">
        {SEARCH_ENGINES.map((engine) => (
          <button
            key={engine.id}
            onClick={() => { setActiveEngine(engine); playSfx('pop'); }}
            className={`
              px-2 md:px-4 py-1 font-anime font-bold text-sm md:text-lg transition-all border-2 border-black
              ${activeEngine.id === engine.id 
                ? 'bg-jinx-pink text-white -translate-y-1 rotate-1 shadow-[2px_2px_0_#000]' 
                : 'bg-white text-gray-500 hover:bg-gray-100 -rotate-1'
              }
            `}
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
          >
            {engine.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="relative">
        <div className={`
          relative flex items-center bg-white border-[3px] border-black p-2 md:p-4
          transition-all duration-300 rough-border
          ${isFocused ? 'shadow-[4px_4px_0px_#00E5FF] md:shadow-[8px_8px_0px_#00E5FF] -translate-y-1' : 'shadow-sketch'}
          z-20
        `}>
          <div className="p-1 md:p-2 mr-2 md:mr-4 animate-wiggle">
             <Search className="text-black w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`SEARCH ON ${activeEngine.name}...`}
            className="w-full text-lg md:text-2xl font-anime font-bold bg-transparent outline-none placeholder-gray-300 text-black tracking-wider uppercase min-w-0"
          />
          
          <button 
            type="submit"
            className="
              hidden sm:block
              bg-neon-green text-black font-anime font-black text-lg md:text-xl px-4 md:px-8 py-1 md:py-2 
              border-2 border-black
              hover:bg-black hover:text-neon-green transition-all
              ml-2
              shadow-[2px_2px_0_#000]
            "
            style={{ borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px' }}
          >
            GO!
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;