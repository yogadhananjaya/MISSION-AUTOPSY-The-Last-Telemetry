import React, { useState } from 'react';
import { ArrowLeft, Lock, Play, Sparkles } from 'lucide-react';
import { MISSIONS_LIST, type MissionDossier } from '../../data/missionsData';
import { sounds } from '../../utils/soundEngine';

interface MissionSelectorProps {
  onBack: () => void;
  onSelectMission: (mission: MissionDossier) => void;
}

export const MissionSelector: React.FC<MissionSelectorProps> = ({ onBack, onSelectMission }) => {
  const [hoveredMissionId, setHoveredMissionId] = useState<string>('aster-9');
  const [selectedMissionId, setSelectedMissionId] = useState<string>('aster-9');

  const activeMission = MISSIONS_LIST.find(m => m.id === (hoveredMissionId || selectedMissionId)) || MISSIONS_LIST[0];

  const handleCardClick = (m: MissionDossier) => {
    sounds.playClick(750);
    setSelectedMissionId(m.id);
    if (m.status === 'active') {
      onSelectMission(m);
    } else {
      sounds.playAlarm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101216] flex flex-col overflow-hidden text-white select-none">
      
      {/* Top Header Bar */}
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
              <span className="text-white">ARSIP BERKAS MISI</span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/40 font-mono">
                REGISTRI MISI : 04
              </span>
            </h1>
          </div>
        </div>

        {/* Selected Mission Quick Details in Header */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-slate-500">TARGET: </span>
            <span className="text-slate-200 font-bold">{activeMission.targetObject}</span>
          </div>
          <div>
            <span className="text-slate-500">BATAS ANGGARAN: </span>
            <span className="text-amber-400 font-bold">{activeMission.budgetLimit}</span>
          </div>
        </div>
      </header>

      {/* Main 4-Column Vertical Split Banner Stage (Matching Reference Image 2) */}
      <main className="relative flex-1 flex flex-col lg:flex-row w-full h-full overflow-hidden p-3 sm:p-5 gap-3 blueprint-grid-dark">
        {MISSIONS_LIST.map((m) => {
          const isSelected = m.id === selectedMissionId;
          const isHovered = m.id === hoveredMissionId;
          const isLocked = m.status === 'locked';

          return (
            <div
              key={m.id}
              onMouseEnter={() => {
                setHoveredMissionId(m.id);
                sounds.playClick(850);
              }}
              onClick={() => handleCardClick(m)}
              className={`relative flex-1 transition-all duration-300 ease-out cursor-pointer overflow-hidden border flex flex-col justify-between p-6 ${
                isHovered || isSelected 
                  ? 'lg:flex-[2.2] border-amber-500 bg-[#16191F] shadow-2xl' 
                  : 'lg:flex-1 border-slate-800/90 bg-[#121418] hover:border-slate-700 opacity-75 hover:opacity-100'
              }`}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)'
              }}
            >
              {/* Technical Corner Crosshairs */}
              <div className="absolute top-2 left-2 text-slate-600 font-mono text-[10px]">+</div>
              <div className="absolute bottom-2 right-2 text-slate-600 font-mono text-[10px]">+</div>

              {/* Faction Insignia Emblem Watermark */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-15">
                <svg viewBox="0 0 120 120" className="w-52 h-52" style={{ stroke: isHovered ? '#F59E0B' : '#94A3B8', fill: 'none' }}>
                  <circle cx="60" cy="60" r="48" strokeWidth="1.5" strokeDasharray="6,4" />
                  <polygon points="60,18 72,50 102,60 72,70 60,102 48,70 18,60 48,50" strokeWidth="2" />
                  <circle cx="60" cy="60" r="16" strokeWidth="2" />
                </svg>
              </div>

              {/* Top Section: Case Code & Status Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-black border border-slate-700 tracking-wider text-slate-200">
                  {m.code}
                </span>

                {isLocked ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/80 border border-red-800 text-[10px] font-mono text-red-400">
                    <Lock className="w-3 h-3" />
                    <span>TERKUNCI</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500 text-[10px] font-mono text-amber-400 font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>MISI AKTIF</span>
                  </span>
                )}
              </div>

              {/* Center Section: Big Title & Progress Indicator */}
              <div className="relative z-10 my-auto py-6">
                <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                  {m.category}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black font-display tracking-wide text-white mt-1 uppercase">
                  {m.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans leading-relaxed">
                  {m.subtitle}
                </p>

                {/* Progress Bar (Tactical Solid Bar) */}
                <div className="mt-6 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">SINKRONISASI INVESTIGASI</span>
                    <span className="font-bold text-amber-400">{m.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-black h-2 border border-slate-800">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${m.progressPercentage}%` }} 
                    />
                  </div>
                </div>

                {/* Expanded Details when Card is Hovered/Selected */}
                {(isHovered || isSelected) && (
                  <div className="mt-5 pt-4 border-t border-slate-800 space-y-3 text-xs animate-fadeIn">
                    <div className="text-slate-300 font-sans leading-relaxed bg-[#101215] p-3 border border-slate-800">
                      <strong className="text-amber-400 font-mono block mb-1">TELEMETRI INSIDEN:</strong>
                      {m.anomalySummary}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <span>TARGET: <strong className="text-slate-200">{m.targetObject}</strong></span>
                      <span className="px-2 py-0.5 bg-amber-950/40 border border-amber-700/60 text-amber-300">
                        {m.difficulty}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section: Action Button */}
              <div className="relative z-10 pt-4 flex items-center justify-between border-t border-slate-800">
                <div className="text-xs font-mono text-slate-400">
                  ANGGARAN: <span className="font-bold text-white">{m.budgetLimit}</span>
                </div>

                {m.status === 'active' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMission(m);
                    }}
                    className="btn-tactical-primary px-5 py-2.5 text-xs text-black cursor-pointer shadow-md"
                  >
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>BUKA BERKAS</span>
                    </span>
                  </button>
                ) : (
                  <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>AKSES TERKUNCI</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
