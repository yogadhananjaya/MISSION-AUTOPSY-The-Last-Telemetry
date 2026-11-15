import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { MissionBriefing } from './components/phase1_briefing/MissionBriefing';
import { TelemetryStudio } from './components/phase2_investigation/TelemetryStudio';
import { HypothesisMatrix } from './components/phase3_root_cause/HypothesisMatrix';
import { RewindStage } from './components/phase3b_rewind/RewindStage';
import { SpacecraftBuilder } from './components/phase4_redesign/SpacecraftBuilder';
import { FlightSimulator } from './components/phase5_simulation/FlightSimulator';
import { MissionDebrief } from './components/phase6_debrief/MissionDebrief';
import { WelcomeModal } from './components/onboarding/WelcomeModal';
import { MainLobby } from './components/lobby/MainLobby';
import { MinigameLab } from './components/minigames/MinigameLab';
import { CoopLanding } from './components/coop/CoopLanding';
import { LobbyScreen } from './components/coop/LobbyScreen';
import { LastStand } from './components/coop/LastStand';
import { ComicViewer } from './components/story/ComicViewer';
import { SpaceMap } from './components/story/SpaceMap';
import { EpisodeStage } from './components/story/EpisodeStage';
import { LeaderboardScreen } from './components/leaderboard/LeaderboardScreen';
import { AcademyScreen } from './components/academy/AcademyScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { useMissionStore } from './store/useMissionStore';
import { useCoopStore } from './store/useCoopStore';
import { useAuthStore } from './store/useAuthStore';
import { FEATURES } from './config/features';
import type { EpisodeDef } from './engine/crisis/episodes';
import type { AgentDef } from './data/agents';

export const App: React.FC = () => {
  const { currentPhase, gameStarted, onboardingStep, currentView, setCurrentView, setPhase, astronautName, setAstronautName } = useMissionStore();
  const { lobby, leave: leaveCoop } = useCoopStore();
  const { isAuthenticated, checkAuth, isLoading: isAuthLoading, user } = useAuthStore();
  const [activeEpisode, setActiveEpisode] = useState<{ episode: EpisodeDef; companion: AgentDef } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user?.callsign && !astronautName) {
      setAstronautName(user.callsign);
    }
  }, [user, astronautName, setAstronautName]);

  // Route for Minigame Lab testing
  if (typeof window !== 'undefined' && window.location.search.includes('lab=1')) {
    return <MinigameLab />;
  }

  // If checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-white flex flex-col items-center justify-center blueprint-grid p-6 select-none font-mono">
        <div className="flex flex-col items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-amber-400 animate-ping" />
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            ORBITA NOVA // VERIFYING TIER-1 SECURITY CREDENTIALS
          </div>
          <div className="text-[10px] text-slate-500">
            TEAM CERTIFIED SPACE CAP • NASA MISSION ARCHIVE
          </div>
        </div>
      </div>
    );
  }

  // Requirement 4: High-security authentication gate (Login, Register, Google SSO)
  if (!isAuthenticated) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  // Requirement 5: After login, show Nova to collect explorer callsign
  const needsCallsign = !user?.callsign && !astronautName;
  const showOnboarding = needsCallsign || !gameStarted || onboardingStep !== 'ready';

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#EAB308]/30 selection:text-white">
      
      {/* Interactive Welcoming Screen & Mascot Tutorial Modal */}
      {showOnboarding && <WelcomeModal />}

      {/* Leaderboard Modal / Fullscreen Terminal */}
      {showLeaderboard && (
        <LeaderboardScreen onBack={() => setShowLeaderboard(false)} />
      )}

      {/* Main Lobby / Hub (Matching Gacha RPG Sci-Fi Home Screen Reference) */}
      {!showOnboarding && currentView === 'lobby' && (
        <MainLobby 
          onStartNewGame={() => {
            if (FEATURES.comic) {
              setCurrentView('comic');
            } else {
              setPhase('briefing');
              setCurrentView('mission');
            }
          }}
          onResumeGame={() => {
            setCurrentView('mission');
          }}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Story Narrative Comic View */}
      {!showOnboarding && currentView === 'comic' && (
        <ComicViewer
          onDone={() => {
            setPhase('briefing');
            setCurrentView('mission');
          }}
        />
      )}

      {/* Celestial Space Map & Episodes 02-06 */}
      {!showOnboarding && currentView === 'map' && (
        activeEpisode ? (
          <EpisodeStage
            episode={activeEpisode.episode}
            companion={activeEpisode.companion}
            onExitToMap={() => setActiveEpisode(null)}
          />
        ) : (
          <SpaceMap
            onBackToHub={() => setCurrentView('lobby')}
            onLaunchEpisode={(ep, companion) => {
              if (ep.id === 'ep01') {
                setPhase('briefing');
                setCurrentView('mission');
              } else {
                setActiveEpisode({ episode: ep, companion });
              }
            }}
          />
        )
      )}

      {/* Space Academy Learning Center View */}
      {!showOnboarding && currentView === 'academy' && (
        <AcademyScreen onBack={() => setCurrentView('lobby')} />
      )}

      {/* Real-time Co-op Multiplayer View (WebRTC PeerJS + BroadcastChannel) */}
      {!showOnboarding && currentView === 'coop' && (
        <div className="min-h-screen flex flex-col bg-[#0b0d12] text-white selection:bg-amber-400 selection:text-black">
          <header className="border-b border-gray-800 bg-[#141619] py-3 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                ORBITA NOVA : CO-OP NETWORK
              </span>
            </div>
            <button
              onClick={() => {
                leaveCoop();
                setCurrentView('lobby');
              }}
              className="text-xs font-mono text-gray-400 hover:text-white underline cursor-pointer"
            >
              KEMBALI KE MENU UTAMA
            </button>
          </header>

          <main className="flex-1 p-3 sm:p-5 md:p-6">
            {!lobby && <CoopLanding onBackToHub={() => setCurrentView('lobby')} />}
            {lobby && lobby.status !== 'IN_GAME' && <LobbyScreen />}
            {lobby && lobby.status === 'IN_GAME' && <LastStand />}
          </main>
        </div>
      )}

      {/* Active Mission Investigation Mode (Header + 6 Phase Viewport) */}
      {!showOnboarding && currentView === 'mission' && (
        <div className="min-h-screen flex flex-col bg-[#0B0E14] blueprint-grid relative">
          
          {/* Subtle Technical Giant Typography in Background */}
          <div className="absolute top-1/4 right-0 pointer-events-none select-none overflow-hidden opacity-[0.02] leading-none z-0">
            <span className="font-display font-black text-[22vw] text-white tracking-tighter block text-right">
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
            {currentPhase === 'rewind' && <RewindStage />}
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
              <span>CERTIFIED SPACE CAP • NASA SPACE APPS 2026</span>
            </div>
          </footer>
        </div>
      )}

    </div>
  );
};

export default App;
