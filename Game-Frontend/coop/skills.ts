import type { ShipState } from '../engine/crisis/shipState';

export interface ActiveBuffs {
  solarBoostTicks: number;     // +25% solar output
  loadReductionTicks: number;  // -20% load reduction
  dualAuthTicks: number;       // allow 2 claims on same damage
}

export function applySkillEffect(
  effect: string,
  state: ShipState,
  buffs: ActiveBuffs
): { state: ShipState; message?: string } {
  const next = structuredClone(state);

  switch (effect) {
    case 'scan': // NOVA
      next.damages.forEach((d) => {
        d.diagnosed = true;
      });
      next.stats.diagnosed += next.damages.length;
      return { state: next, message: 'NOVA: Full Fleet Scan mendiagnosis semua kerusakan aktif!' };

    case 'ir_sweep': // Kaito
      // Peek next vulnerable system based on pool
      return { state: next, message: 'Kaito: IR Deep Sweep mendeteksi instabilitas termal pada subsistem bus daya!' };

    case 'decrypt': // Chloe
      // Remove 1 sensor_noise if active
      const decoyIdx = next.damages.findIndex((d) => d.defId === 'sensor_noise');
      if (decoyIdx >= 0) {
        next.damages.splice(decoyIdx, 1);
        return { state: next, message: 'Chloe: Signal Decrypt berhasil mengeliminasi gangguan derau sensor.' };
      }
      return { state: next, message: 'Chloe: Tidak ada gangguan derau sensor aktif.' };

    case 'load_balance': // Marcus
      buffs.loadReductionTicks = 15;
      return { state: next, message: 'Marcus: Load Balance aktif! Beban listrik dipangkas 20% selama 15 detik.' };

    case 'solar_boost': // Zara
      buffs.solarBoostTicks = 20;
      return { state: next, message: 'Zara: Solar Overcharge aktif! Daya surya meningkat +25% selama 20 detik.' };

    case 'cryo_flush': // Viktor
      next.battery.tempC = Math.min(25, next.battery.tempC + 10);
      return { state: next, message: 'Viktor: Cryo Heat Flush berhasil menaikkan suhu sel baterai +10°C!' };

    case 'emergency_o2': // Sarah
      next.systems.life = Math.min(100, next.systems.life + 20);
      return { state: next, message: 'Sarah: Emergency O2 Purge memulihkan cadangan Life Support +20%!' };

    case 'reboot': // Elena
      next.systems.nav = Math.min(100, next.systems.nav + 30);
      return { state: next, message: 'Elena: Avionics Reboot berhasil memulihkan navigasi +30%!' };

    case 'authorize': // Ryan
      buffs.dualAuthTicks = 20;
      return { state: next, message: 'Ryan: Dual Authorization aktif! 2 personel boleh bekerja bersama selama 20 detik.' };

    case 'laser_lock': // Ayane
      next.systems.comms = Math.min(100, next.systems.comms + 30);
      return { state: next, message: 'Ayane: Laser Lock Pulse mengunci transmisi optik, Comms +30%!' };

    default:
      return { state: next };
  }
}
