/* antislop: Durable local score & challenge ranking store; zero backend overhead for offline resilience */
import { create } from 'zustand';
import { weeklySeed } from '../engine/crisis/rng';

export interface ScoreRecord {
  id: string;
  mode: 'story' | 'coop';
  name: string;
  score: number;
  survivedMin?: number;
  episode?: string;
  date: string;
  weekKey: number;
  seed: number;
  isFriend?: boolean;
}

interface ScoreStore {
  scores: ScoreRecord[];
  addScore: (record: Omit<ScoreRecord, 'id' | 'date' | 'weekKey'>) => void;
  getTopScores: (tab: 'all' | 'weekly' | 'friends') => ScoreRecord[];
}

const STORAGE_KEY = 'orbita:scores';

function loadInitialScores(): ScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default seeded hall-of-fame records for realistic NASA competition feel
  return [
    {
      id: 'hof-1',
      mode: 'story',
      name: 'CDR. HAYES',
      score: 980,
      episode: 'ep01',
      date: '2026-10-04',
      weekKey: weeklySeed(),
      seed: 42,
    },
    {
      id: 'hof-2',
      mode: 'coop',
      name: 'VOLT_TEAM',
      score: 875,
      survivedMin: 180,
      date: '2026-10-05',
      weekKey: weeklySeed(),
      seed: 104,
    },
    {
      id: 'hof-3',
      mode: 'story',
      name: 'SARAH_L',
      score: 790,
      episode: 'ep01',
      date: '2026-10-06',
      weekKey: weeklySeed(),
      seed: 88,
    },
  ];
}

export const useScoreStore = create<ScoreStore>((set, get) => ({
  scores: loadInitialScores(),

  addScore: (rec) => {
    const current = get().scores;
    const newRecord: ScoreRecord = {
      ...rec,
      id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString().slice(0, 10),
      weekKey: weeklySeed(),
    };

    const next = [...current, newRecord];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    set({ scores: next });
  },

  getTopScores: (tab) => {
    const all = get().scores;
    const currentWeek = weeklySeed();

    let filtered = all;
    if (tab === 'weekly') {
      filtered = all.filter((s) => s.weekKey === currentWeek);
    } else if (tab === 'friends') {
      filtered = all.filter((s) => s.isFriend);
    }

    return filtered
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  },
}));
