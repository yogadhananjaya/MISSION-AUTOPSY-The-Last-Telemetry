import React, { useState } from 'react';
import { 
  Search, 
  Wrench, 
  Rocket, 
  FileText, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Home,
  Plus
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import type { GamePhase } from '../../types/mission';

export const Header: React.FC = () => {
  const { 
    currentPhase, 
    setPhase, 
    audioEnabled, 
    toggleAudio, 
    astronautName,
    setOnboardingStep,
    setCurrentView
  } = useMissionStore();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const NAV_TABS = [
    { 
      id: 'investigation', 
      code: '01',
      label: 'INVESTIGATION', 
      icon: Search,
      isActive: currentPhase === 'briefing' || currentPhase === 'investigation' || currentPhase === 'root_cause',
      targetPhase: 'briefing' as GamePhase,
    },
    { 
      id: 'redesign', 
      code: '02',
      label: 'REDESIGN', 
      icon: Wrench,
      isActive: currentPhase === 'redesign',
      targetPhase: 'redesign' as GamePhase,
    },
    { 
      id: 'simulation', 
      code: '03',
      label: 'SIMULATION', 
      icon: Rocket,
      isActive: currentPhase === 'simulation',
      targetPhase: 'simulation' as GamePhase,
    },
    { 
      id: 'report', 
      code: '04',
      label: 'DEBRIEF', 
      icon: FileText,
      isActive: currentPhase === 'debrief',
      targetPhase: 'debrief' as GamePhase,
    },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const displayName = astronautName && astronautName.trim() ? astronautName.toUpperCase() : 'MISTER';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#141619]/90 backdrop-blur-md border-b border-black/40 text-white shadow-lg">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-2">
        
        {/* =========================================================================
            POJOK KIRI ATAS: TACTICAL INVESTIGATOR PROFILE (Matching Gacha RPG Top Bar)
            - Avatar kotak tajam (1px border)
            - Nama pemain (Mister / callsign)
            - Badge level kuning-emas kecil (LV.26)
            - Tag peran miring (NASA INVESTIGATOR)
            - Bar progres EXP tipis monospace 1560 / 5000
            ========================================================================= */}
        <div className="flex items-center gap-3 select-none">
          {/* Avatar Kotak Tajam */}
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="relative w-10 h-10 bg-[#1C1F24] border border-[#EAB308] p-0.5 cursor-pointer group shadow-sm flex items-center justify-center shrink-0"
            title="Investigator Dossier"
          >
            <img 
              src="/assets/nova/c40b7188/31_mascot.png" 
              alt="Avatar" 
              className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all"
              onError={(e) => {
                // Fallback to text initials if image path fails
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-display font-black text-sm text-[#EAB308] absolute">
              {displayName.charAt(0)}
            </span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#10B981] border border-black" />
          </div>

          {/* Dossier Text & EXP Bar */}
          <div className="flex flex-col justify-center">
            {/* Top row: Name + LV.26 Badge */}
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-wider text-[#F8FAFC] uppercase leading-none">
                {displayName}
              </span>
              <span className="bg-[#EAB308] text-black font-mono-tech font-bold text-[10px] px-1.5 py-0.2 leading-tight uppercase tracking-tight">
                LV.26
              </span>
            </div>

            {/* Bottom row: Slanted Role Tag + Thin Monospace EXP Bar */}
            <div className="flex items-center gap-2 mt-1">
              <span className="clip-slanted bg-[#1F2329] border border-slate-700/80 px-2 py-0.5 text-[9px] font-mono-tech tracking-wider text-slate-300 uppercase">
                NASA INVESTIGATOR
              </span>
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-20 h-1.5 bg-black/60 border border-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#EAB308] to-amber-300 w-[31%]" />
                </div>
                <span className="font-mono-tech text-[9px] text-slate-400 tracking-tighter">
                  1560 / 5000 EXP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CENTER: TACTICAL PHASE TABS (Anti-Rounded)
            ========================================================================= */}
        <nav className="hidden md:flex items-center bg-[#0D0F12] border border-slate-800/80 p-0.5 gap-0.5">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setPhase(tab.targetPhase)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  tab.isActive
                    ? 'bg-[#1C2026] text-[#EAB308] border-b-2 border-[#EAB308]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#15181D]'
                }`}
              >
                <span className={`text-[10px] ${tab.isActive ? 'text-[#EAB308]' : 'text-slate-600'}`}>
                  {tab.code}
                </span>
                <Icon className={`w-3.5 h-3.5 ${tab.isActive ? 'text-[#EAB308]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* =========================================================================
            POJOK KANAN ATAS: DERETAN RESOURCE & QUICK TOOLS
            - $ 65,000,000 (Credits)
            - 8,600 DP (Data Points)
            - 940 SIG (Signal Units)
            - Tombol [+] kotak berlatar gelap
            ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Resource 1: Budget / Credits ($ 65,000,000) */}
          <div className="flex items-center gap-1.5 bg-[#0D0F12] border border-slate-800/90 px-2 sm:px-2.5 py-1">
            <span className="w-2.5 h-2.5 bg-[#EAB308] rotate-45 shrink-0 inline-block" />
            <span className="font-mono-tech font-bold text-xs sm:text-sm text-[#F8FAFC] tracking-tight">
              $ 65,000,000
            </span>
          </div>

          {/* Resource 2: Data Points (8,600 DP) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#0D0F12] border border-slate-800/90 px-2.5 py-1">
            <span className="w-2.5 h-2.5 bg-rose-500 shrink-0 inline-block" />
            <span className="font-mono-tech font-bold text-xs sm:text-sm text-[#F8FAFC] tracking-tight">
              8,600 DP
            </span>
          </div>

          {/* Resource 3: Signal Units (940 SIG) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0D0F12] border border-slate-800/90 px-2.5 py-1">
            <span className="w-2.5 h-2.5 bg-cyan-400 rotate-45 shrink-0 inline-block" />
            <span className="font-mono-tech font-bold text-xs sm:text-sm text-[#F8FAFC] tracking-tight">
              940 SIG
            </span>
          </div>

          {/* Tombol [+] Kotak Berlatar Gelap */}
          <button
            onClick={() => setOnboardingStep('tutorial')}
            title="Refill / Tech Store"
            className="w-7 h-7 bg-[#1F2329] border border-slate-700 hover:border-[#EAB308] hover:bg-[#282C34] text-slate-300 hover:text-[#EAB308] flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Divider tipis */}
          <div className="w-[1px] h-6 bg-slate-800 hidden sm:block" />

          {/* Return to Hub Button */}
          <button
            onClick={() => setCurrentView('lobby')}
            title="Return to Command Hub"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1F2329] border border-slate-700 text-xs font-mono text-slate-300 hover:text-[#EAB308] hover:border-[#EAB308] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-bold">HUB</span>
          </button>

          {/* Audio */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Mute SFX' : 'Enable SFX'}
            className="p-1.5 bg-[#1F2329] border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
          >
            {audioEnabled
              ? <Volume2 className="w-3.5 h-3.5 text-[#EAB308]"/>
              : <VolumeX className="w-3.5 h-3.5 text-slate-500"/>
            }
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 bg-[#1F2329] border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-colors hidden md:flex cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      {/* User Dossier Dropdown */}
      {showUserMenu && (
        <div 
          className="absolute left-4 top-14 w-64 p-3 bg-[#141619] border border-black text-white text-xs font-mono space-y-2 shadow-2xl z-50 clip-chamfer-md"
        >
          <div className="border-b border-slate-800 pb-2">
            <div className="text-slate-400 text-[10px]">CURRENT INVESTIGATOR</div>
            <div className="font-bold text-white text-sm uppercase truncate">{displayName}</div>
            <div className="text-[#EAB308] text-[10px]">NASA INVESTIGATION UNIT : 2026</div>
          </div>

          <button
            onClick={() => { setShowUserMenu(false); setCurrentView('lobby'); }}
            className="w-full text-left py-1.5 px-2 bg-[#1C1F24] hover:bg-[#EAB308] hover:text-black text-[#EAB308] font-bold transition-colors cursor-pointer"
          >
            KEMBALI KE HUB
          </button>

          <button
            onClick={() => { setShowUserMenu(false); setOnboardingStep('enter_name'); }}
            className="w-full text-left py-1.5 px-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            GANTI NAMA
          </button>

          <button
            onClick={() => { setShowUserMenu(false); setOnboardingStep('tutorial'); }}
            className="w-full text-left py-1.5 px-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            PANDUAN MISI
          </button>
        </div>
      )}
    </header>
  );
};
