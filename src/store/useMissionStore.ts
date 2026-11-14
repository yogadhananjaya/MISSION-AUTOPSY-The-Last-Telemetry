import { create } from 'zustand';
import type { AnomalyEvidence, CaseFile, GamePhase, RedesignConfiguration, SimulationResult, UserRole } from '../types/mission';
import { CASE_FILES } from '../data/caseFiles';
import { runMissionSimulation } from '../utils/simulationEngine';
import { sounds } from '../utils/soundEngine';

interface MissionState {
  // Onboarding & Welcoming State
  gameStarted: boolean;
  onboardingStep: 'welcome' | 'enter_name' | 'check_experience' | 'tutorial' | 'ready';
  astronautName: string;
  isFirstTimePlayer: boolean | null;
  tutorialStep: number;
  currentView: 'lobby' | 'mission';

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

  // Phase 4 & 5 State
  redesignConfig: RedesignConfiguration;
  simulationResult: SimulationResult | null;
  simulationRunning: boolean;
  simulationProgress: number; // 0 to 100%

  // Actions
  // Onboarding Actions
  setAstronautName: (name: string) => void;
  setOnboardingStep: (step: 'welcome' | 'enter_name' | 'check_experience' | 'tutorial' | 'ready') => void;
  setIsFirstTimePlayer: (isFirst: boolean) => void;
  setTutorialStep: (step: number) => void;
  startGame: () => void;
  setCurrentView: (view: 'lobby' | 'mission') => void;

  setPhase: (phase: GamePhase) => void;
  setRole: (role: UserRole) => void;
  toggleGuidedMode: () => void;
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

export const useMissionStore = create<MissionState>((set, get) => ({
  // Onboarding Initial State
  gameStarted: false,
  onboardingStep: 'welcome',
  astronautName: '',
  isFirstTimePlayer: null,
  tutorialStep: 0,
  currentView: 'lobby',

  currentPhase: 'briefing',
  activeCase: CASE_FILES[0],
  selectedRole: 'flight_director',
  guidedMode: true,
  audioEnabled: true,

  currentTimeMinute: 0,
  pinnedEvidences: [],
  selectedHypothesisId: null,
  hypothesisSubmitted: false,
  isHypothesisCorrect: false,

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
    sounds.playClick(600);
    set({ currentPhase: phase });
  },

  setRole: (role) => {
    sounds.playClick(900);
    set({ selectedRole: role });
  },

  toggleGuidedMode: () => {
    sounds.playClick(750);
    set((state) => ({ guidedMode: !state.guidedMode }));
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
    const { activeCase, selectedHypothesisId } = get();
    const hyp = activeCase.hypotheses.find((h) => h.id === selectedHypothesisId);
    if (!hyp) return false;

    // Check if required evidences are attached or pinned
    const isCorrect = hyp.isCorrect;
    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playAlarm();
    }

    set({
      hypothesisSubmitted: true,
      isHypothesisCorrect: isCorrect,
    });
    return isCorrect;
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

    const { redesignConfig, activeCase, isHypothesisCorrect, pinnedEvidences } = get();
    const result = runMissionSimulation(
      redesignConfig,
      activeCase.budgetCapMillion,
      isHypothesisCorrect,
      pinnedEvidences.length
    );

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
      redesignConfig: { ...initialCase.legacyConfiguration },
      simulationResult: null,
      simulationRunning: false,
      simulationProgress: 0,
    });
  },
}));
