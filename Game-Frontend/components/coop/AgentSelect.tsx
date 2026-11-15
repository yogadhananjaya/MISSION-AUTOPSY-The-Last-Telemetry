import React, { useState } from 'react';
import { Lock, Unlock, Shield, Zap } from 'lucide-react';
import { AGENTS, type AgentDef, type RoleGroup } from '../../data/agents';
import { useCoopStore } from '../../store/useCoopStore';
import { sounds } from '../../utils/soundEngine';

const ROLE_COLORS: Record<RoleGroup, { border: string; bg: string; text: string; label: string }> = {
  telemetry: { border: 'border-purple-500', bg: 'bg-purple-950/30', text: 'text-purple-400', label: 'TELEMETRY' },
  electrical: { border: 'border-yellow-500', bg: 'bg-yellow-950/30', text: 'text-yellow-400', label: 'ELECTRICAL' },
  mechanical: { border: 'border-cyan-500', bg: 'bg-cyan-950/30', text: 'text-cyan-400', label: 'MECHANICAL' },
  systems: { border: 'border-emerald-500', bg: 'bg-emerald-950/30', text: 'text-emerald-400', label: 'SYSTEMS' },
};

export const AgentSelect: React.FC = () => {
  const { lobby, selfId, selectAgent, lockIn, unlock } = useCoopStore();

  const mySlot = lobby?.players.find((p) => p.id === selfId);
  const myAgentId = mySlot?.agentId ?? null;
  const isLocked = mySlot?.locked ?? false;

  const [inspectedAgentId, setInspectedAgentId] = useState<string>(myAgentId || 'nova');
  const inspectedAgent = AGENTS.find((a) => a.id === inspectedAgentId) || AGENTS[0];

  const handlePickAgent = (agent: AgentDef) => {
    if (isLocked) return;
    // Check if taken by someone else
    const isTakenByOther = lobby?.players.some((p) => p.agentId === agent.id && p.id !== selfId);
    if (isTakenByOther) return;

    sounds.playClick(700);
    setInspectedAgentId(agent.id);
    selectAgent(agent.id);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* 10 Agents Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {AGENTS.map((agent) => {
          const isTakenByOther = lobby?.players.some(
            (p) => p.agentId === agent.id && p.id !== selfId
          );
          const otherPlayerName = isTakenByOther
            ? lobby?.players.find((p) => p.agentId === agent.id)?.name
            : null;
          const isMyAgent = myAgentId === agent.id;
          const isInspected = inspectedAgentId === agent.id;
          const roleConf = ROLE_COLORS[agent.roleGroup];

          return (
            <button
              key={agent.id}
              type="button"
              disabled={isTakenByOther || isLocked}
              onClick={() => handlePickAgent(agent)}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-32 ${
                isMyAgent
                  ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_15px_rgba(234,179,8,0.3)] ring-2 ring-amber-400'
                  : isTakenByOther
                  ? 'border-gray-800 bg-black/40 opacity-40 cursor-not-allowed'
                  : isInspected
                  ? 'border-gray-500 bg-[#1e2229] cursor-pointer'
                  : 'border-gray-800 bg-[#141619] hover:border-gray-600 cursor-pointer'
              }`}
            >
              {/* Badge role */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${roleConf.bg} ${roleConf.text} border ${roleConf.border}`}
                >
                  {roleConf.label}
                </span>
                {isMyAgent && (
                  <span className="text-[9px] font-mono bg-amber-400 text-black px-1.5 py-0.5 rounded font-black">
                    PILIHANMU
                  </span>
                )}
              </div>

              {/* Character info */}
              <div className="mt-auto">
                <div className="font-mono text-xs font-bold text-white truncate">{agent.name}</div>
                <div className="text-[10px] text-gray-400 truncate">{agent.roleTitle}</div>
              </div>

              {/* Taken overlay */}
              {isTakenByOther && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-[10px] font-mono text-red-400 font-bold">DIPAKAI</span>
                  <span className="text-[9px] font-mono text-gray-400 truncate max-w-full">
                    {otherPlayerName}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected / Inspected Agent Detail Panel */}
      <div className="bg-[#141619] border border-black p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono text-amber-400">
                {inspectedAgent.name}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  ROLE_COLORS[inspectedAgent.roleGroup].bg
                } ${ROLE_COLORS[inspectedAgent.roleGroup].text} ${
                  ROLE_COLORS[inspectedAgent.roleGroup].border
                }`}
              >
                {inspectedAgent.roleGroup.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-gray-300 font-sans">{inspectedAgent.roleTitle}</div>
          </div>

          {/* Lock In / Unlock Action */}
          <div>
            {isLocked ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick(400);
                  unlock();
                }}
                className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span>BATAL LOCK IN</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!myAgentId}
                onClick={() => {
                  sounds.playSuccess();
                  lockIn();
                }}
                className="px-6 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-gray-800 disabled:text-gray-600 text-black text-xs font-mono font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>LOCK IN PILIHAN</span>
              </button>
            )}
          </div>
        </div>

        {/* Skills Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {/* Passive */}
          <div className="bg-black/50 border border-gray-800 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              <span>PASIF: {inspectedAgent.passive.name}</span>
            </div>
            <p className="text-gray-300 font-sans text-xs leading-relaxed">
              {inspectedAgent.passive.description}
            </p>
          </div>

          {/* Active */}
          <div className="bg-black/50 border border-gray-800 p-3 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>AKTIF: {inspectedAgent.active.name}</span>
              </span>
              <span className="text-[10px] text-gray-400">
                CD: {inspectedAgent.active.cooldownSec}s
              </span>
            </div>
            <p className="text-gray-300 font-sans text-xs leading-relaxed">
              {inspectedAgent.active.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
