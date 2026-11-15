import { nextRand } from './rng';
import { DAMAGE_DEFS } from './damageGraph';

export type SystemId = 'hull' | 'power' | 'propulsion' | 'life' | 'comms' | 'nav';
export const SYSTEM_IDS: SystemId[] = ['hull', 'power', 'propulsion', 'life', 'comms', 'nav'];

export interface ShipParams {
  solarW: number; capWh: number; minOpC: number;
  idleW: number; specW: number; lidarW: number; heaterW: number;
  coolPerMin: number; coolFloorC: number; sunWarmPerMin: number; sunCapC: number;
  orbitPeriodMin: number; eclipseStartMin: number; eclipseLenMin: number; firstOrbitOnly: boolean;
  strictUvlo: boolean; blackoutGraceTicks: number;
  spawn: boolean; spawnScale: number;
  scripted: { atMin: number; defId: string }[];
  endMin: number | null; // null = tanpa akhir (Last Stand)
}

/** Rewind (Story): replika krisis ASTER-9, mulai T+03:00, menang bila selamat sampai T+05:00. */
export const REWIND_PARAMS: ShipParams = {
  solarW: 160, capWh: 400, minOpC: -10, idleW: 100, specW: 95, lidarW: 65, heaterW: 25,
  coolPerMin: 0.84, coolFloorC: -42, sunWarmPerMin: 0.15, sunCapC: 22,
  orbitPeriodMin: 100000, eclipseStartMin: 195, eclipseLenMin: 75, firstOrbitOnly: true,
  strictUvlo: true, blackoutGraceTicks: 0, spawn: false, spawnScale: 1,
  scripted: [{ atMin: 215, defId: 'cable_brownout' }, { atMin: 235, defId: 'antenna_drift' }],
  endMin: 300,
};
/** Last Stand (Co-op): orbit berulang, kerusakan acak ber-seed. Angka = titik awal, perlu playtest. */
export const LASTSTAND_PARAMS: ShipParams = {
  solarW: 260, capWh: 520, minOpC: -10, idleW: 90, specW: 80, lidarW: 50, heaterW: 25,
  coolPerMin: 0.8, coolFloorC: -42, sunWarmPerMin: 0.2, sunCapC: 22,
  orbitPeriodMin: 150, eclipseStartMin: 90, eclipseLenMin: 45, firstOrbitOnly: false,
  strictUvlo: false, blackoutGraceTicks: 8, spawn: true, spawnScale: 1.3, // Mudah 1.0 · Normal 1.3 · Sulit 1.6
  scripted: [], endMin: null,
};

export interface ActiveDamage {
  uid: number; defId: string; startedAt: number; ticksActive: number; diagnosed: boolean;
}
export interface ShipState {
  t: number;                                   // menit-sim; 1 tik = 1 menit-sim
  tickCount: number;
  rng: number;
  systems: Record<SystemId, number>;           // 0..100
  battery: { energyWh: number; socPct: number; tempC: number; busV: number };
  heaterOn: boolean;
  shedLevel: 0 | 1 | 2;                        // 0 semua nyala, 1 lidar off, 2 lidar+spektrometer off
  damages: ActiveDamage[];
  nextUid: number;
  blackoutTicks: number;
  phase: 1 | 2 | 3 | 4 | 5;
  stats: { repaired: number; diagnosed: number; wrongRepairs: number; science: number };
  over: boolean;
  outcome: 'running' | 'success' | 'failure';
  reason?: string;
  events: string[];                            // log tik terakhir (untuk UI/NOVA)
}

export type Action =
  | { type: 'heater'; on: boolean }
  | { type: 'shed'; level: 0 | 1 | 2 }
  | { type: 'diagnose'; uid: number }
  | { type: 'repair'; uid: number }
  | { type: 'boost'; kind: 'solar' | 'load' }; // skill aktif sederhana (durasi ditangani UI/host)

export function fmtT(m: number) {
  return `T+${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m) % 60).padStart(2, '0')}`;
}
const clamp = (x: number, a = 0, b = 100) => Math.min(b, Math.max(a, x));

export function initShip(p: ShipParams, seed: number, startMin = 0): ShipState {
  const energy = p === REWIND_PARAMS ? p.capWh * 0.83 : p.capWh;
  return {
    t: startMin, tickCount: 0, rng: seed >>> 0,
    systems: { hull: 100, power: 100, propulsion: 100, life: 100, comms: 100, nav: 100 },
    battery: { energyWh: energy, socPct: (energy / p.capWh) * 100, tempC: 22, busV: 28.3 },
    heaterOn: false, shedLevel: 0, damages: [], nextUid: 1, blackoutTicks: 0, phase: 1,
    stats: { repaired: 0, diagnosed: 0, wrongRepairs: 0, science: 0 },
    over: false, outcome: 'running', events: [],
  };
}

