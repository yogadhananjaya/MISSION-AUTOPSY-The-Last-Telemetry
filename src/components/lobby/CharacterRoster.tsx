import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  Shield, 
  Zap, 
  Activity, 
  UserCheck, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Mail,
  Settings,
  Grid,
  Globe
} from 'lucide-react';
import { CREW_MEMBERS, getLocalizedCrew, type CrewMember } from '../../data/crewData';
import { sounds } from '../../utils/soundEngine';
import { useTranslation } from '../../i18n';

interface CharacterRosterProps {
  onBack: () => void;
  onSelectRole?: (roleId: string) => void;
  onOpenCoopRoom?: () => void;
}

export const CharacterRoster: React.FC<CharacterRosterProps> = ({ onBack, onSelectRole, onOpenCoopRoom }) => {
  const { language, setLanguage } = useTranslation();

  // View mode: 'album' (Grid view matching Image 1) or 'detail' (Full specification view)
  const [viewMode, setViewMode] = useState<'album' | 'detail'>('album');
  const [selectedCrewId, setSelectedCrewId] = useState<string>('sarah');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'default' | 'level' | 'rarity'>('default');
  const [activeTab, setActiveTab] = useState<'status' | 'skills' | 'equipment' | 'breakthrough'>('status');

  const rawSelectedIndex = CREW_MEMBERS.findIndex(c => c.id === selectedCrewId);
  const rawSelectedCrew = CREW_MEMBERS[rawSelectedIndex] || CREW_MEMBERS[0];
  const selectedCrew = getLocalizedCrew(rawSelectedCrew, language);

  // 4 Core Role Divisions (Essential NASA Disciplines)
  const DIVISIONS = [
    { id: 'ALL', label: language === 'en' ? 'ALL CREW' : 'SEMUA AWAK', icon: Grid },
    { id: 'KOMANDO', label: language === 'en' ? 'COMMAND' : 'KOMANDO', icon: Award },
    { id: 'TELEMETRI', label: language === 'en' ? 'TELEMETRY' : 'TELEMETRI', icon: Activity },
    { id: 'DAYA EPS', label: language === 'en' ? 'DAYA EPS' : 'DAYA EPS', icon: Zap },
    { id: 'REKAYASA', label: language === 'en' ? 'ENGINEERING' : 'REKAYASA', icon: Shield },
  ];

  // Filtered and sorted crew members
  const filteredCrew = CREW_MEMBERS.map(c => getLocalizedCrew(c, language)).filter(c => {
    if (selectedDivision === 'ALL') return true;
    return c.divisionCode === selectedDivision;
  }).sort((a, b) => {
    if (sortOrder === 'level') return b.level - a.level;
    if (sortOrder === 'rarity') return (b.rarity === 'SSR' ? 2 : 1) - (a.rarity === 'SSR' ? 2 : 1);
    return 0; // Default: maintains exact array order
  });

  const handleCardClick = (crew: CrewMember) => {
    sounds.playClick(750);
    setSelectedCrewId(crew.id);
    setViewMode('detail');
  };

  const handlePrevCrew = () => {
    sounds.playClick(600);
    const newIdx = (rawSelectedIndex - 1 + CREW_MEMBERS.length) % CREW_MEMBERS.length;
    setSelectedCrewId(CREW_MEMBERS[newIdx].id);
  };

  const handleNextCrew = () => {
    sounds.playClick(600);
    const newIdx = (rawSelectedIndex + 1) % CREW_MEMBERS.length;
    setSelectedCrewId(CREW_MEMBERS[newIdx].id);
  };

  const handleAssignRole = () => {
    sounds.playClick(900);
    if (onSelectRole) {
      onSelectRole(selectedCrew.role);
    }
  };

  const toggleSort = () => {
    sounds.playClick(500);
    setSortOrder(prev => prev === 'default' ? 'level' : prev === 'level' ? 'rarity' : 'default');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1116] flex flex-col overflow-hidden text-white select-none">
      
      {/* =========================================================================
          TOP NAVIGATION BAR (MATCHING REFERENCE IMAGE 1)
          ========================================================================= */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-2.5 bg-[#14171D] border-b border-black text-white shadow-lg">
        {/* Left: Back Button */}
        <div className="flex items-center gap-3">
          {viewMode === 'detail' ? (
            <button 
              onClick={() => { sounds.playClick(550); setViewMode('album'); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1C2027] border border-slate-700 text-xs font-mono text-amber-400 hover:text-white hover:border-amber-400 transition-colors cursor-pointer clip-chamfer-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'BACK TO ALBUM' : 'KEMBALI KE ALBUM'}</span>
            </button>
          ) : (
            <button 
              onClick={() => { sounds.playClick(600); onBack(); }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1C2027] border border-slate-700 text-xs font-mono text-amber-400 hover:text-white hover:border-amber-400 transition-colors cursor-pointer clip-chamfer-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'BACK' : 'KEMBALI'}</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="font-display font-black text-sm tracking-wider uppercase text-slate-100">
              {viewMode === 'album' 
                ? (language === 'en' ? 'CREW ARCHIVE ALBUM' : 'ALBUM ARSIP AWAK') 
                : `${language === 'en' ? 'SPECIALIST' : 'DETAIL AWAK'} : ${selectedCrew.name}`}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30">
              TOTAL : {CREW_MEMBERS.length} {language === 'en' ? 'SPECIALISTS' : 'SPESIALIS'}
            </span>
          </div>
        </div>

        {/* Center / Right: Resource Indicators in Tactical Rounded Pills (matching Image 1) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Credit / Funds Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1E232B] border border-black rounded-full text-xs font-mono">
            <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold">⚡</span>
            <span className="font-bold text-slate-100 font-mono-tech">356,000</span>
            <span className="text-slate-400 hover:text-white cursor-pointer ml-1 font-bold">+</span>
          </div>

          {/* Energy / Serum Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#1E232B] border border-black rounded-full text-xs font-mono">
            <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px]">🧪</span>
            <span className="font-bold text-slate-100 font-mono-tech">150/300</span>
            <span className="text-slate-400 hover:text-white cursor-pointer ml-1 font-bold">+</span>
          </div>

          {/* Ticket / Signal Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#1E232B] border border-black rounded-full text-xs font-mono">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">🎫</span>
            <span className="font-bold text-slate-100 font-mono-tech">30</span>
            <span className="text-slate-400 hover:text-white cursor-pointer ml-1 font-bold">+</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            title={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#1C2027] border border-black hover:border-amber-400 rounded text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className={language === 'en' ? 'text-amber-400' : 'text-slate-500'}>EN</span>
            <span className="text-slate-600">/</span>
            <span className={language === 'id' ? 'text-amber-400' : 'text-slate-500'}>ID</span>
          </button>

          {/* Mail icon with unread indicator */}
          <div className="relative p-1.5 bg-[#1C2027] border border-black rounded text-slate-300 hover:text-white cursor-pointer ml-1">
            <Mail className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          </div>

          {/* Settings cog */}
          <div className="p-1.5 bg-[#1C2027] border border-black rounded text-slate-300 hover:text-white cursor-pointer">
            <Settings className="w-4 h-4" />
          </div>
        </div>
      </header>


      {/* =========================================================================
          VIEW MODE 1: CHARACTER ALBUM GRID (MATCHING REFERENCE IMAGE 1)
          ========================================================================= */}
      {viewMode === 'album' && (
        <div className="flex-1 flex overflow-hidden p-3 sm:p-5 gap-4 blueprint-grid-dark">
          
          {/* ── LEFT SIDEBAR: Division Filters (matching Image 1 Left Menu) ── */}
          <aside className="w-40 sm:w-48 shrink-0 flex flex-col justify-between py-1 z-10">
            {/* Division Category Buttons */}
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
              {DIVISIONS.map(div => {
                const Icon = div.icon;
                const isActive = selectedDivision === div.id;
                return (
                  <button
                    key={div.id}
                    onClick={() => { sounds.playClick(600); setSelectedDivision(div.id); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-bold transition-all cursor-pointer text-left ${
                      isActive 
                        ? 'bg-[#1C2027] text-white border-l-4 border-orange-500 shadow-md translate-x-1' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#15181E] border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                    <span className="truncate">{div.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Sort Dropdown Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={toggleSort}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#181B22] border border-black rounded-full text-xs font-mono text-slate-300 hover:text-white hover:border-orange-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[11px] font-bold">
                    {sortOrder === 'default' 
                      ? (language === 'en' ? 'DEFAULT ORDER' : 'URUTAN DAFTAR') 
                      : sortOrder === 'level' 
                      ? (language === 'en' ? 'BY LEVEL' : 'URUTAN LEVEL') 
                      : (language === 'en' ? 'BY RARITY' : 'URUTAN RARITAS')}
                  </span>
                </div>
                <span className="text-[10px] text-orange-400">▲</span>
              </button>
            </div>
          </aside>

          {/* ── MAIN AREA: 2-Row Character Card Grid (matching Image 1 Main Grid) ── */}
          <main className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
              {filteredCrew.map(crew => {
                return (
                  <div
                    key={crew.id}
                    onClick={() => handleCardClick(crew)}
                    className="group relative h-80 sm:h-96 rounded-md overflow-hidden border border-slate-700/80 hover:border-amber-400 bg-[#161D27] cursor-pointer select-none transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-amber-500/20"
                  >
                    {/* 1. Full Card Character Artwork (Edge-to-Edge with Atmospheric Sci-Fi Backdrop) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#3A4759] via-[#202936] to-[#0E131A] overflow-hidden">
                      {/* Subtle mesh pattern in background */}
                      <div 
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage: 'radial-gradient(circle at 50% 25%, rgba(255,255,255,0.2) 0%, transparent 60%)',
                        }}
                      />
                      
                      {/* Character Illustration completely filling the card */}
                      <img 
                        src={crew.image} 
                        alt={crew.name}
                        className="w-full h-full object-cover object-[center_12%] transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Bottom rich dark gradient overlay for text readability */}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
                      
                      {/* Top soft shadow */}
                      <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
                    </div>

                    {/* 2. Top-Left: Black Ribbon / Chevron Banner (matching reference card) */}
                    <div className="absolute top-0 left-2.5 z-20 pointer-events-none">
                      <div className="w-8 pt-1.5 pb-2.5 bg-[#0C1017] border-x border-b border-black clip-ribbon flex flex-col items-center justify-center shadow-lg">
                        <span className="text-sm leading-none drop-shadow-md">{crew.badgeIcon}</span>
                      </div>
                    </div>

                    {/* 3. Top-Right: Red Diamond Element Icon (matching reference card) */}
                    <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rotate-45 bg-red-600 border border-amber-300/80 shadow-[0_0_8px_rgba(239,68,68,0.7)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white/90" />
                      </div>
                    </div>

                    {/* 4. Bottom Overlay HUD: Level on left, Stars and Name on right */}
                    <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-2.5 pb-2 pointer-events-none">
                      
                      {/* Bottom-Left: Angled Level Box (matching reference card) */}
                      <div className="bg-[#0A0D12]/95 border-t border-r border-slate-700/80 pl-2.5 pr-4 py-1 text-left clip-level-badge shadow-2xl backdrop-blur-sm min-w-[58px]">
                        <div className="text-[9px] font-mono font-bold text-slate-300 uppercase leading-none tracking-wider">
                          LV.
                        </div>
                        <div className="text-xl sm:text-2xl font-black font-display text-white leading-tight tracking-tight">
                          {crew.level}
                        </div>
                      </div>

                      {/* Bottom-Right: Stars & Name (matching reference card) */}
                      <div className="flex-1 flex flex-col items-end justify-end text-right pl-2 pb-0.5">
                        {/* 5-Star White Glowing Stars */}
                        <div className="flex items-center gap-0.5 text-xs text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]">
                          {Array.from({ length: crew.stars }).map((_, i) => (
                            <span key={i} className="text-white">✦</span>
                          ))}
                        </div>

                        {/* Character Name in Bold Display Typography */}
                        <div className="font-display font-black text-sm sm:text-base tracking-wide text-white uppercase truncate max-w-[125px] sm:max-w-[155px] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                          {crew.name}
                        </div>
                      </div>

                    </div>

                    {/* 5. Thin Bottom Accent Line */}
                    <div 
                      className="absolute inset-x-0 bottom-0 h-1 z-30 pointer-events-none"
                      style={{ background: crew.badgeBgColor || '#f97316' }}
                    />

                    {/* 6. Active / Hover Border Accent */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/90 rounded-md pointer-events-none transition-colors duration-200" />
                  </div>
                );
              })}
            </div>
          </main>

        </div>
      )}


      {/* =========================================================================
          VIEW MODE 2: CHARACTER DETAIL MODAL VIEW (TRIGGERED ON CARD CLICK)
          ========================================================================= */}
      {viewMode === 'detail' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-6 gap-6 blueprint-grid-dark">
          
          {/* ── LEFT / CENTER: Full Character Standee & Quick Nav ── */}
          <div className="flex-1 relative flex flex-col items-center justify-center min-h-[380px] lg:min-h-0 z-10">
            
            {/* Prev / Next Character Arrows */}
            <div className="absolute top-1/2 left-2 -translate-y-1/2 z-30">
              <button
                onClick={handlePrevCrew}
                className="p-2.5 bg-[#14171D] border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white rounded-full transition-all cursor-pointer shadow-lg"
                title="Awak Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div className="absolute top-1/2 right-2 -translate-y-1/2 z-30">
              <button
                onClick={handleNextCrew}
                className="p-2.5 bg-[#14171D] border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white rounded-full transition-all cursor-pointer shadow-lg"
                title="Awak Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Geometric Rings Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 450 450" className="w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] opacity-20">
                <circle cx="225" cy="225" r="210" fill="none" stroke="#64748B" strokeWidth="1" strokeDasharray="6,4" />
                <circle cx="225" cy="225" r="160" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
                <polygon points="225,40 370,300 80,300" fill="none" stroke="#94A3B8" strokeWidth="1" />
                <polygon points="225,410 370,150 80,150" fill="none" stroke="#94A3B8" strokeWidth="1" />
              </svg>
            </div>

            {/* Character Standee Image */}
            <div className="relative z-10 flex flex-col items-center animate-nova-float">
              <img 
                src={selectedCrew.image} 
                alt={selectedCrew.name}
                className="h-72 sm:h-96 lg:h-[460px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Bottom Floating Character Voice & Quote Bubble */}
            <div className="absolute bottom-2 left-4 right-4 sm:right-auto sm:max-w-md p-4 bg-[#14171D]/90 border border-slate-800 backdrop-blur z-20 space-y-1.5 shadow-2xl clip-chamfer-md">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 bg-amber-500 text-black">
                  {selectedCrew.rarity}
                </span>
                <h2 className="text-base font-bold font-display uppercase tracking-wider text-white">
                  {selectedCrew.name}
                </h2>
                <span className="text-xs font-mono text-amber-400">
                  {selectedCrew.callsign}
                </span>
              </div>

              <p className="text-xs italic text-amber-200/90 font-serif leading-relaxed">
                "{selectedCrew.quote}"
              </p>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1">
                {selectedCrew.bio}
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL: Tabs, Attributes & Role Assignment ── */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col justify-between p-5 bg-[#14171D] border border-black z-20 space-y-4 clip-chamfer-md shadow-2xl">
            
            {/* Top Level & Department Info */}
            <div className="space-y-1.5 border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black font-display text-white">LV.{selectedCrew.level}</span>
                  <span className="text-xs font-mono text-amber-400 ml-2 font-bold">
                    {selectedCrew.rarity} {language === 'en' ? 'SPECIALIST' : 'SPESIALIS'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: selectedCrew.stars }).map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-0.5">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-mono font-bold uppercase clip-chamfer-sm shrink-0">
                  {selectedCrew.divisionCode}
                </span>
                <span className="text-xs sm:text-sm font-mono text-slate-200 font-bold uppercase truncate">
                  {selectedCrew.roleTitle}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                {selectedCrew.department}
              </div>
            </div>

            {/* 4 Interactive Specification Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#0E1116] border border-slate-800">
              {[
                { id: 'status', label: 'STATUS', icon: Activity },
                { id: 'skills', label: language === 'en' ? 'SKILLS' : 'KEAHLIAN', icon: Zap },
                { id: 'equipment', label: language === 'en' ? 'MODULE' : 'MODUL', icon: Shield },
                { id: 'breakthrough', label: language === 'en' ? 'HONORS' : 'PRESTASI', icon: Award },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { sounds.playClick(650); setActiveTab(tab.id as any); }}
                    className={`flex flex-col items-center gap-1 py-1.5 text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#1C2027] text-amber-400 border-b-2 border-amber-500 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Attributes Bars */}
            {activeTab === 'status' && (
              <div className="space-y-3 font-mono text-xs flex-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] text-slate-400">
                  <span>{language === 'en' ? 'CREW PERFORMANCE STATS' : 'STATISTIK KEMAMPUAN AWAK'}</span>
                  <span className="px-1.5 py-0.5 bg-slate-800 text-amber-400 font-bold">
                    {language === 'en' ? 'SPEC' : 'KOSMETIK'}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{language === 'en' ? 'FORENSIC ANALYSIS' : 'ANALISIS FORENSIK'}</span>
                    <span className="font-bold text-amber-400">{selectedCrew.stats.analysis}</span>
                  </div>
                  <div className="w-full bg-black h-2 border border-slate-800">
                    <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.analysis}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{language === 'en' ? 'SYSTEMS ENGINEERING' : 'ARSITEKTUR SISTEM'}</span>
                    <span className="font-bold text-amber-400">{selectedCrew.stats.engineering}</span>
                  </div>
                  <div className="w-full bg-black h-2 border border-slate-800">
                    <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.engineering}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{language === 'en' ? 'EPS VOLTAGE SYSTEMS' : 'DAYA TEGANGAN EPS'}</span>
                    <span className="font-bold text-amber-400">{selectedCrew.stats.powerSystems}</span>
                  </div>
                  <div className="w-full bg-black h-2 border border-slate-800">
                    <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.powerSystems}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{language === 'en' ? 'ECLIPSE RESILIENCE' : 'KETAHANAN BAYANGAN'}</span>
                    <span className="font-bold text-amber-400">{selectedCrew.stats.resilience}</span>
                  </div>
                  <div className="w-full bg-black h-2 border border-slate-800">
                    <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.resilience}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Skills Matrix */}
            {activeTab === 'skills' && (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-56 pr-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] text-slate-400 mb-2">
                  <span>{language === 'en' ? 'SPECIALIST SKILLS TREE' : 'POHON KEAHLIAN SPESIALIS'}</span>
                  <span className="px-1.5 py-0.5 bg-slate-800 text-amber-400 font-bold">
                    {language === 'en' ? 'SPEC' : 'KOSMETIK'}
                  </span>
                </div>
                {selectedCrew.skills.map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-[#181B22] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-display font-bold text-white uppercase">
                      <span>{s.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-black text-amber-400 border border-slate-700">
                        {language === 'en' ? `TIER ${s.level}` : `TINGKAT ${s.level}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Equipment */}
            {activeTab === 'equipment' && (
              <div className="space-y-2 flex-1 text-xs font-mono">
                <div className="p-2.5 bg-[#181B22] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">
                      {language === 'en' ? 'DSN-MK4 THERMAL SUIT' : 'SETELAN TERMAL DSN-MK4'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === 'en' ? 'Sub-zero vacuum insulation layer' : 'Insulasi sub-zero ruang hampa'}
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {language === 'en' ? 'EQUIPPED' : 'TERPASANG'}
                  </span>
                </div>
                <div className="p-2.5 bg-[#181B22] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">
                      {language === 'en' ? 'DUAL-BUS TELEMETRY MODULE' : 'MODUL TELEMETRI DUAL-BUS'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === 'en' ? 'High-noise SNR link filtering' : 'Kompensasi sinyal derau tinggi'}
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {language === 'en' ? 'EQUIPPED' : 'TERPASANG'}
                  </span>
                </div>
              </div>
            )}

            {/* Tab 4: Breakthrough */}
            {activeTab === 'breakthrough' && (
              <div className="space-y-2 flex-1 text-xs font-mono">
                <div className="p-2.5 bg-[#181B22] border border-amber-500/40 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-amber-300">
                      {language === 'en' ? 'CLASS 1 INVESTIGATOR CERTIFICATION' : 'SERTIFIKASI INVESTIGATOR KELAS 1'}
                    </div>
                    <div className="text-[10px] text-slate-300 font-sans">
                      {language === 'en' ? 'Full deep space failure forensics authorization.' : 'Otorisasi forensik kegagalan antariksa penuh.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <button
                onClick={handleAssignRole}
                className="btn-tactical-primary w-full py-3 text-xs tracking-wider text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg font-bold font-display"
              >
                <UserCheck className="w-4 h-4" />
                <span>{language === 'en' ? `DEPLOY ${selectedCrew.callsign}` : `PILIH ${selectedCrew.callsign}`}</span>
              </button>

              {onOpenCoopRoom && (
                <button
                  onClick={() => {
                    sounds.playClick(850);
                    onOpenCoopRoom();
                  }}
                  className="w-full py-2 bg-[#1C2027] border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'CO-OP LINK PROTOCOL' : 'BUKA RUANG BERSAMA'}
                </button>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
