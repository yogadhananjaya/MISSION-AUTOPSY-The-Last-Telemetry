import React from 'react';
import { Header } from './components/common/Header';
import { MissionBriefing } from './components/phase1_briefing/MissionBriefing';
import { TelemetryStudio } from './components/phase2_investigation/TelemetryStudio';
import { HypothesisMatrix } from './components/phase3_root_cause/HypothesisMatrix';
import { SpacecraftBuilder } from './components/phase4_redesign/SpacecraftBuilder';
import { FlightSimulator } from './components/phase5_simulation/FlightSimulator';
import { MissionDebrief } from './components/phase6_debrief/MissionDebrief';
import { WelcomeModal } from './components/onboarding/WelcomeModal';
import { MainLobby } from './components/lobby/MainLobby';
import { useMissionStore } from './store/useMissionStore';

export const App: React.FC = () => {
  const { currentPhase, gameStarted, onboardingStep, currentView, setCurrentView, setPhase } = useMissionStore();

  const showOnboarding = !gameStarted || onboardingStep !== 'ready';

  return (
    <div className="min-h-screen bg-[#EAECEF] text-[#141619] flex flex-col font-sans selection:bg-[#EAB308]/30 selection:text-black">
      
      {/* Interactive Welcoming Screen & Mascot Tutorial Modal */}
      {showOnboarding && <WelcomeModal />}

      {/* Main Lobby / Hub (Matching Gacha RPG Sci-Fi Home Screen Reference) */}
      {!showOnboarding && currentView === 'lobby' && (
        <MainLobby 
          onStartNewGame={() => {
            setPhase('briefing');
            setCurrentView('mission');
          }}
          onResumeGame={() => {
            setCurrentView('mission');
          }}
        />
      )}

      {/* Active Mission Investigation Mode (Header + 6 Phase Viewport) */}
      {!showOnboarding && currentView === 'mission' && (
        <div className="min-h-screen flex flex-col bg-[#EAECEF] blueprint-grid relative">
          
          {/* Subtle Technical Giant Typography in Background */}
          <div className="absolute top-1/4 right-0 pointer-events-none select-none overflow-hidden opacity-[0.03] leading-none z-0">
            <span className="font-display font-black text-[22vw] text-black tracking-tighter block text-right">
              AUTOPSY
            </span>
          </div>

          {/* Top NASA Mission Control Header */}
          <Header />

          {/* Main Mission Viewport (Full Screen Width) */}
          <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 md:p-6 lg:p-8 relative z-10">
            {currentPhase === 'briefing' && <MissionBriefing />}
            {currentPhase === 'investigation' && <TelemetryStudio />}
            {currentPhase === 'root_cause' && <HypothesisMatrix />}
            {currentPhase === 'redesign' && <SpacecraftBuilder />}
            {currentPhase === 'simulation' && <FlightSimulator />}
            {currentPhase === 'debrief' && <MissionDebrief />}
          </main>

          {/* Tactical Bottom Telemetry Bar */}
          <footer className="border-t border-black/20 bg-[#141619] text-white py-3 px-6 text-xs font-mono-tech flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#10B981] animate-pulse" />
              <span className="text-slate-300">TELEMETRY: ONLINE</span>
              <span className="text-slate-600">:</span>
              <span className="text-[#EAB308] font-bold">CASE-01 ASTER-9 UMBRA</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <button 
                onClick={() => setCurrentView('lobby')}
                className="text-[#EAB308] hover:text-white underline cursor-pointer font-bold"
              >
                KEMBALI KE HUB
              </button>
              <span className="text-slate-600">:</span>
              <span>NASA SPACE APPS 2026</span>
            </div>
          </footer>
        </div>
      )}

    </div>
  );
};

export default App;
