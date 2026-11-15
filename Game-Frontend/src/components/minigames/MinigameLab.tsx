import React, { useState } from 'react';
import { CableConnection } from './CableConnection';
import { PowerRouting } from './PowerRouting';
import { AntennaAlignment } from './AntennaAlignment';
import type { MinigameResult } from './types';

export const MinigameLab: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'cable' | 'routing' | 'antenna' | null>('cable');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [seed, setSeed] = useState(42);
  const [lastResult, setLastResult] = useState<MinigameResult | null>(null);
  const [runCount, setRunCount] = useState(0);

  const handleDone = (result: MinigameResult) => {
    setLastResult(result);
  };

  const handleLaunch = (game: 'cable' | 'routing' | 'antenna') => {
    setActiveGame(game);
    setLastResult(null);
    setRunCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-mono text-amber-400">
              MINIGAME LAB (?lab=1)
            </h1>
            <p className="text-xs text-gray-400">
              Uji coba mandiri mini-game: CableConnection, PowerRouting, AntennaAlignment
            </p>
          </div>
          <a
            href="/"
            className="text-xs font-mono bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300"
          >
            ← Kembali ke Game
          </a>
        </div>

        {/* Controls */}
        <div className="bg-[#141619] border border-gray-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Game:</span>
            <button
              type="button"
              onClick={() => handleLaunch('cable')}
              className={`px-3 py-1.5 rounded text-xs font-mono border ${
                activeGame === 'cable'
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                  : 'border-gray-700 bg-gray-800 text-gray-400'
              }`}
            >
              Cable
            </button>
            <button
              type="button"
              onClick={() => handleLaunch('routing')}
              className={`px-3 py-1.5 rounded text-xs font-mono border ${
                activeGame === 'routing'
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                  : 'border-gray-700 bg-gray-800 text-gray-400'
              }`}
            >
              Power Routing
            </button>
            <button
              type="button"
              onClick={() => handleLaunch('antenna')}
              className={`px-3 py-1.5 rounded text-xs font-mono border ${
                activeGame === 'antenna'
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                  : 'border-gray-700 bg-gray-800 text-gray-400'
              }`}
            >
              Antenna
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Diff:</span>
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDifficulty(d as 1 | 2 | 3);
                  setLastResult(null);
                  setRunCount((c) => c + 1);
                }}
                className={`w-7 h-7 rounded text-xs font-mono border ${
                  difficulty === d
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'border-gray-700 bg-gray-800 text-gray-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Seed:</span>
            <input
              type="number"
              value={seed}
              onChange={(e) => {
                setSeed(parseInt(e.target.value) || 0);
                setLastResult(null);
                setRunCount((c) => c + 1);
              }}
              className="w-20 px-2 py-1 rounded bg-black/60 border border-gray-700 text-xs font-mono text-amber-300"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setLastResult(null);
              setRunCount((c) => c + 1);
            }}
            className="ml-auto px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-mono rounded text-gray-200 border border-gray-700"
          >
            Reset Game
          </button>
        </div>

        {/* Live Minigame Arena */}
        <div className="p-6 bg-black/30 border border-gray-800/80 rounded-2xl flex justify-center">
          {activeGame === 'cable' && (
            <CableConnection
              key={`cable-${runCount}-${seed}-${difficulty}`}
              difficulty={difficulty}
              seed={seed}
              onDone={handleDone}
            />
          )}
          {activeGame === 'routing' && (
            <PowerRouting
              key={`routing-${runCount}-${seed}-${difficulty}`}
              difficulty={difficulty}
              seed={seed}
              onDone={handleDone}
            />
          )}
          {activeGame === 'antenna' && (
            <AntennaAlignment
              key={`antenna-${runCount}-${seed}-${difficulty}`}
              difficulty={difficulty}
              seed={seed}
              onDone={handleDone}
            />
          )}
        </div>

        {/* Result JSON Inspector */}
        <div className="bg-[#141619] border border-gray-800 rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 mb-2">HASIL ON_DONE (JSON):</div>
          <pre className="bg-black/80 p-3 rounded text-xs font-mono text-green-400 overflow-x-auto">
            {lastResult
              ? JSON.stringify(lastResult, null, 2)
              : '// Menunggu permainan selesai...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
