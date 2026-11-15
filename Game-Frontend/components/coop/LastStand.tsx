import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { HostLoop } from '../../coop/hostLoop';
import { StationPanel } from './StationPanel';
import { TaskBoard } from './TaskBoard';
import { QuickComm } from './QuickComm';
import { CoopResults } from './CoopResults';
import { CableConnection } from '../minigames/CableConnection';
import { PowerRouting } from '../minigames/PowerRouting';
import { AntennaAlignment } from '../minigames/AntennaAlignment';
import { 
  fmtT, 
  inEclipse, 
  minutesToEclipse, 
  LASTSTAND_PARAMS, 
  SYSTEM_IDS 
} from '../../engine/crisis/shipState';
import type { MinigameId } from '../../engine/crisis/damageGraph';
import { AGENTS } from '../../data/agents';
import { sounds } from '../../utils/soundEngine';

export const LastStand: React.FC = () => {
  const { 
    lobby, 
    role, 
    transport, 
    ship, 
    selfId, 
    results, 
    setShipState, 
    setResults, 
    sendAction 
  } = useCoopStore();

  const hostLoopRef = useRef<HostLoop | null>(null);

  // Active minigame state
  const [activeMinigame, setActiveMinigame] = useState<{
    uid: number;
    defId: string;
    type: MinigameId;
  } | null>(null);

  // Active skill cooldown
  const myPlayer = lobby?.players.find((p) => p.id === selfId);
  const myAgent = AGENTS.find((a) => a.id === myPlayer?.agentId);
  const [skillCd, setSkillCd] = useState(0);

  // Initialize Host loop if role === 'host'
  useEffect(() => {
    if (role === 'host' && lobby && transport) {
      const loop = new HostLoop(
        lobby,
        transport,
        (s, claims) => setShipState(s, claims),
        (res) => setResults(res)
      );
      hostLoopRef.current = loop;

      // Listen for client act and claim messages on host
      transport.onMessage((msg, fromPeerId) => {
        if (msg.t === 'act') {
          loop.enqueueAction(fromPeerId, msg.action, msg.ms);
        } else if (msg.t === 'claim') {
          loop.handleClaim(fromPeerId, msg.uid);
        }
      });

      return () => {
        loop.stop();
        hostLoopRef.current = null;
      };
    }
  }, [role, lobby?.seed]);

  // Skill cooldown timer
  useEffect(() => {
    if (skillCd <= 0) return;
    const timer = setInterval(() => {
      setSkillCd((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [skillCd]);

  const handleTriggerSkill = () => {
    if (skillCd > 0 || !myAgent) return;
    sounds.playSuccess();
    sendAction({ type: 'boost', kind: 'solar' });
    setSkillCd(myAgent.active.cooldownSec);
  };

  const handleStartMinigame = (uid: number, defId: string, minigame: MinigameId) => {
    setActiveMinigame({ uid, defId, type: minigame });
  };

  const handleMinigameDone = (res: { success: boolean; ms: number }) => {
    if (!activeMinigame) return;
    if (res.success) {
      sendAction({ type: 'repair', uid: activeMinigame.uid }, res.ms);
    }
    setActiveMinigame(null);
  };

  // If game is over and results are present, render CoopResults
  if (results) {
    return <CoopResults />;
  }

  if (!ship) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center font-mono text-xs text-amber-400 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span>MENYINKRONKAN KONDISI WAHANA DENGAN HOST...</span>
      </div>
    );
  }

  const isEcl = inEclipse(LASTSTAND_PARAMS, ship.t);
  const minToEcl = minutesToEclipse(LASTSTAND_PARAMS, ship.t);

  return (
    <div className="max-w-6xl mx-auto space-y-4 font-mono select-none text-white p-3 sm:p-5">
      {/* Top Bar: Time, Eclipse Status, Phase */}
      <div className="bg-[#141619] border border-black p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black border border-amber-500/50 rounded-xl">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              LAST STAND CO-OP OPERATIONS
            </div>
            <div className="text-xl font-black text-amber-400">{fmtT(ship.t)}</div>
          </div>
        </div>

        {/* Eclipse & Crisis Phase */}
        <div className="flex items-center gap-4 bg-black/60 border border-gray-800 px-4 py-2 rounded-xl text-xs">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase">JAM GERHANA</span>
            <span
              className={`font-bold flex items-center gap-1.5 ${
                isEcl ? 'text-purple-400 animate-pulse' : 'text-amber-300'
              }`}
            >
              {isEcl ? 'SEDANG GERHANA' : `Gerhana dalam ${minToEcl}m`}
            </span>
          </div>
          <div className="w-[1px] h-7 bg-gray-800" />
          <div>
            <span className="text-[10px] text-gray-500 block uppercase">INTENSITAS</span>
            <span className="font-bold text-red-400">FASE {ship.phase} / 5</span>
          </div>
        </div>
      </div>

      {/* 6 Subsystem Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SYSTEM_IDS.map((id) => {
          const val = ship.systems[id];
          return (
            <div key={id} className="p-2.5 bg-[#141619] border border-gray-800 rounded-xl space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400 uppercase">{id}</span>
                <span
                  className={`font-bold ${
                    val < 30 ? 'text-red-400' : val < 60 ? 'text-amber-400' : 'text-green-400'
                  }`}
                >
                  {val.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-black h-1.5 rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    val < 30 ? 'bg-red-500' : val < 60 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Station Console & Task Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Player's Station Console */}
        <div className="space-y-4">
          <StationPanel
            onTriggerSkill={handleTriggerSkill}
            skillCooldownRemaining={skillCd}
          />
          <QuickComm />
        </div>

        {/* Right Column: Shared Damage Task Board */}
        <div>
          <TaskBoard onStartMinigame={handleStartMinigame} />
        </div>
      </div>

      {/* Minigame Modal Overlay */}
      {activeMinigame && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setActiveMinigame(null)}
              className="absolute -top-10 right-0 text-xs font-mono text-gray-400 hover:text-white"
            >
              [BATALKAN TUGAS]
            </button>
            {activeMinigame.type === 'cable' && (
              <CableConnection
                difficulty={1}
                seed={activeMinigame.uid * 1000 + ship.tickCount}
                onDone={handleMinigameDone}
              />
            )}
            {activeMinigame.type === 'routing' && (
              <PowerRouting
                difficulty={1}
                seed={activeMinigame.uid * 1000 + ship.tickCount}
                onDone={handleMinigameDone}
              />
            )}
            {(activeMinigame.type === 'antenna' || activeMinigame.type === 'calibrate') && (
              <AntennaAlignment
                difficulty={1}
                seed={activeMinigame.uid * 1000 + ship.tickCount}
                onDone={handleMinigameDone}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
