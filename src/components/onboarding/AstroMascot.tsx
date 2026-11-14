import React from 'react';

export type MascotMood = 
  | 'happy' 
  | 'idle' 
  | 'explaining' 
  | 'analyzing' 
  | 'surprised' 
  | 'celebrating' 
  | 'sad' 
  | 'warning' 
  | 'determined';

interface AstroMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showExclamation?: boolean;
  className?: string;
}

// Map each condition to the specific Nova character asset
const MOOD_IMAGE_MAP: Record<MascotMood, string> = {
  happy: '/assets/nova/nova_happy.png',          // Nova_idle2.png (friendly greeting & waving)
  idle: '/assets/nova/nova_idle.png',            // Nova_idle.png (neutral standing)
  surprised: '/assets/nova/nova_confused.png',   // Nova nanya&bingung.png (curious / questioning)
  analyzing: '/assets/nova/nova_confused.png',   // Nova nanya&bingung.png (examining anomalies)
  explaining: '/assets/nova/nova_determined.png',// Nova marah&semangat.png (focused & explaining)
  determined: '/assets/nova/nova_determined.png',// Nova marah&semangat.png (spirited & redesigning)
  celebrating: '/assets/nova/nova_happy.png',    // Nova_idle2.png (happy celebration)
  sad: '/assets/nova/nova_sad.png',              // nova sedih&kecewa.png (mission failure & loss)
  warning: '/assets/nova/nova_sad.png',          // nova sedih&kecewa.png (anomaly / critical)
};

