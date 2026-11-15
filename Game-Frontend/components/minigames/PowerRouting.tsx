import React, { useState, useEffect, useRef } from 'react';
import type { MinigameProps } from './types';
import { nextRand } from '../../engine/crisis/rng';

type PipeType = 'straight' | 'elbow' | 'tee' | 'cross';

interface MiddleCell {
  row: number;
  col: number; // 1 or 2
  type: PipeType;
  rotation: number; // 0, 1, 2, 3 (each * 90 deg clockwise)
  isBroken: boolean;
}

// Directions: 0 = Top, 1 = Right, 2 = Bottom, 3 = Left
const BASE_PORTS: Record<PipeType, number[]> = {
  straight: [0, 2],
  elbow: [0, 1],
  tee: [0, 1, 2],
  cross: [0, 1, 2, 3],
};

function getPorts(cell: MiddleCell): number[] {
  if (cell.isBroken) return [];
  const base = BASE_PORTS[cell.type];
  return base.map((p) => (p + cell.rotation) % 4);
}

export const PowerRouting: React.FC<MinigameProps> = ({ difficulty, seed, onDone }) => {
  const [cells, setCells] = useState<MiddleCell[]>([]);
  const [activePaths, setActivePaths] = useState<string[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  const doneCalledRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  // Generate board with guaranteed solvable path
  useEffect(() => {
    let rng = seed >>> 0;
    const numBroken = Math.min(difficulty, 3);

    // 6 middle cells: (0,1), (1,1), (2,1), (0,2), (1,2), (2,2)
    // We pick 1 guaranteed path from col 0 to col 3 (row 1, col 3).
    // Candidate paths from col 0 to (1,3):
    // Path A: (1,0) -> (1,1) -> (1,2) -> (1,3) [straight through row 1]
    // Path B: (0,0) -> (0,1) -> (0,2) -> (1,2) -> (1,3)
    // Path C: (2,0) -> (2,1) -> (2,2) -> (1,2) -> (1,3)
    // Path D: (0,0) -> (0,1) -> (1,1) -> (1,2) -> (1,3)
    // Path E: (2,0) -> (2,1) -> (1,1) -> (1,2) -> (1,3)

    const candidatePaths = [
      [{ r: 1, c: 1 }, { r: 1, c: 2 }],
      [{ r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 2 }],
      [{ r: 2, c: 1 }, { r: 2, c: 2 }, { r: 1, c: 2 }],
      [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
      [{ r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
    ];

    let r: number;
    [r, rng] = nextRand(rng);
    const chosenPath = candidatePaths[Math.floor(r * candidatePaths.length)];
    const pathKeySet = new Set(chosenPath.map((p) => `${p.r},${p.c}`));

    // Potential broken cells are cells NOT in chosenPath
    const candidateBroken: { r: number; c: number }[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 1; col <= 2; col++) {
        if (!pathKeySet.has(`${row},${col}`)) {
          candidateBroken.push({ r: row, c: col });
        }
      }
    }

    // Pick broken cells
    const brokenSet = new Set<string>();
    const pool = [...candidateBroken];
    for (let b = 0; b < numBroken && pool.length > 0; b++) {
      [r, rng] = nextRand(rng);
      const idx = Math.floor(r * pool.length);
      const chosen = pool.splice(idx, 1)[0];
      brokenSet.add(`${chosen.r},${chosen.c}`);
    }

    // Pipe types pool
    const pipeTypes: PipeType[] = ['straight', 'elbow', 'tee', 'cross'];

    // Build 6 cells with scramble
    const initialCells: MiddleCell[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 1; col <= 2; col++) {
        const isBroken = brokenSet.has(`${row},${col}`);
        [r, rng] = nextRand(rng);
        const type = isBroken ? 'straight' : pipeTypes[Math.floor(r * pipeTypes.length)];
        [r, rng] = nextRand(rng);
        const rot = Math.floor(r * 4);
        initialCells.push({ row, col, type, rotation: rot, isBroken });
      }
    }

    setCells(initialCells);
  }, [difficulty, seed]);

  const finish = (success: boolean) => {
    if (doneCalledRef.current) return;
    doneCalledRef.current = true;
    const ms = elapsedMs;
    const score = success ? Math.max(0, Math.round(100 - ms / 250)) : 0;
    onDone({ success, ms, score });
  };

  // Timer loop (25 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      if (doneCalledRef.current) return;
      const actualMs = Date.now() - startTimeRef.current;
      setElapsedMs(actualMs);
      if (actualMs >= 25000) {
        finish(false);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // BFS check for connectivity from Sources to Vital Bus (row 1, col 3)
  useEffect(() => {
    if (cells.length === 0 || doneCalledRef.current) return;

    // Helper map of cells
    const cellMap = new Map<string, MiddleCell>();
    cells.forEach((c) => cellMap.set(`${c.row},${c.col}`, c));

    // Check connection between two points
    // Col 0: sources at (0,0), (1,0), (2,0) with port 1 (Right)
    // Col 3: vital bus at (1,3) with port 3 (Left)
    // Directions: 0=Up, 1=Right, 2=Down, 3=Left
    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];

    const visited = new Set<string>();
    const queue: { r: number; c: number }[] = [];

    // Push sources that can enter col 1
    for (let r = 0; r < 3; r++) {
      const neighbor = cellMap.get(`${r},1`);
      if (neighbor && !neighbor.isBroken) {
        const ports = getPorts(neighbor);
        if (ports.includes(3)) {
          // Port 3 connects westward to source!
          queue.push({ r, c: 1 });
          visited.add(`${r},1`);
        }
      }
    }

    let reachedTarget = false;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.r === 1 && curr.c === 2) {
        // Can it exit eastward to (1,3)?
        const c2 = cellMap.get(`1,2`);
        if (c2 && getPorts(c2).includes(1)) {
          reachedTarget = true;
        }
      }

      const currCell = cellMap.get(`${curr.r},${curr.c}`);
      if (!currCell) continue;
      const currPorts = getPorts(currCell);

      for (const p of currPorts) {
        const nr = curr.r + dr[p];
        const nc = curr.c + dc[p];
        const key = `${nr},${nc}`;

        // Only traverse within middle grid cols 1 and 2
        if (nc >= 1 && nc <= 2 && nr >= 0 && nr < 3) {
          if (!visited.has(key)) {
            const nextCell = cellMap.get(key);
            if (nextCell && !nextCell.isBroken) {
              const oppPort = (p + 2) % 4;
              if (getPorts(nextCell).includes(oppPort)) {
                visited.add(key);
                queue.push({ r: nr, c: nc });
              }
            }
          }
        }
      }
    }

    setActivePaths(Array.from(visited));

    if (reachedTarget) {
      setTimeout(() => finish(true), 250);
    }
  }, [cells]);

  const rotateCell = (row: number, col: number) => {
    if (doneCalledRef.current) return;
    setCells((prev) =>
      prev.map((c) => {
        if (c.row === row && c.col === col && !c.isBroken) {
          return { ...c, rotation: (c.rotation + 1) % 4 };
        }
        return c;
      })
    );
  };

  const remainingSec = Math.max(0, Math.ceil((25000 - elapsedMs) / 1000));

  return (
    <div className="bg-[#141619] border border-amber-500/30 rounded-xl p-5 w-full max-w-lg mx-auto text-white shadow-2xl relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
            MINIGAME: POWER ROUTING
          </div>
          <div className="text-xs text-gray-400">
            Putar ubin pipa untuk menyambungkan Daya ke Bus Vital
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

      {/* Grid Canvas / Board */}
      <div className="bg-black/60 border border-gray-800 rounded-xl p-4 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-3">
          {/* Row 0, 1, 2 */}
          {[0, 1, 2].map((r) => (
            <React.Fragment key={r}>
              {/* Col 0: Power Source */}
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-lg bg-amber-500/10 border border-amber-500/50 flex flex-col items-center justify-center p-1 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping mb-1" />
                  <span className="text-[9px] font-mono text-amber-300 font-bold uppercase">
                    GEN {r + 1}
                  </span>
                  <span className="text-[8px] font-mono text-gray-400">PWR IN</span>
                </div>
              </div>

              {/* Col 1 & 2: Middle interactive pipe cells */}
              {[1, 2].map((c) => {
                const cell = cells.find((x) => x.row === r && x.col === c);
                if (!cell) return <div key={c} className="w-16 h-16" />;

                const isEnergized = activePaths.includes(`${r},${c}`);
                const ports = getPorts(cell);

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => rotateCell(r, c)}
                    disabled={cell.isBroken}
                    className={`w-16 h-16 rounded-lg border transition-transform relative flex items-center justify-center ${
                      cell.isBroken
                        ? 'bg-red-950/40 border-red-500/80 cursor-not-allowed'
                        : isEnergized
                        ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.4)] cursor-pointer hover:scale-105 active:scale-95'
                        : 'bg-[#1c1f24] border-gray-700 hover:border-gray-500 cursor-pointer hover:scale-105 active:scale-95'
                    }`}
                  >
                    {cell.isBroken ? (
                      <div className="text-center">
                        <div className="text-[10px] font-mono font-bold text-red-400">
                          RUSAK
                        </div>
                        <div className="text-[8px] text-red-500">BLOCKED</div>
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        {/* Center core */}
                        <div
                          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${
                            isEnergized ? 'bg-amber-400' : 'bg-gray-600'
                          }`}
                        />
                        {/* Port lines: 0=Up, 1=Right, 2=Down, 3=Left */}
                        {ports.includes(0) && (
                          <div
                            className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1/2 ${
                              isEnergized ? 'bg-amber-400' : 'bg-gray-500'
                            }`}
                          />
                        )}
                        {ports.includes(1) && (
                          <div
                            className={`absolute top-1/2 right-0 -translate-y-1/2 h-2 w-1/2 ${
                              isEnergized ? 'bg-amber-400' : 'bg-gray-500'
                            }`}
                          />
                        )}
                        {ports.includes(2) && (
                          <div
                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1/2 ${
                              isEnergized ? 'bg-amber-400' : 'bg-gray-500'
                            }`}
                          />
                        )}
                        {ports.includes(3) && (
                          <div
                            className={`absolute top-1/2 left-0 -translate-y-1/2 h-2 w-1/2 ${
                              isEnergized ? 'bg-amber-400' : 'bg-gray-500'
                            }`}
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Col 3: Bus vital (row 1 only; row 0 & 2 are empty/shielded) */}
              <div className="flex items-center justify-center">
                {r === 1 ? (
                  <div className="w-16 h-16 rounded-lg bg-cyan-950/30 border border-cyan-500/70 flex flex-col items-center justify-center p-1 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase text-center leading-tight">
                      BUS VITAL
                    </span>
                    <span className="text-[8px] font-mono text-cyan-400 mt-1">MAIN PWR</span>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed border-gray-800 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-gray-700">N/C</span>
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Instructions / status */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] font-mono text-gray-400">
        <div>Klik pipa untuk memutar 90°</div>
        <div className="text-amber-400">
          Ubin rusak: {cells.filter((c) => c.isBroken).length}
        </div>
      </div>
    </div>
  );
};
