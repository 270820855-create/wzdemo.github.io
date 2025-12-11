
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameId, BuiltInGame } from '../types';
import { BUILT_IN_GAMES } from '../constants';
import { X, RotateCcw, Trash2, MousePointer2, Move, ZoomIn, ZoomOut, Grid3X3 } from 'lucide-react';
import { playSfx } from '../utils/audio';

interface GameCenterModalProps {
  gameId: GameId | null;
  onClose: () => void;
}

// --- Nano Builder Constants ---
const CUBE_SIZE = 32; 
const GRID_SIZE = 20; // 20x20 Baseplate for more room

// Image Colors with Pre-calculated Shading
const PALETTE = [
  { id: 'red', color: '#E11D48', top: '#F43F5E', side: '#BE123C' },     // Red
  { id: 'yellow', color: '#FACC15', top: '#FDE047', side: '#EAB308' },  // Gold
  { id: 'black', color: '#171717', top: '#262626', side: '#000000' },   // Black
  { id: 'white', color: '#E5E7EB', top: '#F3F4F6', side: '#D1D5DB' },   // White
  { id: 'skin', color: '#FDBA74', top: '#FED7AA', side: '#FB923C' },    // Skin/Cream
  { id: 'brown', color: '#78350F', top: '#92400E', side: '#451A03' },   // Brown
  { id: 'pink', color: '#F472B6', top: '#FBCFE8', side: '#DB2777' },    // Pink
  { id: 'blue', color: '#3B82F6', top: '#60A5FA', side: '#2563EB' },    // Blue
];

interface BlockData {
  colorIndex: number;
}

type BlockMap = Record<string, BlockData>;

// --- Sub-Component: The Cube (Memoized for Performance) ---
// Only re-renders if its own props change, not when camera moves.
const Cube = React.memo(({ x, y, z, colorIndex, onClick }: { 
    x: number, y: number, z: number, colorIndex: number, 
    onClick: (e: React.MouseEvent | React.TouchEvent, bx: number, by: number, bz: number, face: string) => void 
}) => {
  const p = PALETTE[colorIndex];
  
  const faceStyle = (tr: string, bg: string, isTop: boolean = false) => ({
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backgroundColor: bg,
    transform: tr,
    border: '1px solid rgba(0,0,0,0.15)',
    boxSizing: 'border-box' as const,
    cursor: 'pointer',
  });

  const handleFaceClick = (e: React.MouseEvent | React.TouchEvent, face: string) => {
      e.stopPropagation(); // Stop event from hitting other blocks behind
      onClick(e, x, y, z, face);
  };

  return (
    <div 
        style={{
            position: 'absolute',
            width: CUBE_SIZE,
            height: CUBE_SIZE,
            transform: `translate3d(${x * CUBE_SIZE}px, ${-y * CUBE_SIZE}px, ${z * CUBE_SIZE}px)`,
            transformStyle: 'preserve-3d',
        }}
    >
      {/* Front */}
      <div onClick={(e) => handleFaceClick(e, 'front')} style={faceStyle(`rotateY(0deg) translateZ(${CUBE_SIZE/2}px)`, p.color)} />
      {/* Back */}
      <div onClick={(e) => handleFaceClick(e, 'back')} style={faceStyle(`rotateY(180deg) translateZ(${CUBE_SIZE/2}px)`, p.side)} />
      {/* Right */}
      <div onClick={(e) => handleFaceClick(e, 'right')} style={faceStyle(`rotateY(90deg) translateZ(${CUBE_SIZE/2}px)`, p.side)} />
      {/* Left */}
      <div onClick={(e) => handleFaceClick(e, 'left')} style={faceStyle(`rotateY(-90deg) translateZ(${CUBE_SIZE/2}px)`, p.side)} />
      {/* Top (With Stud) */}
      <div onClick={(e) => handleFaceClick(e, 'top')} style={faceStyle(`rotateX(90deg) translateZ(${CUBE_SIZE/2}px)`, p.top, true)}>
        <div style={{
            position: 'absolute',
            top: '15%', left: '15%', width: '70%', height: '70%',
            backgroundColor: p.top,
            borderRadius: '50%',
            transform: 'translateZ(4px)',
            boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.15)',
            border: `1px solid ${p.color}`,
            pointerEvents: 'none', // Ensure click goes to face
        }} />
      </div>
      {/* Bottom */}
      <div onClick={(e) => handleFaceClick(e, 'bottom')} style={faceStyle(`rotateX(-90deg) translateZ(${CUBE_SIZE/2}px)`, p.side)} />
    </div>
  );
}, (prev, next) => prev.colorIndex === next.colorIndex && prev.x === next.x && prev.y === next.y && prev.z === next.z);


