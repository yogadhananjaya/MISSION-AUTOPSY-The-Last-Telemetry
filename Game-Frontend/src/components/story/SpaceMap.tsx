/* antislop: Celestial trajectory navigation map; replacing repetitive list view with authentic orbital chart */
import React, { useState } from 'react';
import {
  Compass,
  Coins,
  ArrowRight,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { EPISODES, type EpisodeDef } from '../../engine/crisis/episodes';
import { useProgressStore } from '../../store/useProgressStore';
import { AGENTS, type AgentDef } from '../../data/agents';
import { sounds } from '../../utils/soundEngine';

interface SpaceMapProps {
  onBackToHub: () => void;
  onLaunchEpisode: (ep: EpisodeDef, companion: AgentDef) => void;
}

const NODE_COORDINATES = [
  { x: 90, y: 220 },   // Ep 1: ASTER-9 (Bennu)
  { x: 220, y: 130 },  // Ep 2: Solar Frontier
  { x: 360, y: 240 },  // Ep 3: Silent Orbit
  { x: 490, y: 120 },  // Ep 4: Iron Horizon
  { x: 620, y: 250 },  // Ep 5: Deep Space
  { x: 740, y: 140 },  // Ep 6: Final Signal
];

export const SpaceMap: React.FC<SpaceMapProps> = ({ onBackToHub, onLaunchEpisode }) => {
  const { completed, stars, credits } = useProgressStore();

  const [selectedEpId, setSelectedEpId] = useState<string>('ep01');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('nova');

  const selectedEp = EPISODES.find((e) => e.id === selectedEpId) || EPISODES[0];
  const selectedAgent = AGENTS.find((a) => a.id === selectedAgentId) || AGENTS[0];

  const isEpisodeUnlocked = (epIndex: number) => {
    if (epIndex === 0) return true;
    const prevEp = EPISODES[epIndex - 1];
    return completed.includes(prevEp.id);
  };

  const handleSelectNode = (ep: EpisodeDef, idx: number) => {
    if (!isEpisodeUnlocked(idx)) {
      sounds.playAlarm();
      return;
    }
    sounds.playClick(600);
    setSelectedEpId(ep.id);
  };

  const handleStartMission = () => {
    sounds.playSuccess();
    onLaunchEpisode(selectedEp, selectedAgent);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 font-mono select-none text-white p-3 sm:p-5">
      {/* Top Header: Title, Credits, Back */}
      <div className="bg-[#141619] border border-black p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHub}
            className="p-2 bg-black border border-gray-800 hover:border-amber-400 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-all flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>KEMBALI</span>
          </button>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>PETA MISI ANTARIKSA (SPACE MAP)</span>
            </div>
            <h2 className="text-base font-bold text-amber-400 font-display">
              KAMPANYE OPERASI CELESTIAL
            </h2>
          </div>
        </div>

        {/* Persistent Credits Balance */}
        <div className="flex items-center gap-2 bg-black/60 border border-gray-800 px-3.5 py-2 rounded-xl text-xs">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-gray-400">KREDIT MISI:</span>
          <span className="font-bold text-amber-400 text-sm">{credits} CR</span>
        </div>
      </div>

      {/* Interactive Orbital Map Canvas */}
      <div className="bg-[#0b0f19] border-2 border-black rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Subtle Constellation / Starfield SVG Background */}
        <svg viewBox="0 0 820 360" className="w-full h-auto select-none">
          {/* Background Grid & Orbit Paths */}
          <g stroke="#1e293b" strokeWidth="1" strokeDasharray="4 6" fill="none">
            <ellipse cx="410" cy="180" rx="380" ry="140" opacity="0.4" />
            <ellipse cx="410" cy="180" rx="260" ry="90" opacity="0.3" />
          </g>

          {/* Inter-node trajectory dashed line */}
          <path
            d={`M ${NODE_COORDINATES[0].x} ${NODE_COORDINATES[0].y} 
               L ${NODE_COORDINATES[1].x} ${NODE_COORDINATES[1].y} 
               L ${NODE_COORDINATES[2].x} ${NODE_COORDINATES[2].y} 
               L ${NODE_COORDINATES[3].x} ${NODE_COORDINATES[3].y} 
               L ${NODE_COORDINATES[4].x} ${NODE_COORDINATES[4].y} 
               L ${NODE_COORDINATES[5].x} ${NODE_COORDINATES[5].y}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.6"
          />

          {/* 6 Episode Nodes */}
          {EPISODES.map((ep, idx) => {
            const pos = NODE_COORDINATES[idx];
            const unlocked = isEpisodeUnlocked(idx);
            const isSelected = selectedEpId === ep.id;
            const epStars = stars[ep.id] || 0;

            return (
              <g
                key={ep.id}
                onClick={() => handleSelectNode(ep, idx)}
                className={`transition-all ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {/* Outer Ring */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="24"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-spin origin-center"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="18"
                  fill={unlocked ? (isSelected ? '#f59e0b' : '#1e293b') : '#0f172a'}
                  stroke={unlocked ? '#fbbf24' : '#334155'}
                  strokeWidth="2"
                  className="transition-transform hover:scale-110 origin-center"
                />

                {/* Node Icon / Number */}
                {unlocked ? (
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#000000' : '#ffffff'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    0{ep.number}
                  </text>
                ) : (
                  <text
                    x={pos.x}
                    y={pos.y + 3}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    🔒
                  </text>
                )}

                {/* Name Label Below Node */}
                <text
                  x={pos.x}
                  y={pos.y + 32}
                  textAnchor="middle"
                  fill={unlocked ? '#e2e8f0' : '#475569'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-md"
                >
                  {ep.name}
                </text>

                {/* Star rating icons */}
                {unlocked && epStars > 0 && (
                  <text
                    x={pos.x}
                    y={pos.y - 24}
                    textAnchor="middle"
                    fill="#facc15"
                    fontSize="10"
                    className="pointer-events-none"
                  >
                    {'★'.repeat(epStars)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Mission Briefing & Deployment Console */}
      <div className="bg-[#141619] border border-black p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-sm">
                EPISODE 0{selectedEp.number}: {selectedEp.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black border border-gray-800 text-cyan-400">
                {selectedEp.focus}
              </span>
            </div>
            <p className="text-xs text-gray-300 font-sans mt-1 leading-relaxed">
              {selectedEp.briefing}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="text-[11px] text-gray-400">HADIAH:</span>
            <span className="text-amber-400 font-bold text-sm">+{selectedEp.reward} CR</span>
          </div>
        </div>

        {/* Companion Agent Selection */}
        <div className="space-y-2">
          <div className="text-[11px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PILIH AGENT PENDAMPING OPERASI:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {AGENTS.slice(0, 5).map((ag) => {
              const isChosen = selectedAgentId === ag.id;
              return (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick(500);
                    setSelectedAgentId(ag.id);
                  }}
                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                    isChosen
                      ? 'border-amber-400 bg-amber-950/40 shadow-md ring-1 ring-amber-400'
                      : 'border-gray-800 bg-black/40 hover:border-gray-600'
                  }`}
                >
                  <div className="font-bold text-white text-[11px] truncate">{ag.name}</div>
                  <div className="text-[9px] text-amber-400 truncate">[{ag.roleGroup.toUpperCase()}]</div>
                  <div className="text-[9px] text-gray-400 truncate mt-1">{ag.active.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Launch Action */}
        <button
          type="button"
          onClick={handleStartMission}
          className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black font-display text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <span>LUNCURKAN EPISODE 0{selectedEp.number}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
