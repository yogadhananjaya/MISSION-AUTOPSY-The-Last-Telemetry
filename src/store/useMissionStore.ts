import { create } from 'zustand';
import type { AnomalyEvidence, CaseFile, GamePhase, RedesignConfiguration, SimulationResult, UserRole, RewindResult, DiagnosisGrade } from '../types/mission';
import { CASE_FILES, getLocalizedCaseFile } from '../data/caseFiles';
import { runMissionSimulation } from '../utils/simulationEngine';
import { sounds } from '../utils/soundEngine';
import type { Language } from '../i18n/translations';

interface MissionState {
  // Localization State
  language: Language;
  setLanguage: (lang: Language) => void;

  // Onboarding & Welcoming State
  gameStarted: boolean;
  onboardingStep: 'welcome' | 'enter_name' | 'check_experience' | 'tutorial' | 'ready';
  astronautName: string;
  isFirstTimePlayer: boolean | null;
  tutorialStep: number;
  currentView: 'lobby' | 'mission' | 'coop' | 'map' | 'comic' | 'academy';

  currentPhase: GamePhase;
  activeCase: CaseFile;
  selectedRole: UserRole;
  guidedMode: boolean;
  audioEnabled: boolean;
  
  // Phase 2 & 3 State
  currentTimeMinute: number;
  pinnedEvidences: AnomalyEvidence[];
  selectedHypothesisId: string | null;
  hypothesisSubmitted: boolean;
  isHypothesisCorrect: boolean;
  diagnosisGrade: DiagnosisGrade | null;
  failedSubmitsCount: number;
  lastSubmitMissingCount: number;
  missionStartedAt: number | null;

  // Phase 4 & 5 State
  redesignConfig: RedesignConfiguration;
  simulationResult: SimulationResult | null;
  simulationRunning: boolean;
  simulationProgress: number; // 0 to 100%
  rewindResult: RewindResult | null;

  // Actions
  setRewindResult: (res: RewindResult) => void;
  // Onboarding Actions
  setAstronautName: (name: string) => void;
  setOnboardingStep: (step: 'welcome' | 'enter_name' | 'check_experience' | 'tutorial' | 'ready') => void;
  setIsFirstTimePlayer: (isFirst: boolean) => void;
  setTutorialStep: (step: number) => void;
  startGame: () => void;
  setCurrentView: (view: 'lobby' | 'mission' | 'coop' | 'map' | 'comic' | 'academy') => void;

  setPhase: (phase: GamePhase) => void;
  setRole: (role: UserRole) => void;
  toggleGuidedMode: () => void;
  setGuidedMode: (guided: boolean) => void;
  toggleAudio: () => void;
  setCurrentTimeMinute: (min: number) => void;
  pinEvidence: (evidence: AnomalyEvidence) => void;
  unpinEvidence: (evidenceId: string) => void;
  selectHypothesis: (hypothesisId: string) => void;
  submitHypothesis: () => boolean;
  updateRedesignComponent: (category: keyof RedesignConfiguration, value: string | string[]) => void;
  startSimulation: () => void;
  resetMission: () => void;
}

export const checkPhaseAccess = (
  targetPhase: GamePhase,
  state: {
    pinnedEvidences: AnomalyEvidence[];
    hypothesisSubmitted: boolean;
    simulationResult: SimulationResult | null;
  },
  lang: Language = 'en'
): { allowed: boolean; reason: string } => {
  if (targetPhase === 'briefing' || targetPhase === 'investigation') {
    return { allowed: true, reason: '' };
  }
  if (targetPhase === 'root_cause') {
    if (state.pinnedEvidences.length === 0) {
      return { 
        allowed: false, 
        reason: lang === 'id'
          ? 'Sematkan minimal 1 bukti telemetri terlebih dahulu.'
          : 'Pin at least 1 telemetry evidence first.'
      };
    }
    return { allowed: true, reason: '' };
  }
  if (targetPhase === 'rewind') {
    if (!state.hypothesisSubmitted) {
      return { 
        allowed: false, 
        reason: lang === 'id'
          ? 'Selesaikan diagnosis akar masalah terlebih dahulu.'
          : 'Complete root cause diagnosis first.'
      };
    }
    return { allowed: true, reason: '' };
  }
  if (targetPhase === 'redesign') {
    if (!state.hypothesisSubmitted) {
      return { 
        allowed: false, 
        reason: lang === 'id'
          ? 'Selesaikan diagnosis akar masalah terlebih dahulu.'
          : 'Complete root cause diagnosis first.'
      };
    }
    return { allowed: true, reason: '' };
  }
  if (targetPhase === 'simulation') {
    if (!state.hypothesisSubmitted) {
      return { 
        allowed: false, 
        reason: lang === 'id'
          ? 'Selesaikan diagnosis akar masalah sebelum simulasi.'
          : 'Complete root cause diagnosis before simulation.'
      };
    }
    return { allowed: true, reason: '' };
  }
  if (targetPhase === 'debrief') {
    if (!state.simulationResult) {
      return { 
        allowed: false, 
        reason: lang === 'id'
          ? 'Luncurkan uji simulasi penerbangan terlebih dahulu.'
          : 'Launch flight simulation test first.'
      };
    }
    return { allowed: true, reason: '' };
  }
  return { allowed: true, reason: '' };
};