const NanoBuilder: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockMap>({});
  const [selectedColorIdx, setSelectedColorIdx] = useState(0); 
  const [tool, setTool] = useState<'build' | 'delete'>('build');
  
  // Refs to hold latest state for callbacks (fixing stale closures in Memoized components)
  const blocksRef = useRef(blocks);
  const toolRef = useRef(tool);
  const colorRef = useRef(selectedColorIdx);

  // Sync refs
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { colorRef.current = selectedColorIdx; }, [selectedColorIdx]);

  // Camera Refs
  const sceneRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const camera = useRef({ rotX: -30, rotY: 45, zoom: 0.8 }); // Lower default zoom for mobile

  // --- Initial Model ---
  useEffect(() => {
    const newMap: BlockMap = {};
    const add = (x: number, y: number, z: number, cIdx: number) => {
        newMap[`${x},${y},${z}`] = { colorIndex: cIdx };
    };

    // Constructing the "Mouse/Bear" Head
    // Base Red
    for(let x=-2; x<=2; x++) for(let z=-2; z<=2; z++) add(x, 0, z, 0); 
    
    // Head Brown
    for(let y=1; y<=4; y++) {
        for(let x=-3; x<=3; x++) {
            for(let z=-2; z<=2; z++) {
                if(Math.abs(x)===3 && Math.abs(z)===2) continue; 
                add(x, y, z, 5); 
            }
        }
    }

    // Face Cream
    for(let x=-2; x<=2; x++) {
        add(x, 2, 2, 4); 
        add(x, 3, 2, 4); 
    }
    
    // Eyes & Nose
    add(-1, 3, 3, 2); 
    add(1, 3, 3, 2); 
    add(0, 2, 3, 2); 

    // Ears
    add(-4, 5, 0, 5); 
    add(-4, 5, 1, 6); 
    add(4, 5, 0, 5);  
    add(4, 5, 1, 6);  
    
    // Hat
    for(let x=-2; x<=2; x++) for(let z=-2; z<=1; z++) add(x, 5, z, 0); 
    add(0, 6, -1, 1); 

    setBlocks(newMap);
    updateCameraTransform();
  }, []);

  const updateCameraTransform = () => {
    if (sceneRef.current) {
        const { rotX, rotY, zoom } = camera.current;
        sceneRef.current.style.transform = `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }
  };

  // --- Mouse Controls ---
  const handleMouseDown = (e: React.MouseEvent) => {
     if (e.button === 0 && !e.altKey) { 
         isDragging.current = true;
         lastMouse.current = { x: e.clientX, y: e.clientY };
     }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        rotateCamera(dx, dy);
    }
  };

  // --- Touch Controls ---
  const handleTouchStart = (e: React.TouchEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      // Prevent default to stop scrolling while building/rotating
      // e.preventDefault(); // Note: Can't preventDefault on passive listener easily in React without ref workaround, assume layout handles no-scroll
      if (isDragging.current) {
        const dx = e.touches[0].clientX - lastMouse.current.x;
        const dy = e.touches[0].clientY - lastMouse.current.y;
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        rotateCamera(dx, dy);
      }
  };

  const rotateCamera = (dx: number, dy: number) => {
      camera.current.rotY += dx * 0.5;
      camera.current.rotX -= dy * 0.5;
      camera.current.rotX = Math.max(-90, Math.min(0, camera.current.rotX));
      requestAnimationFrame(updateCameraTransform);
  };

  const handlePointerUp = () => {
      isDragging.current = false;
  };

  const zoom = (delta: number) => {
      camera.current.zoom = Math.max(0.3, Math.min(3, camera.current.zoom + delta));
      requestAnimationFrame(updateCameraTransform);
  };

  const handleWheel = (e: React.WheelEvent) => {
      const delta = -Math.sign(e.deltaY) * 0.1;
      zoom(delta);
  };

  // --- Building Logic ---
  const handleBlockClick = useCallback((e: React.MouseEvent | React.TouchEvent, bx: number, by: number, bz: number, face: string) => {
      // If it's a mouse event and alt is pressed, or if tool is delete
      const isAlt = (e as React.MouseEvent).altKey;
      const currentTool = toolRef.current;
      const currentBlocks = blocksRef.current;
      const currentColor = colorRef.current;

      if (currentTool === 'delete' || isAlt) {
          playSfx('delete');
          setBlocks(prev => {
              const next = { ...prev };
              delete next[`${bx},${by},${bz}`];
              return next;
          });
          return;
      }

      // Calculate neighbor coord
      let nx = bx, ny = by, nz = bz;
      if (face === 'top') ny++;
      if (face === 'bottom') ny--;
      if (face === 'left') nx--;
      if (face === 'right') nx++;
      if (face === 'front') nz++;
      if (face === 'back') nz--;

      const key = `${nx},${ny},${nz}`;
      if (!currentBlocks[key]) {
          playSfx('click');
          setBlocks(prev => ({
              ...prev,
              [key]: { colorIndex: currentColor }
          }));
      }
  }, []); 

  const handleBasePlateClick = (x: number, z: number) => {
      if (toolRef.current === 'delete') return;
      
      const key = `${x},0,${z}`;
      if (!blocksRef.current[key]) {
        playSfx('click');
        setBlocks(prev => ({
            ...prev,
            [key]: { colorIndex: colorRef.current }
        }));
      }
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-gray-50 select-none overflow-hidden">
        {/* --- Toolbar (Mobile Optimized) --- */}
        <div className="absolute top-4 left-4 right-4 z-40 bg-white border-[3px] border-black p-2 md:p-3 shadow-[4px_4px_0_#000] flex flex-col gap-2 rounded-lg max-w-sm">
             <div className="flex gap-2">
                 <button 
                    onClick={() => setTool('build')}
                    className={`flex-1 py-2 font-bold border-2 border-black flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base ${tool === 'build' ? 'bg-neon-green' : 'bg-gray-100'}`}
                 >
                    <MousePointer2 size={16} /> BUILD
                 </button>
                 <button 
                    onClick={() => setTool('delete')}
                    className={`flex-1 py-2 font-bold border-2 border-black flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base ${tool === 'delete' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
                 >
                    <Trash2 size={16} /> ERASE
                 </button>
             </div>
             
             <div className="grid grid-cols-8 gap-1 md:gap-2">
                 {PALETTE.map((p, idx) => (
                     <button 
                        key={p.id}
                        onClick={() => { setSelectedColorIdx(idx); playSfx('pop'); }}
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-black ${selectedColorIdx === idx ? 'ring-2 ring-black ring-offset-2 scale-110' : ''}`}
                        style={{ backgroundColor: p.color }}
                     />
                 ))}
             </div>
             
             <div className="flex gap-2 justify-between">
                <button onClick={() => setBlocks({})} className="px-2 py-1 border-2 border-black bg-gray-200 hover:bg-red-100 font-bold text-xs flex items-center">
                    <RotateCcw size={12} className="inline mr-1"/> RESET
                </button>
                {/* Mobile Zoom Controls */}
                <div className="flex gap-1 md:hidden">
                    <button onClick={() => zoom(0.2)} className="p-1 border-2 border-black bg-white"><ZoomIn size={16}/></button>
                    <button onClick={() => zoom(-0.2)} className="p-1 border-2 border-black bg-white"><ZoomOut size={16}/></button>
                </div>
             </div>
        </div>

        {/* --- 3D Viewport --- */}
        <div 
            className="flex-1 cursor-move relative perspective-container touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handlePointerUp}
            onWheel={handleWheel}
            style={{ perspective: '1200px', overflow: 'hidden' }}
        >
            <div 
                ref={sceneRef}
                className="absolute left-1/2 top-1/2 w-0 h-0"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* --- Baseplate Grid (The Floor) --- */}
                <div 
                    style={{ 
                        transform: `rotateX(90deg) translateZ(${-CUBE_SIZE/2}px)`,
                        width: GRID_SIZE * CUBE_SIZE,
                        height: GRID_SIZE * CUBE_SIZE,
                        position: 'absolute',
                        top: -(GRID_SIZE * CUBE_SIZE)/2,
                        left: -(GRID_SIZE * CUBE_SIZE)/2,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        backgroundColor: 'rgba(255,255,255,0.4)',
                        backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
                        backgroundSize: `${CUBE_SIZE}px ${CUBE_SIZE}px`,
                        border: '4px solid #000',
                    }}
                >
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = (i % GRID_SIZE) - GRID_SIZE/2;
                        const z = Math.floor(i / GRID_SIZE) - GRID_SIZE/2;
                        return (
                            <div 
                                key={i}
                                onClick={(e) => { e.stopPropagation(); handleBasePlateClick(x, z); }}
                                // Use onTouchEnd to simulate click on mobile without dragging triggers
                                className="cursor-pointer"
                            />
                        );
                    })}
                </div>

                {/* --- The Blocks --- */}
                {Object.entries(blocks).map(([key, data]: [string, BlockData]) => {
                    const [x, y, z] = key.split(',').map(Number);
                    return (
                        <Cube 
                            key={key} 
                            x={x} y={y} z={z} 
                            colorIndex={data.colorIndex} 
                            onClick={handleBlockClick} 
                        />
                    );
                })}
            </div>
        </div>
    </div>
  );
};

const GameCenterModal: React.FC<GameCenterModalProps> = ({ gameId, onClose }) => {
  const gameConfig = BUILT_IN_GAMES.find(g => g.id === gameId);
  if (!gameId || !gameConfig) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[80] p-0 md:p-4">
      <div className="bg-white rough-border w-full md:max-w-6xl shadow-[10px_10px_0_#FF0055] relative flex flex-col h-full md:h-[85vh] rounded-none md:rounded-[15px]">
        
        {/* Header */}
        <div className={`p-3 md:p-4 border-b-4 border-black flex justify-between items-center ${gameConfig.color}`}>
          <div className="flex items-center gap-3">
             <span className="text-2xl md:text-3xl bg-white rounded-full p-1 border-2 border-black">{gameConfig.icon}</span>
             <h2 className="font-anime text-2xl md:text-3xl text-black font-black tracking-tighter">{gameConfig.name}</h2>
          </div>
          <button onClick={onClose} className="bg-black text-white p-2 rounded-full border-2 border-white hover:rotate-90 transition-transform shadow-lg"><X size={20}/></button>
        </div>

        {/* Game Area */}
        <div className="flex-1 bg-gray-100 p-0 flex flex-col overflow-hidden relative">
           {gameId === 'tetris3d' ? (
             <NanoBuilder />
           ) : (
             <div className="flex flex-col items-center justify-center h-full bg-scribble">
                 <div className="text-8xl mb-8 animate-bounce">{gameConfig.icon}</div>
                 <div className="text-4xl font-anime font-black uppercase tracking-widest bg-black text-white px-4 py-2 rotate-2">{gameConfig.id}</div>
                 <p className="font-anime text-xl mt-8 font-bold text-gray-500">Coming Soon...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default GameCenterModal;
