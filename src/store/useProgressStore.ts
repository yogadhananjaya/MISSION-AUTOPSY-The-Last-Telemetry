/* antislop: Local persistent progression store; clean and durable without artificial bloat */
import { create } from 'zustand';

export interface ProgressData {
  completed: string[];
  stars: Record<string, number>; // epId -> 1..3 stars
  credits: number;
  knowledgePoints: number;
  unlockedComponents: string[];
  crewExp: Record<string, number>;
}

export interface RankInfo {
  title: string;
  titleEn: string;
  level: number;
  minPoints: number;
  nextThreshold: number;
}

export const RANKS: RankInfo[] = [
  { title: 'Kadet Antariksa', titleEn: 'Space Cadet', level: 1, minPoints: 0, nextThreshold: 100 },
  { title: 'Insinyur Sistem', titleEn: 'Systems Engineer', level: 2, minPoints: 100, nextThreshold: 300 },
  { title: 'Analis Senior', titleEn: 'Senior Analyst', level: 3, minPoints: 300, nextThreshold: 600 },
  { title: 'Direktur Misi', titleEn: 'Flight Director', level: 4, minPoints: 600, nextThreshold: 1000 },
];

export function calculateRank(knowledgePoints: number): RankInfo {
  if (knowledgePoints >= 600) return RANKS[3];
  if (knowledgePoints >= 300) return RANKS[2];
  if (knowledgePoints >= 100) return RANKS[1];
  return RANKS[0];
}

interface ProgressStore extends ProgressData {
  completeEpisode: (epId: string, starsEarned: number, rewardCredits: number, rewardKp?: number) => void;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  addKnowledgePoints: (pts: number) => void;
  unlockComponent: (compId: string) => void;
  addCrewExp: (crewId: string, amount: number) => void;
  getRank: () => RankInfo;
}

const STORAGE_KEY = 'orbita:progress';

function loadInitial(): ProgressData {
  const fallback: ProgressData = {
    completed: ['ep01'],
    stars: {},
    credits: 100,
    knowledgePoints: 50,
    unlockedComponents: ['sa_standard', 'bat_standard', 'therm_passive', 'ant_standard'],
    crewExp: {},
  };
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.completed.includes('ep01')) parsed.completed.push('ep01');
      if (typeof parsed.knowledgePoints !== 'number') parsed.knowledgePoints = 50;
      if (!Array.isArray(parsed.unlockedComponents)) parsed.unlockedComponents = fallback.unlockedComponents;
      if (!parsed.crewExp) parsed.crewExp = {};
      return { ...fallback, ...parsed };
    }
  } catch {}
  return fallback;
}

function persist(data: ProgressData) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  ...loadInitial(),

  completeEpisode: (epId, starsEarned, rewardCredits, rewardKp = 50) => {
    const { completed, stars, credits, knowledgePoints, unlockedComponents, crewExp } = get();
    const nextCompleted = completed.includes(epId) ? completed : [...completed, epId];
    const currentBestStars = stars[epId] || 0;
    const nextStars = {
      ...stars,
      [epId]: Math.max(currentBestStars, starsEarned),
    };
    const nextCredits = credits + rewardCredits;
    const nextKp = knowledgePoints + rewardKp;

    const data: ProgressData = {
      completed: nextCompleted,
      stars: nextStars,
      credits: nextCredits,
      knowledgePoints: nextKp,
      unlockedComponents,
      crewExp,
    };
    persist(data);
    set(data);
  },

  addCredits: (amount) => {
    const state = get();
    const next = state.credits + amount;
    const updated = { ...state, credits: next };
    persist(updated);
    set({ credits: next });
  },

  spendCredits: (amount) => {
    const state = get();
    if (state.credits < amount) return false;
    const next = state.credits - amount;
    const updated = { ...state, credits: next };
    persist(updated);
    set({ credits: next });
    return true;
  },

  addKnowledgePoints: (pts) => {
    const state = get();
    const next = state.knowledgePoints + pts;
    const updated = { ...state, knowledgePoints: next };
    persist(updated);
    set({ knowledgePoints: next });
  },

  unlockComponent: (compId) => {
    const state = get();
    if (state.unlockedComponents.includes(compId)) return;
    const next = [...state.unlockedComponents, compId];
    const updated = { ...state, unlockedComponents: next };
    persist(updated);
    set({ unlockedComponents: next });
  },

  addCrewExp: (crewId, amount) => {
    const state = get();
    const current = state.crewExp[crewId] || 0;
    const nextExp = { ...state.crewExp, [crewId]: current + amount };
    const updated = { ...state, crewExp: nextExp };
    persist(updated);
    set({ crewExp: nextExp });
  },

  getRank: () => {
    return calculateRank(get().knowledgePoints);
  },
}));
