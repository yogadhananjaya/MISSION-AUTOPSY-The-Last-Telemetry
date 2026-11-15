/* antislop: Authentic interactive engineering cross-section blueprint; replaces generic AI card grids */
import React, { useState } from 'react';
import { 
  Pin, 
  Check, 
  Maximize2
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { sounds } from '../../utils/soundEngine';

type HotspotId = 'solar' | 'battery' | 'thermal' | 'payload' | 'comms' | 'computer' | 'adcs';

interface HotspotMeta {
  id: HotspotId;
  label: string;
  labelEn: string;
  x: number;
  y: number;
  subsystem: string;
}

const HOTSPOTS: HotspotMeta[] = [
  { id: 'solar', label: 'Panel Surya Fotovoltaik', labelEn: 'Photovoltaic Solar Arrays', x: 120, y: 150, subsystem: 'EPS Power' },
  { id: 'battery', label: 'Modul Baterai Lithium-Ion', labelEn: 'Lithium-Ion Battery Bank', x: 260, y: 175, subsystem: 'Energy Storage' },
  { id: 'thermal', label: 'Insulasi Termal & Radiator', labelEn: 'Thermal Radiators & MLI', x: 300, y: 90, subsystem: 'Thermal TCS' },
  { id: 'payload', label: 'Muatan Sains (LIDAR/Spektro)', labelEn: 'Science Payloads (LIDAR)', x: 420, y: 180, subsystem: 'Science Payload' },
  { id: 'comms', label: 'Antena High-Gain X-Band', labelEn: 'High-Gain X-Band Dish', x: 480, y: 90, subsystem: 'RF Telecom' },
  { id: 'computer', label: 'Komputer Utama OBC Avionik', labelEn: 'On-Board Computer (OBC)', x: 340, y: 150, subsystem: 'Command & Data' },
  { id: 'adcs', label: 'Roda Reaksi & Sensor Bintang', labelEn: 'Reaction Wheels & ADCS', x: 200, y: 110, subsystem: 'Attitude Control' },
];

export const ShipHotspotView: React.FC = () => {
  const { 
    activeCase, 
    currentTimeMinute, 
    pinnedEvidences, 
    pinEvidence, 
    language 
  } = useMissionStore();

  const [selectedHotspot, setSelectedHotspot] = useState<HotspotId>('battery');
  const [pinNotice, setPinNotice] = useState<string | null>(null);

  // Find telemetry point for current time
  const currentPt = activeCase.telemetryLogs.find((p) => p.timeMinutes === currentTimeMinute) 
    || activeCase.telemetryLogs[0];

  // Hotspot status calculation based on telemetry at currentTimeMinute
  const getHotspotStatus = (id: HotspotId): 'nominal' | 'warning' | 'critical' | 'offline' => {
    switch (id) {
      case 'solar':
        if (currentPt.solarOutput === 0) return 'critical';
        if (currentPt.solarOutput < 100) return 'warning';
        return 'nominal';

      case 'battery':
        if (currentPt.batteryTemp < -10 || currentPt.busVoltage < 22) return 'critical';
        if (currentPt.batteryTemp < -5 || currentPt.busVoltage < 24) return 'warning';
        return 'nominal';

      case 'thermal':
        if (currentPt.batteryTemp < -10) return 'critical';
        if (currentPt.batteryTemp < 0) return 'warning';
        return 'nominal';

      case 'payload':
        if (currentPt.timeMinutes < 150) return 'offline';
        if (currentPt.powerConsumption > 250) return 'warning';
        return 'nominal';

      case 'comms':
      case 'computer':
      case 'adcs':
        if (currentPt.severity === 'fatal') return 'critical';
        if (currentPt.severity === 'critical') return 'warning';
        return 'nominal';

      default:
        return 'nominal';
    }
  };

  const getStatusColor = (status: 'nominal' | 'warning' | 'critical' | 'offline') => {
    switch (status) {
      case 'critical':
        return { fill: '#ef4444', stroke: '#b91c1c', text: 'text-red-400', label: 'KRITIS / MATI' };
      case 'warning':
        return { fill: '#eab308', stroke: '#ca8a04', text: 'text-yellow-400', label: 'PERINGATAN' };
      case 'offline':
        return { fill: '#64748b', stroke: '#475569', text: 'text-slate-400', label: 'STANDBY' };
      case 'nominal':
      default:
        return { fill: '#22c55e', stroke: '#15803d', text: 'text-emerald-400', label: 'NOMINAL' };
    }
  };

  const selectedMeta = HOTSPOTS.find((h) => h.id === selectedHotspot) || HOTSPOTS[0];
  const selectedStatus = getHotspotStatus(selectedHotspot);

  // Evidence pinning from hotspot
  const handlePinFromHotspot = () => {
    let matchedEvidenceId: string | null = null;

    if (selectedHotspot === 'solar' && currentPt.solarOutput === 0 && currentPt.isEclipse) {
      matchedEvidenceId = 'ev_eclipse_entry';
    } else if (selectedHotspot === 'battery' && currentPt.batteryTemp < -10) {
      matchedEvidenceId = 'ev_cryo_freeze';
    } else if ((selectedHotspot === 'battery' || selectedHotspot === 'computer') && currentPt.busVoltage <= 21.0) {
      matchedEvidenceId = 'ev_uvlo_cutoff';
    } else if (selectedHotspot === 'payload' && currentPt.powerConsumption > currentPt.solarOutput && currentPt.timeMinutes >= 150) {
      matchedEvidenceId = 'ev_power_deficit';
    }

    if (matchedEvidenceId) {
      const ev = activeCase.keyEvidencePool.find((e) => e.id === matchedEvidenceId);
      if (ev) {
        pinEvidence(ev);
        sounds.playEvidenceFound();
        setPinNotice(language === 'en' ? 'Evidence pinned to investigation pool!' : 'Bukti anomali berhasil disematkan!');
        setTimeout(() => setPinNotice(null), 3000);
        return;
      }
    }

    sounds.playAlarm();
    setPinNotice(language === 'en' ? 'No actionable anomaly on this subsystem at this minute.' : 'Belum ada anomali terverifikasi pada subsistem ini di menit ini.');
    setTimeout(() => setPinNotice(null), 3000);
  };

  const isEvidenceAlreadyPinned = (id: HotspotId) => {
    if (id === 'solar') return pinnedEvidences.some((e) => e.id === 'ev_eclipse_entry');
    if (id === 'battery') return pinnedEvidences.some((e) => e.id === 'ev_cryo_freeze' || e.id === 'ev_uvlo_cutoff');
    if (id === 'payload') return pinnedEvidences.some((e) => e.id === 'ev_power_deficit');
    return false;
  };

  return (
    <div className="bg-[#141619] border border-black p-4 rounded-xl shadow-xl space-y-4 font-mono select-none text-white">
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            {language === 'en' ? 'SPACECRAFT SCHEMATIC BLUEPRINT (CROSS-SECTION)' : 'CETAK BIRU PENAMPANG TEKNIS WAHANA ASTER-9'}
          </span>
        </div>
        <div className="text-[11px] text-gray-400 flex items-center gap-2">
          <span>{language === 'en' ? 'TIMELINE STEP:' : 'WAKTU SIMULASI:'}</span>
          <span className="font-bold text-amber-400 bg-black px-2 py-0.5 rounded border border-gray-800">
            {currentPt.timeStr} ({currentPt.timeMinutes} mnt)
          </span>
        </div>
      </div>

      {/* SVG Blueprint & Detail Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Blueprint Canvas (2 Cols) */}
        <div className="lg:col-span-2 bg-black/80 border border-gray-800 rounded-xl p-3 flex items-center justify-center relative overflow-hidden">
          {/* Blueprint grid texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee08_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee08_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          <svg
            viewBox="0 0 600 280"
            className="w-full h-auto max-h-[300px] select-none"
          >
            {/* Spacecraft Chassis Vector Lines */}
            <g stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.4">
              {/* Main Bus Cubesat Body */}
              <polygon points="180,70 380,70 420,140 380,210 180,210 140,140" fill="#0f172a" fillOpacity="0.8" />
              {/* Internal module separation */}
              <line x1="240" y1="70" x2="240" y2="210" />
              <line x1="320" y1="70" x2="320" y2="210" />
              <line x1="140" y1="140" x2="420" y2="140" strokeDasharray="4 4" />

              {/* Solar Array Left Wing */}
              <polygon points="30,110 140,120 140,160 30,170" fill="#0c4a6e" fillOpacity="0.5" stroke="#38bdf8" />
              <line x1="60" y1="113" x2="60" y2="167" />
              <line x1="90" y1="116" x2="90" y2="164" />
              <line x1="120" y1="118" x2="120" y2="162" />

              {/* High Gain Dish on Top Right */}
              <path d="M 420 120 Q 520 80 500 40" stroke="#94a3b8" strokeWidth="2" />
              <ellipse cx="500" cy="50" rx="25" ry="12" fill="#1e293b" stroke="#cbd5e1" />
              <line x1="420" y1="120" x2="500" y2="50" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />

              {/* Science Payload Sensor Aperture */}
              <rect x="420" y="160" width="30" height="35" fill="#1e1b4b" stroke="#818cf8" />
              <circle cx="435" cy="177" r="8" fill="#4338ca" />
            </g>

            {/* 7 Interactive Hotspots */}
            {HOTSPOTS.map((h) => {
              const status = getHotspotStatus(h.id);
              const conf = getStatusColor(status);
              const isSelected = selectedHotspot === h.id;

              return (
                <g
                  key={h.id}
                  onClick={() => {
                    sounds.playClick(650);
                    setSelectedHotspot(h.id);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Outer pulsating beacon */}
                  {status === 'critical' && (
                    <circle
                      cx={h.x}
                      cy={h.y}
                      r="16"
                      fill="none"
                      stroke={conf.fill}
                      strokeWidth="1.5"
                      className="animate-ping opacity-75 origin-center"
                    />
                  )}

                  {/* Ring selection */}
                  {isSelected && (
                    <circle
                      cx={h.x}
                      cy={h.y}
                      r="14"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      className="animate-spin origin-center"
                    />
                  )}

                  {/* Core hotspot node */}
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r="8"
                    fill={conf.fill}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-transform group-hover:scale-125 origin-center"
                  />

                  {/* Label tooltip */}
                  <text
                    x={h.x}
                    y={h.y - 12}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none drop-shadow-md"
                  >
                    {language === 'en' ? h.labelEn.split(' ')[0] : h.label.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hotspot Inspector Side Panel (1 Col) */}
        <div className="bg-black/60 border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div>
                <span className="text-[10px] text-gray-500 uppercase">{selectedMeta.subsystem}</span>
                <h4 className="font-bold text-sm text-white">{language === 'en' ? selectedMeta.labelEn : selectedMeta.label}</h4>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                  getStatusColor(selectedStatus).text
                } bg-black border border-gray-800`}
              >
                {getStatusColor(selectedStatus).label}
              </span>
            </div>

            {/* Subsystem specific sensor telemetry readings */}
            <div className="space-y-2 text-xs">
              {selectedHotspot === 'solar' && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>KELUARAN SURYA:</span>
                    <span className="font-bold text-amber-400">{currentPt.solarOutput} W</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>STATUS PENYINARAN:</span>
                    <span className={currentPt.isEclipse ? 'text-purple-400 font-bold' : 'text-green-400'}>
                      {currentPt.isEclipse ? 'BAYANGAN GERHANA' : 'TERANG SINAR'}
                    </span>
                  </div>
                </>
              )}

              {selectedHotspot === 'battery' && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>TEGANGAN BUS UTAMA:</span>
                    <span className={`font-bold ${currentPt.busVoltage < 22.5 ? 'text-red-400' : 'text-amber-400'}`}>
                      {currentPt.busVoltage.toFixed(2)} V
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>STATUS CADANGAN (SOC):</span>
                    <span className="font-bold text-green-400">{currentPt.batterySOC.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>SUHU INTI SEL:</span>
                    <span className={`font-bold ${currentPt.batteryTemp < -10 ? 'text-red-400' : 'text-cyan-400'}`}>
                      {currentPt.batteryTemp.toFixed(1)}°C
                    </span>
                  </div>
                </>
              )}

              {selectedHotspot === 'thermal' && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>SUHU RADIATOR:</span>
                    <span className="font-bold text-cyan-400">{currentPt.batteryTemp.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>AMBANG BEKU KRITIS:</span>
                    <span className="text-red-400 font-bold">-10.0°C</span>
                  </div>
                </>
              )}

              {selectedHotspot === 'payload' && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>KONSUMSI BEBAN PAYLOAD:</span>
                    <span className="font-bold text-yellow-400">{currentPt.powerConsumption} W</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>INSTRUMEN AKTIF:</span>
                    <span className="text-gray-300">
                      {currentPt.timeMinutes >= 150 ? 'LIDAR + Spektrometer' : 'Standby / Mati'}
                    </span>
                  </div>
                </>
              )}

              {(selectedHotspot === 'comms' || selectedHotspot === 'computer' || selectedHotspot === 'adcs') && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>MARGIN SINYAL (SNR):</span>
                    <span className="font-bold text-emerald-400">{currentPt.signalSNR.toFixed(1)} dB</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>DOWNLINK LINK RATE:</span>
                    <span className="font-bold text-slate-300">{currentPt.downlinkRate} kbps</span>
                  </div>
                </>
              )}
            </div>

            {/* Educational observation note without spoiling root cause */}
            <div className="p-2.5 bg-black/80 border border-gray-800 rounded-lg text-[11px] text-gray-400 leading-relaxed font-sans">
              <span className="text-amber-400 font-bold font-mono block mb-0.5">CATATAN FISIK:</span>
              {selectedHotspot === 'battery' && 'Penurunan suhu di bawah -10°C secara kimiawi meningkatkan resistansi elektrolit sel.'}
              {selectedHotspot === 'solar' && 'Orientasi panel surya tidak menghasilkan arus foton saat wahana berada dalam umbra asteroid.'}
              {selectedHotspot === 'payload' && 'Beban operasi instrumen sains secara kontinu menguras pasokan daya saat generasi surya nol.'}
              {selectedHotspot === 'thermal' && 'Ketiadaan pemanas radioisotop RHU mempercepat pelepasan panas ke ruang hampa antariksa.'}
              {(selectedHotspot === 'comms' || selectedHotspot === 'computer' || selectedHotspot === 'adcs') && 'Avionik dan transponder telemetri bergantung pada kestabilan bus daya di atas ambang 22V.'}
            </div>
          </div>

          {/* Pin Evidence Button */}
          <div className="pt-2 border-t border-gray-800">
            {pinNotice && (
              <div className="mb-2 text-[10px] text-amber-300 font-bold animate-pulse">
                {pinNotice}
              </div>
            )}

            <button
              type="button"
              onClick={handlePinFromHotspot}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              {isEvidenceAlreadyPinned(selectedHotspot) ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>BUKTI SUDAH TERSEMAT</span>
                </>
              ) : (
                <>
                  <Pin className="w-3.5 h-3.5" />
                  <span>SEMATKAN SEBAGAI BUKTI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
