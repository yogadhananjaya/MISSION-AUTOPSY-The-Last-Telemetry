import { REWIND_PARAMS, LASTSTAND_PARAMS, type ShipParams, type ShipState, type SystemId } from './shipState';

export interface EpisodeDef {
  id: string; number: number; name: string; focus: string; briefing: string;
  params: ShipParams; startMin: number; reward: number;
  winMinSystems: Partial<Record<SystemId, number>>; // ambang minimum saat akhir
  minSocPct: number;
}
const base = (o: Partial<ShipParams>): ShipParams => ({ ...REWIND_PARAMS, scripted: [], ...o });

export const EPISODES: EpisodeDef[] = [
  { id: 'ep01', number: 1, name: 'ASTER-9', focus: 'Tutorial investigasi dan perbaikan',
    briefing: 'Wahana kehilangan sinyal di bayangan asteroid. Buktikan penyebabnya lalu selamatkan wahana.',
    params: REWIND_PARAMS, startMin: 180, reward: 100, winMinSystems: {}, minSocPct: 10 },
  { id: 'ep02', number: 2, name: 'Solar Frontier', focus: 'Gangguan sistem energi',
    briefing: 'Panel surya terdegradasi dan pemanas gagal sebelum gerhana panjang. Kelola daya dan termal.',
    params: base({ solarW: 190, capWh: 420, eclipseStartMin: 190, eclipseLenMin: 70, endMin: 300,
      scripted: [{ atMin: 150, defId: 'solar_degraded' }, { atMin: 195, defId: 'heater_fault' }, { atMin: 225, defId: 'cable_brownout' }] }),
    startMin: 140, reward: 150, winMinSystems: { power: 30 }, minSocPct: 8 },
  { id: 'ep03', number: 3, name: 'Silent Orbit', focus: 'Gangguan komunikasi',
    briefing: 'Antena melenceng dan distribusi daya kacau. Jaga link ke Bumi tetap hidup.',
    params: base({ solarW: 200, capWh: 420, eclipseStartMin: 200, eclipseLenMin: 60, endMin: 300,
      scripted: [{ atMin: 150, defId: 'antenna_drift' }, { atMin: 190, defId: 'power_dist_fail' }, { atMin: 240, defId: 'sensor_noise' }] }),
    startMin: 140, reward: 150, winMinSystems: { comms: 50 }, minSocPct: 8 },
  { id: 'ep04', number: 4, name: 'Iron Horizon', focus: 'Kerusakan propulsi',
    briefing: 'Pendorong tersangkut dan pendingin bocor saat manuver koreksi orbit.',
    params: base({ solarW: 200, capWh: 420, eclipseStartMin: 200, eclipseLenMin: 60, endMin: 300,
      scripted: [{ atMin: 150, defId: 'coolant_leak' }, { atMin: 185, defId: 'propulsion_misfire' }, { atMin: 235, defId: 'sensor_noise' }] }),
    startMin: 140, reward: 200, winMinSystems: { propulsion: 50, nav: 50 }, minSocPct: 8 },
  { id: 'ep05', number: 5, name: 'Deep Space', focus: 'Kerusakan beberapa subsistem',
    briefing: 'Jauh dari Bumi: kerusakan acak ber-seed menyerang banyak subsistem sekaligus.',
    params: { ...LASTSTAND_PARAMS, spawnScale: 1.8, endMin: 330, solarW: 240 },
    startMin: 0, reward: 250, winMinSystems: { hull: 40, life: 40, power: 30 }, minSocPct: 8 },
  { id: 'ep06', number: 6, name: 'Final Signal', focus: 'Kerusakan kritis dan kegagalan berantai',
    briefing: 'Satu brownout memicu rantai kegagalan. Putuskan rantai itu sebelum semuanya padam.',
    params: base({ solarW: 220, capWh: 450, eclipseStartMin: 210, eclipseLenMin: 70, endMin: 330,
      scripted: [{ atMin: 150, defId: 'cable_brownout' }, { atMin: 195, defId: 'micrometeoroid' }, { atMin: 225, defId: 'antenna_drift' }, { atMin: 255, defId: 'life_scrubber' }] }),
    startMin: 140, reward: 400, winMinSystems: { hull: 30, life: 30, comms: 30, power: 30 }, minSocPct: 8 },
];

export function episodeWon(ep: EpisodeDef, s: ShipState): boolean {
  if (s.outcome !== 'success' || s.battery.socPct < ep.minSocPct) return false;
  return (Object.keys(ep.winMinSystems) as SystemId[]).every((k) => s.systems[k] >= (ep.winMinSystems[k] ?? 0));
}
