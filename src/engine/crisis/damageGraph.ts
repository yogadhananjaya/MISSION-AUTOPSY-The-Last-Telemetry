import type { SystemId } from './shipState';

export type MinigameId = 'cable' | 'routing' | 'antenna' | 'calibrate';
export interface DamageDef {
  id: string;
  system: SystemId;
  label: string;
  severity: 'minor' | 'major' | 'critical';
  symptom: string;            // dilihat SEMUA pemain
  cause: string;              // hanya Analyst / setelah diagnosis
  drain: Partial<Record<SystemId, number>>; // poin per tik
  busVDelta?: number;         // volt, selama aktif
  solarMult?: number;         // pengali output surya selama aktif
  coolMult?: number;          // pengali laju pendinginan baterai selama aktif
  heaterBroken?: boolean;     // heater tidak efektif selama aktif
  minigame: MinigameId;
  baseSec: number;            // durasi mini-game acuan (detik nyata)
  requiresPower?: number;     // power minimum agar repair boleh dimulai
  children: { id: string; afterTicks: number }[];
  expireTicks?: number;       // hilang sendiri (umpan)
  weight: number;             // bobot spawn acak
  spawnable: boolean;
}

export const DAMAGE_DEFS: Record<string, DamageDef> = {
  solar_degraded: { id: 'solar_degraded', system: 'power', label: 'Output surya turun', severity: 'major',
    symptom: 'Pembangkit surya hanya ±60% saat terang', cause: 'Panel surya terdegradasi oleh debu mikrometeor',
    drain: {}, solarMult: 0.6, minigame: 'routing', baseSec: 14, children: [], weight: 3, spawnable: true },
  heater_fault: { id: 'heater_fault', system: 'power', label: 'Pemanas baterai gagal', severity: 'major',
    symptom: 'Suhu sel turun lebih cepat dari biasanya', cause: 'Elemen pemanas baterai terputus; pemanas tidak berfungsi',
    drain: {}, heaterBroken: true, coolMult: 1.4, minigame: 'calibrate', baseSec: 12, children: [], weight: 2, spawnable: true },
  cable_brownout: { id: 'cable_brownout', system: 'power', label: 'Brownout bus utama', severity: 'critical',
    symptom: 'Tegangan bus turun mendadak ±2 V', cause: 'Konektor kabel bus longgar akibat getaran',
    drain: { power: 0.3 }, busVDelta: -2, minigame: 'cable', baseSec: 16,
    children: [{ id: 'power_dist_fail', afterTicks: 25 }], weight: 3, spawnable: true },
  power_dist_fail: { id: 'power_dist_fail', system: 'power', label: 'Distribusi daya kacau', severity: 'critical',
    symptom: 'Beban tidak seimbang, komunikasi ikut turun', cause: 'Pembagi daya tidak dapat merutekan ke bus vital',
    drain: { power: 0.6, comms: 0.5 }, minigame: 'routing', baseSec: 16, children: [], weight: 0, spawnable: false },
  antenna_drift: { id: 'antenna_drift', system: 'comms', label: 'Antena melenceng', severity: 'major',
    symptom: 'Link margin turun, paket hilang', cause: 'Penunjukan antena menyimpang dari Bumi',
    drain: { comms: 1.0 }, minigame: 'antenna', baseSec: 14, requiresPower: 40, children: [], weight: 3, spawnable: true },
  micrometeoroid: { id: 'micrometeoroid', system: 'hull', label: 'Tumbukan mikrometeoroid', severity: 'critical',
    symptom: 'Tekanan lambung turun perlahan', cause: 'Lubang kecil pada lambung akibat tumbukan',
    drain: { hull: 0.6, life: 0.25 }, minigame: 'calibrate', baseSec: 18, children: [], weight: 1, spawnable: true },
  coolant_leak: { id: 'coolant_leak', system: 'propulsion', label: 'Kebocoran pendingin', severity: 'major',
    symptom: 'Tekanan pendingin turun, suhu tidak stabil', cause: 'Sambungan pipa pendingin bocor',
    drain: { propulsion: 0.5 }, coolMult: 1.3, minigame: 'calibrate', baseSec: 14, children: [], weight: 2, spawnable: true },
  propulsion_misfire: { id: 'propulsion_misfire', system: 'propulsion', label: 'Pendorong tidak stabil', severity: 'major',
    symptom: 'Daya dorong berfluktuasi, orientasi bergoyang', cause: 'Katup pendorong tersangkut',
    drain: { propulsion: 0.7, nav: 0.4 }, minigame: 'calibrate', baseSec: 15, requiresPower: 40, children: [], weight: 2, spawnable: true },
  life_scrubber: { id: 'life_scrubber', system: 'life', label: 'Penyaring CO₂ macet', severity: 'critical',
    symptom: 'Kadar CO₂ kabin naik', cause: 'Kipas penyaring CO₂ berhenti',
    drain: { life: 0.6 }, minigame: 'cable', baseSec: 14, requiresPower: 30, children: [], weight: 1, spawnable: true },
  sensor_noise: { id: 'sensor_noise', system: 'nav', label: 'Derau sensor', severity: 'minor',
    symptom: 'Pembacaan sensor navigasi berkedip', cause: 'Derau sesaat tanpa dampak pada sistem (umpan)',
    drain: {}, minigame: 'calibrate', baseSec: 8, expireTicks: 25, children: [], weight: 3, spawnable: true },
};
