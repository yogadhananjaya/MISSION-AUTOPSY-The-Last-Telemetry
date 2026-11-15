/* antislop: Authentic story panel definitions grounded in real mission telemetry metrics */
import { CASE_FILES } from './caseFiles';

export interface ComicPanel {
  id: string;
  bg: 'launch' | 'cruise' | 'eclipse' | 'cold' | 'loss' | 'brief';
  nova: 'idle' | 'sad' | 'confused' | 'determined' | 'happy';
  caption: string;
  captionEn: string;
  speaker?: string;
  line?: string;
  lineEn?: string;
}

export function getComicPanels(playerName: string): ComicPanel[] {
  const c = CASE_FILES[0];
  const logs = c.telemetryLogs;
  const pCru = logs.find((p) => p.timeMinutes === 150) || logs[15];
  const pEcl = logs.find((p) => p.isEclipse) || logs[20];
  const pCold = logs.find((p) => p.batteryTemp < -10) || logs[23];
  const pLoss = logs.find((p) => p.busVoltage <= 21.0) || logs[26];

  const name = playerName.trim() || 'Commander';

  return [
    {
      id: 'panel_1',
      bg: 'launch',
      nova: 'happy',
      caption: 'Wahana luar angkasa ASTER-9 meluncur menuju orbit Asteroid Bennu dalam misi pemetaan mineral beresolusi tinggi.',
      captionEn: 'Spacecraft ASTER-9 launches towards Asteroid Bennu on a high-resolution mineral mapping survey.',
      speaker: 'NOVA TACTICAL AI',
      line: 'Peluncuran sempurna. Seluruh telemetri sistem awal beroperasi nominal!',
      lineEn: 'Nominal liftoff confirmed. All primary telemetry channels are fully operational!',
    },
    {
      id: 'panel_2',
      bg: 'cruise',
      nova: 'idle',
      caption: `${pCru.timeStr} — Instrumen LIDAR & Spektrometer diaktifkan. Konsumsi daya melonjak ke ${pCru.powerConsumption} W sementara panel surya hanya menghasilkan ${pCru.solarOutput} W.`,
      captionEn: `${pCru.timeStr} — Science payloads online. Power draw surges to ${pCru.powerConsumption} W while solar arrays generate only ${pCru.solarOutput} W.`,
      speaker: 'NOVA TACTICAL AI',
      line: 'Beban instrumen sains aktif. Baterai mulai menyuplai defisit daya.',
      lineEn: 'Science instruments active. Battery now compensating for the power deficit.',
    },
    {
      id: 'panel_3',
      bg: 'eclipse',
      nova: 'confused',
      caption: `${pEcl.timeStr} — Wahana memasuki bayangan asteroid. Pembangkit surya padam total menjadi 0 W selama durasi gerhana 75 menit.`,
      captionEn: `${pEcl.timeStr} — Ingress into asteroid eclipse shadow. Solar power collapses to 0 W for the 75-minute duration.`,
      speaker: 'NOVA TACTICAL AI',
      line: 'Pembangkit fotovoltaik nol. Bergantung sepenuhnya pada baterai penyimpan.',
      lineEn: 'Zero photovoltaic generation. Operating entirely on battery reserve.',
    },
    {
      id: 'panel_4',
      bg: 'cold',
      nova: 'sad',
      caption: `${pCold.timeStr} — Tanpa pemanas aktif, suhu sel baterai anjlok ke ${pCold.batteryTemp}°C, menembus batas beku lithium-ion (-10°C).`,
      captionEn: `${pCold.timeStr} — Without active heaters, cell temperature plunges to ${pCold.batteryTemp}°C, breaching the critical -10°C threshold.`,
      speaker: 'NOVA TACTICAL AI',
      line: 'Peringatan termal: Resistansi internal sel melonjak drastis akibat pembekuan.',
      lineEn: 'Thermal alert: Internal resistance spiking due to electrolyte freeze.',
    },
    {
      id: 'panel_5',
      bg: 'loss',
      nova: 'sad',
      caption: `${pLoss.timeStr} — Tegangan bus runtuh ke ${pLoss.busVoltage.toFixed(1)} V, memicu pemutus darurat UVLO (Under-Voltage Lockout). Sinyal transmisi DSN terputus total.`,
      captionEn: `${pLoss.timeStr} — Bus voltage collapses to ${pLoss.busVoltage.toFixed(1)} V, tripping UVLO protection. Carrier signal lost to Earth.`,
      speaker: 'NOVA TACTICAL AI',
      line: 'Kita kehilangan kontak dengan ASTER-9...',
      lineEn: 'We have lost carrier lock with ASTER-9...',
    },
    {
      id: 'panel_6',
      bg: 'brief',
      nova: 'determined',
      caption: 'Direktorat Misi NASA membentuk Satuan Tugas Investigasi Forensik Antariksa. Temukan kausalitas kegagalan dan selamatkan wahana.',
      captionEn: 'NASA Mission Directorate has convened an emergency forensics board. Determine causality and salvage the mission.',
      speaker: 'NOVA TACTICAL AI',
      line: `${name}, mari kita telusuri data kotak hitam telemetri.`,
      lineEn: `${name}, let us analyze the black box telemetry records.`,
    },
  ];
}
