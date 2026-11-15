import React, { useState } from 'react';
import { 
  Zap, 
  Battery, 
  Thermometer, 
  Radio, 
  Activity, 
  Check, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import type { RedesignConfiguration } from '../../types/mission';
import { SPACECRAFT_COMPONENTS } from '../../data/components';

interface SpacecraftXRayInspectorProps {
  config: RedesignConfiguration;
}

export const SpacecraftXRayInspector: React.FC<SpacecraftXRayInspectorProps> = ({ config }) => {
  const [activeView, setActiveView] = useState<'comparison' | 'xray'>('comparison');
  const [selectedHotspot, setSelectedHotspot] = useState<string>('battery');

  const getCompName = (id: string) => {
    return SPACECRAFT_COMPONENTS.find((c) => c.id === id)?.name || id;
  };

  const getCompDesc = (id: string) => {
    return SPACECRAFT_COMPONENTS.find((c) => c.id === id)?.description || '';
  };

  const HOTSPOTS = [
    {
      id: 'solar',
      name: 'Pembangkit Daya Surya',
      icon: Zap,
      legacy: 'Silikon Tetap 160W',
      legacyStatus: 'Nol watt saat gerhana dan tidak mampu mengisi baterai.',
      current: getCompName(config.solar),
      currentDesc: getCompDesc(config.solar),
      color: 'text-[#EAB308]',
      x: '20%',
      y: '45%'
    },
    {
      id: 'battery',
      name: 'Penyimpanan Energi Baterai',
      icon: Battery,
      legacy: 'Litium Standar 400 Wh',
      legacyStatus: 'Kapasitas habis total dalam 45 menit gerhana.',
      current: getCompName(config.battery),
      currentDesc: getCompDesc(config.battery),
      color: 'text-cyan-400',
      x: '50%',
      y: '55%'
    },
    {
      id: 'thermal',
      name: 'Proteksi Termal dan Pemanas',
      icon: Thermometer,
      legacy: 'Cat Pasif Tanpa Pemanas',
      legacyStatus: 'Suhu jatuh ke minus 28 derajat dan merusak baterai.',
      current: getCompName(config.thermal),
      currentDesc: getCompDesc(config.thermal),
      color: 'text-amber-400',
      x: '50%',
      y: '35%'
    },
    {
      id: 'comms',
      name: 'Telekomunikasi dan Radio',
      icon: Radio,
      legacy: 'Antena X-Band Standar',
      legacyStatus: 'Kehilangan kuncian sinyal saat tegangan listrik padam.',
      current: getCompName(config.comms),
      currentDesc: getCompDesc(config.comms),
      color: 'text-emerald-400',
      x: '50%',
      y: '18%'
    },
    {
      id: 'payload',
      name: 'Instrumen Sains Bawaan',
      icon: Activity,
      legacy: 'Spektrometer Tunggal',
      legacyStatus: 'Membebani daya listrik tanpa kontrol cerdas baterai.',
      current: `${config.payloads.length} Instrumen Terpasang`,
      currentDesc: config.payloads.map(getCompName).join(', '),
      color: 'text-purple-400',
      x: '75%',
      y: '65%'
    }
  ];

  const activeHotspotData = HOTSPOTS.find(h => h.id === selectedHotspot) || HOTSPOTS[1];

  return (
    <div className="bg-[#141619] border border-black p-5 clip-chamfer-md shadow-2xl relative text-white space-y-4">
      
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#EAB308] rotate-45" />
            <h3 className="font-display font-black text-sm sm:text-base tracking-wider text-white uppercase">
              INSPEKTOR SINAR X : PERBANDINGAN DESAIN
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Inspeksi fisik langsung perbedaan antara desain gagal asli dan konfigurasi refit Mark II Anda.
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-black border border-slate-800 font-mono-tech text-xs">
          <button
            onClick={() => { sounds.playClick(650); setActiveView('comparison'); }}
            className={`px-3 py-1 font-bold transition-all cursor-pointer ${
              activeView === 'comparison' 
                ? 'bg-[#EAB308] text-black shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            KOMPARASI
          </button>
          <button
            onClick={() => { sounds.playClick(650); setActiveView('xray'); }}
            className={`px-3 py-1 font-bold transition-all cursor-pointer ${
              activeView === 'xray' 
                ? 'bg-[#EAB308] text-black shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TITIK FISIK
          </button>
        </div>
      </div>

      {/* VIEW A: SIDE-BY-SIDE VISUAL COMPARISON */}
      {activeView === 'comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card Left: LEGACY ASTER-9 (FAILED) */}
          <div className="p-4 bg-gradient-to-b from-[#141217] to-black border border-rose-900/60 clip-chamfer-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-rose-950 border border-rose-700 text-rose-300 font-mono-tech text-[10px] font-bold">
                DASAR : WAHANA GAGAL
              </span>
              <span className="font-mono-tech text-xs text-rose-400 font-bold">MISI GAGAL</span>
            </div>

            {/* Visual Mini Graphic */}
            <div className="relative h-32 w-full bg-black/60 border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 telemetry-grid opacity-20 pointer-events-none" />
              
              <svg viewBox="0 0 200 100" className="w-48 h-24">
                {/* Frozen grey body */}
                <rect x="75" y="30" width="50" height="40" fill="#334155" stroke="#475569" strokeWidth="2" />
                <rect x="85" y="42" width="30" height="16" fill="#0F172A" stroke="#06B6D4" strokeDasharray="2,2" />
                <text x="100" y="53" fill="#67E8F9" fontSize="6" fontFamily="monospace" textAnchor="middle">-28°C BEKU</text>
                {/* Cracked dark solar wings */}
                <rect x="25" y="38" width="45" height="24" fill="#1E293B" stroke="#475569" />
                <rect x="130" y="38" width="45" height="24" fill="#1E293B" stroke="#475569" />
                {/* Red warning cross */}
                <line x1="90" y1="20" x2="110" y2="20" stroke="#EF4444" strokeWidth="2" />
                <text x="100" y="16" fill="#EF4444" fontSize="6" fontFamily="monospace" textAnchor="middle">SINYAL HILANG</text>
              </svg>
            </div>

            {/* Subsystems Breakdown List */}
            <div className="space-y-1.5 font-mono-tech text-xs divide-y divide-slate-800/80">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Panel Surya:</span>
                <span className="text-slate-300">Silikon Tetap 160W</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Modul Baterai:</span>
                <span className="text-rose-400">400 Wh Beku dan Habis</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Pelindung Termal:</span>
                <span className="text-rose-400">Cat Pasif Tanpa Pemanas</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Ketahanan Gerhana:</span>
                <span className="text-rose-400 font-bold">Maksimal 45 Menit</span>
              </div>
            </div>
          </div>

          {/* Card Right: ASTER-9 MARK II (REFIT) */}
          <div className="p-4 bg-gradient-to-b from-[#181B15] to-black border border-emerald-500/70 clip-chamfer-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono-tech text-[10px] font-bold">
                REFIT : ASTER-9 MARK II
              </span>
              <span className="font-mono-tech text-xs text-emerald-400 font-bold">SIAP TERBANG</span>
            </div>

            {/* Visual Mini Graphic */}
            <div className="relative h-32 w-full bg-black/60 border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 telemetry-grid opacity-20 pointer-events-none" />
              
              <svg viewBox="0 0 200 100" className="w-48 h-24">
                {/* Gold MLI Kapton body */}
                <rect x="75" y="30" width="50" height="40" fill="#D97706" stroke="#FBBF24" strokeWidth="2" />
                <rect x="85" y="42" width="30" height="16" fill="#1C1917" stroke="#10B981" />
                <text x="100" y="53" fill="#34D399" fontSize="6" fontFamily="monospace" textAnchor="middle">+15°C HANGAT</text>
                {/* High tech blue GaAs wings */}
                <rect x="25" y="35" width="45" height="30" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1.5" />
                <rect x="130" y="35" width="45" height="30" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1.5" />
                {/* Green link pulses */}
                <circle cx="100" cy="18" r="4" fill="#10B981" />
                <text x="100" y="12" fill="#10B981" fontSize="6" fontFamily="monospace" textAnchor="middle">SINYAL TERKUNCI</text>
              </svg>
            </div>

            {/* Subsystems Breakdown List */}
            <div className="space-y-1.5 font-mono-tech text-xs divide-y divide-slate-800/80">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Panel Surya:</span>
                <span className="text-[#EAB308] font-bold truncate max-w-[180px]">{getCompName(config.solar)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Modul Baterai:</span>
                <span className="text-cyan-400 font-bold truncate max-w-[180px]">{getCompName(config.battery)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Pelindung Termal:</span>
                <span className="text-amber-400 font-bold truncate max-w-[180px]">{getCompName(config.thermal)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Ketahanan Gerhana:</span>
                <span className="text-emerald-400 font-bold">Lebih dari 75 Menit</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW B: X-RAY INTERACTIVE HOTSPOTS */}
      {activeView === 'xray' && (
        <div className="space-y-4">
          {/* Hotspots Selector Row */}
          <div className="flex flex-wrap gap-2">
            {HOTSPOTS.map((h) => {
              const Icon = h.icon;
              const isSelected = selectedHotspot === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => { sounds.playClick(700); setSelectedHotspot(h.id); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-mono-tech text-xs font-bold transition-all cursor-pointer border clip-chamfer-sm ${
                    isSelected
                      ? 'bg-[#1C1F24] border-[#EAB308] text-[#EAB308] shadow-md'
                      : 'bg-black border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{h.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Hotspot Detail Inspection Card */}
          <div className="p-4 bg-black border border-slate-800 clip-chamfer-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <activeHotspotData.icon className={`w-5 h-5 ${activeHotspotData.color}`} />
                <h4 className="font-display font-bold text-sm text-white">
                  {activeHotspotData.name}
                </h4>
              </div>

              <div className="p-3 bg-red-950/40 border border-red-900/60 text-xs font-mono-tech space-y-1">
                <div className="text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DESAIN LAMA :</span>
                </div>
                <div className="text-white font-semibold">{activeHotspotData.legacy}</div>
                <p className="text-[11px] text-slate-300 font-sans">{activeHotspotData.legacyStatus}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-xs font-mono-tech space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>SOLUSI REFIT SAAT INI :</span>
                </div>
                <div className="text-white font-semibold">{activeHotspotData.current}</div>
                <p className="text-[11px] text-slate-300 font-sans">{activeHotspotData.currentDesc}</p>
              </div>

              <div className="p-2.5 bg-[#141619] border border-slate-800 text-[11px] font-mono-tech text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EAB308] shrink-0" />
                <span>Pilihan komponen memperbarui simulasi secara langsung.</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};