import React, { useState } from 'react';
import { ArrowLeft, Award, Shield, Zap, Activity, UserCheck } from 'lucide-react';
import { CREW_MEMBERS, type CrewMember } from '../../data/crewData';
import { sounds } from '../../utils/soundEngine';

interface CharacterRosterProps {
  onBack: () => void;
  onSelectRole?: (roleId: string) => void;
  onOpenCoopRoom?: () => void;
}

export const CharacterRoster: React.FC<CharacterRosterProps> = ({ onBack, onSelectRole, onOpenCoopRoom }) => {
  const [selectedCrewId, setSelectedCrewId] = useState<string>('nova');
  const [activeTab, setActiveTab] = useState<'status' | 'skills' | 'equipment' | 'breakthrough'>('status');

  const selectedCrew = CREW_MEMBERS.find(c => c.id === selectedCrewId) || CREW_MEMBERS[0];

  const handleSelectCrew = (crew: CrewMember) => {
    sounds.playClick(750);
    setSelectedCrewId(crew.id);
  };

  const handleAssignRole = () => {
    sounds.playClick(900);
    if (onSelectRole) {
      onSelectRole(selectedCrew.role);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101216] flex flex-col overflow-hidden text-white select-none">
      
      {/* Top Header Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-3.5 bg-[#141619] border-b border-black">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { sounds.playClick(600); onBack(); }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1F2329] border border-slate-700 text-xs font-mono text-amber-400 hover:text-white hover:border-amber-400 transition-colors cursor-pointer clip-chamfer-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>KEMBALI</span>
          </button>
          
          <div className="h-5 w-px bg-slate-800" />
          
          <div>
            <h1 className="text-base sm:text-lg font-bold font-display tracking-wider uppercase flex items-center gap-2">
              <span className="text-white">SPESIFIKASI AWAK DAN PERAN</span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/40 font-mono">
                DAFTAR AWAK : 05
              </span>
            </h1>
          </div>
        </div>

        {/* Selected Role Tag in Header */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">PERAN AKTIF:</span>
          <span className="px-3 py-1 bg-amber-500 text-black text-xs font-mono font-bold tracking-wider clip-chamfer-sm">
            {selectedCrew.badgeIcon} {selectedCrew.roleTitle.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Main 3-Section Layout Matching Reference Image 3 */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-5 gap-4 blueprint-grid-dark">
        
        {/* ── LEFT COLUMN: Crew Thumbnails & Category Tabs (Reference 3 Left) ── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3 z-10">
          
          {/* Sub-menu Tabs */}
          <div className="flex lg:flex-col gap-1.5 p-1.5 bg-[#141619] border border-slate-800">
            {[
              { id: 'status', label: 'STATUS', icon: Activity },
              { id: 'skills', label: 'KEAHLIAN', icon: Zap },
              { id: 'equipment', label: 'PERLENGKAPAN', icon: Shield },
              { id: 'breakthrough', label: 'SERTIFIKAT', icon: Award },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { sounds.playClick(650); setActiveTab(tab.id as any); }}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-semibold transition-colors cursor-pointer border ${
                    isActive 
                      ? 'bg-[#1E232B] text-amber-400 border-amber-500 shadow-md' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#1A1D23]'
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Vertical Crew Thumbnails List */}
          <div className="flex-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pr-1">
            {CREW_MEMBERS.map(c => {
              const isSelected = c.id === selectedCrewId;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCrew(c)}
                  className={`flex items-center gap-3 p-2.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#181B20] border-amber-500 shadow-lg translate-x-1'
                      : 'bg-[#121417] border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
                  }}
                >
                  {/* Avatar Icon */}
                  <div className="w-10 h-10 bg-[#1F2329] border border-slate-700 flex items-center justify-center font-bold text-lg shrink-0">
                    <span>{c.badgeIcon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-display uppercase truncate">{c.name}</span>
                      <span className="text-[9px] font-mono font-bold text-amber-400">
                        {c.rarity}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      LV.{c.level} • {c.callsign}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ── CENTER COLUMN: Full Character Portrait & Story Bio (Reference 3 Center) ── */}
        <div className="flex-1 relative flex flex-col items-center justify-center min-h-[360px] lg:min-h-0 z-10">
          
          {/* Geometric Technical Rings behind Character */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 450 450" className="w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] opacity-25">
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
              className="h-72 sm:h-96 lg:h-[460px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            />
          </div>

          {/* Bottom Left Character Bio Card (Reference 3 Bottom-Left) */}
          <div 
            className="absolute bottom-2 left-2 max-w-md p-4 bg-[#141619] border border-black z-20 space-y-1.5 shadow-2xl"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black px-1.5 py-0.2 bg-amber-500 text-black">
                {selectedCrew.rarity}
              </span>
              <h2 className="text-base font-bold font-display uppercase tracking-wider text-white">{selectedCrew.name}</h2>
              <span className="text-xs font-mono text-amber-400">{selectedCrew.callsign}</span>
            </div>

            <p className="text-xs italic text-amber-200/90 font-serif leading-relaxed">
              {selectedCrew.quote}
            </p>

            <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 line-clamp-2">
              {selectedCrew.bio}
            </p>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Stats, Attribute Bars, & Assign Button (Reference 3 Right) ── */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col justify-between p-5 bg-[#141619] border border-black z-10 space-y-5 clip-chamfer-md">
          
          {/* Top Level Display & Role Title */}
          <div className="space-y-1.5 border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold font-display text-white">LV.{selectedCrew.level}</span>
                <span className="text-xs font-mono text-amber-400 ml-2">SPESIALIS</span>
              </div>
              <span className="text-xs font-mono text-slate-400">1450 / 2200 EXP</span>
            </div>
            
            <div className="text-xs font-mono text-slate-200 font-bold uppercase">
              {selectedCrew.roleTitle}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {selectedCrew.department}
            </div>
          </div>

          {/* 4 Attributes Bars (Solid High-Contrast Industrial Bars) */}
          <div className="space-y-2.5 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>ANALISIS FORENSIK</span>
                <span className="font-bold text-amber-400">{selectedCrew.stats.analysis}</span>
              </div>
              <div className="w-full bg-black h-2 border border-slate-800">
                <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.analysis}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>ARSITEKTUR SISTEM</span>
                <span className="font-bold text-amber-400">{selectedCrew.stats.engineering}</span>
              </div>
              <div className="w-full bg-black h-2 border border-slate-800">
                <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.engineering}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>DAYA TEGANGAN EPS</span>
                <span className="font-bold text-amber-400">{selectedCrew.stats.powerSystems}</span>
              </div>
              <div className="w-full bg-black h-2 border border-slate-800">
                <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.powerSystems}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>KETAHANAN BAYANGAN</span>
                <span className="font-bold text-amber-400">{selectedCrew.stats.resilience}</span>
              </div>
              <div className="w-full bg-black h-2 border border-slate-800">
                <div className="h-full bg-amber-400" style={{ width: `${selectedCrew.stats.resilience}%` }} />
              </div>
            </div>
          </div>

          {/* Specialist Skill Matrix */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
              MATRIKS KEAHLIAN KHUSUS
            </span>

            <div className="space-y-1.5">
              {selectedCrew.skills.map((s, idx) => (
                <div key={idx} className="p-2 bg-[#1A1D23] border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-xs font-display font-bold text-white uppercase">
                    <span>{s.name}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-black text-amber-400 border border-slate-700">
                      TINGKAT {s.level}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-sans leading-tight">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Assign Role & Co-op Room Buttons */}
          <div className="pt-1 space-y-2">
            <button
              onClick={handleAssignRole}
              className="btn-tactical-primary w-full py-2.5 text-xs tracking-wider text-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
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
                className="w-full py-2 bg-[#1C1F24] border border-cyan-500 hover:border-cyan-300 text-cyan-300 hover:text-white font-mono text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors clip-chamfer-sm"
              >
                <span>MASUK RUANG BERSAMA</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
