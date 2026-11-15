/* antislop: Generic crisis simulation runtime for Episodes 02-06; no AI slop placeholder text */
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  ChevronLeft
} from 'lucide-react';
import type { EpisodeDef } from '../../engine/crisis/episodes';
import { episodeWon } from '../../engine/crisis/episodes';
import type { AgentDef } from '../../data/agents';
import { 
  initShip, 
  stepShip, 
  fmtT, 
  inEclipse, 
  minutesToEclipse, 
  type ShipState, 
  type Action,
  SYSTEM_IDS 
} from '../../engine/crisis/shipState';
import { DAMAGE_DEFS, type MinigameId } from '../../engine/crisis/damageGraph';
import { CableConnection } from '../minigames/CableConnection';
import { PowerRouting } from '../minigames/PowerRouting';
import { AntennaAlignment } from '../minigames/AntennaAlignment';
import { useProgressStore } from '../../store/useProgressStore';
import { sounds } from '../../utils/soundEngine';

interface EpisodeStageProps {
  episode: EpisodeDef;
  companion: AgentDef;
  onExitToMap: () => void;
}

export const EpisodeStage: React.FC<EpisodeStageProps> = ({
  episode,
  companion,
  onExitToMap,
}) => {
  const { completeEpisode } = useProgressStore();

  const [state, setState] = useState<ShipState>(() => {
    const s = initShip(episode.params, 1, episode.startMin);
    if (episode.id !== 'ep01') {
      s.battery.energyWh = episode.params.capWh;
      s.battery.socPct = 100;
      s.battery.busV = 28.3;
    }
    return s;
  });

  const [queuedActions, setQueuedActions] = useState<Action[]>([]);
  const [activeMinigame, setActiveMinigame] = useState<{
    uid: number;
    defId: string;
    type: MinigameId;
  } | null>(null);

  const [skillCd, setSkillCd] = useState(0);
  const queuedActionsRef = useRef<Action[]>([]);
  queuedActionsRef.current = queuedActions;

  // Main 750ms simulation tick
  useEffect(() => {
    if (state.over) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.over) return prev;
        const acts = [...queuedActionsRef.current];
        setQueuedActions([]);
        const next = stepShip(prev, episode.params, acts);

        if (next.over) {
          const won = episodeWon(episode, next);
          if (won) {
            sounds.playSuccess();
            // Calculate stars: 1 to 3
            let stars = 1;
            if (next.battery.socPct >= 25) stars = 2;
            if (next.battery.socPct >= 50 && next.stats.wrongRepairs === 0) stars = 3;
            completeEpisode(episode.id, stars, episode.reward);
          } else {
            sounds.playAlarm();
          }
        }
        return next;
      });
    }, 750);

    return () => clearInterval(interval);
  }, [state.over, episode]);

  // Skill cooldown timer
  useEffect(() => {
    if (skillCd <= 0) return;
    const t = setInterval(() => setSkillCd((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [skillCd]);

  const queueAction = (act: Action) => {
    sounds.playClick(600);
    setQueuedActions((prev) => [...prev, act]);
  };

  const handleTriggerCompanionSkill = () => {
    if (skillCd > 0) return;
    sounds.playSuccess();
    setSkillCd(companion.active.cooldownSec);

    // Apply companion skill effect
    if (companion.active.effect === 'scan') {
      setState((prev) => {
        const next = structuredClone(prev);
        next.damages.forEach((d) => (d.diagnosed = true));
        return next;
      });
    } else if (companion.active.effect === 'solar_boost') {
      setState((prev) => {
        const next = structuredClone(prev);
        next.battery.energyWh = Math.min(episode.params.capWh, next.battery.energyWh + 30);
        return next;
      });
    } else if (companion.active.effect === 'cryo_flush') {
      setState((prev) => {
        const next = structuredClone(prev);
        next.battery.tempC = Math.min(25, next.battery.tempC + 10);
        return next;
      });
    }
  };

  const handleReset = () => {
    sounds.playClick(400);
    setQueuedActions([]);
    setActiveMinigame(null);
    const s = initShip(episode.params, 1, episode.startMin);
    if (episode.id !== 'ep01') {
      s.battery.energyWh = episode.params.capWh;
      s.battery.socPct = 100;
      s.battery.busV = 28.3;
    }
    setState(s);
  };

  const handleMinigameDone = (res: { success: boolean }) => {
    if (!activeMinigame) return;
    if (res.success) {
      queueAction({ type: 'repair', uid: activeMinigame.uid });
    }
    setActiveMinigame(null);
  };

  const isEcl = inEclipse(episode.params, state.t);
  const minToEcl = minutesToEclipse(episode.params, state.t);
  const isWon = episodeWon(episode, state);

  return (
    <div className="max-w-5xl mx-auto space-y-4 font-mono select-none text-white p-3 sm:p-5">
      {/* Top Header */}
      <div className="bg-[#141619] border border-black p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitToMap}
            className="p-2 bg-black border border-gray-800 hover:border-amber-400 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-all flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PETA</span>
          </button>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              EPISODE 0{episode.number}: {episode.name}
            </div>
            <div className="text-base font-bold text-amber-400">{fmtT(state.t)}</div>
          </div>
        </div>

        {/* Eclipse & Companion Skill */}
        <div className="flex items-center gap-3">
          <div className="bg-black/60 border border-gray-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-[10px] text-gray-500 block uppercase">GERHANA</span>
            <span className={isEcl ? 'text-purple-400 font-bold' : 'text-amber-300'}>
              {isEcl ? 'SEDANG GERHANA' : `${minToEcl}m`}
            </span>
          </div>

          <button
            type="button"
            disabled={skillCd > 0}
            onClick={handleTriggerCompanionSkill}
            className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{skillCd > 0 ? `SKILL (${skillCd}s)` : companion.active.name}</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3 bg-[#141619] border border-gray-800 rounded-xl">
          <span className="text-[10px] text-gray-500 block">BUS VOLTAGE</span>
          <span className={`text-base font-bold ${state.battery.busV < 22.5 ? 'text-red-400' : 'text-amber-400'}`}>
            {state.battery.busV.toFixed(2)} V
          </span>
        </div>
        <div className="p-3 bg-[#141619] border border-gray-800 rounded-xl">
          <span className="text-[10px] text-gray-500 block">BATTERY SOC</span>
          <span className="text-base font-bold text-green-400">{state.battery.socPct.toFixed(1)}%</span>
        </div>
        <div className="p-3 bg-[#141619] border border-gray-800 rounded-xl">
          <span className="text-[10px] text-gray-500 block">CELL TEMP</span>
          <span className={`text-base font-bold ${state.battery.tempC < -10 ? 'text-red-400' : 'text-cyan-400'}`}>
            {state.battery.tempC.toFixed(1)}°C
          </span>
        </div>
        <div className="p-3 bg-[#141619] border border-gray-800 rounded-xl">
          <span className="text-[10px] text-gray-500 block">REPAIR STATS</span>
          <span className="text-base font-bold text-amber-300">{state.stats.repaired} Selesai</span>
        </div>
      </div>

      {/* 6 Subsystem Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SYSTEM_IDS.map((id) => (
          <div key={id} className="p-2 bg-[#141619] border border-gray-800 rounded-lg">
            <div className="flex justify-between text-[9px] text-gray-400">
              <span className="uppercase">{id}</span>
              <span className="font-bold text-white">{state.systems[id].toFixed(0)}%</span>
            </div>
            <div className="w-full bg-black h-1 rounded overflow-hidden mt-1">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${state.systems[id]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Controls & Active Damages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Controls */}
        <div className="bg-[#141619] border border-gray-800 p-4 rounded-xl space-y-3">
          <div className="text-xs font-bold text-amber-400 uppercase">KENDALI DAYA & TERMAL</div>
          <button
            type="button"
            onClick={() => queueAction({ type: 'heater', on: !state.heaterOn })}
            className={`w-full p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
              state.heaterOn
                ? 'bg-amber-950/40 border-amber-400 text-amber-300'
                : 'bg-black/40 border-gray-800 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>PEMANAS (25W)</span>
            </div>
            <span className="font-bold">{state.heaterOn ? 'ON' : 'OFF'}</span>
          </button>

          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {[0, 1, 2].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => queueAction({ type: 'shed', level: lvl as 0 | 1 | 2 })}
                className={`py-1.5 rounded border font-bold cursor-pointer ${
                  state.shedLevel === lvl
                    ? 'border-yellow-400 bg-yellow-950/40 text-yellow-300'
                    : 'border-gray-800 bg-gray-900 text-gray-500'
                }`}
              >
                Shed {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Damages List (2 Cols) */}
        <div className="lg:col-span-2 bg-[#141619] border border-gray-800 p-4 rounded-xl space-y-2.5">
          <div className="text-xs font-bold text-amber-400 uppercase">
            STATUS KERUSAKAN AKTIF ({state.damages.length})
          </div>
          {state.damages.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs border border-dashed border-gray-800 rounded-lg">
              ✓ Semua sistem berfungsi normal.
            </div>
          ) : (
            <div className="space-y-2">
              {state.damages.map((dmg) => {
                const def = DAMAGE_DEFS[dmg.defId];
                return (
                  <div
                    key={dmg.uid}
                    className="p-2.5 rounded-lg bg-black/40 border border-gray-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{def?.label ?? dmg.defId}</div>
                      <div className="text-[10px] text-gray-400">{def?.symptom}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!dmg.diagnosed ? (
                        <button
                          type="button"
                          onClick={() => queueAction({ type: 'diagnose', uid: dmg.uid })}
                          className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-500 text-cyan-300 rounded text-xs font-bold cursor-pointer"
                        >
                          ANALISIS
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const mg = def?.minigame ?? 'calibrate';
                            setActiveMinigame({ uid: dmg.uid, defId: dmg.defId, type: mg });
                          }}
                          className="px-3 py-1 bg-amber-400 text-black font-black rounded text-xs cursor-pointer"
                        >
                          PERBAIKI
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Minigame Modal */}
      {activeMinigame && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setActiveMinigame(null)}
              className="absolute -top-10 right-0 text-xs font-mono text-gray-400 hover:text-white"
            >
              [TUTUP MODAL]
            </button>
            {activeMinigame.type === 'cable' && (
              <CableConnection
                difficulty={1}
                seed={activeMinigame.uid * 1000 + state.tickCount}
                onDone={handleMinigameDone}
              />
            )}
            {activeMinigame.type === 'routing' && (
              <PowerRouting
                difficulty={1}
                seed={activeMinigame.uid * 1000 + state.tickCount}
                onDone={handleMinigameDone}
              />
            )}
            {(activeMinigame.type === 'antenna' || activeMinigame.type === 'calibrate') && (
              <AntennaAlignment
                difficulty={1}
                seed={activeMinigame.uid * 1000 + state.tickCount}
                onDone={handleMinigameDone}
              />
            )}
          </div>
        </div>
      )}

      {/* Outcome Modal */}
      {state.over && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141619] border-2 border-amber-500 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            {isWon ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                <h3 className="text-xl font-bold font-display text-green-400">
                  MISI SELESAI : SUKSES!
                </h3>
                <p className="text-xs text-gray-300 font-sans">
                  Wahana berhasil mempertahankan operasi subsistem dan menyelesaikan target episode.
                </p>
                <div className="p-3 bg-black/60 rounded-xl font-mono text-xs flex justify-around">
                  <div>
                    <span className="text-gray-400 block">SOC AKHIR:</span>
                    <span className="text-green-400 font-bold">{state.battery.socPct.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">REWARD:</span>
                    <span className="text-amber-400 font-bold">+{episode.reward} CR</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onExitToMap}
                  className="w-full py-3 bg-amber-400 text-black font-black text-xs rounded-xl cursor-pointer shadow-lg"
                >
                  KEMBALI KE PETA MISI
                </button>
              </>
            ) : (
              <>
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
                <h3 className="text-xl font-bold font-display text-red-400">
                  MISI GAGAL
                </h3>
                <div className="p-3 bg-black/60 text-red-300 text-xs rounded-xl text-left">
                  {state.reason || 'Kondisi subsistem di bawah ambang batas minimum.'}
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-amber-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  ULANGI EPISODE
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
