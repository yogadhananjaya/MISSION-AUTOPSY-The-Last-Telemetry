export type CrewRole = 
  | 'telemetry_analyst'
  | 'systems_engineer'
  | 'electrical_specialist'
  | 'medical_officer'
  | 'flight_director'
  | 'sensor_specialist'
  | 'dsn_cryptographer'
  | 'cryo_propulsion'
  | 'asteroid_physicist'
  | 'laser_comms';

export interface CrewMember {
  id: string;
  name: string;
  callsign: string;
  role: CrewRole;
  roleTitle: string;
  department: string;
  divisionCode: string;
  level: number;
  rarity: 'SSR' | 'SR' | 'R';
  stars: number;
  quote: string;
  bio: string;
  image: string;
  avatar: string;
  accentColor: string;
  badgeBgColor: string;
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
    divisionCode: 'TELEMETRI',
    level: 79,
    rarity: 'SSR',
    stars: 5,
    quote: 'Setiap kegagalan meninggalkan jejak pada kurva telemetri. Kita harus mendengarkannya dengan cermat.',
    bio: 'Penyelidik AI siber untuk eksplorasi antariksa dalam. Spesialis dekode transmisi bising kotak hitam dan deteksi fluktuasi voltase.',
    image: '/assets/nova/nova_happy.png',
    avatar: '/assets/nova/nova_idle.png',
    accentColor: '#38bdf8', // Cyan
    badgeBgColor: '#0284c7',
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
    divisionCode: 'REKAYASA',
    level: 72,
    rarity: 'SSR',
    stars: 5,
    quote: 'Satelit yang tidak tahan dingin hanyalah sampah antariksa.',
    bio: 'Arsitek sistem veteran dengan catatan 14 misi orbit. Pengendali batas massa dan selimut termal pelindung bayangan antariksa.',
    image: '/assets/nova/nova_determined.png',
    avatar: '/assets/nova/nova_determined.png',
    accentColor: '#f59e0b', // Amber/Gold
    badgeBgColor: '#d97706',
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
    divisionCode: 'DAYA EPS',
    level: 68,
    rarity: 'SR',
    stars: 4,
    quote: 'Data voltase tidak pernah bohong. Jika voltase turun di bawah 24V, segera ambil tindakan.',
    bio: 'Ahli manajemen energi misi antariksa jauh. Menguasai sel baterai kimia, panel surya efisiensi tinggi, dan generator radioisotop.',
    image: '/assets/nova/nova_idle.png',
    avatar: '/assets/nova/nova_idle.png',
    accentColor: '#10b981', // Emerald
    badgeBgColor: '#059669',
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
    divisionCode: 'MEDIS',
    level: 65,
    rarity: 'SR',
    stars: 4,
    quote: 'Menjaga mesin tetap bekerja hanya separuh tugas; menjaga awak tetap fokus adalah sisanya.',
    bio: 'Dokter utama dan peneliti sistem biologis. Ahli pelindung radiasi kosmik dan stabilitas awak misi antariksa berdurasi panjang.',
    image: '/assets/nova/nova_confused.png',
    avatar: '/assets/nova/nova_confused.png',
    accentColor: '#ec4899', // Pink
    badgeBgColor: '#db2777',
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
    divisionCode: 'KOMANDO',
    level: 80,
    rarity: 'SSR',
    stars: 5,
    quote: 'Kita tidak menyerah dalam kegelapan. Kita analisis, kita rancang ulang, dan kita terbang kembali.',
    bio: 'Pimpinan dewan investigasi kegagalan wahana. Memegang wewenang alokasi anggaran darurat dan izin terbang peluncuran ulang.',
    image: '/assets/nova/nova_happy.png',
    avatar: '/assets/nova/nova_happy.png',
    accentColor: '#a855f7', // Purple
    badgeBgColor: '#7c3aed',
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
  {
    id: 'kaito',
    name: 'Kaito Tanaka',
    callsign: 'SHADOW-X',
    role: 'sensor_specialist',
    roleTitle: 'Spesialis Spektra Sensor',
    department: 'Divisi Optik Spektroskopi',
    divisionCode: 'SPEKTRA',
    level: 75,
    rarity: 'SSR',
    stars: 5,
    quote: 'Cahaya inframerah mengungkap struktur mineral yang tersembunyi di balik bayangan asteroid.',
    bio: 'Operator sensor optik multispektral jarak jauh. Mampu memisahkan spektrum reflektansi mineral di tengah derau tinggi.',
    image: '/assets/nova/nova_determined.png',
    avatar: '/assets/nova/nova_determined.png',
    accentColor: '#ef4444', // Red
    badgeBgColor: '#dc2626',
    badgeIcon: '⚛️',
    stats: {
      analysis: 95,
      engineering: 70,
      powerSystems: 84,
      resilience: 86,
    },
    skills: [
      { name: 'Pemisahan Spektrum Halus', description: 'Identifikasi tanda mineral es dan silikat pada resolusi tinggi.', level: 3 },
      { name: 'Kalibrasi Sudut Datang', description: 'Stabilkan akurasi optik saat orientasi satelit bergoyang cepat.', level: 2 },
      { name: 'Penetrasi Bayangan Inframerah', description: 'Deteksi emisi termal residu saat melewati fase gerhana gelap.', level: 3 },
    ],
  },
  {
    id: 'chloe',
    name: 'Chloe Mercier',
    callsign: 'CYBER-9',
    role: 'dsn_cryptographer',
    roleTitle: 'Ahli Kriptografi DSN',
    department: 'Jaringan Antariksa Dalam DSN',
    divisionCode: 'DSN NET',
    level: 70,
    rarity: 'SR',
    stars: 4,
    quote: 'Paket data yang rusak selalu menyimpan fragmen kebenaran terakhir sebelum hilang kontak.',
    bio: 'Pakar protokol komunikasi telekomunikasi antariksa Goldstone dan Canberra. Ahli rekonstruksi transmisi biner lemah.',
    image: '/assets/nova/nova_confused.png',
    avatar: '/assets/nova/nova_confused.png',
    accentColor: '#6366f1', // Indigo
    badgeBgColor: '#4f46e5',
    badgeIcon: '🌐',
    stats: {
      analysis: 93,
      engineering: 76,
      powerSystems: 72,
      resilience: 80,
    },
    skills: [
      { name: 'Rekonstruksi Paket Hilang', description: 'Pulihkan hingga 40% data telemetri yang terpotong saat blackout.', level: 3 },
      { name: 'Penguat Sinyal Bawaan', description: 'Tingkatkan margin SNR tautan komunikasi sebesar 3 dB pada kondisi kritis.', level: 2 },
      { name: 'Enkripsi Perintah Darurat', description: 'Pastikan sinyal reboot wahana menembus badai interferensi kosmik.', level: 2 },
    ],
  },
  {
    id: 'viktor',
    name: 'Viktor Cross',
    callsign: 'TITAN',
    role: 'cryo_propulsion',
    roleTitle: 'Insinyur Propulsi Kriogenik',
    department: 'Divisi Pendorong Sub-Zero',
    divisionCode: 'KRIOGENIK',
    level: 67,
    rarity: 'SR',
    stars: 4,
    quote: 'Di ruang dingin hampa, bahan bakar beku adalah musuh terbesar pendorong reaksi.',
    bio: 'Spesialis sistem propulsi pendorong gas dingin dan nosel tahan beku. Berpengalaman dalam manuver orbit ekuatorial asteroid.',
    image: '/assets/nova/nova_idle.png',
    avatar: '/assets/nova/nova_idle.png',
    accentColor: '#f97316', // Orange
    badgeBgColor: '#ea580c',
    badgeIcon: '❄️',
    stats: {
      analysis: 72,
      engineering: 94,
      powerSystems: 86,
      resilience: 84,
    },
    skills: [
      { name: 'Katup Anti Beku', description: 'Cegah penyumbatan jalur propulsi saat suhu wahana anjlok di bawah -30°C.', level: 3 },
      { name: 'Efisiensi Impuls Spesifik', description: 'Hemat konsumsi propelan sebesar 15% pada manuver koreksi lintasan.', level: 2 },
      { name: 'Penyembur Gas Cepat', description: 'Stabilkan rotasi wahana tiga sumbu dalam waktu kurang dari 5 detik.', level: 2 },
    ],
  },
  {
    id: 'zara',
    name: 'Dr. Zara Al-Mansoor',
    callsign: 'QUARK',
    role: 'asteroid_physicist',
    roleTitle: 'Fisikawan Asteroid',
    department: 'Divisi Sains Planetologi',
    divisionCode: 'GEOLOGI',
    level: 78,
    rarity: 'SSR',
    stars: 5,
    quote: 'Gravitasi asteroid tidak simetris. Perhitungan orbit ceroboh akan menarik wahana jatuh.',
    bio: 'Peneliti medan gravitasi ganjil dan densitas batuan purba tata surya. Pembuat model matematika lintasan orbit terminator.',
    image: '/assets/nova/nova_determined.png',
    avatar: '/assets/nova/nova_determined.png',
    accentColor: '#14b8a6', // Teal
    badgeBgColor: '#0d9488',
    badgeIcon: '☄️',
    stats: {
      analysis: 97,
      engineering: 72,
      powerSystems: 75,
      resilience: 91,
    },
    skills: [
      { name: 'Model Gravitasi Presisi', description: 'Kurangi konsumsi daya pendorong navigasi orbit sebesar 20%.', level: 3 },
      { name: 'Pemetaan Rongga Bawah Tanah', description: 'Tingkatkan nilai perolehan poin sains radar interior hingga 25%.', level: 3 },
      { name: 'Kalkulasi Batas Bayangan', description: 'Perkirakan durasi masuk dan keluar gerhana dengan akurasi 99%.', level: 3 },
    ],
  },
  {
    id: 'ayane',
    name: 'Ayane Shirogane',
    callsign: 'MIRAGE',
    role: 'laser_comms',
    roleTitle: 'Spesialis Laser Optik DSOC',
    department: 'Divisi Tautan Fotonik',
    divisionCode: 'LASER DSOC',
    level: 76,
    rarity: 'SSR',
    stars: 5,
    quote: 'Satu denyut laser inframerah membawa seluruh isi laboratorium sains ke stasiun bumi.',
    bio: 'Pionir transceiver optik antariksa berkecepatan multi-megabit. Pengendali cermin pelacak mikro-radian untuk komunikasi antariksa.',
    image: '/assets/nova/nova_happy.png',
    avatar: '/assets/nova/nova_happy.png',
    accentColor: '#2563eb', // Royal Blue
    badgeBgColor: '#1d4ed8',
    badgeIcon: '🔦',
    stats: {
      analysis: 94,
      engineering: 88,
      powerSystems: 80,
      resilience: 87,
    },
    skills: [
      { name: 'Tautan Bandwidth Raksasa', description: 'Transmisikan seluruh gambar resolusi tinggi tanpa penundaan antrean memori.', level: 3 },
      { name: 'Pelacak Fotonik Cepat', description: 'Kunci posisi penerima stasiun bumi dalam hitungan milidetik.', level: 3 },
      { name: 'Optimasi Efisiensi Emisi', description: 'Kurangi penarikan daya listrik pemancar optik sebesar 18 watt.', level: 2 },
    ],
  },
];
