import React, { useState } from 'react';
import { 
  Compass, 
  Users, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Wrench,
  Radio,
  Repeat,
  Mail,
  Settings,
  ChevronRight,
  Sparkles,
  Rocket,
  Globe,
  GraduationCap
} from 'lucide-react';
import { CREW_MEMBERS, getLocalizedCrew } from '../../data/crewData';
import { MissionSelector } from './MissionSelector';
import { CharacterRoster } from './CharacterRoster';
import { CoopRoomLobby } from './CoopRoomLobby';
import { useMissionStore } from '../../store/useMissionStore';
import { sounds } from '../../utils/soundEngine';
import { useTranslation } from '../../i18n';
import { FEATURES } from '../../config/features';

interface MainLobbyProps {
  onStartNewGame: () => void;
  onResumeGame: () => void;
  onOpenLeaderboard?: () => void;
}

export const MainLobby: React.FC<MainLobbyProps> = ({ onStartNewGame, onResumeGame, onOpenLeaderboard }) => {
  const { 
    astronautName, 
    audioEnabled, 
    toggleAudio, 
    setPhase, 
    setCurrentView,
    hypothesisSubmitted,
    pinnedEvidences,
    simulationResult
  } = useMissionStore();
  const { language, setLanguage } = useTranslation();

  const [activeCrewIndex, setActiveCrewIndex] = useState<number>(0);  // Default: NOVA
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false);
  const [showCharacterModal, setShowCharacterModal] = useState<boolean>(false);
  const [showCoopModal, setShowCoopModal] = useState<boolean>(false);
  const [showAchievementModal, setShowAchievementModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const currentCrew = getLocalizedCrew(CREW_MEMBERS[activeCrewIndex] || CREW_MEMBERS[0], language);

  const handleSmartResume = () => {
    sounds.playClick(850);
    if (simulationResult) {
      setPhase('debrief');
    } else if (hypothesisSubmitted) {
      setPhase('redesign');
    } else if (pinnedEvidences.length > 0) {
      setPhase('root_cause');
    } else {
      setPhase('briefing');
    }
    setCurrentView('mission');
  };

  const handleOpenGudang = () => {
    // antislop: Per final direction, Hangar is modular satellite refit accessible anytime from Hub
    sounds.playClick(700);
    setPhase('redesign');
    setCurrentView('mission');
  };

  // Cycling character with quick switch button
  const cycleCharacter = () => {
    sounds.playClick(650);
    setActiveCrewIndex((prev) => (prev + 1) % CREW_MEMBERS.length);
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
      className="fixed inset-0 z-40 flex flex-col justify-between overflow-hidden select-none bg-[#0B0E14] text-white"
    >
      
      {/* =========================================================================
          1. CINEMATIC SCI-FI COMMAND DECK & HANGAR BACKGROUND (MATCHING IMAGE 2)
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        
        {/* Deep Industrial Spaceport Atmosphere / Rainy Foggy Hangar Bay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #162032 0%, #0d1422 45%, #06090f 90%)',
          }}
        />

        {/* Panoramic Observation Window Frame looking at Spaceport Gantries */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <svg viewBox="0 0 1920 1080" className="w-full h-full object-cover">
            {/* Window vertical mullions */}
            <line x1="450" y1="0" x2="380" y2="1080" stroke="#38bdf8" strokeWidth="2" opacity="0.3" />
            <line x1="960" y1="0" x2="960" y2="1080" stroke="#38bdf8" strokeWidth="3" opacity="0.25" />
            <line x1="1470" y1="0" x2="1540" y2="1080" stroke="#38bdf8" strokeWidth="2" opacity="0.3" />
            {/* Distant orbital crane & launch gantry silhouettes */}
            <path d="M 1200 450 L 1260 220 L 1320 220 L 1380 450 Z" fill="#0f172a" opacity="0.6" />
            <line x1="1290" y1="220" x2="1290" y2="580" stroke="#1e293b" strokeWidth="4" />
            <line x1="1100" y1="360" x2="1500" y2="360" stroke="#1e293b" strokeWidth="2" />
            {/* Blinking signal beacon on gantry */}
            <circle cx="1290" cy="220" r="3" fill="#ef4444" className="animate-ping" />
          </svg>
        </div>

        {/* Warm Overhead Industrial Strip Lights & Ceiling Trusses (matching Image 2) */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1E2638] via-[#101522]/80 to-transparent">
          {/* Overhead industrial warm fluorescent beam */}
          <div className="absolute top-0 left-1/4 right-1/4 h-3 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent blur-sm" />
          <div className="absolute top-1 left-1/3 right-1/3 h-1 bg-amber-100/70 shadow-[0_0_20px_#fef08a]" />
        </div>

        {/* Polished Hangar Deck Floor with Specular Floor Reflections */}
        <div 
          className="absolute bottom-0 inset-x-0 h-96"
          style={{
            background: 'linear-gradient(to top, #06090e 0%, #0d121c 50%, transparent 100%)',
          }}
        >
          {/* Subtle grid lines on deck floor */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(56,189,248,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.2) 1px, transparent 1px)',
              backgroundSize: '80px 40px',
              transform: 'perspective(400px) rotateX(60deg) scale(2)',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Soft floor amber reflection under character */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-28 bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        {/* Atmospheric Floating Dust / Cyber Fog */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#06090f]/20 to-[#06090f]/60 pointer-events-none" />

        {/* Technical Coordinate Micro-Labels */}
        <div className="absolute bottom-4 left-6 font-mono text-[9px] text-slate-500/80 tracking-widest uppercase">
          DSN COMMAND BRIDGE : SECTOR 07 : HANGAR BAY 4
        </div>
      </div>


      {/* =========================================================================
          2. TOP HIGH-CONTRAST TACTICAL HUD (MATCHING REFERENCE IMAGE 2)
          ========================================================================= */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-3 bg-[#0d1117]/80 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
        
        {/* Left: Player Profile Badge with Chamfered Frame */}
        <div className="flex items-center gap-3">
          {/* Avatar Box with Angled Frame (matching Image 2 top-left) */}
          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 bg-[#14171E] border-2 border-orange-500 flex items-center justify-center font-bold text-orange-400 font-display text-lg clip-chamfer-sm shadow-md shadow-orange-500/20">
              {astronautName ? astronautName.charAt(0).toUpperCase() : 'M'}
            </div>
            {/* Level Tag (e.g. Lv.26 in gold) */}
            <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-orange-500 text-black font-black text-[9px] font-mono clip-chamfer-sm">
              Lv.26
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider font-display uppercase text-white">
                {astronautName || 'Mister'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-orange-500/15 text-orange-400 border border-orange-500/40 font-bold clip-chamfer-sm">
                NASA INVESTIGATOR
              </span>
            </div>
            
            {/* EXP Progress Bar with Numbers */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 bg-black h-1.5 border border-black overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 h-full w-[65%]" />
              </div>
              <span className="text-[9px] font-mono text-slate-300 font-bold">1560 / 5000</span>
            </div>
          </div>
        </div>

        {/* Right: Currency Counters in Dark Rounded Pills (matching Image 2 top-right) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Credit / Funds Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#14171E] border border-black rounded-full text-xs font-mono shadow-inner">
            <span className="text-orange-400 font-bold">$</span>
            <span className="font-bold text-slate-100 font-mono-tech">$65,000,000</span>
            <span className="text-slate-400 hover:text-white cursor-pointer ml-1 font-bold">+</span>
          </div>

          {/* Energy / Stamina Counter */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#14171E] border border-black rounded-full text-xs font-mono shadow-inner">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[9px] font-bold">⚡</span>
            <span className="font-bold text-slate-100 font-mono-tech">586/120</span>
            <span className="text-slate-400 hover:text-white cursor-pointer ml-1 font-bold">+</span>
          </div>

          {/* Signal / Tickets Counter */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#14171E] border border-black rounded-full text-xs font-mono shadow-inner">
            <Radio className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-bold text-slate-100 font-mono-tech">165</span>
            <span className="text-slate-400 hover:text-white cursor-pointer ml-1 font-bold">+</span>
          </div>

          {/* Mail icon with notification badge */}
          <div 
            onClick={() => setShowAchievementModal(true)}
            className="relative p-2 bg-[#14171E] border border-black rounded text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Pesan & Laporan"
          >
            <Mail className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
          </div>

          {/* Settings cog */}
          <div 
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-[#14171E] border border-black rounded text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </div>

          {/* Audio, Language & Fullscreen buttons */}
          <div className="hidden sm:flex items-center gap-1.5 pl-1 border-l border-black">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              title={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-[#14171E] border border-black hover:border-orange-500 rounded text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span className={language === 'en' ? 'text-orange-400' : 'text-slate-500'}>EN</span>
              <span className="text-slate-600">/</span>
              <span className={language === 'id' ? 'text-orange-400' : 'text-slate-500'}>ID</span>
            </button>

            <button 
              onClick={toggleAudio}
              className="p-2 bg-[#14171E] border border-black rounded text-slate-300 hover:text-orange-400 transition-colors cursor-pointer"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 bg-[#14171E] border border-black rounded text-slate-300 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </header>

      {/* =========================================================================
          3. MAIN ARENA: CENTER CHARACTER & ASYMMETRIC HUD (IMAGE 2 REPLICA)
          ========================================================================= */}
      <main className="relative flex-1 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 py-2 z-20">
        
        {/* ── LEFT NAVIGATION: Clean Vertical Menu (matching Image 2 Left Menu) ── */}
        <div className="relative z-30 w-full lg:w-72 flex flex-col justify-between self-stretch py-2">
          
          {/* Vertical Menu Items */}
          <div className="space-y-3.5 pt-2">
            {[
              { id: 'new_game', title: language === 'en' ? 'NEW MISSION' : 'GAME BARU', subtitle: language === 'en' ? 'CASE DOSSIER' : 'KASUS PERDANA', icon: Sparkles, onClick: () => onStartNewGame() },
              { id: 'missions', title: language === 'en' ? 'SPACE MAP' : 'PETA MISI', subtitle: language === 'en' ? 'EPISODES 01-06' : 'EPISODE 01-06', icon: Compass, onClick: () => {
                if (FEATURES.spaceMap) {
                  setCurrentView('map');
                } else {
                  setShowMissionModal(true);
                }
              }},
              { id: 'academy', title: language === 'en' ? 'ACADEMY' : 'AKADEMI', subtitle: language === 'en' ? '6 STUDY MODULES' : '6 MODUL PEMBELAJARAN', icon: GraduationCap, onClick: () => setCurrentView('academy') },
              { id: 'events', title: language === 'en' ? 'LEADERBOARD' : 'PERINGKAT', subtitle: language === 'en' ? 'WEEKLY RANKING' : 'TANTANGAN MINGGUAN', icon: Trophy, onClick: () => {
                if (FEATURES.leaderboardLocal && onOpenLeaderboard) {
                  onOpenLeaderboard();
                } else {
                  setShowAchievementModal(true);
                }
              }},
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className="group flex items-center gap-3 p-2.5 bg-[#14171E]/90 hover:bg-[#1E232E] border border-black border-l-4 border-l-orange-500 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:translate-x-1.5 shadow-lg clip-chamfer-sm"
                >
                  <div className="p-2 bg-[#0B0D12] text-orange-400 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-display font-black text-base text-white tracking-wider group-hover:text-orange-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 tracking-wider">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Left Banner Ad / Case Dossier with Character Switch */}
          <div className="mt-auto pt-4">
            <div className="p-3.5 bg-[#14171E]/95 border border-black border-l-4 border-l-orange-500 backdrop-blur-md clip-chamfer-sm shadow-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-orange-400 tracking-widest uppercase">
                  KASUS AKTIF : ASTER-9
                </span>
                <button
                  onClick={cycleCharacter}
                  className="flex items-center gap-1 px-2 py-0.5 bg-[#1C202A] hover:bg-orange-500 hover:text-black border border-black text-orange-400 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer"
                  title="Ganti Karakter Tampilan"
                >
                  <Repeat className="w-3 h-3" />
                  <span>GANTI</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-1 h-7 bg-orange-500 shrink-0" />
                <div>
                  <div className="font-display font-bold text-sm text-white uppercase leading-tight">
                    {currentCrew.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    {currentCrew.callsign} • {currentCrew.roleTitle}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── CENTER: Hero Standee Character Standing on Floor ── */}
        <div className="relative flex-1 flex flex-col items-center justify-center my-auto min-h-[420px] lg:min-h-[580px] pointer-events-none">
          
          {/* Active Character Full Illustration Standee */}
          <div className="relative z-10 flex flex-col items-center animate-nova-float transition-all duration-300">
            <img
              src={currentCrew.image}
              alt={currentCrew.name}
              className="h-[380px] sm:h-[480px] lg:h-[540px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Character Footing Ambient Ground Shadow */}
          <div className="w-64 h-8 bg-black/70 rounded-full blur-xl -mt-6" />

        </div>

        {/* ── RIGHT ASYMMETRIC COMMAND BLOCK ── */}
        <div className="relative z-30 w-full lg:w-96 flex flex-col gap-3.5">
          
          {/* Top Rank Badge */}
          <div className="flex items-center justify-end">
            <div className="px-3 py-1 bg-[#14171E] border border-black text-orange-400 text-xs font-mono font-bold flex items-center gap-2 clip-chamfer-sm shadow-md">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              <span>{language === 'en' ? 'ORBITA NOVA : ACTIVE CADET' : 'ORBITA NOVA : KADET AKTIF'}</span>
            </div>
          </div>

          {/* Main Incident Dossier & Primary DEPLOY Bar */}
          <div className="bg-[#14171E]/95 border border-black p-4 clip-chamfer-md shadow-2xl backdrop-blur-md space-y-3">
            
            {/* Progres Tag */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-black/80 pb-2">
              <span className="text-slate-400">{language === 'en' ? 'ACTIVE PROGRESS : CASE 01' : 'PROGRES AKTIF : KASUS 01'}</span>
              <span className="text-orange-400 font-bold">{language === 'en' ? 'FORENSIC PHASE' : 'FASE FORENSIK'}</span>
            </div>

            {/* Target Title & Insignia */}
            <div className="flex items-center gap-3 py-1">
              <div className="w-12 h-12 bg-black border border-orange-500/60 rounded flex items-center justify-center text-orange-400 text-xl font-bold shrink-0 shadow-lg">
                ☄️
              </div>
              <div>
                <h3 className="font-display font-black text-base text-white uppercase tracking-wide">
                  ASTER-9 : UMBRA FORENSICS
                </h3>
                <p className="text-[11px] text-slate-300 font-sans leading-tight mt-0.5">
                  {language === 'en' 
                    ? 'Spacecraft telemetry lost entering asteroid eclipse shadow.' 
                    : 'Wahana hilang kontak saat memasuki bayangan gerhana asteroid.'}
                </p>
              </div>
            </div>

            {/* Prominent Action Bar (Orange Tactical with Black Outline) */}
            <button
              onClick={handleSmartResume}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-black font-display font-black text-sm tracking-wider flex items-center justify-between cursor-pointer shadow-xl transition-all hover:scale-[1.01] border border-black clip-chamfer-sm"
            >
              <div className="text-left leading-tight">
                <div className="text-base font-black uppercase text-black">
                  {language === 'en' ? 'LAUNCH' : 'LUNCURKAN'}
                </div>
                <div className="text-[9px] font-mono text-black/90 font-bold tracking-widest uppercase">
                  {language === 'en' ? 'COMMENCE INVESTIGATION' : 'MULAI INVESTIGASI'}
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-black" />
            </button>
          </div>

          {/* Tactical Action Grid: 2-Column Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Tile 1: SKUAD AWAK (Opens Character Album) */}
            <div 
              onClick={() => setShowCharacterModal(true)}
              className="group p-3 bg-[#14171E] border border-black hover:border-orange-500 rounded cursor-pointer transition-all hover:scale-[1.02] shadow-md flex items-center gap-3"
            >
              <div className="p-2 bg-[#0B0D12] group-hover:bg-orange-500 group-hover:text-black text-orange-400 rounded transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-xs text-white uppercase tracking-wide group-hover:text-orange-400 transition-colors">
                  {language === 'en' ? 'CREW' : 'AWAK'}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {language === 'en' ? 'SPECIALIST ALBUM' : 'ALBUM SPESIALIS'}
                </div>
              </div>
            </div>

            {/* Tile 2: GUDANG / HANGAR (Accessible anytime per final direction) */}
            <div 
              onClick={handleOpenGudang}
              className="group p-3 bg-[#14171E] border border-black hover:border-orange-500 rounded cursor-pointer transition-all hover:scale-[1.02] shadow-md flex items-center gap-3 relative"
            >
              <div className="p-2 bg-[#0B0D12] group-hover:bg-orange-500 group-hover:text-black text-orange-400 rounded transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-xs text-white uppercase tracking-wide group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <span>{language === 'en' ? 'HANGAR' : 'GUDANG'}</span>
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {language === 'en' ? 'SATELLITE REFIT' : 'REKAYASA MODUL'}
                </div>
              </div>
            </div>

            {/* Tile 3: ACADEMY (Space Learning Center) */}
            <div 
              onClick={() => setCurrentView('academy')}
              className="group p-3 bg-[#14171E] border border-black hover:border-orange-500 rounded cursor-pointer transition-all hover:scale-[1.02] shadow-md flex items-center gap-3"
            >
              <div className="p-2 bg-[#0B0D12] group-hover:bg-orange-500 group-hover:text-black text-orange-400 rounded transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-xs text-white uppercase tracking-wide group-hover:text-orange-400 transition-colors">
                  {language === 'en' ? 'ACADEMY' : 'AKADEMI'}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {language === 'en' ? 'LEARNING CENTER' : 'PUSAT BELAJAR'}
                </div>
              </div>
            </div>

            {/* Tile 4: RUANG BERSAMA (Co-op Last Stand) */}
            <div 
              onClick={() => setCurrentView('coop')}
              className="group p-3 bg-[#14171E] border border-black hover:border-orange-500 rounded cursor-pointer transition-all hover:scale-[1.02] shadow-md flex items-center gap-3"
            >
              <div className="p-2 bg-[#0B0D12] group-hover:bg-orange-500 group-hover:text-black text-orange-400 rounded transition-colors">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-xs text-white uppercase tracking-wide group-hover:text-orange-400 transition-colors">
                  CO-OP
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {language === 'en' ? 'LAST STAND' : 'RUANG BERSAMA'}
                </div>
              </div>
            </div>

          </div>

          {/* Quick Bottom Dock Bar */}
          <div className="bg-[#14171E] border border-black text-slate-300 px-3 py-2 flex items-center justify-between rounded clip-chamfer-sm text-[10px] font-mono">
            <button 
              onClick={() => setShowCharacterModal(true)}
              className="flex items-center gap-1 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>KRU</span>
            </button>
            <div className="w-[1px] h-3 bg-slate-700" />
            <button 
              onClick={() => {
                setPhase('redesign');
                setCurrentView('mission');
              }}
              className="flex items-center gap-1 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>MODUL</span>
            </button>
            <div className="w-[1px] h-3 bg-slate-700" />
            <button 
              onClick={() => setShowMissionModal(true)}
              className="flex items-center gap-1 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>BERKAS</span>
            </button>
            <div className="w-[1px] h-3 bg-slate-700" />
            <button 
              onClick={() => setShowAchievementModal(true)}
              className="flex items-center gap-1 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>PRESTASI</span>
            </button>
          </div>

        </div>

      </main>


      {/* =========================================================================
          MODAL DIALOGS (MISSION DOSSIERS, CHARACTER ALBUM, CO-OP, ETC.)
          ========================================================================= */}
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
            setCurrentView('coop');
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 bg-[#14171e] border border-cyan-500/60 text-white space-y-5 clip-chamfer-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold font-display text-lg tracking-wider text-white">SPESIFIKASI SISTEM</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer">
                TUTUP
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between p-3 bg-[#1C2028] border border-slate-800">
                <span>Audio Prosedural Web Audio</span>
                <button onClick={toggleAudio} className="px-3 py-1 bg-cyan-500 text-black font-bold cursor-pointer rounded">
                  {audioEnabled ? 'AKTIF' : 'SENYAP'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#1C2028] border border-slate-800">
                <span>Mode Tampilan Layar Penuh</span>
                <button onClick={toggleFullscreen} className="px-3 py-1 bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer rounded">
                  TOGEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Modal Dialog */}
      {showAchievementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 bg-[#14171e] border border-amber-500/60 text-white space-y-5 clip-chamfer-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold font-display text-lg tracking-wider text-white">ARSIP PRESTASI</h3>
              <button onClick={() => setShowAchievementModal(false)} className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer">
                TUTUP
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#1C2028] border border-amber-500/40 flex items-center gap-3">
                <span className="w-3 h-3 bg-amber-400 shrink-0" />
                <div>
                  <div className="font-bold font-display text-white text-sm">FORENSIK PERDANA</div>
                  <div className="text-[11px] text-slate-400 font-mono">Selesaikan investigasi telemetri kotak hitam ASTER-9.</div>
                </div>
              </div>
              <div className="p-3 bg-[#1C2028] border border-slate-800 flex items-center gap-3 opacity-60">
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
