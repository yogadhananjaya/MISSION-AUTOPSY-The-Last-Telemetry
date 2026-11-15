import React from 'react';
import { Trophy, Clock, RotateCcw, LogOut } from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { AGENTS } from '../../data/agents';
import { sounds } from '../../utils/soundEngine';

export const CoopResults: React.FC = () => {
  const { results, role, startGame, leave } = useCoopStore();

  if (!results) return null;

  const handlePlayAgain = () => {
    sounds.playSuccess();
    startGame();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-mono text-xs select-none p-4 text-white">
      {/* Team Summary Card */}
      <div className="bg-[#141619] border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-amber-400">
          <Trophy className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-2xl font-black font-display text-amber-400 uppercase tracking-wide">
            HASIL MISI LAST STAND
          </h2>
          <div className="text-xs text-gray-400 font-sans mt-1">
            {results.outcomeReason}
          </div>
        </div>

        {/* Big Score & Time */}
        <div className="grid grid-cols-2 gap-3 bg-black/60 p-4 rounded-xl border border-gray-800">
          <div>
            <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              WAKTU BERTAHAN
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {results.survivedMin} <span className="text-xs text-gray-500">menit</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              SKOR TIM
            </div>
            <div className="text-2xl font-black text-green-400 mt-1">
              {results.score} <span className="text-xs text-gray-500">PTS</span>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-black/40 border border-gray-800 rounded-lg">
            <span className="text-[10px] text-gray-400 block">DIPERBAIKI</span>
            <span className="text-base font-bold text-green-400">{results.repaired}</span>
          </div>
          <div className="p-2.5 bg-black/40 border border-gray-800 rounded-lg">
            <span className="text-[10px] text-gray-400 block">DIDIAGNOSIS</span>
            <span className="text-base font-bold text-cyan-400">{results.diagnosed}</span>
          </div>
          <div className="p-2.5 bg-black/40 border border-gray-800 rounded-lg">
            <span className="text-[10px] text-gray-400 block">KESALAHAN</span>
            <span className="text-base font-bold text-red-400">{results.wrongRepairs}</span>
          </div>
        </div>

        {/* Player Roster Breakdown Table */}
        <div className="border border-gray-800 rounded-xl overflow-hidden text-left">
          <div className="p-2.5 bg-black/80 font-bold text-gray-400 text-[11px] border-b border-gray-800">
            KONTRIBUSI AWAK KAPAL:
          </div>
          <div className="divide-y divide-gray-800">
            {results.players.map((p) => {
              const agent = AGENTS.find((a) => a.id === p.agentId);
              return (
                <div key={p.id} className="p-3 bg-[#16191e] flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{p.name}</span>
                      <span className="text-[10px] text-amber-400">({agent?.name})</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Skill digunakan: {p.skillUses}x
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono">
                    <span className="text-green-400 font-bold">{p.repaired} repair</span> •{' '}
                    <span className="text-cyan-400 font-bold">{p.diagnosed} diag</span>
                    {p.wrongRepairs > 0 && (
                      <span className="text-red-400 font-bold ml-1">({p.wrongRepairs} err)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {role === 'host' ? (
            <button
              type="button"
              onClick={handlePlayAgain}
              className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black font-display text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>MAIN LAGI (RONDE BARU)</span>
            </button>
          ) : (
            <div className="flex-1 text-center py-2 text-xs text-gray-400 italic">
              Menunggu host memulai ronde baru...
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              sounds.playClick(400);
              leave();
            }}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>KELUAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
