import React from 'react';
import { 
  Zap, 
  Thermometer, 
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import type { TelemetryPoint } from '../../types/mission';
import { useTranslation } from '../../i18n';

interface SatelliteVisualizerProps {
  currentPoint: TelemetryPoint;
  solarW?: number;
}

export const SatelliteVisualizer: React.FC<SatelliteVisualizerProps> = ({ currentPoint, solarW = 160 }) => {
  const { language } = useTranslation();
  const isFreezing = currentPoint.batteryTemp < 0;
  const isCryoDanger = currentPoint.batteryTemp < -10;
  const isUVLOBlackout = currentPoint.busVoltage < 22.0;
  const isCarrierLost = currentPoint.signalSNR <= 0;
  const isEclipse = currentPoint.isEclipse;
  const halfSolarW = Math.round(solarW / 2);

  return (
    <div className="bg-[#141619] border border-black p-4 clip-chamfer-md shadow-2xl relative text-white space-y-4">
      
      {/* Top Header Tag */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#EAB308] rotate-45" />
          <h3 className="font-display font-bold text-sm tracking-wide text-white uppercase">
            {language === 'en' ? 'ASTER-9 PHYSICAL STATUS MONITOR' : 'DIAGNOSTIK FISIK WAHANA ASTER-9'}
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono-tech text-[10px]">
          {isUVLOBlackout ? (
            <span className="bg-rose-950 border border-rose-600 text-rose-300 px-2 py-0.5 animate-pulse font-bold">
              {language === 'en' ? 'CRITICAL : UVLO CUTOFF' : 'KRITIS : MATI TOTAL'}
            </span>
          ) : isCryoDanger ? (
            <span className="bg-cyan-950 border border-cyan-500 text-cyan-200 px-2 py-0.5 animate-pulse font-bold">
              {language === 'en' ? 'WARNING : CRYOGENIC FREEZE' : 'PERINGATAN : SUHU BEKU'}
            </span>
          ) : isEclipse ? (
            <span className="bg-purple-950 border border-purple-600 text-purple-300 px-2 py-0.5 font-bold">
              {language === 'en' ? 'STATUS : ECLIPSE UMBRA' : 'STATUS : GERHANA BAYANGAN'}
            </span>
          ) : (
            <span className="bg-emerald-950 border border-emerald-600 text-emerald-300 px-2 py-0.5 font-bold">
              {language === 'en' ? 'STATUS : SUNLIT ORBIT' : 'STATUS : NORMAL MATAHARI'}
            </span>
          )}
        </div>
      </div>

      {/* Main Visual Schematic Box */}
      <div className={`relative h-64 sm:h-72 w-full border transition-all duration-500 flex items-center justify-center overflow-hidden ${
        isUVLOBlackout 
          ? 'bg-black border-rose-800/80' 
          : isEclipse 
          ? 'bg-gradient-to-b from-[#0F0C1B] to-[#0A0D14] border-purple-900/60' 
          : 'bg-gradient-to-b from-[#0A101D] to-[#0D0F14] border-slate-800'
      }`}>

        {/* Blueprint Grid Overlay */}
        <div className="absolute inset-0 telemetry-grid opacity-30 pointer-events-none" />

        {/* Environmental Ambient Light Indicator (Sun vs Moon/Shadow) */}
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2 font-mono-tech text-xs">
          {isEclipse ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/80 border border-purple-600 text-purple-200">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>ASTEROID SHADOW: 0 W SOLAR FLUX</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-600 text-amber-200">
              <Sun className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '12s' }} />
              <span>DIRECT SUNLIGHT: {solarW} W GENERATION</span>
            </div>
          )}
        </div>

        {/* Spacecraft Physical Cross-Section Drawing (SVG) */}
        <svg viewBox="0 0 500 240" className="w-full h-full max-w-[500px] z-10">
          <defs>
            {/* Solar Active Gradient */}
            <linearGradient id="solarActive" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>

            {/* Solar Dead / Eclipse Gradient */}
            <linearGradient id="solarDead" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E1B2E" />
              <stop offset="100%" stopColor="#2E2A44" />
            </linearGradient>

            {/* Frost Texture Gradient */}
            <linearGradient id="frostIce" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A5F3FC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0891B2" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* ==============================================================
              TOP: High-Gain Antenna Dish & Radio Wave Carrier
              ============================================================== */}
          <g transform="translate(250, 45)">
            {/* Dish Strut */}
            <line x1="0" y1="25" x2="0" y2="5" stroke="#94A3B8" strokeWidth="2.5" />
            
            {/* Antenna Dish Curved Arc */}
            <path d="M -30 5 Q 0 -10 30 5" fill="none" stroke="#CBD5E1" strokeWidth="3" />
            <circle cx="0" cy="-6" r="3" fill="#EAB308" />

            {/* Radio Wave Radiations */}
            {!isCarrierLost ? (
              <g className="animate-pulse">
                <path d="M -15 -14 Q 0 -22 15 -14" fill="none" stroke="#10B981" strokeWidth="1.5" />
                <path d="M -25 -22 Q 0 -34 25 -22" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.6" />
                <text x="0" y="-36" fill="#10B981" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  TAUTAN DSN : {currentPoint.signalSNR} dB
                </text>
              </g>
            ) : (
              <g>
                <path d="M -15 -14 L -5 -20 L 5 -12 L 15 -22" fill="none" stroke="#EF4444" strokeWidth="2" />
                <text x="0" y="-26" fill="#EF4444" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  SINYAL TERPUTUS : 0 dB
                </text>
              </g>
            )}
          </g>

          {/* ==============================================================
              LEFT SOLAR WING
              ============================================================== */}
          <g transform="translate(60, 95)">
            {/* Connecting Boom */}
            <rect x="100" y="22" width="40" height="6" fill="#64748B" />
            {/* Wing Panels */}
            <rect 
              x="0" 
              y="0" 
              width="100" 
              height="50" 
              fill={isEclipse ? "url(#solarDead)" : "url(#solarActive)"} 
              stroke={isEclipse ? "#475569" : "#EAB308"} 
              strokeWidth={isEclipse ? "1" : "2"}
            />
            {/* Solar Cell Grid Lines */}
            <line x1="25" y1="0" x2="25" y2="50" stroke="#000000" strokeWidth="1" opacity="0.4" />
            <line x1="50" y1="0" x2="50" y2="50" stroke="#000000" strokeWidth="1" opacity="0.4" />
            <line x1="75" y1="0" x2="75" y2="50" stroke="#000000" strokeWidth="1" opacity="0.4" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#000000" strokeWidth="1" opacity="0.4" />
            
            <text x="50" y="30" fill={isEclipse ? "#94A3B8" : "#FFFFFF"} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {isEclipse ? "0 W BAYANGAN" : `SURYA +${halfSolarW}W`}
            </text>
          </g>

          {/* ==============================================================
              RIGHT SOLAR WING
              ============================================================== */}
          <g transform="translate(340, 95)">
            {/* Connecting Boom */}
            <rect x="0" y="22" width="40" height="6" fill="#64748B" />
            {/* Wing Panels */}
            <rect 
              x="40" 
              y="0" 
              width="100" 
              height="50" 
              fill={isEclipse ? "url(#solarDead)" : "url(#solarActive)"} 
              stroke={isEclipse ? "#475569" : "#EAB308"} 
              strokeWidth={isEclipse ? "1" : "2"}
            />
            {/* Solar Cell Grid Lines */}
            <line x1="65" y1="0" x2="65" y2="50" stroke="#000000" strokeWidth="1" opacity="0.4" />
            <line x1="90" y1="0" x2="90" y2="50" stroke="#000000" strokeWidth="1" opacity="0.4" />
            <line x1="115" y1="0" x2="115" y2="50" stroke="#000000" strokeWidth="1" opacity="0.4" />
            <line x1="40" y1="25" x2="140" y2="25" stroke="#000000" strokeWidth="1" opacity="0.4" />

            <text x="90" y="30" fill={isEclipse ? "#94A3B8" : "#FFFFFF"} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {isEclipse ? "0 W BAYANGAN" : `SURYA +${halfSolarW}W`}
            </text>
          </g>

          {/* ==============================================================
              CENTER: CENTRAL SPACECRAFT BUS
              ============================================================== */}
          <g transform="translate(200, 70)">
            {/* Main Bus Chassis Frame */}
            <rect 
              x="0" 
              y="0" 
              width="100" 
              height="100" 
              fill={isUVLOBlackout ? "#0D0F12" : "#1E232A"} 
              stroke={isUVLOBlackout ? "#EF4444" : isCryoDanger ? "#06B6D4" : "#EAB308"} 
              strokeWidth="2.5" 
            />

            {/* Corner Chamfer Accent Details */}
            <line x1="0" y1="12" x2="12" y2="0" stroke="#64748B" strokeWidth="2" />
            <line x1="88" y1="0" x2="100" y2="12" stroke="#64748B" strokeWidth="2" />
            <line x1="0" y1="88" x2="12" y2="100" stroke="#64748B" strokeWidth="2" />
            <line x1="88" y1="100" x2="100" y2="88" stroke="#64748B" strokeWidth="2" />

            {/* Core CPU Bus Status Indicator */}
            <rect 
              x="15" 
              y="12" 
              width="70" 
              height="24" 
              fill={isUVLOBlackout ? "#450A0A" : "#0A0D12"} 
              stroke={isUVLOBlackout ? "#EF4444" : "#334155"} 
            />
            <text x="50" y="24" fill={isUVLOBlackout ? "#FCA5A5" : "#10B981"} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {isUVLOBlackout ? "BUS 21.0V MATI" : `BUS ${currentPoint.busVoltage}V AMAN`}
            </text>
            <text x="50" y="32" fill="#94A3B8" fontSize="7" fontFamily="monospace" textAnchor="middle">
              {isUVLOBlackout ? "PEMUTUSAN DAYA" : "DISTRIBUSI DAYA"}
            </text>

            {/* Internal Battery Pack Module */}
            <rect 
              x="15" 
              y="44" 
              width="70" 
              height="44" 
              fill={isFreezing ? "#083344" : "#0A0D12"} 
              stroke={isCryoDanger ? "#06B6D4" : "#334155"} 
            />

            {/* Battery Fill Bar */}
            <rect 
              x="18" 
              y="47" 
              width={(currentPoint.batterySOC / 100) * 64} 
              height="8" 
              fill={currentPoint.batterySOC < 20 ? "#EF4444" : currentPoint.batterySOC < 50 ? "#F59E0B" : "#10B981"} 
            />

            <text x="50" y="66" fill="#F8FAFC" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              BAT: {currentPoint.batterySOC}%
            </text>
            
            <text x="50" y="78" fill={isCryoDanger ? "#67E8F9" : isFreezing ? "#A5F3FC" : "#FBBF24"} fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              TEMP: {currentPoint.batteryTemp}°C
            </text>

            {/* Frost Overlay on Battery Bay when Freezing */}
            {isFreezing && (
              <g>
                <path d="M 15 44 L 25 54 L 15 64 L 28 70 L 15 88" fill="none" stroke="#A5F3FC" strokeWidth="1.5" opacity="0.8" />
                <path d="M 85 44 L 75 54 L 85 64 L 72 70 L 85 88" fill="none" stroke="#A5F3FC" strokeWidth="1.5" opacity="0.8" />
              </g>
            )}

            {/* Warning Stamp inside Bus if Blackout */}
            {isUVLOBlackout && (
              <rect x="5" y="38" width="90" height="24" fill="#991B1B" opacity="0.9" rx="2" />
            )}
            {isUVLOBlackout && (
              <text x="50" y="53" fill="#FFFFFF" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="black">
                🚨 UVLO BLACKOUT
              </text>
            )}
          </g>

          {/* Subsystem Flow Energy Particles (SVG Flow Lines) */}
          {!isEclipse && !isUVLOBlackout && (
            <g className="animate-pulse">
              <line x1="160" y1="120" x2="200" y2="120" stroke="#FBBF24" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="340" y1="120" x2="300" y2="120" stroke="#FBBF24" strokeWidth="2" strokeDasharray="3,3" />
            </g>
          )}

          {/* Bottom Thruster Nozzle */}
          <polygon points="238,170 262,170 258,185 242,185" fill="#475569" stroke="#334155" />
          <text x="250" y="200" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="middle">
            DELTA-V PROPULSION
          </text>
        </svg>

        {/* Bottom Banner Status Bar */}
        <div className="absolute bottom-2 inset-x-4 flex items-center justify-between text-[10px] font-mono-tech z-10 px-2 py-1 bg-black/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 ${isUVLOBlackout ? 'bg-red-500' : 'bg-emerald-400'} animate-pulse`} />
            <span className="text-slate-300">
              CORE BUS: <strong className={isUVLOBlackout ? 'text-red-400' : 'text-emerald-400'}>{isUVLOBlackout ? 'OFFLINE' : 'ONLINE'}</strong>
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-400">
            <span>CELL: <strong className={isCryoDanger ? 'text-cyan-400 font-bold' : 'text-slate-200'}>{currentPoint.batteryTemp}°C</strong></span>
            <span>BUS: <strong className={isUVLOBlackout ? 'text-red-400 font-bold' : 'text-slate-200'}>{currentPoint.busVoltage}V</strong></span>
            <span>SOLAR: <strong className={isEclipse ? 'text-purple-400' : 'text-yellow-400'}>{currentPoint.solarOutput}W</strong></span>
          </div>
        </div>

      </div>

      {/* 3 Quick State Diagnoses (Casual-Friendly Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-tech text-xs">
        
        {/* Card 1: Solar State */}
        <div className={`p-3 border flex items-center gap-3 ${
          isEclipse ? 'bg-purple-950/40 border-purple-800/80 text-purple-200' : 'bg-[#1C1F24] border-slate-800 text-slate-300'
        }`}>
          <div className={`p-2 border shrink-0 ${isEclipse ? 'bg-purple-900/60 border-purple-500 text-purple-300' : 'bg-black border-slate-700 text-[#EAB308]'}`}>
            {isEclipse ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div className="leading-tight">
            <div className="font-bold text-white text-[11px]">
              {isEclipse ? (language === 'en' ? 'ECLIPSE UMBRA' : 'FASE GERHANA') : (language === 'en' ? 'SOLAR GENERATION' : 'DAYA MATAHARI')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {isEclipse 
                ? (language === 'en' ? 'Zero solar array input in shadow.' : 'Daya surya nol watt di bayangan.') 
                : (language === 'en' ? '160W active photovoltaic capture.' : 'Penyerapan daya surya 160 watt.')}
            </div>
          </div>
        </div>

        {/* Card 2: Thermal Battery State */}
        <div className={`p-3 border flex items-center gap-3 ${
          isCryoDanger 
            ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10' 
            : isFreezing 
            ? 'bg-blue-950/40 border-blue-800 text-blue-200' 
            : 'bg-[#1C1F24] border-slate-800 text-slate-300'
        }`}>
          <div className={`p-2 border shrink-0 ${isCryoDanger ? 'bg-cyan-900 border-cyan-400 text-cyan-200' : 'bg-black border-slate-700 text-cyan-400'}`}>
            <Thermometer className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-white text-[11px]">
              {isCryoDanger 
                ? (language === 'en' ? 'CRYOGENIC FREEZE' : 'BEKU EKSTREM') 
                : isFreezing 
                ? (language === 'en' ? 'COLD ANOMALY' : 'SUHU DINGIN') 
                : (language === 'en' ? 'THERMAL NOMINAL' : 'TERMAL NORMAL')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {isCryoDanger 
                ? (language === 'en' ? 'Battery core freezing below -10°C.' : 'Baterai membeku pada minus 28 derajat.') 
                : (language === 'en' ? 'Cell temperatures within limits.' : 'Suhu baterai dalam rentang aman.')}
            </div>
          </div>
        </div>

        {/* Card 3: Electric Core Bus State */}
        <div className={`p-3 border flex items-center gap-3 ${
          isUVLOBlackout 
            ? 'bg-red-950/60 border-red-600 text-red-200 shadow-md shadow-red-500/10' 
            : 'bg-[#1C1F24] border-slate-800 text-slate-300'
        }`}>
          <div className={`p-2 border shrink-0 ${isUVLOBlackout ? 'bg-red-900 border-red-500 text-red-200' : 'bg-black border-slate-700 text-[#10B981]'}`}>
            {isUVLOBlackout ? <AlertTriangle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          </div>
          <div className="leading-tight">
            <div className="font-bold text-white text-[11px]">
              {isUVLOBlackout 
                ? (language === 'en' ? 'UVLO BLACKOUT' : 'PADAM TOTAL') 
                : (language === 'en' ? 'MAIN 28V BUS' : 'BUS DAYA 28V')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {isUVLOBlackout 
                ? (language === 'en' ? 'Bus voltage collapsed below 22V.' : 'Tegangan jatuh ke 21.0 volt.') 
                : (language === 'en' ? 'Nominal regulated bus voltage.' : 'Tegangan bus listrik stabil normal.')}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};