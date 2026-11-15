export interface MissionDossier {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  subtitleEn?: string;
  targetObject: string;
  targetObjectEn?: string;
  category: string;
  categoryEn?: string;
  status: 'active' | 'locked' | 'completed';
  progressPercentage: number;
  anomalySummary: string;
  anomalySummaryEn?: string;
  objective: string;
  objectiveEn?: string;
  budgetLimit: string;
  difficulty: 'STANDARD' | 'HARD' | 'CRITICAL';
  factionEmblem: string;
  accentColor: string;
  backgroundTheme: string;
}

export const MISSIONS_LIST: MissionDossier[] = [
  {
    id: 'aster-9',
    code: 'CASE-01',
    title: 'ASTER-9',
    subtitle: 'Kehilangan Sinyal di Bayangan Asteroid',
    subtitleEn: 'Loss of Signal in Asteroid Shadow',
    targetObject: 'Asteroid Bennu Dekat Bumi',
    targetObjectEn: 'Near-Earth Asteroid Bennu',
    category: 'FORENSIK ANTARIKSA DALAM',
    categoryEn: 'DEEP SPACE FORENSICS',
    status: 'active',
    progressPercentage: 62,
    anomalySummary: 'Sinyal telemetri hilang pada T+04:20 setelah wahana masuk bayangan asteroid.',
    anomalySummaryEn: 'Telemetry signal dropped at T+04:20 shortly after spacecraft entered asteroid shadow.',
    objective: 'Periksa telemetri, tentukan akar masalah, dan bangun kembali arsitektur wahana antariksa.',
    objectiveEn: 'Analyze black box telemetry, prove the failure root cause, and rebuild spacecraft architecture.',
    budgetLimit: '$65,000,000',
    difficulty: 'STANDARD',
    factionEmblem: 'SUN_ORBIT',
    accentColor: '#38bdf8',
    backgroundTheme: 'from-blue-950 via-slate-950 to-cyan-950',
  },
  {
    id: 'phobos-x',
    code: 'CASE-02',
    title: 'PHOBOS-X',
    subtitle: 'Wahana Pendarat Hilang Kontak',
    subtitleEn: 'Lander Loss of Contact',
    targetObject: 'Orbit Phobos Mars',
    targetObjectEn: 'Mars Phobos Orbit',
    category: 'REKAYASA PENDARAT PLANET',
    categoryEn: 'PLANETARY LANDER SYSTEMS',
    status: 'locked',
    progressPercentage: 0,
    anomalySummary: 'Pendorong kendali orientasi gagal stabil saat manuver gravitasi lintas bulan Mars.',
    anomalySummaryEn: 'Attitude thrusters failed during dynamic Martian moon gravity assist trajectory.',
    objective: 'Dekode telemetri Doppler dan kalibrasi ulang sistem pendorong hibrida wahana.',
    objectiveEn: 'Decode Doppler telemetry and re-tune hybrid reaction control propulsion.',
    budgetLimit: '$95,000,000',
    difficulty: 'HARD',
    factionEmblem: 'MARTIAN_SHIELD',
    accentColor: '#f97316',
    backgroundTheme: 'from-orange-950 via-slate-950 to-red-950',
  },
  {
    id: 'europa-deep',
    code: 'CASE-03',
    title: 'EUROPA-DEEP',
    subtitle: 'Transponder Bawah Es Terputus',
    subtitleEn: 'Sub-Ice Transponder Blackout',
    targetObject: 'Lautan Dalam Satelit Europa',
    targetObjectEn: 'Europa Deep Ocean Subsurface',
    category: 'ARSITEKTUR SELAM KRIOGENIK',
    categoryEn: 'CRYOGENIC SUBMERSIBLE ARCHITECTURE',
    status: 'locked',
    progressPercentage: 0,
    anomalySummary: 'Fluks radiasi tinggi merusak antena pemancar utama di sabuk radiasi Jupiter.',
    anomalySummaryEn: 'High radiation flux destroyed primary antenna inside Jovian radiation belts.',
    objective: 'Rancang pelindung berilium, daya generator radioisotop, dan tautan laser optik.',
    objectiveEn: 'Engineer beryllium shielding, radioisotope power, and optical laser comms link.',
    budgetLimit: '$140,000,000',
    difficulty: 'CRITICAL',
    factionEmblem: 'JOVIAN_CROWN',
    accentColor: '#a855f7',
    backgroundTheme: 'from-purple-950 via-slate-950 to-blue-950',
  },
  {
    id: 'voyager-core',
    code: 'CASE-04',
    title: 'VOYAGER-CORE',
    subtitle: 'Sinyal Menipis di Batas Antarbintang',
    subtitleEn: 'Fading Carrier at Interstellar Boundary',
    targetObject: 'Batas Luar Tata Surya',
    targetObjectEn: 'Outer Solar System Boundary',
    category: 'RESTORASI WAHANA INTERSTELLAR',
    categoryEn: 'INTERSTELLAR PROBE RESTORATION',
    status: 'locked',
    progressPercentage: 0,
    anomalySummary: 'Daya generator isotop menipis memicu penguncian sistem mode aman otomatis.',
    anomalySummaryEn: 'Depleted RTG thermal output triggered automatic safe-mode system lockup.',
    objective: 'Kirim instruksi perbaikan biner jarak jauh melintasi ruang antariksa.',
    objectiveEn: 'Transmit long-range binary recovery commands across deep interstellar vacuum.',
    budgetLimit: '$45,000,000',
    difficulty: 'CRITICAL',
    factionEmblem: 'STAR_CROSS',
    accentColor: '#10b981',
    backgroundTheme: 'from-emerald-950 via-slate-950 to-teal-950',
  },
];

export function getLocalizedMission(m: MissionDossier, lang: 'en' | 'id'): MissionDossier {
  if (lang === 'en') {
    return {
      ...m,
      subtitle: m.subtitleEn || m.subtitle,
      targetObject: m.targetObjectEn || m.targetObject,
      category: m.categoryEn || m.category,
      anomalySummary: m.anomalySummaryEn || m.anomalySummary,
      objective: m.objectiveEn || m.objective,
    };
  }
  return m;
}
