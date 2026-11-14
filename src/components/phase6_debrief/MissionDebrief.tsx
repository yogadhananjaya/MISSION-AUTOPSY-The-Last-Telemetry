import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Wrench, 
  Download, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { SPACECRAFT_COMPONENTS } from '../../data/components';
import { sounds } from '../../utils/soundEngine';

export const MissionDebrief: React.FC = () => {
  const { 
    activeCase, 
    redesignConfig, 
    simulationResult, 
    setPhase, 
    resetMission,
    selectedRole 
  } = useMissionStore();

  const isSuccess = simulationResult?.completed;
  const breakdown = simulationResult?.scoreBreakdown || {
    investigationAccuracy: 0,
    engineeringDesign: 0,
    missionSuccess: 0,
    resourceEfficiency: 0,
    decisionSpeed: 0,
    totalScore: 0,
    grade: 'FAIL',
  };

  useEffect(() => {
    if (isSuccess && breakdown.totalScore >= 600) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isSuccess, breakdown.totalScore]);

  const getCompName = (id: string) => {
    return SPACECRAFT_COMPONENTS.find((c) => c.id === id)?.name || id;
  };

  const handleExportReport = () => {
    sounds.playClick(800);
    const reportText = `
=====================================================
NASA SPACE APPS CHALLENGE 2026: MISSION AUTOPSY REPORT
=====================================================
Case ID: ${activeCase.id}
Mission Name: ${activeCase.missionName}
Officer Role: ${selectedRole.toUpperCase()}
Final Grade: ${breakdown.grade} : Skor Total: ${breakdown.totalScore} / 1000

BREAKDOWN EVALUASI : 5 PILAR RESMI NASA:
- Akurasi Investigasi: ${breakdown.investigationAccuracy} / 300 pts
- Desain Rekayasa: ${breakdown.engineeringDesign} / 250 pts
- Keberhasilan Sains Misi: ${breakdown.missionSuccess} / 250 pts
- Efisiensi Anggaran Sumber Daya: ${breakdown.resourceEfficiency} / 150 pts
- Kecepatan Keputusan: ${breakdown.decisionSpeed} / 50 pts

CETAK BIRU DESAIN ULANG:
- Daya: ${getCompName(redesignConfig.solar)}
- Baterai: ${getCompName(redesignConfig.battery)}
- Termal: ${getCompName(redesignConfig.thermal)}
- Komunikasi: ${getCompName(redesignConfig.comms)}
- Peluncur: ${getCompName(redesignConfig.launcher)}
- Orbit: ${getCompName(redesignConfig.orbit)}
- Total Massa: ${simulationResult?.finalMassKg} kg
- Total Biaya: $${simulationResult?.finalCostMillion}M

STATUS MISI: ${isSuccess ? 'SUKSES : SELURUH TARGET TERCAPAI' : 'GAGAL'}
=====================================================
`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NASA_DEBRIEF_${activeCase.id}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner & Grade Card */}
      <div className={`border p-6 font-mono-tech relative overflow-hidden clip-chamfer-md shadow-2xl ${
        isSuccess 
          ? 'bg-[#141619] border-emerald-500/80 text-white' 
          : 'bg-[#141619] border-rose-500/80 text-white'
      }`}>
        <div className="absolute top-2 right-4 font-mono-tech text-[10px] text-slate-500">
          LAPORAN : DSN-EVAL-2026
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="clip-slanted text-[10px] uppercase px-2 py-0.5 bg-[#EAB308] text-black font-bold">
                EVALUASI REKAYASA SISTEM NASA
              </span>
              <span className="text-[11px] text-slate-400">
                BERKAS EVALUASI RESMI PENERBANGAN
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold font-display text-white tracking-wide">
              {isSuccess ? 'SERTIFIKASI KEBERHASILAN MISI DITERBITKAN' : 'LAPORAN EVALUASI KEGAGALAN MISI'}
            </h1>
            
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-sans">
              {isSuccess 
                ? 'Pilihan rekayasa berhasil mengatasi defisit daya dan pembekuan baterai. Wahana ASTER-9 Mark II melewati bayangan dengan cadangan energi aman.'
                : 'Misi terputus sebelum target sains tercapai. Evaluasi kembali massa wahana, cadangan baterai, dan pemanas termal, lalu lakukan uji ulang.'}
            </p>
          </div>

          {/* Grade Badge */}
          <div className="flex items-center gap-4 bg-black p-4 border border-slate-800 self-stretch md:self-auto justify-between md:justify-start">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono-tech uppercase">TOTAL SCORE</span>
              <div className="text-2xl font-bold text-[#EAB308] font-mono-tech">
                {breakdown.totalScore} <span className="text-xs text-slate-500">/ 1000</span>
              </div>
            </div>

            <div className={`px-4 py-2 font-display font-black text-3xl border flex items-center justify-center ${
              breakdown.grade === 'A+' 
                ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                : breakdown.grade === 'A'
                ? 'bg-amber-950 border-[#EAB308] text-[#EAB308]'
                : breakdown.grade === 'B'
                ? 'bg-yellow-950 border-yellow-500 text-yellow-400'
                : 'bg-red-950 border-red-500 text-red-400'
            }`}>
              {breakdown.grade}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Pillar Score Cards */}
      <div className="space-y-3">
        <h3 className="font-mono-tech text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-[#EAB308]" />
          <span>EVALUASI 5 PILAR SISTEM NASA :</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono-tech text-xs">
          
          {/* Pillar 1 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">PILAR 01 : AKURASI</div>
            <div className="text-lg font-bold text-white">
              {breakdown.investigationAccuracy} <span className="text-xs text-slate-500">/ 300</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-purple-500 h-full"
                style={{ width: `${(breakdown.investigationAccuracy / 300) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Akurasi bukti dan diagnosis</p>
          </div>

          {/* Pillar 2 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">PILAR 02 : REKAYASA</div>
            <div className="text-lg font-bold text-white">
              {breakdown.engineeringDesign} <span className="text-xs text-slate-500">/ 250</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-cyan-400 h-full"
                style={{ width: `${(breakdown.engineeringDesign / 250) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Margin daya dan proteksi termal</p>
          </div>

          {/* Pillar 3 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">PILAR 03 : SAINS MISI</div>
            <div className="text-lg font-bold text-white">
              {breakdown.missionSuccess} <span className="text-xs text-slate-500">/ 250</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-emerald-400 h-full"
                style={{ width: `${(breakdown.missionSuccess / 250) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Perolehan data ilmiah asteroid</p>
          </div>

          {/* Pillar 4 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">PILAR 04 : ANGGARAN</div>
            <div className="text-lg font-bold text-white">
              {breakdown.resourceEfficiency} <span className="text-xs text-slate-500">/ 150</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-[#EAB308] h-full"
                style={{ width: `${(breakdown.resourceEfficiency / 150) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Efisiensi biaya dan batas massa</p>
          </div>

          {/* Pillar 5 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">PILAR 05 : KEPUTUSAN</div>
            <div className="text-lg font-bold text-white">
              {breakdown.decisionSpeed} <span className="text-xs text-slate-500">/ 50</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-blue-400 h-full"
                style={{ width: `${(breakdown.decisionSpeed / 50) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Kecepatan investigasi tim</p>
          </div>

        </div>
      </div>

      {/* Side-by-Side Comparison: Legacy ASTER-9 vs Redesign */}
      <div className="border border-black bg-[#141619] text-white p-5 space-y-4 clip-chamfer-md shadow-2xl">
        <h3 className="font-mono-tech text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-4 h-4 text-[#EAB308]" />
          <span>PERBANDINGAN SUBSISTEM : DASAR LAMA VS REFIT MARK II</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full font-mono-tech text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Subsistem</th>
                <th className="py-2.5 px-3 text-rose-400">Wahana Gagal ASTER-9</th>
                <th className="py-2.5 px-3 text-[#EAB308]">Refit Mark II</th>
                <th className="py-2.5 px-3">Dampak Rekayasa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Pembangkit Daya</td>
                <td className="py-2.5 px-3">Silikon Tetap 160W</td>
                <td className="py-2.5 px-3 text-white">{getCompName(redesignConfig.solar)}</td>
                <td className="py-2.5 px-3 text-emerald-400">Menjaga laju pengisian daya tinggi</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Penyimpan Energi</td>
                <td className="py-2.5 px-3">Litium Standar 400 Wh</td>
                <td className="py-2.5 px-3 text-white">{getCompName(redesignConfig.battery)}</td>
                <td className="py-2.5 px-3 text-emerald-400">Menjamin pasokan daya selama gerhana</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Proteksi Termal</td>
                <td className="py-2.5 px-3 text-rose-400">Pasif Tanpa Pemanas</td>
                <td className="py-2.5 px-3 text-white">{getCompName(redesignConfig.thermal)}</td>
                <td className="py-2.5 px-3 text-emerald-400">Menjaga suhu sel di atas batas beku</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Massa Wahana</td>
                <td className="py-2.5 px-3">112 kg</td>
                <td className="py-2.5 px-3 text-white">{simulationResult?.finalMassKg} kg</td>
                <td className="py-2.5 px-3 text-slate-400">Dalam kapasitas muatan roket</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Total Biaya</td>
                <td className="py-2.5 px-3">$38.2M</td>
                <td className="py-2.5 px-3 text-white">${simulationResult?.finalCostMillion}M</td>
                <td className="py-2.5 px-3 text-slate-400">Sesuai pagu program</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Hasil Misi</td>
                <td className="py-2.5 px-3 text-rose-400 font-bold">SINYAL HILANG DI MENIT 330</td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">
                  {isSuccess ? 'ORBIT PENUH BERHASIL' : 'BELUM SEMPURNA'}
                </td>
                <td className="py-2.5 px-3 text-emerald-400">
                  {isSuccess ? 'Seluruh telemetri sains terkirim' : 'Desain butuh penyesuaian'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Lessons Learned Card */}
      <div className="border-l-4 border-[#EAB308] bg-[#141619] border-black p-5 space-y-2 text-xs font-mono-tech text-slate-200 shadow-xl">
        <div className="flex items-center gap-2 font-bold text-[#EAB308]">
          <Sparkles className="w-4 h-4 text-[#EAB308]" />
          <span>PRINSIP PEMBELAJARAN REKAYASA ANTARIKSA :</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          Dalam rekayasa misi antariksa, tidak ada subsistem yang bekerja sendirian. Pengurangan isolasi termal membuat baterai membeku. Baterai beku memicu kejatuhan tegangan. Kejatuhan tegangan mematikan sistem komputer secara permanen. Misi yang sukses adalah keseimbangan harmonis antara massa, daya, ketahanan termal, dan anggaran.
        </p>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick(400);
              resetMission();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1F2329] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-mono-tech text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ULANGI KASUS</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick(600);
              setPhase('redesign');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1F2329] border border-slate-700 hover:border-[#EAB308] text-slate-300 hover:text-[#EAB308] font-mono-tech text-xs transition-colors cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>UBAH DESAIN</span>
          </button>
        </div>

        <button
          onClick={handleExportReport}
          className="btn-tactical-primary px-6 py-2.5 text-black font-display font-black text-xs tracking-wider flex items-center gap-2 shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>EKSPOR LAPORAN</span>
        </button>
      </div>

    </div>
  );
};
