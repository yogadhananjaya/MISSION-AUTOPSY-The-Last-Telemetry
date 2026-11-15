import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  BatteryCharging, 
  Thermometer, 
  Zap, 
  Activity, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Wrench,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { 
  initShip, 
  stepShip, 
  REWIND_PARAMS, 
  fmtT, 
  inEclipse, 
  minutesToEclipse, 
  type ShipState, 
  type Action,
  SYSTEM_IDS
} from '../../engine/crisis/shipState';
import { DAMAGE_DEFS } from '../../engine/crisis/damageGraph';
import { CableConnection } from '../minigames/CableConnection';
import { PowerRouting } from '../minigames/PowerRouting';
import { AntennaAlignment } from '../minigames/AntennaAlignment';
import { sounds } from '../../utils/soundEngine';

export const RewindStage: React.FC = () => {
  const { 
    isHypothesisCorrect, 
    lastSubmitMissingCount, 
    setPhase, 
    setRewindResult,
    language 
  } = useMissionStore();

  const [state, setState] = useState<ShipState>(() => initShip(REWIND_PARAMS, 1, 180));
  const [queuedActions, setQueuedActions] = useState<Action[]>([]);
  const [activeMinigame, setActiveMinigame] = useState<{
    uid: number;
    defId: string;
    type: 'cable' | 'routing' | 'antenna' | 'calibrate';
  } | null>(null);

  const [novaMessage, setNovaMessage] = useState<string>(
    language === 'en'
      ? 'CRISIS REWIND: You have assumed control of ASTER-9 at T+03:00 before shadow ingress.'
      : 'REWIND KRISIS: Kendali ASTER-9 diambil alih pada T+03:00 sebelum wahana masuk bayangan.'
  );

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
        const next = stepShip(prev, REWIND_PARAMS, acts);

        // NOVA messages
        if (next.t === 190) {
          if (isHypothesisCorrect && lastSubmitMissingCount === 0) {
            setNovaMessage(
              language === 'en'
                ? 'ALERT: Battery temperature is plunging. Engage heaters before T+03:50 to prevent freezing.'
                : 'PERINGATAN: Suhu sel turun drastis, nyalakan pemanas sebelum T+03:50 untuk mencegah pembekuan.'
            );
          }
        }

        // Event logs
        for (const ev of next.events) {
          if (ev.startsWith('DAMAGE:')) {
            const defId = ev.split(':')[1];
            const def = DAMAGE_DEFS[defId];
            sounds.playAlarm();
            setNovaMessage(
              language === 'en'
                ? `CRITICAL ALERT: ${def?.label ?? defId} detected!`
                : `PERINGATAN KRITIS: Terdeteksi ${def?.label ?? defId}!`
            );
          } else if (ev.startsWith('REPAIRED:')) {
            sounds.playSuccess();
            setNovaMessage(
              language === 'en' ? 'Subsystem repair successful.' : 'Perbaikan subsistem berhasil.'
            );
          } else if (ev.startsWith('WRONG_REPAIR:')) {
            sounds.playAlarm();
            setNovaMessage(
              language === 'en'
                ? 'ERROR: Repair attempted without diagnostic clearance! Hull degraded.'
                : 'GAGAL: Perbaikan dilakukan tanpa diagnosis! Integritas lambung rusak.'
            );
          }
        }

        if (next.over) {
          if (next.outcome === 'success') {
            sounds.playSuccess();
          } else {
            sounds.playAlarm();
          }
        }

        return next;
      });
    }, 750);

    return () => clearInterval(interval);
  }, [state.over, isHypothesisCorrect, lastSubmitMissingCount, language]);

  const queueAction = (act: Action) => {
    sounds.playClick(600);
    setQueuedActions((prev) => [...prev, act]);
  };

  const handleReset = () => {
    sounds.playClick(400);
    setQueuedActions([]);
    setActiveMinigame(null);
    setState(initShip(REWIND_PARAMS, 1, 180));
    setNovaMessage(
      language === 'en'
        ? 'SIMULATION RESTARTED: ASTER-9 state re-initialized to T+03:00.'
        : 'SIMULASI DIULANG: Kondisi ASTER-9 direset ke T+03:00.'
    );
  };

  const handleProceedToRefit = () => {
    sounds.playSuccess();
    setRewindResult({
      survived: state.outcome === 'success',
      finalSoc: Math.round(state.battery.socPct),
      science: state.stats.science,
      reason: state.reason,
    });
    setPhase('redesign');
  };

  // Minigame completion callback
  const handleMinigameDone = (res: { success: boolean }) => {
    if (!activeMinigame) return;
    if (res.success) {
      queueAction({ type: 'repair', uid: activeMinigame.uid });
    }
    setActiveMinigame(null);
  };

  // Eclipse calculations
  const eclipseNow = inEclipse(REWIND_PARAMS, state.t);
  const minToEclipse = minutesToEclipse(REWIND_PARAMS, state.t);

  // Electrical load calculation
  const currentLoadW =
    REWIND_PARAMS.idleW +
    (state.heaterOn ? REWIND_PARAMS.heaterW : 0) +
    (state.shedLevel === 0
      ? REWIND_PARAMS.specW + REWIND_PARAMS.lidarW
      : state.shedLevel === 1
      ? REWIND_PARAMS.specW
      : 0);

  return (
    <div className="space-y-5 select-none font-sans text-white">
      {/* Top Header Bar: Clock + Eclipse status */}
      <div className="bg-[#141619] border border-black p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black border border-amber-500/40 rounded">
            <RotateCcw className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                CRISIS REWIND MODE
              </span>
              <span className="text-[10px] bg-red-950/60 border border-red-500/60 text-red-300 font-mono px-1.5 py-0.5 rounded">
                LIVE INTERACTIVE
              </span>
            </div>
            <h2 className="text-sm font-mono text-slate-300">
              {language === 'en'
                ? 'Can you pilot ASTER-9 to survive through the eclipse shadow?'
                : 'Bisakah kamu mengendalikan ASTER-9 agar selamat melewati gerhana?'}
            </h2>
          </div>
        </div>

        {/* Mission Time & Eclipse Clock */}
        <div className="flex items-center gap-4 bg-black/60 border border-slate-800 px-4 py-2 rounded-lg font-mono">
          <div>
            <div className="text-[10px] text-gray-500 uppercase">MISSION ELAPSED</div>
            <div className="text-xl font-bold text-amber-400">{fmtT(state.t)}</div>
          </div>
          <div className="h-8 w-[1px] bg-gray-800" />
          <div>
            <div className="text-[10px] text-gray-500 uppercase">JAM GERHANA</div>
            <div
              className={`text-sm font-bold flex items-center gap-1.5 ${
                eclipseNow ? 'text-purple-400 animate-pulse' : 'text-amber-300'
              }`}
            >
              {eclipseNow ? (
                <span>SEDANG GERHANA</span>
              ) : (
                <span>Gerhana dalam {minToEclipse} menit</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Center Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Bus Voltage */}
        <div className="bg-[#141619] border border-black p-3.5 rounded-lg space-y-1 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              TEGANGAN BUS
            </span>
            <span
              className={`font-bold ${
                state.battery.busV < 22.5 ? 'text-red-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              {state.battery.busV.toFixed(2)} V
            </span>
          </div>
          <div className="w-full bg-black h-2.5 rounded overflow-hidden relative border border-gray-800">
            {/* Red threshold marker at 22V (22/30 = ~73%) */}
            <div className="absolute top-0 bottom-0 left-[73%] w-0.5 bg-red-500 z-10" />
            <div
              className={`h-full transition-all duration-300 ${
                state.battery.busV < 22.5 ? 'bg-red-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (state.battery.busV / 30) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>0 V</span>
            <span className="text-red-400 font-bold">UVLO 22.0V</span>
            <span>30.0 V</span>
          </div>
        </div>

        {/* Battery SOC */}
        <div className="bg-[#141619] border border-black p-3.5 rounded-lg space-y-1 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-green-400" />
              STATUS DAYA (SOC)
            </span>
            <span
              className={`font-bold ${
                state.battery.socPct < 20 ? 'text-red-400 animate-pulse' : 'text-green-400'
              }`}
            >
              {state.battery.socPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-black h-2.5 rounded overflow-hidden border border-gray-800">
            <div
              className={`h-full transition-all duration-300 ${
                state.battery.socPct < 20 ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, state.battery.socPct))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>0%</span>
            <span>{state.battery.energyWh.toFixed(0)} Wh</span>
            <span>100%</span>
          </div>
        </div>

        {/* Cell Temperature */}
        <div className="bg-[#141619] border border-black p-3.5 rounded-lg space-y-1 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              SUHU SEL
            </span>
            <span
              className={`font-bold ${
                state.battery.tempC < -10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
              }`}
            >
              {state.battery.tempC.toFixed(1)}°C
            </span>
          </div>
          <div className="w-full bg-black h-2.5 rounded overflow-hidden relative border border-gray-800">
            {/* -10C threshold marker on range [-42 to +25] => total 67, (-10 - (-42)) / 67 = 32 / 67 = ~48% */}
            <div className="absolute top-0 bottom-0 left-[48%] w-0.5 bg-red-500 z-10" />
            <div
              className={`h-full transition-all duration-300 ${
                state.battery.tempC < -10 ? 'bg-red-500' : 'bg-cyan-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, ((state.battery.tempC - REWIND_PARAMS.coolFloorC) / 67) * 100)
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>-42°C</span>
            <span className="text-red-400 font-bold">BEKU -10°C</span>
            <span>+25°C</span>
          </div>
        </div>

        {/* Electrical Load */}
        <div className="bg-[#141619] border border-black p-3.5 rounded-lg space-y-1 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-yellow-400" />
              TOTAL BEBAN
            </span>
            <span className="font-bold text-yellow-400">{currentLoadW} W</span>
          </div>
          <div className="w-full bg-black h-2.5 rounded overflow-hidden border border-gray-800">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (currentLoadW / 300) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>Idle: {REWIND_PARAMS.idleW}W</span>
            <span>Sains: {state.stats.science} pts</span>
            <span>Max: 300W</span>
          </div>
        </div>
      </div>

      {/* Main Center Area: Systems (Right) & Damages + Controls (Left/Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Controls & Damages */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Panel: Heater & Load Shedding */}
          <div className="bg-[#141619] border border-black p-4 rounded-xl space-y-3 shadow-md">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              PANEL AKSI DARURAT
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Heater Toggle */}
              <button
                type="button"
                onClick={() => queueAction({ type: 'heater', on: !state.heaterOn })}
                className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                  state.heaterOn
                    ? 'bg-amber-950/40 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                    : 'bg-black/40 border-gray-800 hover:border-gray-700 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame
                    className={`w-5 h-5 ${state.heaterOn ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`}
                  />
                  <div className="text-left font-mono">
                    <div className="text-xs font-bold">PEMANAS BATERAI (25W)</div>
                    <div className="text-[10px] text-gray-400">
                      {state.heaterOn ? 'AKTIF: Mencegah beku' : 'NONAKTIF: Hemat daya'}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                    state.heaterOn ? 'bg-amber-400 text-black' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {state.heaterOn ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Load Shedding Level */}
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-lg flex flex-col justify-between">
                <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">
                  PELEPASAN BEBAN (LOAD SHED)
                </div>
                <div className="grid grid-cols-3 gap-1 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => queueAction({ type: 'shed', level: 0 })}
                    className={`py-1.5 rounded border text-[11px] font-bold cursor-pointer transition-all ${
                      state.shedLevel === 0
                        ? 'border-green-400 bg-green-950/40 text-green-300'
                        : 'border-gray-800 bg-gray-900 text-gray-500'
                    }`}
                  >
                    Semua (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => queueAction({ type: 'shed', level: 1 })}
                    className={`py-1.5 rounded border text-[11px] font-bold cursor-pointer transition-all ${
                      state.shedLevel === 1
                        ? 'border-yellow-400 bg-yellow-950/40 text-yellow-300'
                        : 'border-gray-800 bg-gray-900 text-gray-500'
                    }`}
                  >
                    -Lidar (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => queueAction({ type: 'shed', level: 2 })}
                    className={`py-1.5 rounded border text-[11px] font-bold cursor-pointer transition-all ${
                      state.shedLevel === 2
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                        : 'border-gray-800 bg-gray-900 text-gray-500'
                    }`}
                  >
                    -Semua (2)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Damages List */}
          <div className="bg-[#141619] border border-black p-4 rounded-xl space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                STATUS KERUSAKAN AKTIF ({state.damages.length})
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                Diperbaiki: {state.stats.repaired} | Didiagnosis: {state.stats.diagnosed}
              </span>
            </div>

            {state.damages.length === 0 ? (
              <div className="p-6 bg-black/40 border border-dashed border-gray-800 rounded-lg text-center font-mono text-xs text-gray-500">
                ✓ Tidak ada kerusakan subsistem yang terdeteksi saat ini.
              </div>
            ) : (
              <div className="space-y-2">
                {state.damages.map((dmg) => {
                  const def = DAMAGE_DEFS[dmg.defId];
                  return (
                    <div
                      key={dmg.uid}
                      className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        def?.severity === 'critical'
                          ? 'bg-red-950/20 border-red-500/50'
                          : 'bg-amber-950/20 border-amber-500/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                              def?.severity === 'critical'
                                ? 'bg-red-500 text-black'
                                : 'bg-amber-400 text-black'
                            }`}
                          >
                            {def?.severity ?? 'ANOMALY'}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {def?.label ?? dmg.defId}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 font-sans">
                          <span className="font-bold text-gray-400 font-mono">Gejala: </span>
                          {def?.symptom}
                        </p>
                        {dmg.diagnosed && (
                          <p className="text-xs text-amber-300 font-sans border-l-2 border-amber-400 pl-2 mt-1">
                            <span className="font-bold font-mono">Akar: </span>
                            {def?.cause}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!dmg.diagnosed ? (
                          <button
                            type="button"
                            onClick={() => queueAction({ type: 'diagnose', uid: dmg.uid })}
                            className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5" />
                            ANALISIS
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const mg = def?.minigame ?? 'calibrate';
                              setActiveMinigame({
                                uid: dmg.uid,
                                defId: dmg.defId,
                                type: mg,
                              });
                            }}
                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                          >
                            <Wrench className="w-3.5 h-3.5" />
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

        {/* Right Col: 6 System Bars + NOVA */}
        <div className="space-y-4">
          {/* 6 Subsystem Bars */}
          <div className="bg-[#141619] border border-black p-4 rounded-xl space-y-3 shadow-md">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              INTEGRITAS SUBSISTEM
            </div>
            <div className="space-y-2.5 font-mono text-xs">
              {SYSTEM_IDS.map((id) => {
                const val = state.systems[id];
                return (
                  <div key={id} className="space-y-1">
                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span className="uppercase">{id}</span>
                      <span
                        className={`font-bold ${
                          val < 30 ? 'text-red-400' : val < 60 ? 'text-amber-400' : 'text-green-400'
                        }`}
                      >
                        {val.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-black h-2 rounded overflow-hidden border border-gray-800">
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
          </div>

          {/* NOVA Tactical Mascot Box */}
          <div className="bg-[#141619] border border-black p-4 rounded-xl space-y-2 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                AI TACTICAL ADVISOR (NOVA)
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans bg-black/40 p-2.5 rounded border border-gray-800/80">
              {novaMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Minigame Modal Dialog */}
      {activeMinigame && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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

      {/* Game Over / Success Modal */}
      {state.over && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141619] border-2 border-amber-500/80 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            {state.outcome === 'success' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 mx-auto flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black font-display text-green-400">
                  ASTER-9 SELAMAT!
                </h3>
                <p className="text-xs text-gray-300 font-sans">
                  Wahana berhasil bertahan melewati bayangan gerhana dan menjaga daya hingga kontak
                  kembali pulih.
                </p>
                <div className="grid grid-cols-2 gap-2 bg-black/60 p-3 rounded-lg font-mono text-xs">
                  <div>
                    <span className="text-gray-400">SOC AKHIR:</span>
                    <div className="text-green-400 font-bold text-sm">
                      {state.battery.socPct.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">SAINS TERKUMPUL:</span>
                    <div className="text-amber-400 font-bold text-sm">
                      {state.stats.science} PTS
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleProceedToRefit}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black font-display text-xs tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                >
                  <span>LANJUT KE REFIT / DESAIN ULANG</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 mx-auto flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black font-display text-red-400">
                  ASTER-9 MENGALAMI KEGAGALAN
                </h3>
                <div className="p-3 bg-black/60 border border-red-500/40 rounded-lg text-xs font-mono text-red-300 text-left">
                  <span className="font-bold text-gray-400 block mb-1">PENYEBAB:</span>
                  {state.reason ?? 'Kegagalan kritis pada subsistem wahana.'}
                </div>
                <p className="text-xs text-gray-400 font-sans">
                  Coba nyalakan pemanas baterai sebelum suhu sel mencapai -10°C, lepaskan beban instrumen
                  sains, dan perbaiki kabel bus yang longgar.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-amber-400 border border-amber-500/50 font-bold font-mono text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ULANGI REWIND</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
