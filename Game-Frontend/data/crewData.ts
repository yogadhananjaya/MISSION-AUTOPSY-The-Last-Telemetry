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
  roleTitleEn?: string;
  department: string;
  departmentEn?: string;
  divisionCode: string;
  level: number;
  rarity: 'SSR' | 'SR' | 'R';
  stars: number;
  quote: string;
  quoteEn?: string;
  bio: string;
  bioEn?: string;
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
  skillsEn?: {
    name: string;
    description: string;
    level: number;
  }[];
}

export const CREW_MEMBERS: CrewMember[] = [
  {
    id: 'sarah',
    name: 'Dr. Sarah Lin',
    callsign: 'BIOME',
    role: 'medical_officer',
    roleTitle: 'Spesialis Medis dan Radiasi',
    roleTitleEn: 'Medical & Radiation Specialist',
    department: 'Kesehatan Awak Antariksa',
    departmentEn: 'Astro-Health & Life Support',
    divisionCode: 'KOMANDO',
    level: 78,
    rarity: 'SSR',
    stars: 5,
    quote: 'Menjaga mesin tetap bekerja hanya separuh tugas; menjaga awak tetap fokus adalah sisanya.',
    quoteEn: 'Keeping machines running is only half the mission; keeping the crew alive is the rest.',
    bio: 'Dokter utama dan peneliti sistem biologis. Ahli pelindung radiasi kosmik dan stabilitas awak misi antariksa berdurasi panjang.',
    bioEn: 'Chief flight surgeon and biological systems researcher. Specialist in cosmic radiation shielding and deep-space crew endurance.',
    image: '/assets/crew/sarah_lin.png',
    avatar: '/assets/crew/sarah_lin.png',
    accentColor: '#10b981',
    badgeBgColor: '#059669',
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
    skillsEn: [
      { name: 'Radiation Storm Shield', description: 'Mitigate cosmic ray damage by 25% during solar proton events.', level: 2 },
      { name: 'Closed-Loop Air Scrubber', description: 'Boost pure oxygen recovery in closed environmental modules.', level: 1 },
      { name: 'Crisis Decision Anchor', description: 'Accelerate squad decision speed during red-alert contingencies.', level: 3 },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Throne',
    callsign: 'VOLT',
    role: 'electrical_specialist',
    roleTitle: 'Spesialis Daya dan Propulsi',
    roleTitleEn: 'Power & Propulsion Specialist',
    department: 'Sistem Daya Elektrik EPS',
    departmentEn: 'Electrical Power Systems (EPS)',
    divisionCode: 'DAYA EPS',
    level: 76,
    rarity: 'SSR',
    stars: 5,
    quote: 'Data voltase tidak pernah bohong. Jika voltase turun di bawah 24V, segera ambil tindakan.',
    quoteEn: 'Telemetry data never lies. If bus voltage drops below 24V, act immediately.',
    bio: 'Ahli manajemen energi misi antariksa jauh. Menguasai sel baterai kimia, panel surya efisiensi tinggi, dan generator radioisotop.',
    bioEn: 'Deep-space power management authority. Master of battery chemistry, high-efficiency photovoltaics, and radioisotope generators.',
    image: '/assets/crew/marcus_thorne.png',
    avatar: '/assets/crew/marcus_thorne.png',
    accentColor: '#f59e0b',
    badgeBgColor: '#d97706',
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
    skillsEn: [
      { name: 'High-Efficiency Solar Array', description: 'Maximize photovoltaic absorption at acute sun angles.', level: 2 },
      { name: 'Cryogenic Cell Conditioning', description: 'Prevent battery anode degradation under severe thermal swings.', level: 3 },
      { name: 'Autonomous Load Shedding', description: 'Prioritize mission-critical subsystems during shadow transits.', level: 2 },
    ],
  },
  {
    id: 'ryan',
    name: 'Komandan Ryan Hayes',
    callsign: 'VALKYRIE-LEAD',
    role: 'flight_director',
    roleTitle: 'Direktur Operasi Penerbangan',
    roleTitleEn: 'Flight Operations Director',
    department: 'Komando Misi dan Strategi',
    departmentEn: 'Mission Command & Strategy',
    divisionCode: 'KOMANDO',
    level: 85,
    rarity: 'SSR',
    stars: 5,
    quote: 'Kita tidak menyerah dalam kegelapan. Kita analisis, kita rancang ulang, dan kita terbang kembali.',
    quoteEn: 'We do not surrender to the dark. We analyze, we redesign, and we fly again.',
    bio: 'Pimpinan dewan investigasi kegagalan wahana. Memegang wewenang alokasi anggaran darurat dan izin terbang peluncuran ulang.',
    bioEn: 'Spacecraft anomaly board director. Holds mission budget authority and flight readiness clearance.',
    image: '/assets/crew/ryan_hayes.png',
    avatar: '/assets/crew/ryan_hayes.png',
    accentColor: '#3b82f6',
    badgeBgColor: '#2563eb',
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
    skillsEn: [
      { name: 'Board Authorization', description: 'Unlock emergency reserve funding upon proving the root cause.', level: 3 },
      { name: 'Tri-Discipline Synergy', description: 'Grant +10% subsystem efficiency when all roles are filled.', level: 3 },
      { name: 'Rapid Flight Window', description: 'Compress pre-flight calibration intervals before launch.', level: 2 },
    ],
  },
  {
    id: 'kaito',
    name: 'Kaito Tanaka',
    callsign: 'SHADOW-X',
    role: 'sensor_specialist',
    roleTitle: 'Spesialis Spektra Sensor',
    roleTitleEn: 'Spectral Sensor Specialist',
    department: 'Divisi Optik Spektroskopi',
    departmentEn: 'Optical Spectroscopy Division',
    divisionCode: 'TELEMETRI',
    level: 75,
    rarity: 'SSR',
    stars: 5,
    quote: 'Cahaya inframerah mengungkap struktur mineral yang tersembunyi di balik bayangan asteroid.',
    quoteEn: 'Infrared light unveils minerals concealed in deep asteroid shadows.',
    bio: 'Operator sensor optik multispektral jarak jauh. Mampu memisahkan spektrum reflektansi mineral di tengah derau tinggi.',
    bioEn: 'Long-range multispectral optical sensor operator. Decouples mineral reflectance spectra amidst high thermal noise.',
    image: '/assets/crew/kaito_tanaka.png',
    avatar: '/assets/crew/kaito_tanaka.png',
    accentColor: '#06b6d4',
    badgeBgColor: '#0891b2',
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
    skillsEn: [
      { name: 'Fine Spectrum Resolution', description: 'Distinguish ice and silicate signatures at sub-meter fidelity.', level: 3 },
      { name: 'Attitude Jitter Compensation', description: 'Stabilize optical bore sight during high slew-rate maneuvers.', level: 2 },
      { name: 'Thermal Shadow Penetration', description: 'Track residual thermal radiation through total solar occultation.', level: 3 },
    ],
  },
  {
    id: 'ayane',
    name: 'Ayane Shirogane',
    callsign: 'MIRAGE',
    role: 'laser_comms',
    roleTitle: 'Spesialis Laser Optik DSOC',
    roleTitleEn: 'Deep Space Optical Comms Lead',
    department: 'Divisi Tautan Fotonik',
    departmentEn: 'Photonic Telecommunications',
    divisionCode: 'TELEMETRI',
    level: 76,
    rarity: 'SSR',
    stars: 5,
    quote: 'Satu denyut laser inframerah membawa seluruh isi laboratorium sains ke stasiun bumi.',
    quoteEn: 'A single pulse of infrared laser carries an entire science lab back to Earth.',
    bio: 'Pionir transceiver optik antariksa berkecepatan multi-megabit. Pengendali cermin pelacak mikro-radian untuk komunikasi antariksa.',
    bioEn: 'Pioneer of gigabit optical deep-space transceivers. Precision micro-radian fine pointing controller.',
    image: '/assets/crew/ayane_shirogane.png',
    avatar: '/assets/crew/ayane_shirogane.png',
    accentColor: '#ef4444',
    badgeBgColor: '#b91c1c',
    badgeIcon: '🎯',
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
    skillsEn: [
      { name: 'Gigabit Downlink Burst', description: 'Downlink full raw survey data sets with zero memory backlog.', level: 3 },
      { name: 'Photonic Acquisition Beacon', description: 'Lock ground station optical receivers in sub-second time.', level: 3 },
      { name: 'Emission Efficiency Tuner', description: 'Shave 18W off transmitter bus load without dropping link SNR.', level: 2 },
    ],
  },
  {
    id: 'viktor',
    name: 'Viktor Cross',
    callsign: 'TITAN',
    role: 'cryo_propulsion',
    roleTitle: 'Insinyur Propulsi Kriogenik',
    roleTitleEn: 'Cryogenic Propulsion Engineer',
    department: 'Divisi Pendorong Sub-Zero',
    departmentEn: 'Sub-Zero Thruster Division',
    divisionCode: 'REKAYASA',
    level: 67,
    rarity: 'SR',
    stars: 4,
    quote: 'Di ruang dingin hampa, bahan bakar beku adalah musuh terbesar pendorong reaksi.',
    quoteEn: 'In deep vacuum cold, frozen propellant is the greatest enemy of reaction control.',
    bio: 'Spesialis sistem propulsi pendorong gas dingin dan nosel tahan beku. Berpengalaman dalam manuver orbit ekuatorial asteroid.',
    bioEn: 'Cold-gas reaction control system and freeze-resistant nozzle veteran. Expert in close equatorial asteroid orbits.',
    image: '/assets/crew/viktor_cross.png',
    avatar: '/assets/crew/viktor_cross.png',
    accentColor: '#3b82f6',
    badgeBgColor: '#1d4ed8',
    badgeIcon: '🔧',
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
    skillsEn: [
      { name: 'Anti-Freeze Valve Line', description: 'Prevent propellant manifold freeze-up down to -30°C.', level: 3 },
      { name: 'Specific Impulse Optimizer', description: 'Conserve 15% delta-v on orbital trimming burns.', level: 2 },
      { name: 'Rapid Reaction Pulse', description: 'Damp 3-axis spacecraft spin within 5 seconds.', level: 2 },
    ],
  },
  {
    id: 'zara',
    name: 'Zara',
    callsign: 'QUARK',
    role: 'asteroid_physicist',
    roleTitle: 'Fisikawan Asteroid',
    roleTitleEn: 'Asteroid Planetary Physicist',
    department: 'Divisi Sains Planetologi',
    departmentEn: 'Planetary Science Division',
    divisionCode: 'KOMANDO',
    level: 78,
    rarity: 'SSR',
    stars: 5,
    quote: 'Batuan purba ini menyimpan jejak geologi pembentukan asteroid tata surya.',
    quoteEn: 'Ancient meteorites preserve the foundational geology of our solar system.',
    bio: 'Peneliti medan gravitasi ganjil dan densitas batuan purba tata surya. Pembuat model matematika lintasan orbit terminator.',
    bioEn: 'Investigator of anomalous gravity fields and primordial asteroidal density. Architect of terminator orbit models.',
    image: '/assets/crew/zara.png',
    avatar: '/assets/crew/zara.png',
    accentColor: '#10b981',
    badgeBgColor: '#047857',
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
    skillsEn: [
      { name: 'High-Fidelity Gravity Model', description: 'Cut navigation delta-v expenditure by 20% near irregular bodies.', level: 3 },
      { name: 'Subsurface Radar Sounding', description: 'Increase interior science yield by up to 25%.', level: 3 },
      { name: 'Umbra Boundary Mapping', description: 'Predict eclipse ingress and egress timing with 99% precision.', level: 3 },
    ],
  },
  {
    id: 'chloe',
    name: 'Chloe Mercier',
    callsign: 'CYBER-9',
    role: 'dsn_cryptographer',
    roleTitle: 'Ahli Kriptografi DSN',
    roleTitleEn: 'DSN Deep Space Cryptographer',
    department: 'Jaringan Antariksa Dalam DSN',
    departmentEn: 'Deep Space Network (DSN)',
    divisionCode: 'TELEMETRI',
    level: 70,
    rarity: 'SR',
    stars: 4,
    quote: 'Paket data yang rusak selalu menyimpan fragmen kebenaran terakhir sebelum hilang kontak.',
    quoteEn: 'Corrupted packets always retain the final truth before telemetry cutoff.',
    bio: 'Pakar protokol komunikasi telekomunikasi antariksa Goldstone dan Canberra. Ahli rekonstruksi transmisi biner lemah.',
    bioEn: 'Deep Space Network telecommunications protocol specialist for Goldstone and Canberra. Master of weak signal reconstruction.',
    image: '/assets/crew/chloe_mercier.png',
    avatar: '/assets/crew/chloe_mercier.png',
    accentColor: '#f97316',
    badgeBgColor: '#ea580c',
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
    skillsEn: [
      { name: 'Corrupt Packet Reconstruction', description: 'Recover up to 40% of telemetry dropped during signal blackout.', level: 3 },
      { name: 'Link Margin Booster', description: 'Increase comms link SNR margin by 3 dB in marginal geometry.', level: 2 },
      { name: 'Contingency Safe-Reboot', description: 'Ensure emergency commands penetrate severe cosmic interference.', level: 2 },
    ],
  },
  {
    id: 'elena',
    name: 'Dr. Elena Vance',
    callsign: 'AEGIS',
    role: 'systems_engineer',
    roleTitle: 'Arsitek Utama Wahana',
    roleTitleEn: 'Lead Spacecraft Architect',
    department: 'Teknik Termal dan Struktur',
    departmentEn: 'Thermal & Structural Engineering',
    divisionCode: 'REKAYASA',
    level: 77,
    rarity: 'SSR',
    stars: 5,
    quote: 'Satelit yang tidak tahan dingin hanyalah sampah antariksa.',
    quoteEn: 'A satellite that cannot survive the cold is merely expensive space junk.',
    bio: 'Arsitek sistem veteran dengan catatan 14 misi orbit. Pengendali batas massa dan selimut termal pelindung bayangan antariksa.',
    bioEn: 'Veteran systems architect with 14 orbital flight clearances. Guardian of mass budgets and cryogenic multi-layer insulation blankets.',
    image: '/assets/crew/elena_vance.png',
    avatar: '/assets/crew/elena_vance.png',
    accentColor: '#f97316',
    badgeBgColor: '#ea580c',
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
    skillsEn: [
      { name: 'Lightweight Bus Optimization', description: 'Shave 12% dry mass from structural bus without compromising rigidity.', level: 3 },
      { name: 'Radioisotope Heater Units (RHU)', description: 'Sustain battery and avionics temperatures during deep eclipse.', level: 2 },
      { name: 'Modular Payload Bay', description: 'Mount dual scientific instruments with minimal structural vibration.', level: 1 },
    ],
  },
  {
    id: 'nova',
    name: 'NOVA',
    callsign: 'PULSE-01',
    role: 'telemetry_analyst',
    roleTitle: 'Analis Telemetri Utama',
    roleTitleEn: 'Lead AI Telemetry Analyst',
    department: 'Divisi Forensik Antariksa',
    departmentEn: 'Deep Space Forensics Division',
    divisionCode: 'TELEMETRI',
    level: 79,
    rarity: 'SSR',
    stars: 5,
    quote: 'Setiap kegagalan meninggalkan jejak pada kurva telemetri. Kita harus mendengarkannya dengan cermat.',
    quoteEn: 'Every anomaly writes its signature into the telemetry curve. Listen carefully.',
    bio: 'Penyelidik AI siber untuk eksplorasi antariksa dalam. Spesialis dekode transmisi bising kotak hitam dan deteksi fluktuasi voltase.',
    bioEn: 'Autonomous cybernetic investigator for deep space anomalies. Specialist in black box audio decoding and UVLO fault identification.',
    image: '/assets/nova/nova_happy.png',
    avatar: '/assets/nova/nova_idle.png',
    accentColor: '#38bdf8',
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
    skillsEn: [
      { name: 'Black Box Decompression', description: 'Enhance telemetry resolution and anomaly detection by 35%.', level: 3 },
      { name: 'Signal Noise Filter', description: 'Automatically flag red herring signals and telemetry glitches.', level: 2 },
      { name: 'UVLO Forensics Engine', description: 'Reconstruct bus voltage collapse curves right before shutdown.', level: 3 },
    ],
  },
];

export function getLocalizedCrew(crew: CrewMember, lang: 'en' | 'id'): CrewMember {
  if (lang === 'en') {
    return {
      ...crew,
      roleTitle: crew.roleTitleEn || crew.roleTitle,
      department: crew.departmentEn || crew.department,
      quote: crew.quoteEn || crew.quote,
      bio: crew.bioEn || crew.bio,
      skills: crew.skillsEn || crew.skills,
    };
  }
  return crew;
}