export function inEclipse(p: ShipParams, t: number) {
  if (p.firstOrbitOnly) return t >= p.eclipseStartMin && t < p.eclipseStartMin + p.eclipseLenMin;
  const m = t % p.orbitPeriodMin;
  return m >= p.eclipseStartMin && m < p.eclipseStartMin + p.eclipseLenMin;
}
/** Menit sampai gerhana berikutnya (untuk "Jam Gerhana"); 0 jika sedang gerhana. */
export function minutesToEclipse(p: ShipParams, t: number) {
  if (inEclipse(p, t)) return 0;
  if (p.firstOrbitOnly) return Math.max(0, p.eclipseStartMin - t);
  const m = t % p.orbitPeriodMin;
  return m < p.eclipseStartMin ? p.eclipseStartMin - m : p.orbitPeriodMin - m + p.eclipseStartMin;
}
export function addDamage(s: ShipState, defId: string) {
  if (s.damages.some((d) => d.defId === defId)) return;
  s.damages.push({ uid: s.nextUid++, defId, startedAt: s.t, ticksActive: 0, diagnosed: false });
  s.events.push(`DAMAGE:${defId}`);
}

/** Satu tik = 1 menit-sim. FUNGSI MURNI: mengembalikan state baru, tidak memutasi input. */
export function stepShip(prev: ShipState, p: ShipParams, actions: Action[] = []): ShipState {
  if (prev.over) return prev;
  const s: ShipState = structuredClone(prev);
  s.events = [];

  // 1. Aksi pemain
  for (const a of actions) {
    if (a.type === 'heater') s.heaterOn = a.on;
    else if (a.type === 'shed') s.shedLevel = a.level;
    else if (a.type === 'diagnose') {
      const d = s.damages.find((x) => x.uid === a.uid);
      if (d && !d.diagnosed) { d.diagnosed = true; s.stats.diagnosed++; s.events.push(`DIAG:${d.defId}`); }
    } else if (a.type === 'repair') {
      const d = s.damages.find((x) => x.uid === a.uid);
      if (!d) continue;
      const def = DAMAGE_DEFS[d.defId];
      if (!d.diagnosed || (def.requiresPower && s.systems.power < def.requiresPower)) {
        s.stats.wrongRepairs++; s.systems.hull = clamp(s.systems.hull - 3);
        s.events.push(`WRONG_REPAIR:${d.defId}`);
      } else {
        s.damages = s.damages.filter((x) => x.uid !== d.uid);
        s.systems[def.system] = clamp(s.systems[def.system] + 20);
        s.stats.repaired++; s.events.push(`REPAIRED:${d.defId}`);
      }
    }
  }

  // 2. Kerusakan terjadwal & acak
  for (const sc of p.scripted) if (sc.atMin === s.t) addDamage(s, sc.defId);
  if (p.spawn) {
    const activeNonDecoy = s.damages.filter((d) => DAMAGE_DEFS[d.defId].severity !== 'minor').length;
    s.phase = Math.min(5, Math.floor(s.t / 90) + 1 + (activeNonDecoy >= 4 ? 1 : 0)) as ShipState['phase'];
    const chance = [0, 0.02, 0.035, 0.05, 0.07, 0.09][s.phase] * p.spawnScale;
    let r: number; [r, s.rng] = nextRand(s.rng);
    if (r < chance) {
      const pool = Object.values(DAMAGE_DEFS).filter((d) => d.spawnable && !s.damages.some((x) => x.defId === d.id));
      const total = pool.reduce((a, d) => a + d.weight, 0);
      if (total > 0) {
        [r, s.rng] = nextRand(s.rng);
        let x = r * total;
        for (const d of pool) { x -= d.weight; if (x <= 0) { addDamage(s, d.id); break; } }
      }
    }
  }

  // 3. Efek kerusakan aktif
  let solarMult = 1, coolMult = 1, busVDelta = 0, heaterBroken = false;
  const drains: Partial<Record<SystemId, number>> = {};
  for (const d of s.damages) {
    const def = DAMAGE_DEFS[d.defId];
    solarMult *= def.solarMult ?? 1; coolMult *= def.coolMult ?? 1;
    busVDelta += def.busVDelta ?? 0; heaterBroken ||= !!def.heaterBroken;
    for (const k of Object.keys(def.drain) as SystemId[]) drains[k] = (drains[k] ?? 0) + (def.drain[k] ?? 0);
    d.ticksActive++;
  }
  // anak kerusakan & umpan kedaluwarsa
  for (const d of [...s.damages]) {
    const def = DAMAGE_DEFS[d.defId];
    for (const c of def.children) if (d.ticksActive === c.afterTicks) addDamage(s, c.id);
    if (def.expireTicks && d.ticksActive >= def.expireTicks) s.damages = s.damages.filter((x) => x.uid !== d.uid);
  }

  // 4. Daya & termal (rumus sama dengan simulationEngine.ts)
  const eclipse = inEclipse(p, s.t);
  const heaterEff = s.heaterOn && !heaterBroken;
  const loadW = p.idleW + (s.heaterOn ? p.heaterW : 0)
    + (s.shedLevel === 0 ? p.specW + p.lidarW : s.shedLevel === 1 ? p.specW : 0);
  const genW = eclipse ? 0 : p.solarW * solarMult;
  if (eclipse) s.battery.tempC = Math.max(p.coolFloorC, s.battery.tempC - p.coolPerMin * coolMult * (heaterEff ? 0.35 : 1));
  else s.battery.tempC = Math.min(p.sunCapC, s.battery.tempC + p.sunWarmPerMin);
  const below = Math.max(0, p.minOpC - s.battery.tempC);
  const effCap = p.capWh * Math.max(0.2, 1 - below * 0.04);
  s.battery.energyWh = Math.min(effCap, s.battery.energyWh + (genW - loadW) / 60);
  s.battery.socPct = Math.max(0, (s.battery.energyWh / p.capWh) * 100);
  let v = 23.5 + 4.8 * Math.min(1, s.battery.socPct / 100);
  if (s.battery.tempC < p.minOpC) v -= Math.min(3, 0.1 * (p.minOpC - s.battery.tempC));
  v += busVDelta;
  s.battery.busV = Number(v.toFixed(2));
  if (s.shedLevel < 2) s.stats.science += s.shedLevel === 0 ? 2 : 1;

  // 5. Sistem
  s.systems.power = clamp(((s.battery.busV - 21) / 7.3) * 100);
  const pw = s.systems.power;
  for (const id of ['hull', 'propulsion', 'life', 'comms', 'nav'] as SystemId[]) {
    let drain = drains[id] ?? 0;
    if (pw < 40 && id === 'comms') drain += 1.2;
    if (pw < 40 && id === 'nav') drain += 0.6;
    if (pw < 30 && id === 'life') drain += 0.5;
    if (drain > 0) s.systems[id] = clamp(s.systems[id] - drain);
    else if (id !== 'hull' && s.systems[id] < 100) s.systems[id] = clamp(s.systems[id] + 0.3);
  }

  // 6. Akhir permainan
  if (s.battery.busV < 22) s.blackoutTicks++; else s.blackoutTicks = 0;
  if (p.strictUvlo && s.battery.busV < 22) { s.over = true; s.outcome = 'failure'; s.reason = `UVLO_TRIP: bus ${s.battery.busV} V < 22 V pada ${fmtT(s.t)}`; }
  else if (s.blackoutTicks > p.blackoutGraceTicks && !p.strictUvlo) { s.over = true; s.outcome = 'failure'; s.reason = `BLACKOUT: bus < 22 V selama ${s.blackoutTicks} menit`; }
  else if (s.battery.energyWh <= 0) { s.over = true; s.outcome = 'failure'; s.reason = `ENERGY_DEPLETED pada ${fmtT(s.t)}`; }
  else if (s.systems.hull <= 0) { s.over = true; s.outcome = 'failure'; s.reason = 'HULL_BREACH: integritas lambung 0'; }
  else if (s.systems.life <= 0) { s.over = true; s.outcome = 'failure'; s.reason = 'LIFE_SUPPORT_FAILURE'; }
  else if (p.endMin !== null && s.t >= p.endMin) { s.over = true; s.outcome = s.battery.socPct >= 10 ? 'success' : 'failure'; s.reason = s.outcome === 'success' ? undefined : `POWER_DEFICIT: SOC akhir ${Math.round(s.battery.socPct)}%`; }

  s.t += 1; s.tickCount += 1;
  return s;
}
