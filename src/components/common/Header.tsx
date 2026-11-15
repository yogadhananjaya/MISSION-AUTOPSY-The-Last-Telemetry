import React, { useState } from 'react';
import { 
  Search, 
  Wrench, 
  Rocket, 
  FileText, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Home,
  User,
  Lock,
  Activity,
  Layers,
  Globe,
  RotateCcw
} from 'lucide-react';
import { useMissionStore, checkPhaseAccess } from '../../store/useMissionStore';
import type { GamePhase } from '../../types/mission';
import { sounds } from '../../utils/soundEngine';
import { useTranslation } from '../../i18n';

export const Header: React.FC = () => {
  const { 
    currentPhase, 
    setPhase, 
    audioEnabled, 
    toggleAudio, 
    astronautName,
    activeCase,
    pinnedEvidences,
    hypothesisSubmitted,
    simulationResult,
    setOnboardingStep,
    setCurrentView
  } = useMissionStore();

  const { t, language, setLanguage } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const NAV_TABS = [
    { 
      id: 'briefing', 
      code: '01',
      label: t.header.briefing, 
      icon: Search,
      targetPhase: 'briefing' as GamePhase,
    },
    { 
      id: 'investigation', 
      code: '02',
      label: t.header.investigation, 
      icon: Activity,
      targetPhase: 'investigation' as GamePhase,
    },
    { 
      id: 'root_cause', 
      code: '03',
      label: t.header.rootCause, 
      icon: Layers,
      targetPhase: 'root_cause' as GamePhase,
    },
    { 
      id: 'rewind', 
      code: '3B',
      label: 'REWIND', 
      icon: RotateCcw,
      targetPhase: 'rewind' as GamePhase,
    },
    { 
      id: 'redesign', 
      code: '04',
      label: t.header.redesign, 
      icon: Wrench,
      targetPhase: 'redesign' as GamePhase,
    },
    { 
      id: 'simulation', 
      code: '05',
      label: t.header.simulation, 
      icon: Rocket,
      targetPhase: 'simulation' as GamePhase,
    },
    { 
      id: 'debrief', 
      code: '06',
      label: t.header.debrief, 
      icon: FileText,
      targetPhase: 'debrief' as GamePhase,
    },
  ];

  const handleTabClick = (tab: typeof NAV_TABS[0]) => {
    const access = checkPhaseAccess(tab.targetPhase, {
      pinnedEvidences,
      hypothesisSubmitted,
      simulationResult,
    }, language);

    if (!access.allowed) {
      sounds.playAlarm();
      setLockedNotice(access.reason);
      setTimeout(() => setLockedNotice(null), 3500);
      return;
    }

    setLockedNotice(null);
    setPhase(tab.targetPhase);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const displayName = astronautName && astronautName.trim() ? astronautName.toUpperCase() : 'MISTER';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#141619]/90 backdrop-blur-md border-b border-black/40 text-white shadow-lg">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-2">
        
        {/* =========================================================================
            POJOK KIRI ATAS: TACTICAL INVESTIGATOR PROFILE (Matching Gacha RPG Top Bar)
            - Avatar kotak tajam (1px border)
            - Nama pemain (Mister / callsign)
            - Badge level kuning-emas kecil (LV.26)
            - Tag peran miring (NASA INVESTIGATOR)
            - Bar progres EXP tipis monospace 1560 / 5000
            ========================================================================= */}
        <div className="flex items-center gap-3 select-none min-w-0 max-w-[200px] sm:max-w-none">
          {/* Avatar Kotak Tajam */}
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="relative w-10 h-10 bg-[#1C1F24] border border-[#EAB308] p-0.5 cursor-pointer group shadow-sm flex items-center justify-center shrink-0"
            title="Investigator Dossier"
          >
            <User className="w-5 h-5 text-[#EAB308]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#10B981] border border-black" />
          </div>

          {/* Dossier Text */}
          <div className="flex flex-col justify-center min-w-0">
            <span 
              className="font-display font-bold text-sm tracking-wider text-[#F8FAFC] uppercase leading-none truncate max-w-[120px] sm:max-w-[200px]"
              title={displayName}
            >
              {displayName}
            </span>
            <div className="mt-1">
              <span className="clip-slanted bg-[#1F2329] border border-slate-700/80 px-2 py-0.5 text-[9px] font-mono-tech tracking-wider text-slate-300 uppercase truncate block">
                NASA INVESTIGATOR
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CENTER: TACTICAL PHASE TABS (Anti-Rounded + Validation Gate)
            ========================================================================= */}
        <nav className="hidden lg:flex items-center bg-[#0D0F12] border border-slate-800/80 p-0.5 gap-0.5">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const access = checkPhaseAccess(tab.targetPhase, {
              pinnedEvidences,
              hypothesisSubmitted,
              simulationResult,
            });
            const isLocked = !access.allowed;
            const isActive = currentPhase === tab.targetPhase;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                title={isLocked ? `DIKUNCI: ${access.reason}` : tab.label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1C2026] text-[#EAB308] border-b-2 border-[#EAB308]'
                    : isLocked
                    ? 'opacity-40 text-slate-500 hover:text-slate-400 hover:bg-black/40 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#15181D]'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-[#EAB308]' : 'text-slate-600'}`}>
                  {tab.code}
                </span>
                {isLocked ? (
                  <Lock className="w-3 h-3 text-slate-500" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#EAB308]' : 'text-slate-500'}`} />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* =========================================================================
            POJOK KANAN ATAS: DERETAN RESOURCE & QUICK TOOLS
            - $ 65,000,000 (Credits)
            - 8,600 DP (Data Points)
            - 940 SIG (Signal Units)
            - Tombol [+] kotak berlatar gelap
            ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Resource: Real Mission Budget Cap */}
          <div className="flex items-center gap-1.5 bg-[#0D0F12] border border-slate-800/90 px-2 sm:px-2.5 py-1">
            <span className="w-2.5 h-2.5 bg-[#EAB308] rotate-45 shrink-0 inline-block" />
            <span className="font-mono-tech font-bold text-xs sm:text-sm text-[#F8FAFC] tracking-tight">
              ${activeCase.budgetCapMillion}M
            </span>
          </div>

          {/* Divider tipis */}
          <div className="w-[1px] h-6 bg-slate-800 hidden sm:block" />

          {/* Return to Hub Button */}
          <button
            onClick={() => setCurrentView('lobby')}
            title="Return to Command Hub"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1F2329] border border-slate-700 text-xs font-mono text-slate-300 hover:text-[#EAB308] hover:border-[#EAB308] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-bold">HUB</span>
          </button>

          {/* Audio */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Mute SFX' : 'Enable SFX'}
            className="p-1.5 bg-[#1F2329] border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
          >
            {audioEnabled
              ? <Volume2 className="w-3.5 h-3.5 text-[#EAB308]"/>
              : <VolumeX className="w-3.5 h-3.5 text-slate-500"/>
            }
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            title={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#1F2329] border border-slate-700 hover:border-[#EAB308] text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#EAB308]" />
            <span className={language === 'en' ? 'text-[#EAB308]' : 'text-slate-500'}>EN</span>
            <span className="text-slate-600">/</span>
            <span className={language === 'id' ? 'text-[#EAB308]' : 'text-slate-500'}>ID</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 bg-[#1F2329] border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-colors hidden md:flex cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      {/* Locked Phase Notice Toast */}
      {lockedNotice && (
        <div className="bg-amber-500/10 border-t border-b border-amber-500/40 text-amber-300 py-1.5 px-4 text-center font-mono-tech text-xs flex items-center justify-center gap-2 animate-fadeIn">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-bold">{language === 'en' ? 'ACCESS RESTRICTED:' : 'AKSES DITOLAK:'}</span>
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* User Dossier Dropdown */}
      {showUserMenu && (
        <div 
          className="absolute left-4 top-14 w-64 p-3 bg-[#141619] border border-black text-white text-xs font-mono space-y-2 shadow-2xl z-50 clip-chamfer-md"
        >
          <div className="border-b border-slate-800 pb-2">
            <div className="text-slate-400 text-[10px]">CURRENT INVESTIGATOR</div>
            <div className="font-bold text-white text-sm uppercase truncate">{displayName}</div>
            <div className="text-[#EAB308] text-[10px]">NASA INVESTIGATION UNIT : 2026</div>
          </div>

          <button
            onClick={() => { setShowUserMenu(false); setCurrentView('lobby'); }}
            className="w-full text-left py-1.5 px-2 bg-[#1C1F24] hover:bg-[#EAB308] hover:text-black text-[#EAB308] font-bold transition-colors cursor-pointer"
          >
            {language === 'en' ? 'RETURN TO HUB' : 'KEMBALI KE HUB'}
          </button>

          <button
            onClick={() => { setShowUserMenu(false); setOnboardingStep('enter_name'); }}
            className="w-full text-left py-1.5 px-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {language === 'en' ? 'CHANGE CALLSIGN' : 'GANTI NAMA'}
          </button>

          <button
            onClick={() => { setShowUserMenu(false); setOnboardingStep('tutorial'); }}
            className="w-full text-left py-1.5 px-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {language === 'en' ? 'MISSION TUTORIAL' : 'PANDUAN MISI'}
          </button>
        </div>
      )}
    </header>
  );
};
