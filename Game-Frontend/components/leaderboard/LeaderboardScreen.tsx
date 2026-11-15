/* antislop: NASA Flight Operations Leaderboard terminal with tabbed challenge telemetry */
import React, { useState } from 'react';
import { Trophy, Calendar, Users, Globe, ArrowLeft, Award, Sparkles } from 'lucide-react';
import { useScoreStore } from '../../store/useScoreStore';
import { HoloPanel } from '../common/HoloPanel';
import { NvButton } from '../common/NvButton';
import { sounds } from '../../utils/soundEngine';

interface LeaderboardScreenProps {
  onBack: () => void;
  onLaunchWeeklyChallenge?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  onBack,
  onLaunchWeeklyChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'weekly' | 'friends'>('weekly');
  const { getTopScores } = useScoreStore();
  const topScores = getTopScores(activeTab);

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14] text-white flex flex-col overflow-hidden blueprint-grid-dark select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#0d1424] border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <NvButton variant="secondary" size="sm" onClick={onBack} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            KEMBALI KE HUB
          </NvButton>
          <div className="h-4 w-px bg-cyan-500/30" />
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm font-black tracking-wider uppercase text-cyan-300">
              ORBITA NOVA : PAPAN PERINGKAT
            </span>
          </div>
        </div>

        {onLaunchWeeklyChallenge && (
          <NvButton
            variant="primary"
            size="sm"
            onClick={onLaunchWeeklyChallenge}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            TANTANGAN MINGGUAN
          </NvButton>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
          <button
            onClick={() => { sounds.playClick(650); setActiveTab('weekly'); }}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer clip-chamfer-sm ${
              activeTab === 'weekly'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-[#10192e] text-slate-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>MINGGU INI</span>
          </button>

          <button
            onClick={() => { sounds.playClick(650); setActiveTab('all'); }}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer clip-chamfer-sm ${
              activeTab === 'all'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-[#10192e] text-slate-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEMUA REKOR</span>
          </button>

          <button
            onClick={() => { sounds.playClick(650); setActiveTab('friends'); }}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer clip-chamfer-sm ${
              activeTab === 'friends'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-[#10192e] text-slate-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>REKAN TIM</span>
          </button>
        </div>

        {/* Leaderboard Table Inside HoloPanel */}
        <HoloPanel title="REKOR INVESTIGASI & PENYELAMATAN TERBAIK" badge={`${topScores.length} KADET`} badgeColor="amber">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-cyan-500/30 text-cyan-400/80 uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3">PERINGKAT</th>
                  <th className="py-2 px-3">KADET</th>
                  <th className="py-2 px-3">MODE</th>
                  <th className="py-2 px-3 text-right">SKOR</th>
                  <th className="py-2 px-3 text-right">TANGGAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {topScores.map((score, idx) => (
                  <tr key={score.id} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Award className="w-4 h-4 text-amber-400" />}
                        {idx === 1 && <Award className="w-4 h-4 text-slate-300" />}
                        {idx === 2 && <Award className="w-4 h-4 text-amber-600" />}
                        <span className="font-bold text-slate-200">#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white tracking-wide">
                      {score.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 border clip-chamfer-sm uppercase ${
                        score.mode === 'coop'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {score.mode === 'coop' ? 'CO-OP NETWORK' : 'STORY AUTOPSY'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-400 text-sm">
                      {score.score} <span className="text-[10px] text-slate-400 font-normal">PTS</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                      {score.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </HoloPanel>
      </main>
    </div>
  );
};
