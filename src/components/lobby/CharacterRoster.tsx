import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  Shield, 
  Zap, 
  Activity, 
  UserCheck, 
  Filter, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Mail,
  Settings,
  Grid,
  Radio
} from 'lucide-react';
import { CREW_MEMBERS, type CrewMember } from '../../data/crewData';
import { sounds } from '../../utils/soundEngine';

interface CharacterRosterProps {
  onBack: () => void;
  onSelectRole?: (roleId: string) => void;
  onOpenCoopRoom?: () => void;
}

export const CharacterRoster: React.FC<CharacterRosterProps> = ({ onBack, onSelectRole, onOpenCoopRoom }) => {
  // View mode: 'album' (Grid view matching Image 1) or 'detail' (Full specification view)
  const [viewMode, setViewMode] = useState<'album' | 'detail'>('album');
  const [selectedCrewId, setSelectedCrewId] = useState<string>('nova');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'level' | 'rarity'>('level');
  const [activeTab, setActiveTab] = useState<'status' | 'skills' | 'equipment' | 'breakthrough'>('status');

  const selectedIndex = CREW_MEMBERS.findIndex(c => c.id === selectedCrewId);
  const selectedCrew = CREW_MEMBERS[selectedIndex] || CREW_MEMBERS[0];

  // Division Filter list
  const DIVISIONS = [
    { id: 'ALL', label: 'SEMUA AWAK', icon: Grid },
    { id: 'TELEMETRI', label: 'TELEMETRI', icon: Activity },
    { id: 'REKAYASA', label: 'REKAYASA', icon: Shield },
    { id: 'DAYA EPS', label: 'DAYA EPS', icon: Zap },
    { id: 'MEDIS', label: 'MEDIS BIOME', icon: Activity },
    { id: 'KOMANDO', label: 'KOMANDO', icon: Award },
    { id: 'SPEKTRA', label: 'SPEKTRA', icon: Radio },
    { id: 'DSN NET', label: 'DSN NET', icon: Radio },
    { id: 'KRIOGENIK', label: 'KRIOGENIK', icon: Shield },
    { id: 'GEOLOGI', label: 'GEOLOGI', icon: Filter },
    { id: 'LASER DSOC', label: 'LASER DSOC', icon: Zap },
  ];

  // Filtered and sorted crew members
  const filteredCrew = CREW_MEMBERS.filter(c => {
    if (selectedDivision === 'ALL') return true;
    return c.divisionCode === selectedDivision;
  }).sort((a, b) => {
    if (sortOrder === 'level') return b.level - a.level;
    return (b.rarity === 'SSR' ? 2 : 1) - (a.rarity === 'SSR' ? 2 : 1);
  });

  const handleCardClick = (crew: CrewMember) => {
    sounds.playClick(750);
    setSelectedCrewId(crew.id);
    setViewMode('detail');
  };

  const handlePrevCrew = () => {
    sounds.playClick(600);
    const newIdx = (selectedIndex - 1 + CREW_MEMBERS.length) % CREW_MEMBERS.length;
    setSelectedCrewId(CREW_MEMBERS[newIdx].id);
  };

  const handleNextCrew = () => {
    sounds.playClick(600);
    const newIdx = (selectedIndex + 1) % CREW_MEMBERS.length;
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
    setSortOrder(prev => prev === 'level' ? 'rarity' : 'level');
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
              <span>KEMBALI KE ALBUM</span>
            </button>
          ) : (
            <button 
              onClick={() => { sounds.playClick(600); onBack(); }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1C2027] border border-slate-700 text-xs font-mono text-amber-400 hover:text-white hover:border-amber-400 transition-colors cursor-pointer clip-chamfer-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>KEMBALI</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="font-display font-black text-sm tracking-wider uppercase text-slate-100">
              {viewMode === 'album' ? 'ALBUM ARSIP AWAK' : `DETAIL AWAK : ${selectedCrew.name}`}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30">
              TOTAL : {CREW_MEMBERS.length} SPESIALIS
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
                    {sortOrder === 'level' ? 'URUTAN LEVEL' : 'URUTAN RARITAS'}
                  </span>
                </div>
                <span className="text-[10px] text-orange-400">▲</span>
              </button>
            </div>
          </aside>

          {/* ── MAIN AREA: 2-Row Character Card Grid (matching Image 1 Main Grid) ── */}
          <main className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredCrew.map(crew => {
                return (
                  <div
                    key={crew.id}
                    onClick={() => handleCardClick(crew)}
                    className="group relative flex flex-col justify-between h-72 sm:h-80 bg-[#161920] border border-black hover:border-orange-500 rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/20 cursor-pointer select-none"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 30%, #1e2532 0%, #12151c 70%, #0c0e14 100%)',
                    }}
                  >
                    {/* Top Bar inside Card: Division Icon Badge (Left) & Star Tag (Right) */}
                    <div className="relative z-20 flex items-center justify-between p-2 pointer-events-none">
                      {/* Top Left Faction Badge */}
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold shadow-md"
                        style={{ background: crew.badgeBgColor }}
                      >
                        <span>{crew.badgeIcon}</span>
                      </div>

                      {/* Top Right Sub-marker */}
                      <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-slate-700/80">
                        {crew.rarity}
                      </span>
                    </div>

                    {/* Character Knee-Up / Portrait Artwork */}
                    <div className="relative flex-1 flex items-center justify-center overflow-hidden -my-4">
                      <img 
                        src={crew.image} 
                        alt={crew.name}
                        className="w-full h-full object-contain object-bottom scale-110 group-hover:scale-115 transition-transform duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                      />
                      {/* Subtle ambient light gradient at bottom of art */}
                      <div 
                        className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                        style={{
                          background: `linear-gradient(to top, rgba(14,17,22,0.95), transparent)`
                        }}
                      />
                    </div>

                    {/* Bottom Status Banner (matching Image 1 card footers) */}
                    <div className="relative z-20 flex items-stretch border-t border-slate-800/80 font-mono">
                      {/* Left: Level Box */}
                      <div className="bg-[#0B0D11] px-2.5 py-2 flex flex-col justify-center border-r border-slate-800">
                        <span className="text-[9px] text-slate-400 font-bold leading-none">LV.</span>
                        <span className="text-base font-black text-white font-display leading-tight">{crew.level}</span>
                      </div>

                      {/* Right: Character Name + Stars Colored Banner */}
                      <div 
                        className="flex-1 px-2.5 py-1.5 flex flex-col justify-center text-white"
                        style={{ background: crew.badgeBgColor }}
                      >
                        {/* 5-Star / 4-Star Rating */}
                        <div className="flex items-center gap-0.5 text-[10px] text-amber-200">
                          {Array.from({ length: crew.stars }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>

                        {/* Character Name in Bold Display */}
                        <div className="font-display font-black text-xs sm:text-sm tracking-wider uppercase truncate">
                          {crew.name}
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow Border Accent */}
                    <div 
                      className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/80 rounded-lg pointer-events-none transition-colors"
                    />
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
                  <span className="text-xs font-mono text-amber-400 ml-2 font-bold">{selectedCrew.rarity} SPESIALIS</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: selectedCrew.stars }).map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
              </div>
              
              <div className="text-sm font-mono text-slate-200 font-bold uppercase">
                {selectedCrew.roleTitle}
              </div>
              <div className="text-xs font-mono text-slate-400">
                {selectedCrew.department}
              </div>
            </div>

            {/* 4 Interactive Specification Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#0E1116] border border-slate-800">
              {[
                { id: 'status', label: 'STATUS', icon: Activity },
                { id: 'skills', label: 'KEAHLIAN', icon: Zap },
                { id: 'equipment', label: 'MODUL', icon: Shield },
                { id: 'breakthrough', label: 'PRESTASI', icon: Award },
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
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>ANALISIS FORENSIK</span>
                    <span className="font-bold text-amber-400">{selectedCrew.stats.analysis}</span>
                  </div>
                  <div className="w-full bg-black h-2 border border-slate-800">
                    <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.analysis}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>ARSITEKTUR SISTEM</span>
                    <span className="font-bold text-amber-400">{selectedCrew.stats.engineering}</span>
                  </div>
                  <div className="w-full bg-black h-2 border border-slate-800">
                    <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.engineering}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>DAYA TEGANGAN EPS</span>
                    <span className="font-bold text-amber-400">{selectedCrew.stats.powerSystems}</span>
                  </div>
                  <div className="w-full bg-black h-2 border border-slate-800">
                    <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.powerSystems}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>KETAHANAN BAYANGAN</span>
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
                {selectedCrew.skills.map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-[#181B22] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-display font-bold text-white uppercase">
                      <span>{s.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-black text-amber-400 border border-slate-700">
                        TINGKAT {s.level}
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
                    <div className="font-bold text-white">SETELAN TERMAL DSN-MK4</div>
                    <div className="text-[10px] text-slate-400">Insulasi sub-zero ruang hampa</div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">TERPASANG</span>
                </div>
                <div className="p-2.5 bg-[#181B22] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">MODUL TELEMETRI DUAL-BUS</div>
                    <div className="text-[10px] text-slate-400">Kompensasi sinyal derau tinggi</div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">TERPASANG</span>
                </div>
              </div>
            )}

            {/* Tab 4: Breakthrough */}
            {activeTab === 'breakthrough' && (
              <div className="space-y-2 flex-1 text-xs font-mono">
                <div className="p-2.5 bg-[#181B22] border border-amber-500/40 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-amber-300">SERTIFIKASI INVESTIGATOR KELAS 1</div>
                    <div className="text-[10px] text-slate-300 font-sans">Otorisasi forensik kegagalan antariksa penuh.</div>
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
                <span>PILIH {selectedCrew.callsign}</span>
              </button>

              {onOpenCoopRoom && (
                <button
                  onClick={() => {
                    sounds.playClick(850);
                    onOpenCoopRoom();
                  }}
                  className="w-full py-2.5 bg-[#161920] border border-black hover:border-orange-500 text-orange-400 hover:text-white font-mono text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors clip-chamfer-sm"
                >
                  <span>MASUK RUANG BERSAMA</span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
