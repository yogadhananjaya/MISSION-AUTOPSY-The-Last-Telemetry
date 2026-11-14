import React, { useState } from 'react';
import { 
  Compass, 
  Users, 
  Trophy, 
  ChevronUp, 
  ChevronDown, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Wrench,
  Radio,
  FolderGit2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { CREW_MEMBERS } from '../../data/crewData';
import { MissionSelector } from './MissionSelector';
import { CharacterRoster } from './CharacterRoster';
import { CoopRoomLobby } from './CoopRoomLobby';
import { useMissionStore } from '../../store/useMissionStore';
import { sounds } from '../../utils/soundEngine';

interface MainLobbyProps {
  onStartNewGame: () => void;
  onResumeGame: () => void;
}

export const MainLobby: React.FC<MainLobbyProps> = ({ onStartNewGame, onResumeGame }) => {
  const { astronautName, audioEnabled, toggleAudio, setPhase, setCurrentView } = useMissionStore();

  const [activeMenuIndex, setActiveMenuIndex] = useState<number>(1); // Default: 'CONTINUE'
  const [activeCrewIndex, setActiveCrewIndex] = useState<number>(0);  // Default: NOVA
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false);
  const [showCharacterModal, setShowCharacterModal] = useState<boolean>(false);
  const [showCoopModal, setShowCoopModal] = useState<boolean>(false);
  const [showAchievementModal, setShowAchievementModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const MENU_ITEMS = [
    { id: 'new_game', code: '01', label: 'NEW GAME', sublabel: 'CHRONICLE RE-ENTRY' },
    { id: 'continue', code: '02', label: 'CONTINUE', sublabel: 'ACTIVE FORENSICS' },
    { id: 'mission', code: '03', label: 'MISSION', sublabel: 'INCIDENT DOSSIER' },
    { id: 'character', code: '04', label: 'CHARACTER', sublabel: 'MULTIPLAYER ROSTER' },
    { id: 'coop', code: '05', label: 'CO-OP ROOM', sublabel: '3-OPERATOR SYNC' },
    { id: 'achievement', code: '06', label: 'ACHIEVEMENT', sublabel: 'CITATION ARCHIVE' },
    { id: 'settings', code: '07', label: 'SETTINGS', sublabel: 'SYSTEM SPEC' },
  ];

  const currentCrew = CREW_MEMBERS[activeCrewIndex];

  // Cycling character when navigating up or down
  const cycleCharacter = (direction: 'up' | 'down') => {
    sounds.playClick(600);
    setActiveCrewIndex((prev) => {
      if (direction === 'up') {
        return (prev - 1 + CREW_MEMBERS.length) % CREW_MEMBERS.length;
      } else {
        return (prev + 1) % CREW_MEMBERS.length;
      }
    });
  };

  const handleMenuClick = (index: number) => {
    sounds.playClick(750);
    setActiveMenuIndex(index);
    setActiveCrewIndex(index % CREW_MEMBERS.length);

    const item = MENU_ITEMS[index];
    if (item.id === 'new_game') {
      onStartNewGame();
    } else if (item.id === 'continue') {
      onResumeGame();
    } else if (item.id === 'mission') {
      setShowMissionModal(true);
    } else if (item.id === 'character') {
      setShowCharacterModal(true);
    } else if (item.id === 'coop') {
      setShowCoopModal(true);
    } else if (item.id === 'achievement') {
      setShowAchievementModal(true);
    } else if (item.id === 'settings') {
      setShowSettingsModal(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div 
      className="fixed inset-0 z-40 flex flex-col justify-between overflow-hidden select-none bg-[#E4E7EC] text-slate-900"
      onWheel={(e) => {
        if (e.deltaY > 50) cycleCharacter('down');
        else if (e.deltaY < -50) cycleCharacter('up');
      }}
    >
      
      {/* ─────────────────────────────────────────────────────────────
          1. BACKGROUND & ARCHITECTURAL TYPOGRAPHY (IMAGE 1 STYLE)
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        
        {/* Subtle Industrial Blueprint Grid */}
        <div 
          className="absolute inset-0 opacity-40" 
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Diagonal Architectural Line */}
        <div className="absolute top-0 right-1/3 w-[1px] h-full bg-slate-300/80 -rotate-12 pointer-events-none" />

        {/* Micro-UI Technical Coordinate Headers */}
        <div className="absolute top-16 left-8 font-mono text-[9px] text-slate-500/80 tracking-widest uppercase">
          SEC 42-ALPHA : SYS.GRID 382.91 : 84.10
        </div>
        <div className="absolute top-16 right-8 font-mono text-[9px] text-slate-500/80 tracking-widest uppercase">
          TELEMETRY DOWNLINK AKTIF : FREQ 8.4 GHz
        </div>

        {/* Giant Cropped Silhouette Typography (Matching Reference 1 "BOY MADE") */}
        <div className="absolute top-8 left-[18%] text-[150px] sm:text-[240px] font-black tracking-tighter text-slate-900/[0.04] leading-none uppercase font-display select-none">
          ORBITA
        </div>
        <div className="absolute top-60 left-[26%] text-[130px] sm:text-[210px] font-black tracking-tighter text-amber-500/[0.055] leading-none uppercase font-display select-none">
          NOVA
        </div>
        <div className="absolute bottom-10 left-[45%] text-[110px] sm:text-[170px] font-black tracking-tighter text-slate-900/[0.03] leading-none uppercase font-display select-none">
          2026
        </div>

        {/* Precision Crosshairs in screen corners */}
        <div className="absolute top-3 left-4 text-slate-400 font-mono text-xs">+</div>
        <div className="absolute top-3 right-4 text-slate-400 font-mono text-xs">+</div>
        <div className="absolute bottom-3 left-4 text-slate-400 font-mono text-xs">+</div>
        <div className="absolute bottom-3 right-4 text-slate-400 font-mono text-xs">+</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP HIGH-CONTRAST BAR (PROFILE & RESIDUAL RESOURCES)
          ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-10 py-2.5 bg-[#141619] border-b border-black text-white shadow-md">
        
        {/* Left: Player ID & Level Tag */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-[#20242B] border border-amber-500/90 flex items-center justify-center font-bold text-amber-400 font-display text-base clip-chamfer-sm">
              {astronautName ? astronautName.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="absolute -bottom-1 -right-1 px-1 bg-amber-500 text-black font-black text-[8px] font-mono">
              26
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider font-display uppercase text-slate-100">
                {astronautName || 'KOMANDAN OPERASI'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/40">
                NASA FLIGHT OPS
              </span>
            </div>
            
            {/* Slim XP Bar */}
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-28 bg-black h-1 border border-slate-800">
                <div className="bg-amber-400 h-full w-[65%]" />
              </div>
              <span className="text-[9px] font-mono text-slate-400">1560 / 5000 EXP</span>
            </div>
          </div>
        </div>

        {/* Right: Currency Counters in High-Contrast Dark Blocks */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1D23] border border-slate-800 text-xs font-mono">
            <span className="text-amber-400 font-bold">$</span>
            <span className="font-bold text-slate-100 font-mono-tech">$65,000,000</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#1A1D23] border border-slate-800 text-xs font-mono">
            <span className="text-emerald-400">◆</span>
            <span className="font-bold text-slate-100 font-mono-tech">8,600 DP</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#1A1D23] border border-slate-800 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-100 font-mono-tech">940 SIG</span>
          </div>

          {/* Quick Audio & Display Toggles */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button 
              onClick={toggleAudio}
              className="p-1.5 bg-[#1A1D23] border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 transition-colors cursor-pointer"
              title="Toggle Audio SFX"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 bg-[#1A1D23] border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 transition-colors hidden sm:block cursor-pointer"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN TACTICAL ARENA (ASYMMETRIC COMPOSITION)
          ───────────────────────────────────────────────────────────── */}
      <main className="relative flex-1 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 py-3 z-20">
        
        {/* ─────────────────────────────────────────────────────────────
            2. LEFT NAVIGATION: FLOATING OPEN-LIST & ACTIVE EMBLEM
            ───────────────────────────────────────────────────────────── */}
        <div className="relative z-30 w-full lg:w-80 flex flex-col items-start gap-4">
          
          {/* Subtle Crew Switch Header */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 pb-1 border-b border-slate-300 w-full justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-500" />
              <span className="font-bold text-[10px] tracking-widest uppercase text-slate-700">CREW SELECTOR</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => cycleCharacter('up')} 
                className="p-0.5 bg-white border border-slate-300 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                title="Previous Crew"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1">0{activeCrewIndex + 1}/0{CREW_MEMBERS.length}</span>
              <button 
                onClick={() => cycleCharacter('down')} 
                className="p-0.5 bg-white border border-slate-300 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                title="Next Crew"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Open-List Navigation Items */}
          <nav className="flex flex-col gap-5 w-full pt-1" aria-label="Main system navigation">
            {MENU_ITEMS.map((item, idx) => {
              const isSelected = activeMenuIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => handleMenuClick(idx)}
                  className={`group relative flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                    isSelected ? 'translate-x-3' : 'hover:translate-x-1.5 opacity-75 hover:opacity-100'
                  }`}
                >
                  
                  {/* Active Golden Hexagon / Seal Emblem (Image 1 Style) */}
                  {isSelected ? (
                    <div className="relative shrink-0 flex items-center justify-center">
                      {/* Hexagon Amber Emblem */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 border border-black shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center clip-chamfer-sm">
                        <svg viewBox="0 0 40 40" className="w-6 h-6 stroke-black fill-none stroke-[2.2]">
                          <circle cx="20" cy="20" r="14" />
                          <circle cx="20" cy="20" r="6" fill="#000" />
                          <line x1="20" y1="2" x2="20" y2="8" />
                          <line x1="20" y1="32" x2="20" y2="38" />
                          <line x1="2" y1="20" x2="8" y2="20" />
                          <line x1="32" y1="20" x2="38" y2="20" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-3 h-3 border border-slate-400 rotate-45 shrink-0 group-hover:border-slate-900 transition-colors" />
                  )}

                  {/* Open Typography Menu Item */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`font-display font-black text-xl sm:text-2xl tracking-wider uppercase ${
                        isSelected ? 'text-slate-950 font-extrabold' : 'text-slate-800 group-hover:text-black'
                      }`}>
                        {item.label}
                      </span>
                      
                      {isSelected && (
                        <span className="px-2 py-0.2 bg-amber-500 text-black text-[10px] font-mono font-black clip-chamfer-sm">
                          SANCTUARY
                        </span>
                      )}
                    </div>

                    <span className={`text-[10px] font-mono tracking-widest uppercase ${
                      isSelected ? 'text-amber-700 font-bold' : 'text-slate-500'
                    }`}>
                      {item.code} : {item.sublabel}
                    </span>

                    {/* Horizontal Sharp Gold Line Running Under Active Text */}
                    {isSelected && (
                      <div className="mt-1 h-[2.5px] w-48 sm:w-56 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
                    )}
                  </div>

                </div>
              );
            })}
          </nav>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            CENTER: UNCONSTRAINED FULL-BODY CHARACTER STANDEE
            ───────────────────────────────────────────────────────────── */}
        <div className="relative flex-1 flex flex-col items-center justify-center my-auto min-h-[420px] lg:min-h-[560px]">
          
          {/* Active Character Illustration Standee (Free, Natural Standing) */}
          <div className="relative z-10 flex flex-col items-center animate-nova-float transition-all duration-300">
            <img
              src={currentCrew.image}
              alt={currentCrew.name}
              className="h-96 sm:h-[480px] lg:h-[540px] object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,0.22)]"
            />
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. RIGHT TACTICAL HUD: ASYMMETRIC GRID (IMAGE 1 REPLICA)
            ───────────────────────────────────────────────────────────── */}
        <div className="relative z-30 w-full lg:w-96 flex flex-col gap-3">
          
          {/* ── ROW A (Top Right): Circular Progress Dial + Active Mission Tag ── */}
          <div className="flex items-center gap-3">
            
            {/* Circular Progress Dial (62% Sync Rate / 嵌合度) */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
                <circle cx="45" cy="45" r="36" fill="none" stroke="#D1D5DB" strokeWidth="7" />
                <circle 
                  cx="45" cy="45" r="36" fill="none" stroke="#EAB308" strokeWidth="7" 
                  strokeDasharray="226" strokeDashoffset={226 - (226 * 0.62)}
                  strokeLinecap="butt"
                />
              </svg>
              <div className="absolute text-center leading-none">
                <span className="text-2xl font-black font-display text-slate-900">62%</span>
                <span className="block text-[8px] font-mono text-amber-600 font-bold tracking-wider uppercase">
                  SYNC RATE
                </span>
              </div>
            </div>

            {/* Mission Information Block with Chamfered Dark Header */}
            <div className="flex-1 bg-[#181A1F] border border-black text-white p-3 clip-chamfer-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400" />
                  <span className="font-display font-bold text-xs tracking-wider text-amber-400 uppercase">
                    CASE INVESTIGATION
                  </span>
                </div>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold">
                  IN PROGRESS
                </span>
              </div>

              <div className="text-xs font-bold font-display text-slate-100 uppercase tracking-wide">
                KASUS 01 : ASTER-9
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                T+03:15 : FASE BAYANGAN GELAP
              </div>
            </div>

          </div>

          {/* ── ROW B (Middle Right): Wide Dossier Banner Card (任务 / MISSION) ── */}
          <div 
            onClick={() => setShowMissionModal(true)}
            className="group relative bg-[#181A1F] border border-black hover:border-amber-500 text-white p-4 clip-chamfer-sm cursor-pointer shadow-lg transition-all"
          >
            {/* Background Texture / Subtle Mission Emblem */}
            <div className="absolute top-2 right-4 opacity-15 pointer-events-none font-display font-black text-6xl text-slate-500">
              01
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">
                  FASE REKAYASA AKTIF
                </div>
                <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider uppercase group-hover:text-amber-400 transition-colors">
                  MISI
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Technical Index Line at Bottom Right of Banner */}
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>TARGET : ASTEROID BENNU</span>
              <span className="text-amber-400 font-bold">BAB 01 : FORENSIK UMBRA</span>
            </div>
          </div>

          {/* ── ROW C (Bottom Right): 2 Square Mode Cards (05 改造 / 出征 DEPLOY) ── */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Square Card 1: 05 REFIT / TELEMETRY LAB */}
            <div 
              onClick={() => {
                setPhase('redesign');
                setCurrentView('mission');
              }}
              className="group relative bg-[#141619] border border-black hover:border-slate-500 text-white p-3.5 h-36 flex flex-col justify-between clip-chamfer-sm cursor-pointer shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 font-bold">05</span>
                <Wrench className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
              </div>

              {/* Giant White Stamped Typography */}
              <div>
                <div className="font-display font-black text-2xl sm:text-3xl text-white leading-none tracking-tight uppercase group-hover:text-amber-400 transition-colors">
                  REFIT
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                  TELEMETRY LAB
                </div>
              </div>
            </div>

            {/* Square Card 2: 出征 LAUNCH / DEPLOY (Primary Action Card) */}
            <div 
              onClick={onResumeGame}
              className="group relative bg-amber-500 border border-amber-600 hover:bg-amber-400 text-black p-3.5 h-36 flex flex-col justify-between clip-chamfer-sm cursor-pointer shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider">DEPLOY</span>
                <span className="w-2.5 h-2.5 bg-black" />
              </div>

              {/* Giant Stamped Typography (出征 Style) */}
              <div>
                <div className="font-display font-black text-3xl sm:text-4xl text-black leading-none tracking-tight uppercase">
                  LUNCURKAN
                </div>
                <div className="text-[10px] font-mono font-bold text-black/80 mt-1 uppercase tracking-wider">
                  LANJUTKAN MISI
                </div>
              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. QUICK DOCK POJOK KANAN BAWAH (4 ICONS + MINIMAL LABELS)
              ───────────────────────────────────────────────────────────── */}
          <div className="bg-[#141619] border border-black text-slate-300 px-3 py-2 flex items-center justify-between clip-chamfer-sm">
            
            {/* Dock Item 1: Crew */}
            <button 
              onClick={() => setShowCharacterModal(true)}
              className="flex items-center gap-1 text-[10px] font-mono text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>KRU</span>
            </button>

            <div className="w-[1px] h-3 bg-slate-700" />

            {/* Dock Item 2: Inventory / Refit */}
            <button 
              onClick={() => {
                setPhase('redesign');
                setCurrentView('mission');
              }}
              className="flex items-center gap-1 text-[10px] font-mono text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>GUDANG</span>
            </button>

            <div className="w-[1px] h-3 bg-slate-700" />

            {/* Dock Item 3: Database / Missions */}
            <button 
              onClick={() => setShowMissionModal(true)}
              className="flex items-center gap-1 text-[10px] font-mono text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>DATA</span>
            </button>

            <div className="w-[1px] h-3 bg-slate-700" />

            {/* Dock Item 4: Missions / Citations */}
            <button 
              onClick={() => setShowAchievementModal(true)}
              className="flex items-center gap-1 text-[10px] font-mono text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>PRESTASI</span>
            </button>

          </div>

        </div>

      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. CHARACTER BIO (BOTTOM LEFT CORNER OPEN LAYOUT)
          ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-30 px-6 sm:px-12 pb-5 flex items-end justify-between pointer-events-none">
        
        {/* Open Clean Bio Section on Bottom-Left */}
        <div className="max-w-md pointer-events-auto space-y-1">
          <div className="flex items-center gap-2.5">
            {/* Thick Vertical Accent Bar */}
            <div className="w-1.5 h-8 bg-amber-500 shrink-0" />
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-xl sm:text-2xl text-slate-950 uppercase tracking-wide leading-none">
                  {currentCrew.name}
                </h3>
                <span className="text-xs font-mono font-bold text-amber-600 uppercase">
                  {currentCrew.callsign}
                </span>
                <span className="px-1.5 py-0.2 bg-slate-900 text-amber-400 text-[9px] font-mono font-black clip-chamfer-sm">
                  {currentCrew.rarity}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                {currentCrew.roleTitle} : {currentCrew.department}
              </div>
            </div>
          </div>

          {/* Clean 2-3 Line Description */}
          <p className="text-xs font-sans text-slate-700 font-medium leading-relaxed pl-4 line-clamp-2">
            {currentCrew.bio}
          </p>
        </div>

        {/* Global NASA Space Apps Tagline on Bottom Center-Right */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>NASA SPACE APPS CHALLENGE 2026 : ORBITA NOVA</span>
        </div>

      </footer>

      {/* ─────────────────────────────────────────────────────────────
          MODAL DIALOGS (MISSION DOSSIERS & CHARACTER ROSTER)
          ───────────────────────────────────────────────────────────── */}
      {showMissionModal && (
        <MissionSelector 
          onBack={() => setShowMissionModal(false)}
          onSelectMission={() => {
            setShowMissionModal(false);
            onResumeGame();
          }}
        />
      )}

      {showCharacterModal && (
        <CharacterRoster 
          onBack={() => setShowCharacterModal(false)}
          onSelectRole={() => {
            setShowCharacterModal(false);
            sounds.playClick(900);
          }}
          onOpenCoopRoom={() => {
            setShowCharacterModal(false);
            setShowCoopModal(true);
          }}
        />
      )}

      {/* 3-Operator Multiplayer Co-op Room */}
      {showCoopModal && (
        <CoopRoomLobby
          astronautName={astronautName || 'Mister'}
          onBack={() => setShowCoopModal(false)}
          onLaunchCoopMission={(_selectedRole) => {
            setShowCoopModal(false);
            setPhase('briefing');
            setCurrentView('mission');
          }}
        />
      )}

      {/* Settings Modal Dialog */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 bg-[#141619] border border-amber-500/60 text-white space-y-5 clip-chamfer-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold font-display text-lg tracking-wider text-white">SPESIFIKASI SISTEM</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer">
                TUTUP
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between p-3 bg-[#1C1F24] border border-slate-800">
                <span>Audio Prosedural Web Audio</span>
                <button onClick={toggleAudio} className="px-3 py-1 bg-amber-500 text-black font-bold cursor-pointer">
                  {audioEnabled ? 'AKTIF' : 'SENYAP'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#1C1F24] border border-slate-800">
                <span>Layar Penuh Layar Perangkat</span>
                <button onClick={toggleFullscreen} className="px-3 py-1 bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer">
                  TOGEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Modal Dialog */}
      {showAchievementModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 bg-[#141619] border border-amber-500/60 text-white space-y-5 clip-chamfer-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold font-display text-lg tracking-wider text-white">ARSIP PRESTASI</h3>
              <button onClick={() => setShowAchievementModal(false)} className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer">
                TUTUP
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#1C1F24] border border-amber-500/40 flex items-center gap-3">
                <span className="w-3 h-3 bg-amber-400 shrink-0" />
                <div>
                  <div className="font-bold font-display text-white text-sm">FORENSIK PERDANA</div>
                  <div className="text-[11px] text-slate-400 font-mono">Selesaikan investigasi telemetri kotak hitam ASTER-9.</div>
                </div>
              </div>
              <div className="p-3 bg-[#1C1F24] border border-slate-800 flex items-center gap-3 opacity-60">
                <span className="w-3 h-3 bg-slate-600 shrink-0" />
                <div>
                  <div className="font-bold font-display text-slate-300 text-sm">PENYINTAS GERHANA</div>
                  <div className="text-[11px] text-slate-500 font-mono">Rancang ulang satelit dengan daya baterai stabil di bayangan.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
