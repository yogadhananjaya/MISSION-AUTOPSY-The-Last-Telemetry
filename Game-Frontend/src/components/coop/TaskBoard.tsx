import React from 'react';
import { ShieldAlert, Wrench, Search, UserCheck, AlertTriangle } from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { DAMAGE_DEFS, type MinigameId } from '../../engine/crisis/damageGraph';
import { AGENTS } from '../../data/agents';
import { sounds } from '../../utils/soundEngine';

interface TaskBoardProps {
  onStartMinigame: (uid: number, defId: string, minigame: MinigameId) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ onStartMinigame }) => {
  const { ship, claims, selfId, lobby, claimTask, sendAction } = useCoopStore();

  const myPlayer = lobby?.players.find((p) => p.id === selfId);
  const myAgent = AGENTS.find((a) => a.id === myPlayer?.agentId);
  const isTelemetry = myAgent?.roleGroup === 'telemetry';

  if (!ship) return null;

  const handleClaimAndWork = (uid: number, defId: string) => {
    sounds.playClick(700);
    claimTask(uid);
    const def = DAMAGE_DEFS[defId];
    onStartMinigame(uid, defId, def?.minigame ?? 'calibrate');
  };

  const handleDiagnose = (uid: number) => {
    sounds.playClick(600);
    sendAction({ type: 'diagnose', uid });
  };

  return (
    <div className="bg-[#141619] border border-black p-4 rounded-2xl shadow-xl space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          PAPAN TUGAS KERUSAKAN AKTIF ({ship.damages.length})
        </span>
        <span className="text-[10px] text-gray-500">
          Klaim tugas untuk memulai perbaikan interaktif
        </span>
      </div>

      {ship.damages.length === 0 ? (
        <div className="p-6 bg-black/40 border border-dashed border-gray-800 rounded-xl text-center text-gray-500">
          ✓ Seluruh subsistem beroperasi nominal. Tidak ada kerusakan aktif saat ini.
        </div>
      ) : (
        <div className="space-y-2.5">
          {ship.damages.map((dmg) => {
            const def = DAMAGE_DEFS[dmg.defId];
            const claimedByPeerId = claims[dmg.uid];
            const claimedPlayer = lobby?.players.find((p) => p.id === claimedByPeerId);
            const isClaimedByMe = claimedByPeerId === selfId;
            const isClaimedByOther = !!claimedByPeerId && !isClaimedByMe;

            // Visibility of cause: telemetry analyst or already diagnosed
            const showCause = isTelemetry || dmg.diagnosed;

            return (
              <div
                key={dmg.uid}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  def?.severity === 'critical'
                    ? 'bg-red-950/20 border-red-500/60'
                    : 'bg-amber-950/20 border-amber-500/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        def?.severity === 'critical'
                          ? 'bg-red-500 text-black'
                          : 'bg-amber-400 text-black'
                      }`}
                    >
                      {def?.severity ?? 'MAJOR'}
                    </span>
                    <span className="font-bold text-white text-xs">{def?.label ?? dmg.defId}</span>

                    {/* Claim indicator badge */}
                    {claimedPlayer && (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                          isClaimedByMe
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                            : 'bg-purple-950/80 text-purple-300 border border-purple-500/50'
                        }`}
                      >
                        <UserCheck className="w-3 h-3" />
                        {isClaimedByMe ? 'KAMU KERJAKAN' : `DIKLAIM: ${claimedPlayer.name}`}
                      </span>
                    )}

                    {!dmg.diagnosed && (
                      <span className="text-[9px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded">
                        BELUM DIDIAGNOSIS
                      </span>
                    )}
                  </div>

                  {/* Symptom */}
                  <div className="text-gray-300 text-xs font-sans">
                    <span className="font-mono text-gray-500 font-bold">GEJALA: </span>
                    {def?.symptom}
                  </div>

                  {/* Cause if revealed */}
                  {showCause && (
                    <div className="text-amber-300 text-xs font-sans border-l-2 border-amber-400 pl-2 mt-1">
                      <span className="font-mono font-bold">AKAR MASALAH: </span>
                      {def?.cause}
                    </div>
                  )}

                  {def?.requiresPower && ship.systems.power < def.requiresPower && (
                    <div className="text-[10px] text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Butuh Power minimal {def.requiresPower}% agar perbaikan tidak gagal.</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!dmg.diagnosed && isTelemetry && (
                    <button
                      type="button"
                      onClick={() => handleDiagnose(dmg.uid)}
                      className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      ANALISIS
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isClaimedByOther}
                    onClick={() => handleClaimAndWork(dmg.uid, dmg.defId)}
                    className={`px-4 py-2 rounded-lg font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isClaimedByOther
                        ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                        : isClaimedByMe
                        ? 'bg-green-500 text-black shadow-md'
                        : 'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-500/20'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{isClaimedByMe ? 'LANJUTKAN' : 'KERJAKAN'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
