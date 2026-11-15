import React from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Battery, 
  Thermometer, 
  Zap, 
  Radio, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { Spacecraft3D } from './Spacecraft3D';
import { sounds } from '../../utils/soundEngine';
import type { TelemetryPoint } from '../../types/mission';
import { useTranslation } from '../../i18n';

export const FlightSimulator: React.FC = () => {
  const { 
    redesignConfig, 
    simulationResult, 
    simulationRunning, 
    simulationProgress, 
    startSimulation, 
    setPhase,
    guidedMode 
  } = useMissionStore();
  const { t, language } = useTranslation();

  const isSuccess = simulationResult?.completed;
  const trace = simulationResult?.telemetryTrace || [];
  
  // Calculate active point index based on simulationProgress
  const currentIdx = Math.min(
    trace.length - 1, 
    Math.floor((simulationProgress / 100) * (trace.length - 1))
  );
  const fallbackPt: TelemetryPoint = {
    timeMinutes: 0,
    timeStr: 'T+00:00',
    busVoltage: 28.2,
    solarOutput: 160,
    batterySOC: 100,
    batteryTemp: 18,
    powerConsumption: 120,
    dataBuffered: 0,
    downlinkRate: 256,
    signalSNR: 15.0,
    isEclipse: false,
  };
  const currentPt: TelemetryPoint = trace.length > 0
    ? (trace[currentIdx] || trace[0])
    : fallbackPt;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141619] border border-black text-white p-5 clip-chamfer-md shadow-2xl relative">
        <div className="absolute top-2 right-4 font-mono-tech text-[10px] text-slate-500">
          {language === 'en' ? 'SIMULATION : FLIGHT TEST' : 'SIMULASI : UJI PENERBANGAN'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="clip-slanted font-mono-tech text-[10px] uppercase px-2 py-0.5 bg-[#EAB308] text-black font-bold">
              {language === 'en' ? 'PHASE 05 : ORBITAL SIMULATION' : 'FASE 05 : SIMULASI ORBIT'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono-tech">
              {language === 'en' ? 'ORBITAL THERMAL & FLIGHT PATH VERIFICATION' : 'UJI BEBAN TERMAL DAN LINTASAN WAHANA'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-wide text-white mt-1">
            {language === 'en' ? 'FLIGHT TEST : ASTER-9 MARK II ORBIT INSERTION' : 'UJI TERBANG : INSERSI ORBIT ASTER-9 MARK II'}
          </h2>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {simulationRunning ? (
            <div className="flex items-center gap-2 font-mono-tech text-xs text-[#EAB308] bg-black px-3 py-2 border border-slate-800 animate-pulse">
              <Rocket className="w-4 h-4 animate-spin text-[#EAB308]" />
              <span>
                {language === 'en' ? 'SIMULATION RUNNING : ' : 'SIMULASI BERJALAN : '}
                {simulationProgress}%
              </span>
            </div>
          ) : (
            <button
              onClick={() => startSimulation()}
              className="flex items-center gap-2 px-4 py-2 bg-[#1F2329] border border-slate-700 hover:border-[#EAB308] text-white hover:text-[#EAB308] font-mono-tech text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'en' ? 'RERUN SIMULATION' : 'ULANGI SIMULASI'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#141619] border border-black p-4 space-y-2 clip-chamfer-sm text-white">
        <div className="flex items-center justify-between font-mono-tech text-xs text-slate-400">
          <span>MISSION ELAPSED TIME: <strong className="text-white">MET {currentPt.timeStr}</strong></span>
          <span className="text-[#EAB308] font-bold">{simulationProgress}% {language === 'en' ? 'TRAJECTORY COMPLETED' : 'LINTASAN SELESAI'}</span>
          <span>TARGET DURATION: <strong className="text-white">MET T+06:00</strong></span>
        </div>
        <div className="w-full bg-black h-2 overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-[#EAB308] transition-all duration-300"
            style={{ width: `${simulationProgress}%` }}
          />
        </div>
      </div>

      {/* Active Event Log from Telemetry Point */}
      {currentPt.eventLog && (
        <div className={`p-3 border font-mono-tech text-xs flex items-center justify-between clip-chamfer-sm ${
          currentPt.severity === 'fatal' || currentPt.severity === 'critical'
            ? 'bg-red-950/80 border-red-600 text-red-300'
            : currentPt.severity === 'warning'
            ? 'bg-amber-950/80 border-amber-600 text-amber-300'
            : 'bg-black border-[#EAB308] text-[#EAB308]'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span className="font-bold">{language === 'en' ? 'ORBIT EVENT LOG:' : 'LOG PERISTIWA ORBIT:'}</span>
            <span className="text-white font-sans text-xs">{currentPt.eventLog}</span>
          </div>
          <span className="text-[10px] text-slate-400">{currentPt.timeStr}</span>
        </div>
      )}

      {/* 3D WebGL Spacecraft View with Tactical HUD Frame */}
      <div className="relative border border-black bg-black clip-chamfer-md overflow-hidden shadow-2xl">
        {/* Top-Left Corner HUD */}
        <div className="absolute top-3 left-4 z-20 flex flex-col items-start gap-1 pointer-events-none">
          <div className="font-mono-tech text-[10px] text-slate-300 bg-black/85 px-2 py-0.5 border border-slate-800 flex items-center gap-2">
            <span className={`w-2 h-2 ${currentPt.isEclipse ? 'bg-purple-500' : 'bg-amber-400'} animate-pulse`} />
            <span>
              {language === 'en' 
                ? `ZONE : ${currentPt.isEclipse ? 'ECLIPSE UMBRA' : 'SUNLIT ORBIT SECTOR'}` 
                : `ZONA : ${currentPt.isEclipse ? 'BAYANGAN GERHANA' : 'SEKTOR TERANG MATAHARI'}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono-tech text-[9px] bg-slate-950/85 px-2 py-0.5 border border-slate-800 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold">3D CAD</span>
            <span className="text-slate-400">{language === 'en' ? ': ROTATE TO INSPECT' : ': DRAG ROTASI'}</span>
          </div>
        </div>

        {/* Top-Right Corner HUD */}
        <div className="absolute top-3 right-4 z-20 flex flex-col items-end gap-1 pointer-events-none">
          <div className={`font-mono-tech text-[10px] px-2 py-0.5 border font-bold flex items-center gap-1.5 ${
            currentPt.isEclipse 
              ? 'bg-purple-950/90 border-purple-600 text-purple-300 animate-pulse' 
              : 'bg-yellow-950/90 border-yellow-600 text-yellow-300'
          }`}>
            <span>{currentPt.isEclipse ? (language === 'en' ? 'UMBRA' : 'BAYANGAN') : (language === 'en' ? 'SUNLIT' : 'MATAHARI')}</span>
            <span>{currentPt.solarOutput} W</span>
          </div>
        </div>

        {/* 3D Canvas Canvas */}
        <div className="w-full h-80 sm:h-96">
          <Spacecraft3D config={redesignConfig} isEclipse={currentPt.isEclipse} />
        </div>

        {/* Bottom Orbit Coordinate Status Bar */}
        <div className="bg-[#141619] border-t border-black px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono-tech text-slate-400">
          <div className="flex items-center gap-4">
            <span>ORBIT: <strong className="text-white">{redesignConfig.orbit.replace('orbit_', '').toUpperCase()}</strong></span>
            <span>ALT: <strong className="text-white">{redesignConfig.orbit === 'orbit_low_terminator' ? '15 KM' : redesignConfig.orbit === 'orbit_distant_quasi' ? '45 KM' : '8 KM'}</strong></span>
            <span>SPEED: <strong className="text-white">0.24 M/S</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span>DATA RECORDED: <strong className="text-emerald-400">{Math.round((simulationProgress / 100) * 850)} MB</strong></span>
          </div>
        </div>
      </div>

      {/* 4-Channel Live Telemetry Instruments */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech text-xs">
        
        {/* Bus Voltage */}
        <div className={`p-3 border transition-colors ${
          currentPt.busVoltage < 22.0 
            ? 'bg-red-950/80 border-red-600 text-red-300' 
            : currentPt.busVoltage < 24.0 
            ? 'bg-amber-950/50 border-amber-600 text-amber-300'
            : 'bg-[#141619] border-black text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>CH-01 : {language === 'en' ? 'VOLTAGE' : 'VOLTASE'}</span>
            <Zap className="w-3.5 h-3.5 text-[#EAB308]" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPt.busVoltage.toFixed(1)} V
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            UVLO: {currentPt.busVoltage < 22.0 ? (language === 'en' ? 'SHUTDOWN' : 'PADAM') : (language === 'en' ? 'NOMINAL' : 'NOMINAL')}
          </div>
        </div>

        {/* Battery SOC */}
        <div className="p-3 border border-black bg-[#141619] text-slate-300">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>CH-02 : {language === 'en' ? 'BATTERY' : 'BATERAI'}</span>
            <Battery className="w-3.5 h-3.5 text-[#EAB308]" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPt.batterySOC}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Status: {currentPt.isEclipse ? (language === 'en' ? 'Discharging' : 'Pengosongan Daya') : (language === 'en' ? 'Charging' : 'Pengisian Daya')}
          </div>
        </div>

        {/* Cell Temperature */}
        <div className={`p-3 border transition-colors ${
          currentPt.batteryTemp < -10 
            ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200' 
            : 'bg-[#141619] border-black text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>CH-03 : {language === 'en' ? 'TEMP' : 'SUHU'}</span>
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPt.batteryTemp} °C
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {currentPt.batteryTemp >= 0 ? (language === 'en' ? 'Thermal Optimal' : 'Termal Optimal') : (language === 'en' ? 'Sub-Zero Cryo' : 'Suhu Sub-Nol')}
          </div>
        </div>

        {/* RF Signal Link Margin */}
        <div className="p-3 border border-black bg-[#141619] text-slate-300">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>CH-04 : {language === 'en' ? 'SIGNAL' : 'SINYAL'}</span>
            <Radio className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <div className="text-xl font-bold mt-1 text-white">
            {currentPt.signalSNR} dB
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {currentPt.signalSNR >= 3.0 ? (language === 'en' ? 'Carrier Locked' : 'Kuncian Stabil') : (language === 'en' ? 'Marginal SNR' : 'Sinyal Kritis')}
          </div>
        </div>

      </div>

      {/* Outcome Status & Transition to Debrief */}
      {simulationResult && !simulationRunning && (
        <div className={`p-6 border font-mono-tech space-y-4 clip-chamfer-md shadow-2xl ${
          isSuccess 
            ? 'bg-[#141619] border-emerald-500 text-emerald-200' 
            : 'bg-[#141619] border-rose-600 text-rose-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isSuccess ? (
                <div className="p-3 bg-black border border-emerald-500 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-3 bg-black border border-rose-500 text-rose-400">
                  <XCircle className="w-8 h-8" />
                </div>
              )}
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  {isSuccess 
                    ? (language === 'en' ? 'MISSION SIMULATION SUCCESS' : 'UJI MISI BERHASIL')
                    : (language === 'en' ? 'MISSION SIMULATION FAILED' : 'UJI MISI GAGAL')}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                  {isSuccess 
                    ? (language === 'en' 
                        ? `All shadow phases safely transited. Total science yield: ${simulationResult.scienceYieldScore} Points.`
                        : `Seluruh fase bayangan terlewati dengan aman. Skor sains: ${simulationResult.scienceYieldScore} Poin.`)
                    : simulationResult.failureReason || (language === 'en' ? 'Spacecraft suffered critical power or structural failure.' : 'Wahana mengalami kegagalan daya atau struktural kritis.')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick(600);
                setPhase('debrief');
              }}
              className="btn-tactical-primary px-6 py-3 text-black font-display font-black text-xs tracking-wider flex items-center gap-2 whitespace-nowrap shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>{t.simulation.proceedToDebrief}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Guided Info */}
      {guidedMode && (
        <div className="p-3 bg-[#1C1F24] border border-slate-800 text-xs text-slate-400 flex items-center gap-2 font-mono-tech">
          <Sparkles className="w-4 h-4 text-[#EAB308] shrink-0" />
          <span>
            {language === 'en'
              ? 'Compare with the legacy ASTER-9 failure at T+04:20: on this refit configuration, main bus voltage stays safely above UVLO cutoff throughout eclipse.'
              : 'Bandingkan dengan kegagalan ASTER-9 lama pada T+04:20: pada konfigurasi refit ini, tegangan bus bertahan aman di atas batas UVLO selama gerhana.'}
          </span>
        </div>
      )}

    </div>
  );
};
