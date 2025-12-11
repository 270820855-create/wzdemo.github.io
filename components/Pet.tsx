import React, { useState, useEffect, useRef } from 'react';
import { PetMood, PetSkinId } from '../types';
import { CHARACTER_DIALOGS } from '../constants';
import { Heart, Zap, Ghost } from 'lucide-react';
import { playSfx } from '../utils/audio';

interface PetProps {
  mood: PetMood;
  setMood: (mood: PetMood) => void;
  skinId: PetSkinId;
  scale: number;
}

const Pet: React.FC<PetProps> = ({ mood, setMood, skinId, scale }) => {
  const [message, setMessage] = useState<string>('');
  const [showBubble, setShowBubble] = useState(false);
  
  // Physics & Movement State
  const [isDragging, setIsDragging] = useState(false);
  const [x, setX] = useState(window.innerWidth - 450); // Initial X position
  const [y, setY] = useState(0); // Y offset (for jumping/dragging)
  const [direction, setDirection] = useState(1); // 1 = Right, -1 = Left
  const [isWalking, setIsWalking] = useState(false);

  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Constants
  const isCat = skinId === 'cat-orange';
  const isPinkSkin = skinId === 'girl-pink';

  // --- Helper: Get Messages ---
  const getCurrentMessages = () => {
    return CHARACTER_DIALOGS[skinId] || CHARACTER_DIALOGS['girl-white'];
  };

  // --- Palette Configuration (Unchanged) ---
  const colors = isPinkSkin ? {
    hair: '#FF6699', 
    hairShadow: '#CC3366',
    skin: '#FFF0E5',
    eyes: '#33CCFF',
    clothes: '#222',
    highlight: '#FFF',
    blush: '#FFB6C1',
    acc: '#FFF'
  } : {
    // Jinx-inspired Palette
    hair: '#00E5FF',
    hairShadow: '#00B2CC',
    skin: '#FFFAFA',
    eyes: '#FF0055',
    clothes: '#1A1A1A',
    highlight: '#FFFFFF',
    blush: '#FFB6C1',
    acc: '#CCFF00'
  };

  // --- Eye Tracking ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate angle, considering the character might be flipped
      const dx = (e.clientX - centerX) * direction; // Adjust for flip
      const dy = e.clientY - centerY;
      
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(isCat ? 2 : 2.5, Math.hypot(dx, dy) / 30);
      setEyePosition({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCat, direction]);

  // --- Blinking Logic ---
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // --- AI: Random Walking & Idle Behavior ---
  useEffect(() => {
    const planNextMove = () => {
      if (isDragging) return;

      const randomAction = Math.random();
      
      // 50% chance to walk somewhere (Increased frequency)
      if (randomAction < 0.5) {
        const screenWidth = window.innerWidth;
        
        // Relative Movement: Walk a shorter distance from current spot
        const maxStep = 300; // Reduced amplitude
        const minStep = 50;
        let step = minStep + Math.random() * (maxStep - minStep);
        
        // Randomize direction
        if (Math.random() > 0.5) step *= -1;
        
        let targetX = x + step;
        
        // Clamp to screen bounds (Character width approx 400px)
        const minX = -50; // Allow slight overlap
        const maxX = screenWidth - 350;
        
        if (targetX < minX) targetX = minX;
        if (targetX > maxX) targetX = maxX;

        const dist = targetX - x;
        
        // If stuck against wall, maybe turn around next time, but for now just stop
        if (Math.abs(dist) < 10) return;

        const duration = Math.abs(dist) * 5; // Speed factor (ms per pixel)
        
        // Face the direction
        setDirection(dist > 0 ? 1 : -1);
        setIsWalking(true);
        setX(targetX);
        
        // Trigger walk dialog occasionally
        if (Math.random() > 0.8) {
            triggerReaction(PetMood.HAPPY, 'idle', 2000);
        }

        setTimeout(() => {
            setIsWalking(false);
        }, duration); 

      } else {
        // Stay idle
        setIsWalking(false);
        if (Math.random() > 0.7) {
           triggerReaction(PetMood.IDLE, 'idle');
        }
      }
    };

    // High frequency check loop
    const timer = setTimeout(planNextMove, 1500); // Check 1.5s after state change/render
    walkIntervalRef.current = setInterval(planNextMove, 3000 + Math.random() * 3000); // Check every 3-6s if idle

    return () => {
        clearTimeout(timer);
        if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [x, isDragging]);

  const triggerReaction = (newMood: PetMood, msgCategory: keyof typeof CHARACTER_DIALOGS['girl-white'], duration: number = 3000) => {
    setMood(newMood);
    const msgs = getCurrentMessages()[msgCategory];
    if (msgs && msgs.length > 0) {
        setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        setShowBubble(true);
    }
    
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setMood(PetMood.IDLE);
      setShowBubble(false);
    }, duration);
  };

  // --- Interaction Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); // Prevent passing through to elements behind when clicking char
    setIsDragging(true);
    triggerReaction(PetMood.SURPRISED, 'surprised');
    playSfx('pet-surprised');
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setY(0); // Snap back to ground
        setTimeout(() => setMood(PetMood.IDLE), 500);
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Update x/y directly based on movement
        setX(prev => prev + e.movementX);
        setY(prev => prev + e.movementY);
      }
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);


  // --- Helper: Bubble Effect ---
  const renderBubbles = () => (
    <g className="pointer-events-none">
       {/* Adjusted coordinates to be surrounding the character (approx center 100,100) within 200x200 viewBox */}
       <circle cx="50" cy="140" r="6" fill={isPinkSkin ? '#FFCCDD' : '#00E5FF'} opacity="0.6" className="animate-float" style={{animationDuration: '3s', animationDelay: '0s'}} />
       <circle cx="160" cy="50" r="4" fill="#FFFFFF" opacity="0.8" className="animate-float" style={{animationDuration: '4s', animationDelay: '1s'}} />
       <circle cx="40" cy="60" r="8" fill={isCat ? '#FDBA74' : (isPinkSkin ? '#FFF' : '#FF0055')} opacity="0.4" className="animate-float" style={{animationDuration: '5s', animationDelay: '2s'}} />
       <circle cx="170" cy="130" r="3" fill="#CCFF00" opacity="0.7" className="animate-float" style={{animationDuration: '3.5s', animationDelay: '0.5s'}} />
       <circle cx="110" cy="30" r="5" fill="#FFFFFF" opacity="0.5" className="animate-float" style={{animationDuration: '6s', animationDelay: '1.5s'}} />
    </g>
  );

  // --- Render Characters (Unchanged) ---
  const renderCat = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-xl">
        {renderBubbles()}
        <g className="animate-wiggle origin-bottom" style={{ transformOrigin: '150px 150px' }}>
             <path d="M140,140 Q170,110 160,80" stroke="#FDBA74" strokeWidth="12" fill="none" strokeLinecap="round" />
        </g>
        <path d="M50,70 L40,30 L80,60 Z" fill="#FDBA74" stroke="black" strokeWidth="3" />
        <path d="M150,70 L160,30 L120,60 Z" fill="#FDBA74" stroke="black" strokeWidth="3" />
        <ellipse cx="100" cy="110" rx="60" ry="55" fill="#FDBA74" stroke="black" strokeWidth="3" />
        <path d="M100,60 L90,75 L110,75 Z" fill="#C2410C" opacity="0.5" />
        <path d="M150,110 L135,105 L135,115 Z" fill="#C2410C" opacity="0.5" />
        <path d="M50,110 L65,105 L65,115 Z" fill="#C2410C" opacity="0.5" />
        <ellipse cx="100" cy="130" rx="30" ry="25" fill="#FFF7ED" opacity="0.8" />
        <g transform="translate(100, 100)">
           {blink || mood === PetMood.SLEEP ? (
               <g fill="none" stroke="black" strokeWidth="3">
                   <path d="M-25,0 L-15,0" />
                   <path d="M15,0 L25,0" />
               </g>
           ) : mood === PetMood.HAPPY || mood === PetMood.LOVE ? (
               <g fill="none" stroke="black" strokeWidth="3">
                   <path d="M-25,5 Q-20,-5 -15,5" />
                   <path d="M15,5 Q20,-5 25,5" />
               </g>
           ) : (
             <g>
               <g transform={`translate(${-20 + eyePosition.x}, ${eyePosition.y})`}>
                   <ellipse cx="0" cy="0" rx="8" ry="10" fill="white" stroke="black" strokeWidth="2" />
                   <circle cx="0" cy="0" r="3" fill="black" />
               </g>
               <g transform={`translate(${20 + eyePosition.x}, ${eyePosition.y})`}>
                   <ellipse cx="0" cy="0" rx="8" ry="10" fill="white" stroke="black" strokeWidth="2" />
                   <circle cx="0" cy="0" r="3" fill="black" />
               </g>
             </g>
           )}
           <path d="M-3,8 L3,8 L0,12 Z" fill="pink" stroke="black" strokeWidth="1" />
           <path d="M-3,12 Q-8,18 -15,14 M3,12 Q8,18 15,14" fill="none" stroke="black" strokeWidth="2" />
           <g stroke="black" strokeWidth="1" opacity="0.6">
               <line x1="-30" y1="10" x2="-50" y2="5" />
               <line x1="-30" y1="15" x2="-50" y2="15" />
               <line x1="30" y1="10" x2="50" y2="5" />
               <line x1="30" y1="15" x2="50" y2="15" />
           </g>
        </g>
        {mood === PetMood.ANGRY && <text x="130" y="60" fontSize="30" fill="red" fontWeight="bold">💢</text>}
        {mood === PetMood.LOVE && <text x="130" y="60" fontSize="30" fill="#FF69B4">💗</text>}
        {mood === PetMood.SLEEP && <text x="140" y="70" fontSize="24" fill="#666">Zzz</text>}
    </svg>
  );

  const renderAnimeGirl = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-xl">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {renderBubbles()}

        {/* --- Back Hair (Background Layer) --- */}
        {!isPinkSkin ? (
           // Jinx Style Braids (Behind body)
           <g stroke="black" strokeWidth="2.5" fill={colors.hair}>
              <path d="M50,80 Q30,120 20,150 Q15,170 30,175 Q45,170 40,150 Q45,120 60,80 Z" />
              <path d="M150,80 Q170,120 180,150 Q185,170 170,175 Q155,170 160,150 Q155,120 140,80 Z" />
              {/* Volume behind head - Flattened top */}
              <path d="M60,40 Q100,10 140,40 L140,80 Q100,90 60,80 Z" />
           </g>
        ) : (
           // Bob hair for Pink
           <path 
             d="M55,80 Q40,110 40,130 Q40,150 70,150 L130,150 Q160,150 160,130 Q160,110 145,80 Q150,0 100,0 Q50,0 55,80" 
             fill={colors.hair} stroke="black" strokeWidth="2.5"
           />
        )}

        {/* --- Wings (Behind Body, for Pink Skin) --- */}
        {isPinkSkin && (
            <g transform="translate(100, 110)" stroke="black" strokeWidth="2" fill="#FFF">
                <path d="M-25,10 Q-50,-10 -60,0 Q-50,20 -40,15 Q-50,30 -30,25 Z" />
                <path d="M25,10 Q50,-10 60,0 Q50,20 40,15 Q50,30 30,25 Z" />
            </g>
        )}

        {/* --- Body --- */}
        <g transform="translate(100, 135)">
           <rect x="-5" y="-25" width="10" height="20" fill={colors.skin} stroke="black" strokeWidth="0" />

           {!isPinkSkin ? (
             <g>
               <path 
                 d="M-7,-20 Q-28,-5 -28,40 L-20,40 L-20,10 L20,10 L20,40 L28,40 Q28,-5 7,-20 Z" 
                 fill={colors.skin} stroke="black" strokeWidth="2.5" 
               />
               <path 
                 d="M-14,-20 L-16,40 L16,40 L14,-20 Q0,-10 -14,-20" 
                 fill={colors.clothes} stroke="black" strokeWidth="2.5" 
               />
               <path d="M-8,15 L8,30 M8,15 L-8,30" stroke="#FF0055" strokeWidth="3" opacity="0.9" strokeLinecap="round" />
               <path d="M-26,15 L-22,18 M-26,22 L-22,25" stroke="#00E5FF" strokeWidth="2" opacity="0.7" />
             </g>
           ) : (
             <g>
                <path d="M0,-35 L-45,60 L45,60 Z" fill={colors.clothes} stroke="black" strokeWidth="2.5" />
                <path d="M-8,5 L-15,0 L-8,-5 L8,-5 L15,0 L8,5 Z" fill={colors.acc} stroke="black" strokeWidth="1.5" />
             </g>
           )}
        </g>

        {/* --- Head --- */}
        <g transform="translate(100, 95)">
            <path 
              d="M-38,-25 C-42,15 -20,28 0,28 C20,28 42,15 38,-25 Z" 
              fill={colors.skin} stroke="black" strokeWidth="2.5" 
            />
            
            <ellipse cx="-25" cy="12" rx="6" ry="3" fill={colors.blush} opacity="0.6" />
            <ellipse cx="25" cy="12" rx="6" ry="3" fill={colors.blush} opacity="0.6" />

            {/* Eyes */}
            {blink || mood === PetMood.SLEEP ? (
                <g stroke="black" strokeWidth="2.5" fill="none">
                    <path d="M-28,0 Q-20,5 -12,0" />
                    <path d="M12,0 Q20,5 28,0" />
                </g>
            ) : mood === PetMood.HAPPY || mood === PetMood.LOVE ? (
                <g stroke="black" strokeWidth="2.5" fill="none">
                     <path d="M-28,5 Q-20,-5 -12,5" />
                     <path d="M12,5 Q20,-5 28,5" />
                </g>
            ) : (
                <g>
                   <g transform={`translate(${-22 + eyePosition.x}, ${eyePosition.y})`}>
                       <path d="M-14,-9 Q0,-14 14,-9" stroke="black" strokeWidth="2.5" fill="none" /> 
                       <ellipse cx="0" cy="1" rx="11" ry="13" fill="#FFFFFF" stroke="black" strokeWidth="1.5" />
                       <ellipse cx="0" cy="3" rx="6" ry="8" fill={colors.eyes} />
                       <circle cx="0" cy="3" r="2.5" fill="#111" />
                       <circle cx="-3" cy="-2" r="3" fill="white" />
                   </g>
                   <g transform={`translate(${22 + eyePosition.x}, ${eyePosition.y})`}>
                       <path d="M-14,-9 Q0,-14 14,-9" stroke="black" strokeWidth="2.5" fill="none" /> 
                       <ellipse cx="0" cy="1" rx="11" ry="13" fill="#FFFFFF" stroke="black" strokeWidth="1.5" />
                       <ellipse cx="0" cy="3" rx="6" ry="8" fill={colors.eyes} />
                       <circle cx="0" cy="3" r="2.5" fill="#111" />
                       <circle cx="-3" cy="-2" r="3" fill="white" />
                   </g>
                   {!isPinkSkin && (
                     <g opacity="0.3" fill="none" stroke="#500" strokeWidth="2">
                       <path d="M-28,10 Q-20,16 -12,10" />
                       <path d="M12,10 Q20,16 28,10" />
                     </g>
                   )}
                </g>
            )}

            {/* Mouth */}
            <g transform="translate(0, 18)">
                {mood === PetMood.SURPRISED ? (
                    <circle r="3" fill="none" stroke="black" strokeWidth="2" />
                ) : mood === PetMood.HAPPY || mood === PetMood.LOVE ? (
                     <path d="M-4,-2 Q0,4 4,-2" fill="none" stroke="black" strokeWidth="2" />
                ) : (
                    <path d="M-3,0 L3,0" stroke="black" strokeWidth="2" strokeLinecap="round" />
                )}
            </g>

            {/* Bangs */}
            <path 
              d="M-40,-30 Q-45,-10 -35,20 L-30,5 L-20,-10 L-10,5 L0,-15 L10,5 L20,-10 L30,5 L35,20 Q45,-10 40,-30 Q0,-42 -40,-30" 
              fill={colors.hair} 
              stroke="black" strokeWidth="2.5"
            />
            
            {/* Accessories */}
            {!isPinkSkin && (
               <g transform="translate(0, -38) rotate(-5)">
                  <rect x="-35" y="-8" width="25" height="16" rx="5" fill="#333" stroke="black" strokeWidth="2" />
                  <rect x="10" y="-8" width="25" height="16" rx="5" fill="#333" stroke="black" strokeWidth="2" />
                  <rect x="-30" y="-4" width="15" height="8" rx="2" fill="#FF0055" opacity="0.8" />
                  <rect x="15" y="-4" width="15" height="8" rx="2" fill="#FF0055" opacity="0.8" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#333" strokeWidth="4" />
               </g>
            )}
        </g>

        {mood === PetMood.ANGRY && <text x="130" y="60" fontSize="30" fill="red" fontWeight="bold">💢</text>}
        {mood === PetMood.LOVE && <text x="130" y="60" fontSize="30" fill="#FF69B4">💗</text>}
        {mood === PetMood.SLEEP && <text x="140" y="70" fontSize="24" fill="#666">Zzz</text>}
    </svg>
  );

  return (
    <div 
      ref={containerRef}
      className={`fixed z-[100] flex flex-col items-center select-none pointer-events-none`}
      style={{ 
        left: x,
        bottom: 0,
        // Combined Scale and Direction Transform. 
        // transformOrigin is handled via CSS to ensure it scales from bottom-center
        transform: `translate(0, ${y}px) scale(${scale}) scaleX(${direction})`, 
        transformOrigin: 'bottom center', 
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'left 1s linear, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' // Smoother bouncy scale
      }}
    >
      {/* Speech Bubble - Inverse ScaleX to keep text readable */}
      <div 
        className={`
          absolute -top-32 right-12
          bg-white border-[3px] border-black px-4 py-3
          shadow-[4px_4px_0px_rgba(0,0,0,1)]
          font-anime text-lg font-bold text-black whitespace-nowrap z-50
          transition-all duration-300 origin-bottom-right pointer-events-none
          ${showBubble ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-12'}
        `}
        style={{ 
            borderRadius: '20px 20px 5px 20px',
        }}
      >
        <span style={{ display: 'inline-block', transform: `scaleX(${direction})` }}>{message}</span>
      </div>

      {/* Character Container - Enable pointer events here for dragging */}
      <div 
         className={`
           relative w-[400px] h-[500px] drop-shadow-2xl pointer-events-auto
           ${isDragging ? 'animate-bounce' : isWalking ? 'animate-bounce' : 'animate-float'}
         `}
         style={{ animationDuration: isWalking ? '0.5s' : '4s' }}
         onMouseDown={handleMouseDown}
         onClick={(e) => {
           if (!isDragging) {
                e.stopPropagation();
                triggerReaction(PetMood.HAPPY, 'happy');
                playSfx('pet-happy');
           }
         }}
         onDoubleClick={(e) => {
           e.stopPropagation();
           triggerReaction(PetMood.LOVE, 'love');
           playSfx('success');
         }}
      >
         {isCat ? renderCat() : renderAnimeGirl()}
      </div>

      {/* Interaction Buttons - Inverse ScaleX - Enable pointer events */}
       <div 
         className="absolute bottom-10 flex gap-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity pointer-events-auto"
         style={{ transform: `scaleX(${direction})` }}
       >
           <button 
             onClick={(e) => { 
                e.stopPropagation(); 
                triggerReaction(PetMood.LOVE, 'love'); 
                playSfx('success');
             }}
             className="p-2 bg-jinx-pink border-2 border-black rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0_#000]"
           >
             <Heart size={16} className="text-white" fill="currentColor" />
           </button>
           <button 
             onClick={(e) => { 
                e.stopPropagation(); 
                triggerReaction(PetMood.SURPRISED, 'surprised'); 
                playSfx('pet-surprised');
             }}
             className="p-2 bg-jinx-blue border-2 border-black rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0_#000]"
           >
             <Ghost size={16} className="text-black" fill="currentColor" />
           </button>
        </div>
    </div>
  );
};

export default Pet;