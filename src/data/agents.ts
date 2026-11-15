export type RoleGroup = 'telemetry' | 'electrical' | 'mechanical' | 'systems';

export type SkillEffect =
  | 'scan'
  | 'ir_sweep'
  | 'decrypt'
  | 'load_balance'
  | 'solar_boost'
  | 'cryo_flush'
  | 'emergency_o2'
  | 'reboot'
  | 'authorize'
  | 'laser_lock';

export interface AgentDef {
  id: string;
  name: string;
  roleGroup: RoleGroup;
  roleTitle: string;
  roleTitleEn: string;
  portrait: string;
  passive: {
    name: string;
    description: string;
  };
  active: {
    name: string;
    description: string;
    cooldownSec: number;
    effect: SkillEffect;
  };
}

export const AGENTS: AgentDef[] = [
  {
    id: 'nova',
    name: 'NOVA Tactical AI',
    roleGroup: 'telemetry',
    roleTitle: 'Kecerdasan Taktis Telemetri',
    roleTitleEn: 'Tactical Telemetry AI',
    portrait: '/assets/crew/nova.png',
    passive: {
      name: 'Neural Watch',
      description: 'Mendeteksi anomali telemetri 2 detik lebih cepat dari sensor standar.',
    },
    active: {
      name: 'Full Fleet Scan',
      description: 'Mendiagnosis otomatis semua kerusakan yang sedang aktif seketika.',
      cooldownSec: 30,
      effect: 'scan',
    },
  },
  {
    id: 'kaito',
    name: 'Kaito Tanaka',
    roleGroup: 'telemetry',
    roleTitle: 'Spesialis Sensor & Spektrometri',
    roleTitleEn: 'Sensor & Spectrometry Specialist',
    portrait: '/assets/crew/kaito_tanaka.png',
    passive: {
      name: 'Spectrum Analyzer',
      description: 'Mengurangi probabilitas alarm palsu (sensor noise) sebesar 30%.',
    },
    active: {
      name: 'IR Deep Sweep',
      description: 'Memprediksi subsistem berikutnya yang rentan mengalami kerusakan.',
      cooldownSec: 25,
      effect: 'ir_sweep',
    },
  },
  {
    id: 'chloe',
    name: 'Chloe Mercier',
    roleGroup: 'telemetry',
    roleTitle: 'Kriptografer Deep Space Network',
    roleTitleEn: 'Deep Space Network Cryptographer',
    portrait: '/assets/crew/chloe_mercier.jpg',
    passive: {
      name: 'Packet Filter',
      description: 'Mempercepat transmisi paket data telemetri kritis.',
    },
    active: {
      name: 'Signal Decrypt',
      description: 'Menghapus satu gangguan derau sensor (decoy noise) aktif.',
      cooldownSec: 20,
      effect: 'decrypt',
    },
  },
  {
    id: 'marcus',
    name: 'Marcus Throne',
    roleGroup: 'electrical',
    roleTitle: 'Spesialis Daya & EPS',
    roleTitleEn: 'Electrical Power Specialist',
    portrait: '/assets/crew/marcus_throne.png',
    passive: {
      name: 'Circuit Shunt',
      description: 'Mengurangi drop voltase bus saat terjadi lonjakan beban transien.',
    },
    active: {
      name: 'Load Balance Override',
      description: 'Memangkas total konsumsi beban listrik sebesar 20% selama 15 detik.',
      cooldownSec: 30,
      effect: 'load_balance',
    },
  },
  {
    id: 'zara',
    name: 'Zara',
    roleGroup: 'electrical',
    roleTitle: 'Insinyur Sel Surya & Array',
    roleTitleEn: 'Solar Array Engineer',
    portrait: '/assets/crew/zara_khalid.png',
    passive: {
      name: 'Photovoltaic Tuning',
      description: 'Meningkatkan efisiensi pembangkit panel surya sebesar 10% di luar bayangan.',
    },
    active: {
      name: 'Solar Overcharge',
      description: 'Meningkatkan keluaran surya sebesar 25% selama 20 detik.',
      cooldownSec: 35,
      effect: 'solar_boost',
    },
  },
  {
    id: 'viktor',
    name: 'Viktor Cross',
    roleGroup: 'mechanical',
    roleTitle: 'Teknisi Propulsi Kriogenik',
    roleTitleEn: 'Cryogenic Propulsion Technician',
    portrait: '/assets/crew/viktor_cross.jpg',
    passive: {
      name: 'Thermal Blanket',
      description: 'Memperlambat penurunan suhu sel baterai saat bayangan gerhana sebesar 15%.',
    },
    active: {
      name: 'Cryo Heat Flush',
      description: 'Menyuntikkan pemanasan darurat ke modul sel baterai (+10°C seketika).',
      cooldownSec: 30,
      effect: 'cryo_flush',
    },
  },
  {
    id: 'sarah',
    name: 'Dr. Sarah Lin',
    roleGroup: 'mechanical',
    roleTitle: 'Spesialis Medis & Life Support',
    roleTitleEn: 'Life Support & Medical Specialist',
    portrait: '/assets/crew/sarah_lin.png',
    passive: {
      name: 'Atmospheric Reserve',
      description: 'Mengurangi laju konsumsi cadangan oksigen dan penyaring CO2.',
    },
    active: {
      name: 'Emergency O2 Purge',
      description: 'Memulihkan integritas sistem Life Support sebesar +20% seketika.',
      cooldownSec: 25,
      effect: 'emergency_o2',
    },
  },
  {
    id: 'elena',
    name: 'Dr. Elena Vance',
    roleGroup: 'systems',
    roleTitle: 'Kepala Rekayasa Sistem & ADCS',
    roleTitleEn: 'Chief Systems & ADCS Engineer',
    portrait: '/assets/crew/elena_vance.png',
    passive: {
      name: 'Redundant Bus',
      description: 'Mencegah kerusakan sekunder (cascade) merembet ke sistem avionik.',
    },
    active: {
      name: 'Avionics Reboot',
      description: 'Melakukan reset cepat komputer navigasi dan memulihkan Nav +30%.',
      cooldownSec: 30,
      effect: 'reboot',
    },
  },
  {
    id: 'ryan',
    name: 'Komandan Ryan Hayes',
    roleGroup: 'systems',
    roleTitle: 'Direktur Penerbangan Misi',
    roleTitleEn: 'Flight Operations Director',
    portrait: '/assets/crew/ryan_hayes.png',
    passive: {
      name: 'Command Protocol',
      description: 'Semua anggota tim mendapatkan bonus +5 skor per perbaikan sukses.',
    },
    active: {
      name: 'Dual Authorization',
      description: 'Mengizinkan 2 pemain mengklaim dan bekerja bersama pada 1 kerusakan selama 20 detik.',
      cooldownSec: 40,
      effect: 'authorize',
    },
  },
  {
    id: 'ayane',
    name: 'Ayane Shirogane',
    roleGroup: 'systems',
    roleTitle: 'Pakar Komunikasi Laser Antariksa',
    roleTitleEn: 'Deep Space Optical Comms Lead',
    portrait: '/assets/crew/ayane_shirogane.png',
    passive: {
      name: 'Beam Collimator',
      description: 'Mempertahankan margin tautan komunikasi 15% lebih lama saat drift antena.',
    },
    active: {
      name: 'Laser Lock Pulse',
      description: 'Mengunci kembali sinyal transmisi laser dan memulihkan Comms +30%.',
      cooldownSec: 25,
      effect: 'laser_lock',
    },
  },
];
