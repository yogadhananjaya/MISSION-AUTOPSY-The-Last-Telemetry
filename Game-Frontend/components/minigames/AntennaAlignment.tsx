import React, { useState, useEffect, useRef } from 'react';
import type { MinigameProps } from './types';
import { nextRand } from '../../engine/crisis/rng';

export const AntennaAlignment: React.FC<MinigameProps> = ({ seed, onDone }) => {
  // Slider positions: 0 to 100
  const [az, setAz] = useState(50);
  const [el, setEl] = useState(50);

  // Target coordinates
  const [target, setTarget] = useState<{ x: number; y: number }>(() => {
    let rng = seed >>> 0;
    let r1: number, r2: number;
    [r1, rng] = nextRand(rng);
    [r2, rng] = nextRand(rng);
    // Range 20..80
    return {
      x: 20 + r1 * 60,
      y: 20 + r2 * 60,
    };
  });

  const [snr, setSnr] = useState(0);
  const [holdMs, setHoldMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const doneCalledRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());
  const lastTickRef = useRef<number>(Date.now());

  const finish = (success: boolean) => {
    if (doneCalledRef.current) return;
    doneCalledRef.current = true;
    const ms = elapsedMs;
    const score = success ? Math.max(0, Math.round(100 - ms / 300)) : 0;
    onDone({ success, ms, score });
  };

  // Main animation / update loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (doneCalledRef.current) return;
      const now = Date.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      const totalElapsed = now - startTimeRef.current;
      setElapsedMs(totalElapsed);

      if (totalElapsed >= 25000) {
        finish(false);
        return;
      }

      // Drift target slowly
      setTarget((prev) => {
        const nextX = prev.x + Math.sin(totalElapsed / 1500) * 0.02;
        const nextY = prev.y + Math.cos(totalElapsed / 1800) * 0.015;
        return {
          x: Math.min(85, Math.max(15, nextX)),
          y: Math.min(85, Math.max(15, nextY)),
        };
      });

      // Calculate SNR
      const dist = Math.hypot(az - target.x, el - target.y);
      const currentSnr = Math.max(0, 20 - 0.25 * dist);
      setSnr(currentSnr);

      // SNR threshold is 14 dB
      if (currentSnr >= 14) {
        setHoldMs((prev) => {
          const next = prev + dt;
          if (next >= 3000) {
            setTimeout(() => finish(true), 50);
          }
          return next;
        });
      } else {
        setHoldMs(0); // Reset hold if drops below 14 dB
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [az, el, target.x, target.y]);

  const remainingSec = Math.max(0, Math.ceil((25000 - elapsedMs) / 1000));
  const holdProgressPct = Math.min(100, (holdMs / 3000) * 100);
  const isLocked = snr >= 14;

  return (
    <div className="bg-[#141619] border border-amber-500/30 rounded-xl p-5 w-full max-w-lg mx-auto text-white shadow-2xl relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
            MINIGAME: ANTENNA ALIGNMENT
          </div>
          <div className="text-xs text-gray-400">
            Arahkan Azimut & Elevasi ke sinyal Bumi (SNR ≥ 14 dB selama 3 detik)
          </div>
        </div>
        <div className="text-right">
          <div
            className={`font-mono text-xl font-bold ${
              remainingSec <= 6 ? 'text-red-400 animate-pulse' : 'text-amber-400'
            }`}
          >
            {remainingSec}s
          </div>
          <div className="text-[10px] text-gray-500 font-mono">Batas 25s</div>
        </div>
      </div>

      {/* Radar Scope */}
      <div className="relative w-full h-48 bg-black/60 border border-gray-800 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
        {/* Radar concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-40 rounded-full border border-gray-800/80" />
          <div className="w-24 h-24 rounded-full border border-gray-800/60 absolute" />
          <div className="w-8 h-8 rounded-full border border-gray-800/40 absolute" />
          <div className="w-full h-[1px] bg-gray-800/50 absolute" />
          <div className="h-full w-[1px] bg-gray-800/50 absolute" />
        </div>

        {/* Target Beacon */}
        <div
          className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
          style={{
            left: `${target.x}%`,
            top: `${target.y}%`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-400 animate-ping absolute" />
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="absolute -top-4 text-[9px] font-mono text-cyan-300 font-bold whitespace-nowrap">
            EARTH BEACON
          </span>
        </div>

        {/* Current Reticle (Az / El) */}
        <div
          className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-2 rounded-full transition-colors flex items-center justify-center ${
            isLocked
              ? 'border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.6)]'
              : 'border-amber-400'
          }`}
          style={{
            left: `${az}%`,
            top: `${el}%`,
          }}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isLocked ? 'bg-green-400' : 'bg-amber-400'
            }`}
          />
        </div>
      </div>

      {/* SNR Gauge & Lock Progress */}
      <div className="bg-black/40 border border-gray-800 rounded-lg p-3 mb-4 space-y-3">
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-gray-400">SIGNAL-TO-NOISE (SNR):</span>
            <span
              className={`font-bold ${
                isLocked ? 'text-green-400' : 'text-amber-400'
              }`}
            >
              {snr.toFixed(1)} dB{' '}
              <span className="text-[10px] text-gray-500">(Target: ≥ 14.0 dB)</span>
            </span>
          </div>
          <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden relative">
            {/* 14 dB marker line (14/20 = 70%) */}
            <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-red-500 z-10" />
            <div
              className={`h-full transition-all duration-75 ${
                isLocked ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (snr / 20) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-gray-400">LOCK ACQUISITION (3.0s):</span>
            <span className="font-bold text-cyan-400">
              {(holdMs / 1000).toFixed(1)}s / 3.0s
            </span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-75"
              style={{ width: `${holdProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3 font-mono text-xs">
        <div>
          <div className="flex justify-between text-gray-400 mb-1">
            <span>AZIMUT (HORISONTAL):</span>
            <span className="text-amber-400 font-bold">{az.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={az}
            onChange={(e) => setAz(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-gray-400 mb-1">
            <span>ELEVASI (VERTIKAL):</span>
            <span className="text-amber-400 font-bold">{el.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={el}
            onChange={(e) => setEl(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