export const useMissionStore = create<MissionState>((set, get) => ({
  // Localization Initial State (Default: English)
  language: (typeof window !== 'undefined' && (localStorage.getItem('orbita_nova_lang') as Language)) || 'en',
  setLanguage: (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbita_nova_lang', lang);
    }
    set({ 
      language: lang,
      activeCase: getLocalizedCaseFile(CASE_FILES[0], lang),
    });
  },

  // Onboarding Initial State
  gameStarted: false,
  onboardingStep: 'welcome',
  astronautName: '',
  isFirstTimePlayer: null,
  tutorialStep: 0,
  currentView: 'lobby',

  currentPhase: 'briefing',
  activeCase: getLocalizedCaseFile(
    CASE_FILES[0], 
    (typeof window !== 'undefined' && (localStorage.getItem('orbita_nova_lang') as Language)) || 'en'
  ),
  selectedRole: 'flight_director',
  guidedMode: true,
  audioEnabled: true,

  currentTimeMinute: 0,
  pinnedEvidences: [],
  selectedHypothesisId: null,
  hypothesisSubmitted: false,
  isHypothesisCorrect: false,
  diagnosisGrade: null,
  failedSubmitsCount: 0,
  lastSubmitMissingCount: 0,
  missionStartedAt: null,

  redesignConfig: {
    solar: CASE_FILES[0].legacyConfiguration.solar,
    battery: CASE_FILES[0].legacyConfiguration.battery,
    thermal: CASE_FILES[0].legacyConfiguration.thermal,
    payloads: [...CASE_FILES[0].legacyConfiguration.payloads],
    comms: CASE_FILES[0].legacyConfiguration.comms,
    adcs: CASE_FILES[0].legacyConfiguration.adcs,
    launcher: CASE_FILES[0].legacyConfiguration.launcher,
    orbit: CASE_FILES[0].legacyConfiguration.orbit,
  },
  simulationResult: null,
  simulationRunning: false,
  simulationProgress: 0,
  rewindResult: null,

  setRewindResult: (res) => set({ rewindResult: res }),

  setAstronautName: (name) => {
    set({ astronautName: name });
  },

  setOnboardingStep: (step) => {
    sounds.playClick(650);
    set({ onboardingStep: step });
  },

  setIsFirstTimePlayer: (isFirst) => {
    sounds.playClick(750);
    set({ 
      isFirstTimePlayer: isFirst,
      guidedMode: isFirst // auto set Cadet Guided mode if first time!
    });
  },

  setTutorialStep: (step) => {
    sounds.playClick(800);
    set({ tutorialStep: step });
  },

  startGame: () => {
    sounds.playSuccess();
    set({ 
      gameStarted: true,
      currentPhase: 'briefing',
      onboardingStep: 'ready',
      currentView: 'lobby'
    });
  },

  setCurrentView: (view) => {
    sounds.playClick(750);
    set({ currentView: view });
  },

  setPhase: (phase) => {
    const state = get();
    const access = checkPhaseAccess(phase, state);
    if (!access.allowed) {
      sounds.playAlarm();
      return;
    }
    sounds.playClick(600);
    const { missionStartedAt } = state;
    if (phase === 'investigation' && missionStartedAt === null) {
      set({ currentPhase: phase, missionStartedAt: Date.now() });
    } else {
      set({ currentPhase: phase });
    }
  },

  setRole: (role) => {
    sounds.playClick(900);
    set({ selectedRole: role });
  },

  toggleGuidedMode: () => {
    sounds.playClick(750);
    set((state) => ({ guidedMode: !state.guidedMode }));
  },

  setGuidedMode: (guided) => {
    sounds.playClick(750);
    set({ guidedMode: guided });
  },

  toggleAudio: () => {
    sounds.enabled = !sounds.enabled;
    set((state) => ({ audioEnabled: !state.audioEnabled }));
  },

  setCurrentTimeMinute: (min) => {
    set({ currentTimeMinute: min });
  },

  pinEvidence: (evidence) => {
    const { pinnedEvidences } = get();
    if (!pinnedEvidences.some((e) => e.id === evidence.id)) {
      sounds.playEvidenceFound();
      set({ pinnedEvidences: [...pinnedEvidences, evidence] });
    }
  },

  unpinEvidence: (evidenceId) => {
    sounds.playClick(400);
    set((state) => ({
      pinnedEvidences: state.pinnedEvidences.filter((e) => e.id !== evidenceId),
    }));
  },

  selectHypothesis: (hypothesisId) => {
    sounds.playClick(700);
    set({ selectedHypothesisId: hypothesisId });
  },

  submitHypothesis: () => {
    const { activeCase, selectedHypothesisId, pinnedEvidences } = get();
    const hyp = activeCase.hypotheses.find((h) => h.id === selectedHypothesisId);
    if (!hyp) return false;

    const pinnedRequired = hyp.requiredEvidenceIds.filter(id => pinnedEvidences.some(e => e.id === id));
    const missing = hyp.requiredEvidenceIds.filter(id => !pinnedEvidences.some(e => e.id === id));

    let grade: DiagnosisGrade = 'incorrect';
    if (hyp.isCorrect && missing.length === 0) {
      grade = 'correct';
    } else if (hyp.isCorrect || pinnedRequired.length >= 2) {
      grade = 'partial';
    } else {
      grade = 'incorrect';
    }

    if (grade === 'incorrect') {
      const prevFails = get().failedSubmitsCount || 0;
      if (prevFails >= 1 && get().missionStartedAt) {
        // -30 seconds time penalty on 2nd+ fail
        set((s) => ({
          missionStartedAt: (s.missionStartedAt || Date.now()) - 30000,
          failedSubmitsCount: prevFails + 1,
        }));
      } else {
        set((s) => ({ failedSubmitsCount: (s.failedSubmitsCount || 0) + 1 }));
      }
      sounds.playAlarm();
    } else if (grade === 'correct') {
      sounds.playSuccess();
    } else {
      sounds.playEvidenceFound();
    }

    set({
      hypothesisSubmitted: grade !== 'incorrect',
      isHypothesisCorrect: grade === 'correct',
      diagnosisGrade: grade,
      lastSubmitMissingCount: missing.length,
    });
    return grade !== 'incorrect';
  },

  updateRedesignComponent: (category, value) => {
    sounds.playClick(850);
    set((state) => ({
      redesignConfig: {
        ...state.redesignConfig,
        [category]: value,
      },
    }));
  },

  startSimulation: () => {
    sounds.playClick(500);
    set({ simulationRunning: true, simulationProgress: 0 });

    const { redesignConfig, activeCase, isHypothesisCorrect, pinnedEvidences, missionStartedAt } = get();
    const timeTakenSeconds = missionStartedAt ? Math.round((Date.now() - missionStartedAt) / 1000) : 180;
    const result = runMissionSimulation({
      config: redesignConfig,
      budgetCapMillion: activeCase.budgetCapMillion,
      isHypothesisCorrect,
      pinnedEvidenceIds: pinnedEvidences.map((e) => e.id),
      requiredEvidenceIds: activeCase.hypotheses.find((h) => h.isCorrect)?.requiredEvidenceIds ?? [],
      redHerringEvidenceIds: activeCase.keyEvidencePool.filter((e) => e.isRedHerring).map((e) => e.id),
      timeTakenSeconds,
    });

    // Simulated progress tick
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      sounds.playTelemetryPing();
      set({ simulationProgress: progress });

      if (progress >= 100) {
        clearInterval(interval);
        set({
          simulationRunning: false,
          simulationResult: result,
          currentPhase: 'debrief',
        });
        if (result.completed) {
          sounds.playSuccess();
        } else {
          sounds.playAlarm();
        }
      }
    }, 250);
  },

  resetMission: () => {
    sounds.playClick(400);
    const initialCase = CASE_FILES[0];
    set({
      currentPhase: 'briefing',
      currentTimeMinute: 0,
      pinnedEvidences: [],
      selectedHypothesisId: null,
      hypothesisSubmitted: false,
      isHypothesisCorrect: false,
      lastSubmitMissingCount: 0,
      missionStartedAt: null,
      redesignConfig: { ...initialCase.legacyConfiguration },
      simulationResult: null,
      simulationRunning: false,
      simulationProgress: 0,
    });
  },
}));
