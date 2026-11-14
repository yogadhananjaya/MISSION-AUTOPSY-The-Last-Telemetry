export interface MissionDossier {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  targetObject: string;
  category: string;
  status: 'active' | 'locked' | 'completed';
  progressPercentage: number;
  anomalySummary: string;
  objective: string;
  budgetLimit: string;
  difficulty: 'STANDARD' | 'HARD' | 'CRITICAL';
  factionEmblem: string; // SVG or icon identifier
  accentColor: string;
  backgroundTheme: string;
}

export const MISSIONS_LIST: MissionDossier[] = [
  {
    id: 'aster-9',
    code: 'KASUS-01',
    title: 'ASTER-9',
    subtitle: 'Kehilangan Sinyal di Bayangan Asteroid',
    targetObject: 'Asteroid Bennu Dekat Bumi',
    category: 'FORENSIK ANTARIKSA DALAM',
    status: 'active',
    progressPercentage: 62,
    anomalySummary: 'Sinyal telemetri hilang total pada T+03:15 setelah wahana masuk ke bayangan asteroid.',
    objective: 'Periksa telemetri, tentukan akar masalah, dan bangun kembali arsitektur wahana antariksa.',
    budgetLimit: '$65,000,000',
    difficulty: 'STANDARD',
    factionEmblem: 'SUN_ORBIT',
    accentColor: '#38bdf8',
    backgroundTheme: 'from-blue-950 via-slate-950 to-cyan-950',
  },
  {
    id: 'phobos-x',
    code: 'KASUS-02',
    title: 'PHOBOS-X',
    subtitle: 'Wahana Pendarat Hilang Kontak',
    targetObject: 'Orbit Phobos Mars',
    category: 'REKAYASA PENDARAT PLANET',
    status: 'locked',
    progressPercentage: 0,
    anomalySummary: 'Pendorong kendali orientasi gagal stabil saat manuver gravitasi lintas bulan Mars.',
    objective: 'Dekode telemetri Doppler dan kalibrasi ulang sistem pendorong hibrida wahana.',
    budgetLimit: '$95,000,000',
    difficulty: 'HARD',
    factionEmblem: 'MARTIAN_SHIELD',
    accentColor: '#f97316',
    backgroundTheme: 'from-orange-950 via-slate-950 to-red-950',
  },
  {
    id: 'europa-deep',
    code: 'KASUS-03',
    title: 'EUROPA-DEEP',
    subtitle: 'Transponder Bawah Es Terputus',
    targetObject: 'Lautan Dalam Satelit Europa',
    category: 'ARSITEKTUR SELAM KRIOGENIK',
    status: 'locked',
    progressPercentage: 0,
    anomalySummary: 'Fluks radiasi tinggi merusak antena pemancar utama di sabuk radiasi Jupiter.',
    objective: 'Rancang pelindung berilium, daya generator radioisotop, dan tautan laser optik.',
    budgetLimit: '$140,000,000',
    difficulty: 'CRITICAL',
    factionEmblem: 'JOVIAN_CROWN',
    accentColor: '#a855f7',
    backgroundTheme: 'from-purple-950 via-slate-950 to-blue-950',
  },
  {
    id: 'voyager-core',
    code: 'KASUS-04',
    title: 'VOYAGER-CORE',
    subtitle: 'Sinyal Menipis di Batas Antarbintang',
    targetObject: 'Batas Luar Tata Surya',
    category: 'RESTORASI WAHANA INTERSTELLAR',
    status: 'locked',
    progressPercentage: 0,
    anomalySummary: 'Daya generator isotop menipis memicu penguncian sistem mode aman otomatis.',
    objective: 'Kirim instruksi perbaikan biner jarak jauh melintasi ruang antariksa.',
    budgetLimit: '$45,000,000',
    difficulty: 'CRITICAL',
    factionEmblem: 'STAR_CROSS',
    accentColor: '#10b981',
    backgroundTheme: 'from-emerald-950 via-slate-950 to-teal-950',
  },
];
