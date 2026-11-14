export type CrewRole = 
  | 'telemetry_analyst'
  | 'systems_engineer'
  | 'electrical_specialist'
  | 'medical_officer'
  | 'flight_director';

export interface CrewMember {
  id: string;
  name: string;
  callsign: string;
  role: CrewRole;
  roleTitle: string;
  department: string;
  level: number;
  rarity: 'SSR' | 'SR' | 'R';
  quote: string;
  bio: string;
  image: string;
  avatar: string;
  accentColor: string;
  badgeIcon: string;
  stats: {
    analysis: number;
    engineering: number;
    powerSystems: number;
    resilience: number;
  };
  skills: {
    name: string;
    description: string;
    level: number;
  }[];
}

export const CREW_MEMBERS: CrewMember[] = [
  {
    id: 'nova',
    name: 'NOVA',
    callsign: 'PULSE-01',
    role: 'telemetry_analyst',
    roleTitle: 'Analis Telemetri Utama',
    department: 'Divisi Forensik Antariksa',
    level: 79,
    rarity: 'SSR',
    quote: 'Setiap kegagalan meninggalkan jejak pada kurva telemetri. Kita harus mendengarkannya dengan cermat.',
    bio: 'Penyelidik AI siber untuk eksplorasi antariksa dalam. Spesialis dekode transmisi bising kotak hitam dan deteksi fluktuasi voltase.',
    image: '/assets/nova/nova_happy.png',
    avatar: '/assets/nova/nova_idle.png',
    accentColor: '#38bdf8', // Cyan
    badgeIcon: '📡',
    stats: {
      analysis: 96,
      engineering: 74,
      powerSystems: 82,
      resilience: 90,
    },
    skills: [
      { name: 'Dekompresi Kotak Hitam', description: 'Tingkatkan resolusi pembacaan telemetri dan deteksi anomali hingga 35%.', level: 3 },
      { name: 'Penyaring Derau Sinyal', description: 'Identifikasi sinyal palsu dan data pengalih secara otomatis.', level: 2 },
      { name: 'Forensik Darurat UVLO', description: 'Rekonstruksi kurva baterai sebelum satelit padam total.', level: 3 },
    ],
  },
  {
    id: 'elena',
    name: 'Dr. Elena Vance',
    callsign: 'AEGIS',
    role: 'systems_engineer',
    roleTitle: 'Arsitek Utama Wahana',
    department: 'Teknik Termal dan Struktur',
    level: 72,
    rarity: 'SSR',
    quote: 'Satelit yang tidak tahan dingin hanyalah sampah antariksa.',
    bio: 'Arsitek sistem veteran dengan catatan 14 misi orbit. Pengendali batas massa dan selimut termal pelindung bayangan antariksa.',
    image: '/assets/nova/nova_determined.png',
    avatar: '/assets/nova/nova_determined.png',
    accentColor: '#f59e0b', // Amber/Gold
    badgeIcon: '🔧',
    stats: {
      analysis: 78,
      engineering: 98,
      powerSystems: 85,
      resilience: 88,
    },
    skills: [
      { name: 'Optimasi Bus Ringan', description: 'Kurangi beban massa rangka sebesar 12% tanpa mengurangi kekuatan struktur.', level: 3 },
      { name: 'Pemanas Termal RHU', description: 'Tingkatkan ketahanan sistem terhadap suhu beku saat gerhana antariksa.', level: 2 },
      { name: 'Dudukan Instrumen Modular', description: 'Pasang instrumen ganda dengan getaran resonansi minimal.', level: 1 },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Thorne',
    callsign: 'VOLT',
    role: 'electrical_specialist',
    roleTitle: 'Spesialis Daya dan Propulsi',
    department: 'Sistem Daya Elektrik EPS',
    level: 68,
    rarity: 'SR',
    quote: 'Data voltase tidak pernah bohong. Jika voltase turun di bawah 24V, segera ambil tindakan.',
    bio: 'Ahli manajemen energi misi antariksa jauh. Menguasai sel baterai kimia, panel surya efisiensi tinggi, dan generator radioisotop.',
    image: '/assets/nova/nova_idle.png',
    avatar: '/assets/nova/nova_idle.png',
    accentColor: '#10b981', // Emerald
    badgeIcon: '⚡',
    stats: {
      analysis: 82,
      engineering: 90,
      powerSystems: 97,
      resilience: 76,
    },
    skills: [
      { name: 'Panel Surya Efisiensi Tinggi', description: 'Tingkatkan penyerapan energi surya pada sudut datang miring.', level: 2 },
      { name: 'Kondisi Baterai Beku', description: 'Cegah kerusakan anoda baterai pada pergantian suhu ekstrem.', level: 3 },
      { name: 'Pengalihan Beban Otomatis', description: 'Prioritaskan daya sistem vital selama fase gerhana gelap.', level: 2 },
    ],
  },
  {
    id: 'sarah',
    name: 'Dr. Sarah Lin',
    callsign: 'BIOME',
    role: 'medical_officer',
    roleTitle: 'Spesialis Medis dan Radiasi',
    department: 'Kesehatan Awak Antariksa',
    level: 65,
    rarity: 'SR',
    quote: 'Menjaga mesin tetap bekerja hanya separuh tugas; menjaga awak tetap fokus adalah sisanya.',
    bio: 'Dokter utama dan peneliti sistem biologis. Ahli pelindung radiasi kosmik dan stabilitas awak misi antariksa berdurasi panjang.',
    image: '/assets/nova/nova_confused.png',
    avatar: '/assets/nova/nova_confused.png',
    accentColor: '#ec4899', // Pink
    badgeIcon: '🩺',
    stats: {
      analysis: 89,
      engineering: 65,
      powerSystems: 70,
      resilience: 95,
    },
    skills: [
      { name: 'Perisai Badai Radiasi', description: 'Kurangi dampak radiasi kosmik sebesar 25% saat badai proton surya.', level: 2 },
      { name: 'Filter Udara Tertutup', description: 'Tingkatkan pemulihan oksigen murni di modul kabin tertutup.', level: 1 },
      { name: 'Stabilisator Keputusan', description: 'Tingkatkan kecepatan koordinasi tim saat status siaga merah.', level: 3 },
    ],
  },
  {
    id: 'ryan',
    name: 'Komandan Ryan Hayes',
    callsign: 'VALKYRIE-LEAD',
    role: 'flight_director',
    roleTitle: 'Direktur Operasi Penerbangan',
    department: 'Komando Misi dan Strategi',
    level: 80,
    rarity: 'SSR',
    quote: 'Kita tidak menyerah dalam kegelapan. Kita analisis, kita rancang ulang, dan kita terbang kembali.',
    bio: 'Pimpinan dewan investigasi kegagalan wahana. Memegang wewenang alokasi anggaran darurat dan izin terbang peluncuran ulang.',
    image: '/assets/nova/nova_happy.png',
    avatar: '/assets/nova/nova_happy.png',
    accentColor: '#a855f7', // Purple
    badgeIcon: '🚀',
    stats: {
      analysis: 92,
      engineering: 91,
      powerSystems: 88,
      resilience: 98,
    },
    skills: [
      { name: 'Otorisasi Dewan Investigasi', description: 'Buka dana darurat setelah membuktikan akar masalah kegagalan misi.', level: 3 },
      { name: 'Sinergi Tiga Teknisi', description: 'Berikan bonus efisiensi 10% jika seluruh peran terisi pada mode bersama.', level: 3 },
      { name: 'Jendela Terbang Cepat', description: 'Kurangi jeda kalibrasi sebelum uji coba peluncuran kedua.', level: 2 },
    ],
  },
];