export const AstroMascot: React.FC<AstroMascotProps> = ({ 
  mood = 'happy',
  size = 'md',
  showExclamation = false,
  className = ''
}) => {
  // Dimensions tailored to Nova's 351x711 aspect ratio (~ 1:2)
  const sizeMap = {
    sm: { img: 'w-20 h-40 object-contain', pxWidth: 80, ringBottom: 'bottom-4' },
    md: { img: 'w-28 h-56 sm:w-32 sm:h-64 object-contain', pxWidth: 128, ringBottom: 'bottom-6' },
    lg: { img: 'w-40 h-80 sm:w-44 sm:h-88 object-contain', pxWidth: 176, ringBottom: 'bottom-8' },
    xl: { img: 'w-48 h-96 sm:w-52 sm:h-[420px] object-contain', pxWidth: 208, ringBottom: 'bottom-10' },
  }[size];

  const imageSrc = MOOD_IMAGE_MAP[mood] || MOOD_IMAGE_MAP.happy;

  return (
    <div 
      className={`relative flex flex-col items-center select-none ${className}`} 
      style={{ animation: 'floatBob 3.5s ease-in-out infinite' }}
    >
      
      {/* Exclamation marks (!!) : for surprised / familiarity check */}
      {(showExclamation || mood === 'surprised') && (
        <div 
          className="absolute z-30 flex items-end gap-1 font-black pointer-events-none"
          style={{
            top: '-26px',
            right: size === 'xl' ? '12px' : size === 'lg' ? '8px' : '4px',
            animation: 'bounce 1s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: '1.7rem', color: '#38bdf8', textShadow: '0 0 12px #38bdf8' }}>!</span>
          <span style={{ fontSize: '2.1rem', color: '#ffffff', textShadow: '0 0 10px #38bdf8, 0 0 20px #0284c7' }}>!</span>
        </div>
      )}

      {/* Mood status badges (Tactical Chamfered Tags) */}
      {mood === 'analyzing' && (
        <div 
          className="absolute -top-3 -left-3 z-30 px-2.5 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md pointer-events-none bg-[#141619] border border-amber-500 text-amber-400 clip-chamfer-sm"
        >
          <span>🔍</span>
          <span>ANALISIS OPERASI</span>
        </div>
      )}

      {mood === 'explaining' && (
        <div 
          className="absolute -top-3 -left-3 z-30 px-2.5 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md pointer-events-none bg-[#141619] border border-amber-500 text-amber-400 clip-chamfer-sm"
        >
          <span>💡</span>
          <span>BRIEFING 01</span>
        </div>
      )}

      {mood === 'determined' && (
        <div 
          className="absolute -top-3 -left-3 z-30 px-2.5 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md pointer-events-none bg-[#141619] border border-amber-500 text-amber-400 clip-chamfer-sm"
        >
          <span>⚡</span>
          <span>REKAYASA DESAIN</span>
        </div>
      )}

      {(mood === 'sad' || mood === 'warning') && (
        <div 
          className="absolute -top-3 -left-3 z-30 px-2.5 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md pointer-events-none bg-[#2A0C12] border border-red-500 text-red-400 clip-chamfer-sm"
        >
          <span>⚠️</span>
          <span>KEGAGALAN TELEMETRI</span>
        </div>
      )}

      {mood === 'celebrating' && (
        <div 
          className="absolute -top-3 -right-3 z-30 px-2.5 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md pointer-events-none bg-[#141619] border border-emerald-500 text-emerald-400 clip-chamfer-sm"
        >
          <span>★</span>
          <span>MISI BERHASIL</span>
        </div>
      )}

      {/* Sparkle & particle effects */}
      {(mood === 'happy' || mood === 'celebrating') && (
        <>
          <div 
            className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 pointer-events-none"
            style={{ top: '15%', left: '-8%', opacity: 0.8, animation: 'twinkle 2s ease-in-out infinite', boxShadow: '0 0 10px #38bdf8' }}
          />
          <div 
            className="absolute w-2 h-2 rounded-full bg-white pointer-events-none"
            style={{ bottom: '35%', right: '-6%', opacity: 0.85, animation: 'twinkle 2.5s ease-in-out infinite 0.6s', boxShadow: '0 0 8px white' }}
          />
          <div 
            className="absolute w-2 h-2 rounded-full bg-amber-300 pointer-events-none"
            style={{ top: '25%', right: '0%', opacity: 0.8, animation: 'twinkle 2.2s ease-in-out infinite 1.1s', boxShadow: '0 0 8px #f59e0b' }}
          />
        </>
      )}

      {/* Back glow behind Nova tailored to mood */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        style={{
          background: (mood === 'sad' || mood === 'warning')
            ? 'radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(225, 29, 72, 0.08) 55%, transparent 75%)'
            : (mood === 'determined')
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.08) 55%, transparent 75%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.08) 55%, transparent 75%)',
          transform: 'scale(1.25)',
        }}
      />

      {/* Nova Character Mascot Image */}
      <div className="relative z-10 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={`Nova - ${mood}`}
          className={`${sizeMap.img} transition-all duration-300 hover:scale-105`}
          style={{
            filter: (mood === 'sad' || mood === 'warning')
              ? 'drop-shadow(0 10px 24px rgba(244, 63, 94, 0.35)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))'
              : (mood === 'determined')
              ? 'drop-shadow(0 10px 24px rgba(245, 158, 11, 0.35)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))'
              : 'drop-shadow(0 10px 24px rgba(56, 189, 248, 0.35)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))',
          }}
          loading="eager"
        />

        {/* Orbit holographic ring around character's waist */}
        <div 
          className={`absolute inset-x-0 ${sizeMap.ringBottom} h-8 pointer-events-none flex items-center justify-center opacity-80`}
          style={{ transform: 'rotate(-5deg)' }}
        >
          <svg viewBox="0 0 200 50" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="orbitGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <ellipse cx="100" cy="25" rx="84" ry="16" fill="none" stroke="url(#orbitGlow)" strokeWidth="2.2" />
            <ellipse cx="100" cy="25" rx="84" ry="16" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            <circle cx="155" cy="32" r="2.8" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 6px #ffffff)' }} />
            <circle cx="42" cy="19" r="2.2" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }} />
          </svg>
        </div>
      </div>

      {/* Holographic floor ring / pedestal glow underneath Nova */}
      <div 
        className="mt-[-6px] w-24 sm:w-32 h-3.5 rounded-full pointer-events-none blur-sm"
        style={{
          background: (mood === 'sad' || mood === 'warning')
            ? 'radial-gradient(ellipse, rgba(244, 63, 94, 0.55) 0%, rgba(225, 29, 72, 0.2) 50%, transparent 75%)'
            : (mood === 'determined')
            ? 'radial-gradient(ellipse, rgba(245, 158, 11, 0.55) 0%, rgba(217, 119, 6, 0.2) 50%, transparent 75%)'
            : 'radial-gradient(ellipse, rgba(56, 189, 248, 0.55) 0%, rgba(14, 165, 233, 0.2) 50%, transparent 75%)',
        }}
      />

      <style>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
};
