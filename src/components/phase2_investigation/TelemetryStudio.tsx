import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Pin, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Zap, 
  Thermometer, 
  Battery, 
  Radio, 
  Clock, 
  Layers,
  Moon,
  AlertTriangle
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { sounds } from '../../utils/soundEngine';
import { SatelliteVisualizer } from './SatelliteVisualizer';
import { BlackBoxAudioPlayer } from './BlackBoxAudioPlayer';
import { AstroMascot } from '../onboarding/AstroMascot';
import { ShipHotspotView } from './ShipHotspotView';
import { FEATURES } from '../../config/features';
import { useTranslation } from '../../i18n';

export const TelemetryStudio: React.FC = () => {
  const { 
    activeCase, 
    currentTimeMinute, 
    setCurrentTimeMinute, 
    pinnedEvidences, 
    pinEvidence, 
    unpinEvidence, 
    setPhase
  } = useMissionStore();
  const { t, language } = useTranslation();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'telemetry' | 'hotspot'>('telemetry');

  // Auto-play scrubber effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeMinute(
          currentTimeMinute >= 360 ? 0 : currentTimeMinute + 5
        );
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTimeMinute, setCurrentTimeMinute]);

  const telemetry = activeCase.telemetryLogs;

  // Eclipse shading coordinates calculated dynamically from activeCase.telemetryLogs
  const eclipsePoints = telemetry.filter((p) => p.isEclipse);
  const eclipseStartMin = eclipsePoints.length > 0 ? eclipsePoints[0].timeMinutes : 200;
  const eclipseEndMin = eclipsePoints.length > 0 ? eclipsePoints[eclipsePoints.length - 1].timeMinutes + 10 : 270;
  const eclipseX1 = (eclipseStartMin / 360) * 720;
  const eclipseWidth = ((eclipseEndMin - eclipseStartMin) / 360) * 720;
  
  // Find closest telemetry point to currentTimeMinute
  const currentPoint = telemetry.reduce((prev, curr) => 
    Math.abs(curr.timeMinutes - currentTimeMinute) < Math.abs(prev.timeMinutes - currentTimeMinute) ? curr : prev
  , telemetry[0]);

  // Find if an evidence is discoverable near current time (±15 min)
  const availableEvidenceNear = activeCase.keyEvidencePool.find(
    (ev) => Math.abs(ev.timeMinutes - currentTimeMinute) <= 15
  );

  const isEvidencePinned = (id: string) => pinnedEvidences.some((e) => e.id === id);

  // Nova live speech and reaction based on scrubber position
  const getNovaCommentary = () => {
    if (currentTimeMinute < 130) {
      return {
        mood: 'happy' as const,
        tag: 'KONDISI NORMAL : T+00:00 HINGGA T+02:00',
        text: 'Semua sistem ASTER-9 berjalan mulus. Panel surya menyuplai daya penuh dan baterai terisi penuh.',
        highlightColor: 'text-[#10B981]'
      };
    } else if (currentTimeMinute < 185) {
      return {
        mood: 'explaining' as const,
        tag: 'TITIK ANOMALI 1 : T+02:30 LONJAKAN BEBAN',
        text: 'Instrumen spektrometer dinyalakan pada T+02:30. Pemakaian daya melonjak tinggi ke 260W.',
        highlightColor: 'text-[#EAB308]'
      };
    } else if (currentTimeMinute < 230) {
      return {
        mood: 'surprised' as const,
        tag: 'TITIK ANOMALI 2 : T+03:20 MASUK BAYANGAN',
        text: 'Satelit masuk ke bayangan tebal asteroid pada T+03:20. Daya surya turun ke nol watt.',
        highlightColor: 'text-purple-400'
      };
    } else if (currentTimeMinute < 260) {
      return {
        mood: 'warning' as const,
        tag: 'TITIK ANOMALI 3 : T+03:50 SUHU BEKU',
        text: 'Temperatur baterai anjlok sampai minus 11.6 derajat. Baterai membeku tanpa pemanas aktif.',
        highlightColor: 'text-cyan-400'
      };
    } else {
      return {
        mood: 'sad' as const,
        tag: 'TITIK ANOMALI 4 : T+04:20 MATI TOTAL',
        text: 'Tegangan bus anjlok drastis ke 21.0V. Komputer utama mati dan sinyal terputus total.',
        highlightColor: 'text-rose-400'
      };
    }
  };

  const novaCommentary = getNovaCommentary();

  const GLITCH_SNAPS = [
    { min: 150, time: 'T+02:30', title: 'GLITCH 1', desc: 'Instrumen Nyala : 260W', icon: Zap, activeColor: 'border-[#EAB308] text-[#EAB308]' },
    { min: 200, time: 'T+03:20', title: 'GLITCH 2', desc: 'Masuk Bayangan : 0W', icon: Moon, activeColor: 'border-purple-500 text-purple-400' },
    { min: 230, time: 'T+03:50', title: 'GLITCH 3', desc: 'Baterai Beku : -11.6°C', icon: Thermometer, activeColor: 'border-cyan-400 text-cyan-300' },
    { min: 260, time: 'T+04:20', title: 'GLITCH 4', desc: 'Mati Total : 21.0V', icon: AlertTriangle, activeColor: 'border-rose-500 text-rose-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141619] border border-black text-white p-5 clip-chamfer-md shadow-2xl relative">
        <div className="absolute top-2 right-4 font-mono-tech text-[10px] text-slate-500">
          PEREKAM : DSN-BLKBOX-09
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="clip-slanted font-mono-tech text-[10px] uppercase px-2 py-0.5 bg-[#EAB308] text-black font-bold">
              FASE 02 : LAB TELEMETRI
            </span>
            <span className="text-[11px] text-slate-400 font-mono-tech">
              ANALISIS LOG REKAMAN DSN
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-white mt-1">
            STUDIO TELEMETRI KOTAK HITAM ASTER-9
          </h2>
        </div>

        {/* Scrubber Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-2 px-4 py-2 font-mono-tech text-xs font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#EAB308] text-black shadow-lg shadow-amber-500/20'
                : 'bg-[#1F2329] border border-slate-700 hover:border-[#EAB308] text-white hover:text-[#EAB308]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'JEDA' : 'PUTAR'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick(400);
              setIsPlaying(false);
              setCurrentTimeMinute(0);
            }}
            className="p-2 bg-[#1F2329] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset to T+00:00"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="px-3 py-2 bg-black border border-slate-800 font-mono-tech text-[#EAB308] text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{currentPoint.timeStr}</span>
          </div>
        </div>
      </div>

      {/* Tab Mode: Kurva vs Penampang Cetak Biru (Q9) */}
      {FEATURES.shipHotspots && (
        <div className="flex items-center gap-2 bg-[#141619] border border-black p-1.5 rounded-lg font-mono-tech text-xs">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(500);
              setViewMode('telemetry');
            }}
            className={`flex-1 py-2 px-3 rounded font-bold transition-all cursor-pointer text-center ${
              viewMode === 'telemetry'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'en' ? 'TELEMETRY PLOT CURVES' : 'ANALISIS KURVA TELEMETRI'}
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick(500);
              setViewMode('hotspot');
            }}
            className={`flex-1 py-2 px-3 rounded font-bold transition-all cursor-pointer text-center ${
              viewMode === 'hotspot'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'en' ? 'SPACECRAFT SCHEMATIC / HOTSPOTS' : 'PENAMPANG KAPAL / HOTSPOT'}
          </button>
        </div>
      )}

      {/* Render Hotspot Blueprint View when active */}
      {FEATURES.shipHotspots && viewMode === 'hotspot' && (
        <ShipHotspotView />
      )}

      {/* =========================================================================
          FEATURE 1: QUICK ANOMALY SNAP POINTS (4 Glitch Jump Buttons)
          Pemain awam tidak perlu pusing mencari: cukup 1-klik untuk lompat ke anomali!
          ========================================================================= */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono-tech text-slate-700 uppercase tracking-wider">
          <span className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#EAB308]" />
            LOMPAT CEPAT KE TITIK ANOMALI :
          </span>
          <span className="text-slate-500 text-[10px]">PILIH TITIK ANOMALI</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {GLITCH_SNAPS.map((snap) => {
            const Icon = snap.icon;
            const isNear = Math.abs(currentTimeMinute - snap.min) <= 12;
            return (
              <button
                key={snap.title}
                onClick={() => {
                  sounds.playClick(750);
                  setCurrentTimeMinute(snap.min);
                }}
                className={`p-3 text-left border transition-all cursor-pointer flex items-center justify-between clip-chamfer-sm ${
                  isNear 
                    ? `bg-[#1C1F24] ${snap.activeColor} shadow-lg ring-1 ring-[#EAB308]/40` 
                    : 'bg-[#141619] border-black text-slate-400 hover:border-slate-700 hover:text-white hover:bg-[#181A1F]'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-mono-tech text-[10px] font-bold">
                    <span className="text-[#EAB308]">{snap.time}</span>
                    <span>: {snap.title}</span>
                  </div>
                  <div className="font-display font-bold text-xs text-white truncate">
                    {snap.desc}
                  </div>
                </div>
                <Icon className={`w-4 h-4 shrink-0 ${isNear ? 'animate-bounce' : 'opacity-60'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          FEATURE 2: NOVA REAL-TIME COMPANION (Smart Assistant for Beginners)
          ========================================================================= */}
      <div className="bg-[#141619] border border-black p-4 clip-chamfer-md shadow-2xl flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
        {/* Nova Mini Character Display */}
        <div className="shrink-0 flex items-center justify-center relative">
          <AstroMascot mood={novaCommentary.mood} size="sm" />
          <div className="absolute -bottom-1 font-mono-tech text-[9px] bg-black border border-slate-700 text-[#EAB308] px-1.5 py-0.2">
            NOVA ASISTEN AI
          </div>
        </div>

        {/* Speech Bubble / Dialogue */}
        <div className="flex-1 space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className={`font-mono-tech text-[10px] font-bold uppercase px-2 py-0.5 bg-black border border-slate-800 ${novaCommentary.highlightColor}`}>
              {novaCommentary.tag}
            </span>
            <span className="text-[10px] font-mono-tech text-slate-500">
              ANALISIS SUARA
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mt-1">
            "{novaCommentary.text}"
          </p>
        </div>

        {/* Pin CTA badge inside Nova bubble */}
        {availableEvidenceNear && (
          <div className="shrink-0 self-center">
            <button
              onClick={() => {
                if (isEvidencePinned(availableEvidenceNear.id)) {
                  unpinEvidence(availableEvidenceNear.id);
                } else {
                  pinEvidence(availableEvidenceNear);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 font-mono-tech text-xs font-bold transition-all cursor-pointer ${
                isEvidencePinned(availableEvidenceNear.id)
                  ? 'bg-emerald-600 text-black'
                  : 'btn-tactical-primary text-black shadow-lg shadow-amber-500/20'
              }`}
            >
              {isEvidencePinned(availableEvidenceNear.id) ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>TERSIMPAN</span>
                </>
              ) : (
                <>
                  <Pin className="w-3.5 h-3.5" />
                  <span>SEMATKAN</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          FEATURE 3: PHYSICAL SATELLITE VISUAL METAPHOR (Schematic Diagnostic)
          Menampilkan dampak nyata di fisik wahana: sayap surya mati, baterai membeku, blackout
          ========================================================================= */}
      <SatelliteVisualizer 
        currentPoint={currentPoint} 
        solarW={currentPoint.solarOutput > 0 ? currentPoint.solarOutput : (telemetry.find(p => p.solarOutput > 0)?.solarOutput || 160)}
      />

      {/* =========================================================================
          FEATURE 4: RECOVERED BLACK BOX AUDIO LOG PLAYER
          Dramatisasi suara rekaman detik-detik terakhir pemutusan kontak satelit
          ========================================================================= */}
      <BlackBoxAudioPlayer 
        isPinned={isEvidencePinned('ev_uvlo_cutoff')}
        onPinEvidence={() => {
          const uvloEv = activeCase.keyEvidencePool.find(e => e.id === 'ev_uvlo_cutoff');
          if (uvloEv) {
            if (isEvidencePinned(uvloEv.id)) {
              unpinEvidence(uvloEv.id);
            } else {
              pinEvidence(uvloEv);
            }
          }
        }}
      />

      {/* Current Telemetry Ticker Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* CH-01 Bus Voltage */}
        <div className={`p-3 border font-mono-tech transition-colors ${
          currentPoint.busVoltage < 22.0 
            ? 'bg-red-950/70 border-red-600 text-red-300' 
            : currentPoint.busVoltage < 24.0 
            ? 'bg-amber-950/40 border-amber-600 text-amber-300'
            : 'bg-[#141619] border-black text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>CH-01 : {t.investigation.busVoltage}</span>
            <Zap className="w-3.5 h-3.5 text-[#EAB308]" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPoint.busVoltage} <span className="text-xs text-slate-400">V</span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            {currentPoint.busVoltage < 22.0 ? (language === 'en' ? 'UVLO CRITICAL' : 'DARURAT UVLO') : (language === 'en' ? 'Safe Limit : 22.0V' : 'Batas Aman : 22.0V')}
          </div>
        </div>

        {/* CH-02 Solar Generation */}
        <div className={`p-3 border font-mono-tech transition-colors ${
          currentPoint.isEclipse 
            ? 'bg-purple-950/50 border-purple-700 text-purple-300' 
            : 'bg-[#141619] border-black text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>CH-02 : {t.investigation.solarGeneration}</span>
            <Zap className="w-3.5 h-3.5 text-[#EAB308]" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPoint.solarOutput} <span className="text-xs text-slate-400">W</span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            {currentPoint.isEclipse ? (language === 'en' ? 'UMBRA 0W' : 'BAYANGAN 0W') : (language === 'en' ? 'SUNLIT' : 'TERANG MATAHARI')}
          </div>
        </div>

        {/* CH-03 Battery SOC */}
        <div className={`p-3 border font-mono-tech transition-colors ${
          currentPoint.batterySOC < 20 
            ? 'bg-red-950/70 border-red-600 text-red-300' 
            : currentPoint.batterySOC < 50 
            ? 'bg-amber-950/40 border-amber-600 text-amber-300'
            : 'bg-[#141619] border-black text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>CH-03 : {t.investigation.batterySOC}</span>
            <Battery className="w-3.5 h-3.5 text-[#EAB308]" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPoint.batterySOC} <span className="text-xs text-slate-400">%</span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            {language === 'en' ? 'CAPACITY : 400 WH' : 'KAPASITAS : 400 WH'}
          </div>
        </div>

        {/* CH-04 Battery Temp */}
        <div className={`p-3 border font-mono-tech transition-colors ${
          currentPoint.batteryTemp < -10 
            ? 'bg-cyan-950/90 border-cyan-500 text-cyan-200' 
            : currentPoint.batteryTemp < 0 
            ? 'bg-blue-950/60 border-blue-700 text-blue-300'
            : 'bg-[#141619] border-black text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>CH-04 : {t.investigation.batteryTemp}</span>
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPoint.batteryTemp} <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            {currentPoint.batteryTemp < -10 ? (language === 'en' ? 'CRYOGENIC FREEZE' : 'BEKU TOTAL') : (language === 'en' ? 'Nominal Range' : 'Rentang Normal')}
          </div>
        </div>

        {/* CH-05 Power Consumption */}
        <div className="p-3 border border-black bg-[#141619] font-mono-tech text-slate-300">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>CH-05 : {t.investigation.powerLoad}</span>
            <Zap className="w-3.5 h-3.5 text-[#EAB308]" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPoint.powerConsumption} <span className="text-xs text-slate-400">W</span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            {currentPoint.powerConsumption > 160 ? (language === 'en' ? 'ENERGY DEFICIT' : 'DEFISIT ENERGI') : (language === 'en' ? 'LOAD BALANCED' : 'BEBAN SEIMBANG')}
          </div>
        </div>

        {/* CH-06 Signal SNR */}
        <div className={`p-3 border font-mono-tech transition-colors ${
          currentPoint.signalSNR <= 0 
            ? 'bg-red-950/70 border-red-700 text-red-400' 
            : currentPoint.signalSNR < 6 
            ? 'bg-amber-950/40 border-amber-600 text-amber-300'
            : 'bg-[#141619] border-black text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>CH-06 : {t.investigation.linkSNR}</span>
            <Radio className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPoint.signalSNR} <span className="text-xs text-slate-400">dB</span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            {currentPoint.signalSNR <= 0 ? (language === 'en' ? 'CARRIER LOST' : 'SINYAL HILANG') : (language === 'en' ? 'NOMINAL CARRIER' : 'SINYAL NORMAL')}
          </div>
        </div>

      </div>

      {/* Main Interactive Graphs Area */}
      <div className="bg-[#141619] border border-black text-white p-5 space-y-4 clip-chamfer-md shadow-2xl">
        
        {/* Scrubber Timeline Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400">
            <span>LINIMASA : T+00:00</span>
            <span className="text-[#EAB308] font-bold">WAKTU AKTIF : {currentPoint.timeStr}</span>
            <span>T+06:00 AKHIR SINYAL</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={currentTimeMinute}
            onChange={(e) => setCurrentTimeMinute(Number(e.target.value))}
            className="w-full h-2 bg-black border border-slate-700 appearance-none cursor-pointer accent-[#EAB308]"
          />
        </div>

        {/* Timeline Event Flags Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono-tech text-[11px]">
          <button
            onClick={() => { sounds.playClick(); setCurrentTimeMinute(150); }}
            className={`p-2 border text-left transition-colors cursor-pointer ${
              Math.abs(currentTimeMinute - 150) <= 10 
                ? 'bg-[#1C1F24] border-[#EAB308] text-[#EAB308]' 
                : 'bg-black border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-[#EAB308]">T+02:30</div>
            <div className="truncate">Spektrometer Aktif</div>
          </button>

          <button
            onClick={() => { sounds.playClick(); setCurrentTimeMinute(200); }}
            className={`p-2 border text-left transition-colors cursor-pointer ${
              Math.abs(currentTimeMinute - 200) <= 10 
                ? 'bg-[#1C1F24] border-[#EAB308] text-[#EAB308]' 
                : 'bg-black border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-purple-400">T+03:20</div>
            <div className="truncate">Masuk Bayangan</div>
          </button>

          <button
            onClick={() => { sounds.playClick(); setCurrentTimeMinute(230); }}
            className={`p-2 border text-left transition-colors cursor-pointer ${
              Math.abs(currentTimeMinute - 230) <= 10 
                ? 'bg-[#1C1F24] border-[#EAB308] text-[#EAB308]' 
                : 'bg-black border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-cyan-400">T+03:50</div>
            <div className="truncate">Baterai Membeku</div>
          </button>

          <button
            onClick={() => { sounds.playClick(); setCurrentTimeMinute(260); }}
            className={`p-2 border text-left transition-colors cursor-pointer ${
              Math.abs(currentTimeMinute - 260) <= 10 
                ? 'bg-[#1C1F24] border-red-500 text-red-300' 
                : 'bg-black border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-red-400">T+04:20</div>
            <div className="truncate">Mati Total 21.0V</div>
          </button>
        </div>

        {/* SVG Multi-Channel Visual Telemetry Curves */}
        <div className="relative bg-black border border-slate-800 p-4 overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 telemetry-grid pointer-events-none opacity-30" />

          {/* SVG Visualizer */}
          <div className="relative h-64 w-full">
            <svg viewBox="0 0 720 240" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <defs>
                <linearGradient id="eclipseShade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7e22ce" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Eclipse Shading Area: x1 = (menit eclipse pertama)/360*720, lebar = (menit eclipse terakhir + 10 - menit eclipse pertama)/360*720 */}
              <rect x={eclipseX1} y="0" width={eclipseWidth} height="240" fill="url(#eclipseShade)" />
              <text x={eclipseX1 + 5} y="20" fill="#c084fc" fontSize="10" fontFamily="monospace">
                ZONA BAYANGAN : 0W
              </text>

              {/* UVLO Cutoff Red Line (y = 190 corresponds to 22.0V) */}
              <line x1="0" y1="190" x2="720" y2="190" stroke="#ef4444" strokeDasharray="4 4" strokeWidth="1.5" />
              <text x="10" y="185" fill="#ef4444" fontSize="10" fontFamily="monospace">
                BATAS TEGANGAN : 22.0V
              </text>

              {/* Freezing Temp Line (0°C at y = 140) */}
              <line x1="0" y1="140" x2="720" y2="140" stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
              <text x="10" y="135" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                0°C Freezing Line
              </text>

              {/* Curve 1: Solar Generation (Yellow) */}
              <path
                d={telemetry.map((pt, i) => {
                  const x = (pt.timeMinutes / 360) * 720;
                  const y = 210 - (pt.solarOutput / 200) * 150;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#eab308"
                strokeWidth="2"
              />

              {/* Curve 2: Battery Temp (Cyan) */}
              <path
                d={telemetry.map((pt, i) => {
                  const x = (pt.timeMinutes / 360) * 720;
                  const y = 140 - (pt.batteryTemp / 30) * 40;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${Math.min(235, Math.max(10, y))}`;
                }).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              {/* Curve 3: Bus Voltage (Green) */}
              <path
                d={telemetry.map((pt, i) => {
                  const x = (pt.timeMinutes / 360) * 720;
                  const y = 190 - (pt.busVoltage - 22.0) * 21.5;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${Math.min(235, Math.max(10, y))}`;
                }).join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Scrubber Cursor Line */}
              {(() => {
                const cursorX = (currentTimeMinute / 360) * 720;
                return (
                  <g>
                    <line
                      x1={cursorX}
                      y1="0"
                      x2={cursorX}
                      y2="240"
                      stroke="#EAB308"
                      strokeWidth="2"
                    />
                    <circle cx={cursorX} cy="10" r="4" fill="#EAB308" />
                  </g>
                );
              })()}
            </svg>

            {/* Legend Overlay */}
            <div className="absolute top-2 right-2 flex flex-wrap gap-3 bg-black/80 p-2 border border-slate-800 text-[10px] font-mono-tech">
              <span className="flex items-center gap-1 text-yellow-400">
                <span className="w-2.5 h-0.5 bg-yellow-400 inline-block" /> Daya Surya W
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> Suhu Sel C
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Voltase Bus V
              </span>
            </div>
          </div>
        </div>

        {/* Live Anomaly Detection Card */}
        {availableEvidenceNear && (
          <div className="p-4 border border-[#EAB308] bg-[#1C1F24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-black text-[#EAB308] border border-slate-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-tech text-[#EAB308] font-bold uppercase">
                    ANOMALI PADA {availableEvidenceNear.timeStr}
                  </span>
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 bg-black text-white border border-slate-700">
                    {availableEvidenceNear.value}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-mono-tech">
                  {availableEvidenceNear.observedText}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (isEvidencePinned(availableEvidenceNear.id)) {
                  unpinEvidence(availableEvidenceNear.id);
                } else {
                  pinEvidence(availableEvidenceNear);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 font-mono-tech text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isEvidencePinned(availableEvidenceNear.id)
                  ? 'bg-emerald-600 text-black'
                  : 'btn-tactical-primary text-black'
              }`}
            >
              {isEvidencePinned(availableEvidenceNear.id) ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>TERSEMAT</span>
                </>
              ) : (
                <>
                  <Pin className="w-4 h-4" />
                  <span>SEMATKAN</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Event Log Output at current timestamp */}
        {currentPoint.eventLog && (
          <div className={`p-3 border font-mono-tech text-xs flex items-center gap-2.5 ${
            currentPoint.severity === 'fatal' 
              ? 'bg-red-950/70 border-red-700 text-red-300' 
              : currentPoint.severity === 'critical'
              ? 'bg-amber-950/60 border-amber-700 text-amber-300'
              : 'bg-black border-slate-800 text-slate-300'
          }`}>
            <span className="text-[#EAB308] font-bold">[{currentPoint.timeStr}]</span>
            <span>{currentPoint.eventLog}</span>
          </div>
        )}

      </div>

      {/* Pinned Evidence Tray & Navigation Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pinned Evidence Tray (2 cols) */}
        <div className="lg:col-span-2 bg-[#141619] border border-black text-white p-5 clip-chamfer-md shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-white">
              <Layers className="w-4 h-4 text-[#EAB308]" />
              <span>
                {language === 'en' ? 'INVESTIGATION EVIDENCE TRAY : ' : 'BERKAS BUKTI INVESTIGASI : '}
                {pinnedEvidences.length} {language === 'en' ? 'EVIDENCE' : 'BUKTI'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono-tech">
              {language === 'en' ? 'MINIMUM 2 EVIDENCE REQUIRED' : 'MINIMAL 2 BUKTI DIPERLUKAN'}
            </span>
          </div>

          {pinnedEvidences.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono-tech py-4 text-center">
              {language === 'en' 
                ? 'No evidence pinned yet. Scrub the timeline to anomaly points and pin findings.' 
                : 'Belum ada bukti tersemat. Geser linimasa ke titik anomali lalu klik Sematkan.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {pinnedEvidences.map((ev, idx) => (
                <div 
                  key={ev.id} 
                  className="p-3 bg-[#1C1F24] border border-slate-800 flex flex-col justify-between text-xs font-mono-tech"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#EAB308] font-bold">
                        {language === 'en' ? 'EVIDENCE' : 'BUKTI'} {String(idx + 1).padStart(2, '0')} : {ev.timeStr}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">{ev.metric}</span>
                    </div>
                    <div className="text-white font-semibold mt-1">{ev.value}</div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{ev.observedText}</p>
                  </div>
                  <button
                    onClick={() => unpinEvidence(ev.id)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 self-end mt-2 cursor-pointer font-bold"
                  >
                    {language === 'en' ? 'REMOVE' : 'HAPUS'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Card (1 col) */}
        <div className="bg-[#141619] border border-black text-white p-5 flex flex-col justify-between clip-chamfer-md shadow-2xl">
          <div>
            <div className="text-[10px] font-mono-tech text-slate-500 uppercase">
              {language === 'en' ? 'NEXT PHASE' : 'FASE BERIKUTNYA'}
            </div>
            <h3 className="font-display font-bold text-base text-white mt-1">
              {t.investigation.proceedToRootCause}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 font-sans leading-relaxed">
              {language === 'en'
                ? 'Correlate electrical, thermal, and shadow anomalies to prove the cascading failure chain.'
                : 'Hubungkan anomali listrik, termal, dan bayangan untuk membuktikan urutan kegagalan wahana.'}
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playClick(600);
              setPhase('root_cause');
            }}
            disabled={pinnedEvidences.length === 0}
            className={`w-full mt-4 flex items-center justify-center gap-2 py-3 font-display font-black text-sm tracking-wide transition-all cursor-pointer ${
              pinnedEvidences.length >= 1
                ? 'btn-tactical-primary text-black shadow-lg shadow-amber-500/20'
                : 'bg-[#1C1F24] text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <span>{language === 'en' ? 'PROCEED TO HYPOTHESIS' : 'LANJUTKAN HIPOTESIS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
