import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Wrench, 
  Download, 
  Layers, 
  Sparkles,
  FileText,
  Share2,
  BookOpen
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { useProgressStore } from '../../store/useProgressStore';
import { SPACECRAFT_COMPONENTS } from '../../data/components';
import { runMissionSimulation } from '../../utils/simulationEngine';
import { sounds } from '../../utils/soundEngine';
import { useTranslation } from '../../i18n';
import { FEATURES } from '../../config/features';

export const MissionDebrief: React.FC = () => {
  const { 
    activeCase, 
    redesignConfig, 
    simulationResult, 
    pinnedEvidences,
    setPhase, 
    resetMission,
    selectedRole,
    rewindResult,
    astronautName
  } = useMissionStore();
  const { completeEpisode } = useProgressStore();
  const { t, language } = useTranslation();

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
      if (FEATURES.episodes2to6) {
        const stars = breakdown.totalScore >= 800 ? 3 : breakdown.totalScore >= 650 ? 2 : 1;
        completeEpisode('ep01', stars, 100);
      }
    }
  }, [isSuccess, breakdown.totalScore, completeEpisode]);

  const getCompName = (id: string) => {
    return SPACECRAFT_COMPONENTS.find((c) => c.id === id)?.name || id;
  };

  // Run legacy configuration for authentic dynamic comparison table
  const legacyConfig = activeCase.legacyConfiguration;
  const legacyRun = runMissionSimulation({
    config: legacyConfig,
    budgetCapMillion: activeCase.budgetCapMillion,
    isHypothesisCorrect: false,
    pinnedEvidenceIds: [],
    requiredEvidenceIds: [],
    redHerringEvidenceIds: [],
    timeTakenSeconds: 180,
  });

  const lastPt = simulationResult?.telemetryTrace?.[simulationResult.telemetryTrace.length - 1];
  const lastSOC = lastPt ? lastPt.batterySOC : 0;
  const minTemp = simulationResult?.telemetryTrace 
    ? Math.min(...simulationResult.telemetryTrace.map((t) => t.batteryTemp)) 
    : 0;
  const powerMargin = simulationResult?.powerMarginPercent ?? 0;

  // Ghost Replay: Telemetry comparison curve
  const eclipsePoints = activeCase.telemetryLogs.filter((p) => p.isEclipse);
  const eclipseStartMin = eclipsePoints.length > 0 ? eclipsePoints[0].timeMinutes : 180;
  const eclipseEndMin = eclipsePoints.length > 0 ? eclipsePoints[eclipsePoints.length - 1].timeMinutes + 10 : 255;
  const ghostEclipseX = (eclipseStartMin / 360) * 720;
  const ghostEclipseW = Math.max(10, ((eclipseEndMin - eclipseStartMin) / 360) * 720);

  const legacyTrace = legacyRun.telemetryTrace || [];
  const redesignTrace = simulationResult?.telemetryTrace || [];

  const voltToY = (v: number) => {
    const clamped = Math.max(18, Math.min(30, v));
    return 125 - ((clamped - 18) / 12) * 105;
  };

  const legacyPolyline = legacyTrace
    .map((p) => `${((p.timeMinutes / 360) * 720).toFixed(1)},${voltToY(p.busVoltage).toFixed(1)}`)
    .join(' ');

  const redesignPolyline = redesignTrace
    .map((p) => `${((p.timeMinutes / 360) * 720).toFixed(1)},${voltToY(p.busVoltage).toFixed(1)}`)
    .join(' ');

  const legacyFailurePt = legacyTrace.find((p) => p.severity === 'fatal') || legacyTrace[legacyTrace.length - 1];
  const legacyFailX = legacyFailurePt ? (legacyFailurePt.timeMinutes / 360) * 720 : 520;
  const legacyFailY = legacyFailurePt ? voltToY(legacyFailurePt.busVoltage) : 125;

  const getFailureAdvice = (reason?: string) => {
    if (!reason) return '';
    if (reason.includes('UVLO') || reason.includes('ENERGY_DEPLETED')) {
      return 'Tambahkan kapasitas baterai atau isolasi termal.';
    }
    if (reason.includes('POWER_DEFICIT')) {
      return 'Kurangi beban atau naikkan pembangkit.';
    }
    if (reason.includes('LAUNCH_ABORT')) {
      return 'Kurangi massa atau pilih peluncur lebih besar.';
    }
    if (reason.includes('BUDGET_EXCEEDED')) {
      return 'Kurangi biaya komponen.';
    }
    return 'Tinjau kembali konfigurasi sistem wahana.';
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

STATUS MISI: ${isSuccess ? 'SUKSES : SELURUH TARGET TERCAPAI' : `GAGAL: ${simulationResult?.failureReason}`}
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

  const handleShareCard = () => {
    sounds.playClick(900);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0a1224';
    ctx.fillRect(0, 0, 1080, 1080);

    // Border & Technical Grid
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1020, 1020);

    // Header Title
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('NASA SPACE APPS 2026 // ORBITA NOVA', 60, 95);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 60px sans-serif';
    ctx.fillText('MISSION AUTOPSY', 60, 170);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '26px monospace';
    ctx.fillText(`CADET: ${astronautName || 'CADET ASTER'} • CASE-01 UMBRA`, 60, 220);

    // Result Status Banner
    ctx.fillStyle = isSuccess ? '#10b981' : '#ef4444';
    ctx.fillRect(60, 260, 960, 90);
    ctx.fillStyle = '#000000';
    ctx.font = '900 40px sans-serif';
    ctx.fillText(isSuccess ? 'STATUS: FULL ORBIT SURVIVED' : 'STATUS: MISSION FAILED (UVLO)', 85, 322);

    // Score & Grade
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px monospace';
    ctx.fillText(`TOTAL SCORE: ${breakdown.totalScore} / 1000  (GRADE: ${breakdown.grade})`, 60, 410);

    // Key Telemetry Run Readouts Box
    ctx.fillStyle = '#141c2e';
    ctx.fillRect(60, 450, 960, 190);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 450, 960, 190);

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('KEY RUN TELEMETRY:', 85, 495);

    ctx.fillStyle = '#ffffff';
    ctx.font = '22px monospace';
    ctx.fillText(`• Min Battery Temp: ${minTemp.toFixed(1)}°C (Freeze Threshold: -20°C)`, 85, 540);
    ctx.fillText(`• Final Battery SOC: ${lastSOC}% (Nominal Margin: >20%)`, 85, 580);
    ctx.fillText(`• Subsystem Power Margin: +${powerMargin}%`, 85, 620);

    // 5 Pillars Breakdown
    const pillars = [
      { label: 'Accuracy', val: breakdown.investigationAccuracy, max: 300 },
      { label: 'Engineering', val: breakdown.engineeringDesign, max: 250 },
      { label: 'Science Yield', val: breakdown.missionSuccess, max: 250 },
      { label: 'Resource Cap', val: breakdown.resourceEfficiency, max: 150 },
      { label: 'Decision Speed', val: breakdown.decisionSpeed, max: 50 },
    ];

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('PERFORMANCE PILLARS:', 60, 685);

    pillars.forEach((p, idx) => {
      const y = 730 + idx * 52;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '20px monospace';
      ctx.fillText(`${p.label.padEnd(16, ' ')} ${p.val}/${p.max}`, 60, y);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(450, y - 18, 570, 22);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(450, y - 18, (p.val / p.max) * 570, 22);
    });

    // Branding Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '18px monospace';
    ctx.fillText(`Generated on ${new Date().toISOString().slice(0, 10)} • orbita-nova.app`, 60, 1030);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orbita-nova-hasil-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
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
                {language === 'en' ? 'NASA SYSTEMS ENGINEERING EVALUATION' : 'EVALUASI REKAYASA SISTEM NASA'}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'en' ? 'OFFICIAL FLIGHT EVALUATION RECORD' : 'BERKAS EVALUASI RESMI PENERBANGAN'}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold font-display text-white tracking-wide">
              {isSuccess 
                ? (language === 'en' ? 'MISSION SUCCESS CERTIFICATION' : 'SERTIFIKASI KEBERHASILAN MISI') 
                : (language === 'en' ? 'MISSION FAILURE REPORT' : 'LAPORAN KEGAGALAN MISI')}
            </h1>
            
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-sans">
              {isSuccess 
                ? (language === 'en'
                    ? `Engineering choices successfully completed orbit. Final battery SOC ${lastSOC}%, minimum battery temp ${minTemp}°C, and power margin ${powerMargin}%. Spacecraft ASTER-9 Mark II operating nominal.`
                    : `Pilihan rekayasa berhasil menyelesaikan orbit. Cadangan energi akhir ${lastSOC}%, suhu minimum baterai ${minTemp}°C, dan margin daya ${powerMargin}%. Wahana ASTER-9 Mark II beroperasi aman.`)
                : `${simulationResult?.failureReason ?? 'Kegagalan kritis pada wahana.'} ${getFailureAdvice(simulationResult?.failureReason)}`}
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

      {/* Rewind Evaluation Summary (Q3) */}
      {rewindResult && (
        <div className="border border-black bg-[#141619] text-white p-3.5 clip-chamfer-sm font-mono-tech text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[#EAB308] font-bold">
              {language === 'en' ? 'CRISIS REWIND RECORD:' : 'CATATAN REWIND KRISIS:'}
            </span>
          </div>
          <div className="text-slate-300">
            Rewind: <span className={rewindResult.survived ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {rewindResult.survived ? (language === 'en' ? 'survived' : 'selamat') : (language === 'en' ? 'failed' : 'gagal')}
            </span>, SOC {rewindResult.finalSoc}%
            {rewindResult.science > 0 && ` • Science: ${rewindResult.science} pts`}
          </div>
        </div>
      )}

      {/* 5-Pillar Score Cards */}
      <div className="space-y-3">
        <h3 className="font-mono-tech text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-[#EAB308]" />
          <span>{language === 'en' ? 'NASA 5-PILLAR EVALUATION CRITERIA :' : 'EVALUASI 5 PILAR SISTEM NASA :'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono-tech text-xs">
          
          {/* Pillar 1 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">
              {language === 'en' ? 'PILLAR 01 : ACCURACY' : 'PILAR 01 : AKURASI'}
            </div>
            <div className="text-lg font-bold text-white">
              {breakdown.investigationAccuracy} <span className="text-xs text-slate-500">/ 300</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-purple-500 h-full"
                style={{ width: `${(breakdown.investigationAccuracy / 300) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">
              {language === 'en' ? 'Evidence and root cause accuracy' : 'Akurasi bukti dan diagnosis'}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">
              {language === 'en' ? 'PILLAR 02 : ENGINEERING' : 'PILAR 02 : REKAYASA'}
            </div>
            <div className="text-lg font-bold text-white">
              {breakdown.engineeringDesign} <span className="text-xs text-slate-500">/ 250</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-cyan-400 h-full"
                style={{ width: `${(breakdown.engineeringDesign / 250) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">
              {language === 'en' ? 'Power margin & thermal protection' : 'Margin daya dan proteksi termal'}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">
              {language === 'en' ? 'PILLAR 03 : SCIENCE YIELD' : 'PILAR 03 : SAINS MISI'}
            </div>
            <div className="text-lg font-bold text-white">
              {breakdown.missionSuccess} <span className="text-xs text-slate-500">/ 250</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-emerald-400 h-full"
                style={{ width: `${(breakdown.missionSuccess / 250) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">
              {language === 'en' ? 'Scientific data points collected' : 'Perolehan data ilmiah asteroid'}
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">
              {language === 'en' ? 'PILLAR 04 : RESOURCES' : 'PILAR 04 : ANGGARAN'}
            </div>
            <div className="text-lg font-bold text-white">
              {breakdown.resourceEfficiency} <span className="text-xs text-slate-500">/ 150</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-[#EAB308] h-full"
                style={{ width: `${(breakdown.resourceEfficiency / 150) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">
              {language === 'en' ? 'Mass margin & budget efficiency' : 'Efisiensi biaya dan batas massa'}
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="p-3.5 border border-black bg-[#141619] text-white space-y-1">
            <div className="text-[#EAB308] text-[10px] font-bold">
              {language === 'en' ? 'PILLAR 05 : DECISION SPEED' : 'PILAR 05 : KEPUTUSAN'}
            </div>
            <div className="text-lg font-bold text-white">
              {breakdown.decisionSpeed} <span className="text-xs text-slate-500">/ 50</span>
            </div>
            <div className="w-full bg-black h-1.5 overflow-hidden border border-slate-800 mt-2">
              <div 
                className="bg-blue-400 h-full"
                style={{ width: `${(breakdown.decisionSpeed / 50) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">
              {language === 'en' ? 'Cadet investigation speed' : 'Kecepatan investigasi tim'}
            </p>
          </div>

        </div>
      </div>

      {/* Rewind Evaluation Summary (Q3) */}
      {rewindResult && (
        <div className="border border-black bg-[#141619] text-white p-3.5 clip-chamfer-sm font-mono-tech text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[#EAB308] font-bold">
              {language === 'en' ? 'CRISIS REWIND RECORD:' : 'CATATAN REWIND KRISIS:'}
            </span>
          </div>
          <div className="text-slate-300">
            Rewind: <span className={rewindResult.survived ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {rewindResult.survived ? (language === 'en' ? 'survived' : 'selamat') : (language === 'en' ? 'failed' : 'gagal')}
            </span>, SOC {rewindResult.finalSoc}%
            {rewindResult.science > 0 && ` • Science: ${rewindResult.science} pts`}
          </div>
        </div>
      )}

      {/* Pinned Evidence Review with Weak Evidence Tags */}
      {pinnedEvidences.length > 0 && (
        <div className="border border-black bg-[#141619] text-white p-5 space-y-3 clip-chamfer-md shadow-2xl font-mono-tech text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#EAB308]" />
              <span className="font-bold text-[#EAB308]">
                {language === 'en' 
                  ? `INVESTIGATION EVIDENCE REVIEW (${pinnedEvidences.length} EVIDENCE PINNED) :` 
                  : `EVALUASI BUKTI INVESTIGASI (${pinnedEvidences.length} BUKTI DISEMATKAN) :`}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedEvidences.map((e) => (
              <div key={e.id} className="p-3 bg-black border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400">{e.timeStr} • {e.metric}</div>
                  <div className="text-white font-sans text-xs leading-relaxed">{e.observedText}</div>
                </div>
                {e.isRedHerring ? (
                  <span className="px-2 py-0.5 bg-rose-950 border border-rose-600 text-rose-300 text-[10px] font-bold shrink-0">
                    {language === 'en' ? 'RED HERRING' : 'BUKTI LEMAH'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold shrink-0">
                    {language === 'en' ? 'VALID EVIDENCE' : 'BUKTI VALID'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ghost Replay: Telemetry Curve Comparison */}
      <div className="border border-black bg-[#141619] text-white p-5 space-y-3 clip-chamfer-md shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h3 className="font-mono-tech text-xs font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-[#EAB308] rounded-full animate-pulse" />
            <span>{t.debrief.ghostReplayTitle}</span>
          </h3>
          <div className="flex items-center gap-4 text-[11px] font-mono-tech">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500 inline-block" />
              <span>{t.debrief.legacyAster9}</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-4 h-0.5 bg-emerald-400 inline-block" />
              <span>{t.debrief.refitMark2}</span>
            </span>
          </div>
        </div>

        <div className="w-full h-44 bg-black/80 border border-slate-800 relative overflow-hidden clip-chamfer-sm">
          <svg viewBox="0 0 720 140" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ghostEclipse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7e22ce" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Eclipse zone */}
            <rect x={ghostEclipseX} y="0" width={ghostEclipseW} height="140" fill="url(#ghostEclipse)" />
            <text x={ghostEclipseX + 6} y="16" fill="#c084fc" fontSize="9" fontFamily="monospace">
              {language === 'en' ? 'ECLIPSE UMBRA 0W' : 'ZONA GERHANA 0W'}
            </text>

            {/* UVLO Cutoff threshold */}
            <line x1="0" y1={voltToY(22)} x2="720" y2={voltToY(22)} stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
            <text x="8" y={voltToY(22) - 4} fill="#ef4444" fontSize="9" fontFamily="monospace">
              UVLO THRESHOLD 22.0V
            </text>

            {/* Nominal Line 28V */}
            <line x1="0" y1={voltToY(28)} x2="720" y2={voltToY(28)} stroke="#64748b" strokeDasharray="2 4" strokeWidth="1" opacity="0.4" />
            <text x="8" y={voltToY(28) - 4} fill="#94a3b8" fontSize="8" fontFamily="monospace">
              NOMINAL 28.0V
            </text>

            {/* Legacy Trace: Red dashed */}
            {legacyPolyline && (
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4 4"
                points={legacyPolyline}
              />
            )}

            {/* Redesign Trace: Green solid */}
            {redesignPolyline && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={redesignPolyline}
              />
            )}

            {/* Legacy failure point marker */}
            {legacyFailurePt && (
              <g transform={`translate(${legacyFailX}, ${legacyFailY})`}>
                <circle r="4" fill="#ef4444" />
                <text x="8" y="4" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  {legacyFailurePt.timeStr} UVLO
                </text>
              </g>
            )}
          </svg>
        </div>

        <p className="font-mono-tech text-[11px] text-slate-400">
          {t.debrief.ghostReplayDesc}
        </p>
      </div>

      {/* Side-by-Side Comparison: Legacy ASTER-9 vs Redesign */}
      <div className="border border-black bg-[#141619] text-white p-5 space-y-4 clip-chamfer-md shadow-2xl">
        <h3 className="font-mono-tech text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-4 h-4 text-[#EAB308]" />
          <span>{t.debrief.subsystemComparison}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full font-mono-tech text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">{language === 'en' ? 'Subsystem' : 'Subsistem'}</th>
                <th className="py-2.5 px-3 text-rose-400">{t.debrief.legacyAster9}</th>
                <th className="py-2.5 px-3 text-[#EAB308]">{t.debrief.refitMark2}</th>
                <th className="py-2.5 px-3">{t.debrief.engineeringImpact}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">
                  {language === 'en' ? 'Power Generation' : 'Pembangkit Daya'}
                </td>
                <td className="py-2.5 px-3">{getCompName(legacyConfig.solar)}</td>
                <td className="py-2.5 px-3 text-white">{getCompName(redesignConfig.solar)}</td>
                <td className="py-2.5 px-3 text-emerald-400">
                  {language === 'en' ? 'Maintains high battery recharge rate' : 'Menjaga laju pengisian daya tinggi'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">
                  {language === 'en' ? 'Energy Storage' : 'Penyimpan Energi'}
                </td>
                <td className="py-2.5 px-3">{getCompName(legacyConfig.battery)}</td>
                <td className="py-2.5 px-3 text-white">{getCompName(redesignConfig.battery)}</td>
                <td className="py-2.5 px-3 text-emerald-400">
                  {language === 'en' ? 'Sustains system bus during eclipse transits' : 'Menjamin pasokan daya selama gerhana'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">
                  {language === 'en' ? 'Thermal Control' : 'Proteksi Termal'}
                </td>
                <td className="py-2.5 px-3 text-rose-400">{getCompName(legacyConfig.thermal)}</td>
                <td className="py-2.5 px-3 text-white">{getCompName(redesignConfig.thermal)}</td>
                <td className="py-2.5 px-3 text-emerald-400">
                  {language === 'en' ? 'Maintains cell temp above freeze threshold' : 'Menjaga suhu sel di atas batas beku'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">
                  {language === 'en' ? 'Dry Mass' : 'Massa Wahana'}
                </td>
                <td className="py-2.5 px-3">{legacyRun.finalMassKg} kg</td>
                <td className="py-2.5 px-3 text-white">{simulationResult?.finalMassKg ?? 0} kg</td>
                <td className="py-2.5 px-3 text-slate-400">
                  {language === 'en' ? 'Within rocket payload limit' : 'Dalam kapasitas muatan roket'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">
                  {language === 'en' ? 'Total Cost' : 'Total Biaya'}
                </td>
                <td className="py-2.5 px-3">${legacyRun.finalCostMillion}M</td>
                <td className="py-2.5 px-3 text-white">${simulationResult?.finalCostMillion ?? 0}M</td>
                <td className="py-2.5 px-3 text-slate-400">
                  {language === 'en' ? 'Within program budget cap' : 'Sesuai pagu program'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">
                  {language === 'en' ? 'Mission Outcome' : 'Hasil Misi'}
                </td>
                <td className="py-2.5 px-3 text-rose-400 font-bold">{legacyRun.failureReason ?? 'FAIL'}</td>
                <td className={`py-2.5 px-3 font-bold ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isSuccess 
                    ? (language === 'en' ? 'FULL ORBIT SUCCESS' : 'SUKSES ORBIT PENUH') 
                    : (simulationResult?.failureReason ?? 'FAIL')}
                </td>
                <td className="py-2.5 px-3 text-emerald-400">
                  {isSuccess 
                    ? (language === 'en' ? 'Full scientific telemetry returned' : 'Seluruh telemetri sains terkirim') 
                    : (language === 'en' ? 'Design adjustments required' : 'Desain butuh penyesuaian')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Lessons Learned Cards (Q19c: What You Learned Panel) */}
      {FEATURES.learnedPanel ? (
        <div className="border border-cyan-500/30 bg-[#0a1224] p-5 space-y-4 clip-chamfer-md shadow-2xl">
          <div className="flex items-center gap-2 font-bold text-amber-400 font-mono text-xs uppercase tracking-wider border-b border-cyan-500/20 pb-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>{language === 'en' ? 'WHAT YOU LEARNED : AEROSPACE FORENSIC INSIGHTS' : 'APA YANG KAMU PELAJARI : ANALISIS FORENSIK ANTARIKSA'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {/* Card 1: Thermal Swings */}
            <div className="p-3 bg-[#111c33] border border-cyan-500/20 clip-chamfer-sm space-y-1.5">
              <div className="text-cyan-300 font-bold text-[11px] uppercase">
                {language === 'en' ? '1. THERMAL CONTRACTION' : '1. SIKLUS TERMAL'}
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {language === 'en'
                  ? `Entering asteroid shadow drops flux to 0W. Minimum cell temperature reached ${minTemp.toFixed(1)}°C.`
                  : `Bayangan gerhana memutus radiasi surya total. Suhu sel wahana mencapai titik terendah ${minTemp.toFixed(1)}°C.`}
              </p>
            </div>

            {/* Card 2: Cryo Battery Sag */}
            <div className="p-3 bg-[#111c33] border border-cyan-500/20 clip-chamfer-sm space-y-1.5">
              <div className="text-cyan-300 font-bold text-[11px] uppercase">
                {language === 'en' ? '2. CRYO BATTERY SAG' : '2. BATERAI BEKU'}
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {language === 'en'
                  ? 'Frozen lithium-ion electrolytes spike internal resistance, dropping usable capacity by up to 80%.'
                  : 'Elektrolit lithium yang membeku melipatgandakan hambatan dalam, memangkas kapasitas efektif hingga 80%.'}
              </p>
            </div>

            {/* Card 3: UVLO Cutoff */}
            <div className="p-3 bg-[#111c33] border border-cyan-500/20 clip-chamfer-sm space-y-1.5">
              <div className="text-cyan-300 font-bold text-[11px] uppercase">
                {language === 'en' ? '3. UVLO CUTOFF' : '3. PEMUTUSAN UVLO'}
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {language === 'en'
                  ? 'Flight computers trigger Undervoltage Lockout (UVLO) below 22.0V to safeguard volatile memory.'
                  : 'Komputer penerbangan memicu Undervoltage Lockout (UVLO) di bawah 22.0V untuk mengamankan memori.'}
              </p>
            </div>

            {/* Card 4: Power Margin & Load Shedding */}
            <div className="p-3 bg-[#111c33] border border-cyan-500/20 clip-chamfer-sm space-y-1.5">
              <div className="text-cyan-300 font-bold text-[11px] uppercase">
                {language === 'en' ? '4. POWER MARGIN' : '4. MARGIN DAYA'}
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {language === 'en'
                  ? `Your redesign maintained a +${powerMargin}% net power margin, sustaining life support and comms.`
                  : `Rancangan barumu mempertahankan margin daya +${powerMargin}%, menjaga subsistem vital tetap hidup.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Legacy Lessons Learned Card */
        <div className="border-l-4 border-[#EAB308] bg-[#141619] border-black p-5 space-y-2 text-xs font-mono-tech text-slate-200 shadow-xl">
          <div className="flex items-center gap-2 font-bold text-[#EAB308]">
            <Sparkles className="w-4 h-4 text-[#EAB308]" />
            <span>{t.debrief.lessonsLearned}</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            {t.debrief.lessonsLearnedText}
          </p>
        </div>
      )}

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
            <span>{t.debrief.retryMission}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick(600);
              setPhase('redesign');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1F2329] border border-slate-700 hover:border-[#EAB308] text-slate-300 hover:text-[#EAB308] font-mono-tech text-xs transition-colors cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>{t.debrief.modifyDesign}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {FEATURES.shareCard && (
            <button
              onClick={handleShareCard}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg cursor-pointer clip-chamfer-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'en' ? 'SHARE RESULT CARD' : 'BAGIKAN HASIL'}</span>
            </button>
          )}

          <button
            onClick={handleExportReport}
            className="btn-tactical-primary px-6 py-2.5 text-black font-display font-black text-xs tracking-wider flex items-center gap-2 shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.debrief.exportReport}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
