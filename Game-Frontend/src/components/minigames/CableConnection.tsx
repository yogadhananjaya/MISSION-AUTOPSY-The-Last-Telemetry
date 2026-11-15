import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { MinigameProps } from './types';
import { nextRand } from '../../engine/crisis/rng';

const COLOR_PALETTE = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#06b6d4'];
const COLOR_NAMES: Record<string, string> = {
  '#ef4444': 'RED',
  '#22c55e': 'GREEN',
  '#3b82f6': 'BLUE',
  '#eab308': 'YELLOW',
  '#a855f7': 'PURPLE',
  '#06b6d4': 'CYAN',
};

export const CableConnection: React.FC<MinigameProps> = ({ difficulty, seed, onDone }) => {
  const n = 3 + difficulty;
  const colors = useMemo(() => COLOR_PALETTE.slice(0, n), [n]);

  const [currentSeed, setCurrentSeed] = useState(seed);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [selectedCable, setSelectedCable] = useState<string | null>(null);
  const [connectedMap, setConnectedMap] = useState<Record<string, number>>({});
  const [errorSocket, setErrorSocket] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [penaltyMs, setPenaltyMs] = useState(0);

  const doneCalledRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  // Generate mapping from seed
  const { manual, shuffledSockets } = useMemo(() => {
    let rng = currentSeed >>> 0;
    // Map each color to a socket 1..n
    const socketPool = Array.from({ length: n }, (_, i) => i + 1);
    // Shuffle pool using nextRand
    const shuffled: number[] = [];
    const poolCopy = [...socketPool];
    while (poolCopy.length > 0) {
      let r: number;
      [r, rng] = nextRand(rng);
      const idx = Math.floor(r * poolCopy.length);
      shuffled.push(poolCopy.splice(idx, 1)[0]);
    }

    const mapping: Record<string, number> = {};
    colors.forEach((col, i) => {
      mapping[col] = shuffled[i];
    });

    // Shuffle socket display order on the right
    const rightDisplay: number[] = [];
    const displayPool = [...socketPool];
    while (displayPool.length > 0) {
      let r: number;
      [r, rng] = nextRand(rng);
      const idx = Math.floor(r * displayPool.length);
      rightDisplay.push(displayPool.splice(idx, 1)[0]);
    }

    return { manual: mapping, shuffledSockets: rightDisplay };
  }, [currentSeed, n, colors]);

  const finish = (success: boolean) => {
    if (doneCalledRef.current) return;
    doneCalledRef.current = true;
    const totalMs = elapsedMs + penaltyMs;
    const score = success
      ? Math.max(0, Math.round(100 - (totalMs / 1000) * 2 - totalErrors * 5))
      : 0;
    onDone({ success, ms: totalMs, score });
  };

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (doneCalledRef.current) return;
      const actualMs = Date.now() - startTimeRef.current;
      setElapsedMs(actualMs);
      if (actualMs + penaltyMs >= 40000) {
        finish(false);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [penaltyMs]);

  const handleSelectCable = (color: string) => {
    if (connectedMap[color] !== undefined) return; // already connected
    setSelectedCable(color);
  };

  const handleConnectSocket = (socketNum: number) => {
    if (!selectedCable) return;

    // Check if socket already taken
    const alreadyTaken = Object.values(connectedMap).includes(socketNum);
    if (alreadyTaken) return;

    const expectedSocket = manual[selectedCable];
    if (expectedSocket === socketNum) {
      // Correct!
      const nextConnected = { ...connectedMap, [selectedCable]: socketNum };
      setConnectedMap(nextConnected);
      setSelectedCable(null);
      setConsecutiveErrors(0);

      // Check if all connected
      if (Object.keys(nextConnected).length === n) {
        setTimeout(() => finish(true), 200);
      }
    } else {
      // Wrong connection
      setErrorSocket(socketNum);
      setTimeout(() => setErrorSocket(null), 600);
      setPenaltyMs((p) => p + 3000);
      setTotalErrors((e) => e + 1);
      const nextErrors = consecutiveErrors + 1;
      if (nextErrors >= 3) {
        // Rescramble board
        setCurrentSeed((s) => (s + 1) >>> 0);
        setConnectedMap({});
        setSelectedCable(null);
        setConsecutiveErrors(0);
      } else {
        setConsecutiveErrors(nextErrors);
      }
    }
  };

  const effectiveRemainingSec = Math.max(
    0,
    Math.ceil((40000 - (elapsedMs + penaltyMs)) / 1000)
  );

  return (
    <div className="bg-[#141619] border border-amber-500/30 rounded-xl p-5 w-full max-w-lg mx-auto text-white shadow-2xl relative select-none">
      {/* Header with timer */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
            MINIGAME: CABLE CONNECTION
          </div>
          <div className="text-xs text-gray-400">
            Hubungkan kabel ke nomor soket sesuai Manual
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono text-xl font-bold ${effectiveRemainingSec <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
            {effectiveRemainingSec}s
          </div>
          {penaltyMs > 0 && (
            <div className="text-[10px] text-red-400 font-mono">
              +{(penaltyMs / 1000).toFixed(0)}s PENALTY
            </div>
          )}
        </div>
      </div>

      {/* Manual Table */}
      <div className="bg-black/40 border border-gray-800 rounded-lg p-3 mb-5">
        <div className="text-[11px] font-mono text-gray-400 mb-2 uppercase flex items-center justify-between">
          <span>MANUAL SAMBUNGAN</span>
          <span className="text-[10px] text-amber-500">Seed: {currentSeed}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {colors.map((c) => (
            <div
              key={c}
              className="flex items-center gap-2 bg-[#1a1d21] border border-gray-700/50 rounded px-2 py-1 text-xs font-mono"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: c }}
              />
              <span className="text-gray-300 truncate">{COLOR_NAMES[c]}</span>
              <span className="text-amber-400 font-bold ml-auto">→ #{manual[c]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Area */}
      <div className="flex justify-between items-center px-4 py-2 relative min-h-[220px]">
        {/* Cables (Left) */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-mono text-gray-500 text-center">KABEL</div>
          {colors.map((c) => {
            const isConnected = connectedMap[c] !== undefined;
            const isSelected = selectedCable === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleSelectCable(c)}
                disabled={isConnected}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                  isConnected
                    ? 'border-gray-800 opacity-40 cursor-default bg-gray-900'
                    : isSelected
                    ? 'border-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.5)] scale-105 bg-[#22262c]'
                    : 'border-gray-700 hover:border-gray-500 bg-[#1c1f24] active:scale-95'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                  style={{ backgroundColor: c }}
                />
                <span className="text-xs font-mono font-medium">
                  {COLOR_NAMES[c]}
                </span>
                {isConnected && (
                  <span className="text-[10px] text-green-400 font-mono">
                    ✓ #{connectedMap[c]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sockets (Right) */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-mono text-gray-500 text-center">SOKET</div>
          {shuffledSockets.map((sockNum) => {
            const connectedColor = Object.keys(connectedMap).find(
              (c) => connectedMap[c] === sockNum
            );
            const isErr = errorSocket === sockNum;
            return (
              <button
                key={sockNum}
                type="button"
                onClick={() => handleConnectSocket(sockNum)}
                disabled={!!connectedColor}
                className={`flex items-center justify-center w-24 py-2 rounded-lg border font-mono text-sm transition-all ${
                  connectedColor
                    ? 'border-green-500/50 bg-green-950/20 text-green-300 cursor-default'
                    : isErr
                    ? 'border-red-500 bg-red-950/40 text-red-200 animate-pulse'
                    : selectedCable
                    ? 'border-amber-500/70 hover:border-amber-400 hover:bg-amber-500/10 cursor-pointer bg-[#1c1f24] active:scale-95'
                    : 'border-gray-700 bg-[#1a1d21] text-gray-400 cursor-default'
                }`}
              >
                {connectedColor ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: connectedColor }}
                    />
                    <span>#{sockNum}</span>
                  </div>
                ) : (
                  <span>SOKET {sockNum}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer warning */}
      <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <div>
          Salah: <span className="text-red-400 font-bold">{consecutiveErrors}</span>/3 (reset
          jika 3)
        </div>
        <div className="text-gray-500">
          Tersambung: {Object.keys(connectedMap).length}/{n}
        </div>
      </div>
    </div>
  );
};
