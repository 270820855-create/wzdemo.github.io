import React, { useRef, useState } from 'react';
import { X, Download, Upload, RotateCcw, CheckCircle2, Scaling } from 'lucide-react';
import { NavLink } from '../types';
import { playSfx } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  onImport: (links: NavLink[]) => void;
  onReset: () => void;
  petScale: number;
  onScaleChange: (scale: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  links, 
  onImport, 
  onReset,
  petScale,
  onScaleChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-jinx-pink/30 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rough-border w-full max-w-2xl shadow-sketch-hover relative p-8">
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <h2 className="font-anime text-4xl text-black font-black">SYSTEM_CONFIG</h2>
          <button onClick={() => { onClose(); playSfx('click'); }} className="bg-black text-white p-2 hover:bg-jinx-blue transition-colors"><X size={28} /></button>
        </div>
        
        <div className="space-y-6 font-anime">
            {/* Pet Scale Control */}
            <div className="border-[3px] border-black p-4 bg-scribble relative mt-2">
               <div className="absolute -top-3 left-4 bg-neon-green border-2 border-black px-2 text-sm font-bold rotate-1 shadow-[2px_2px_0_#000]">
                 人物模型大小 (PET SIZE)
               </div>
               <div className="flex items-center gap-4 mt-4">
                 <Scaling size={28} strokeWidth={2.5} />
                 <input 
                    type="range" 
                    min="0.3" 
                    max="2.0" 
                    step="0.1"
                    value={petScale}
                    onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                    className="w-full h-4 bg-gray-200 rounded-lg cursor-pointer border-2 border-black accent-jinx-pink"
                 />
                 <span className="font-bold text-2xl min-w-[3ch] text-right">{petScale.toFixed(1)}x</span>
               </div>
            </div>

            <div className="grid gap-6 pt-2">
                <button 
                    onClick={() => playSfx('pop')}
                    className="p-4 border-[3px] border-black bg-paper hover:bg-jinx-blue hover:text-white transition-all text-2xl font-bold flex items-center justify-center gap-4 shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none"
                >
                    <Download /> EXPORT DATA
                </button>
                <button 
                    onClick={() => playSfx('pop')}
                    className="p-4 border-[3px] border-black bg-paper hover:bg-neon-green hover:text-black transition-all text-2xl font-bold flex items-center justify-center gap-4 shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none"
                >
                    <Upload /> IMPORT DATA
                </button>
                <button onClick={onReset} className="p-4 border-[3px] border-black bg-red-500 text-white hover:bg-black transition-all text-2xl font-bold flex items-center justify-center gap-4 shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none">
                    <RotateCcw /> RESET SYSTEM
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;