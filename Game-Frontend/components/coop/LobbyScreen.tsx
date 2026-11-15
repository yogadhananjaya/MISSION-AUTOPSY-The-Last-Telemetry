import React, { useState } from 'react';
import { Copy, Check, Users, Play, LogOut, ShieldAlert, Cpu } from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { AgentSelect } from './AgentSelect';
import { AGENTS } from '../../data/agents';
import { sounds } from '../../utils/soundEngine';

export const LobbyScreen: React.FC = () => {
  const { lobby, role, startGame, leave, setDifficulty, error } = useCoopStore();
  const [copied, setCopied] = useState(false);

  if (!lobby) return null;

  const handleCopyCode = () => {
    sounds.playClick(500);
    navigator.clipboard.writeText(lobby.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const humanPlayers = lobby.players.filter((p) => !p.isBot);
  const allHumansLocked = humanPlayers.length > 0 && humanPlayers.every((p) => p.locked && p.agentId);

  // Fill up to 4 slots visually
  const slots = Array.from({ length: 4 }, (_, i) => lobby.players[i] || null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans select-none p-4 text-white">
      {/* Lobby Header: Code & Quick Actions */}
      <div className="bg-[#141619] border border-black p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>KODE LOBI RUANG MISI</span>
            {role === 'host' && (
              <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded font-black text-[9px]">
                TUAN RUMAH (HOST)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-black font-mono text-amber-400 tracking-wider">
              {lobby.code}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2 rounded-lg bg-black/60 border border-gray-700 hover:border-amber-400 text-gray-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 text-xs font-mono"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-bold">TERSALIN</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>SALIN KODE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Host Controls & Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {role === 'host' && (
            <div className="flex items-center gap-1.5 bg-black/60 border border-gray-800 p-1 rounded-xl text-xs font-mono">
              <span className="text-gray-400 px-2">TINGKAT:</span>
              <button
                type="button"
                onClick={() => setDifficulty(1.0)}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                  lobby.difficulty === 1.0
                    ? 'bg-green-500/20 border border-green-500 text-green-300'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                Mudah (1.0)
              </button>
              <button
                type="button"
                onClick={() => setDifficulty(1.3)}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                  lobby.difficulty === 1.3
                    ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                Normal (1.3)
              </button>
              <button
                type="button"
                onClick={() => setDifficulty(1.6)}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                  lobby.difficulty === 1.6
                    ? 'bg-red-500/20 border border-red-500 text-red-300'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                Sulit (1.6)
              </button>
            </div>
          )}

          {role === 'host' ? (
            <button
              type="button"
              disabled={!allHumansLocked}
              onClick={() => {
                sounds.playSuccess();
                startGame();
              }}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black font-display text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>MULAI MISI</span>
            </button>
          ) : (
            <div className="text-xs font-mono text-amber-400 bg-amber-950/30 border border-amber-500/40 px-3 py-2 rounded-xl">
              Menunggu Tuan Rumah memulai...
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              sounds.playClick(400);
              leave();
            }}
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-red-950/60 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-300 cursor-pointer transition-all"
            title="Keluar dari Lobi"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-950/80 border border-red-500 text-red-300 rounded-xl text-xs font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Player Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {slots.map((slot, idx) => {
          const agent = slot?.agentId ? AGENTS.find((a) => a.id === slot.agentId) : null;
          const isBot = slot?.isBot;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] relative transition-all ${
                slot
                  ? slot.locked
                    ? 'border-green-500/60 bg-green-950/10'
                    : 'border-amber-500/60 bg-[#141619]'
                  : 'border-dashed border-gray-800 bg-black/30'
              }`}
            >
              {slot ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      SLOT {idx + 1}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isBot
                          ? 'bg-purple-950/80 border border-purple-500 text-purple-300'
                          : !slot.connected
                          ? 'bg-red-950/80 border border-red-500 text-red-300'
                          : slot.locked
                          ? 'bg-green-500 text-black'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                      }`}
                    >
                      {isBot
                        ? 'BOT'
                        : !slot.connected
                        ? 'TERPUTUS'
                        : slot.locked
                        ? 'LOCKED'
                        : slot.agentId
                        ? 'MEMILIH'
                        : 'BELUM PILIH'}
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="font-mono text-sm font-bold text-white truncate flex items-center gap-1.5">
                      {isBot && <Cpu className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{slot.name}</span>
                    </div>
                    {agent ? (
                      <div className="text-xs font-mono text-amber-400 truncate mt-0.5">
                        {agent.name}
                        <span className="text-[10px] text-gray-400 block">
                          [{agent.roleGroup.toUpperCase()}]
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-gray-600 italic">
                        Sedang memilih karakter...
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[10px] font-mono text-gray-600 uppercase">
                    SLOT {idx + 1} : KOSONG
                  </span>
                  <span className="text-[10px] text-gray-500 font-sans mt-1">
                    (Akan diisi Bot saat permainan dimulai)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent Selection Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
          PILIH SPESIALIS AGENT ASTRONOT
        </h3>
        <AgentSelect />
      </div>
    </div>
  );
};
