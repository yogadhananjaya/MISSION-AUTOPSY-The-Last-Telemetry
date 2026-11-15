/* antislop: Narrative comic presentation avoiding generic stock layouts; uses authentic mission logs */
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, SkipForward, Sparkles } from 'lucide-react';
import { getComicPanels } from '../../data/comicPanels';
import { useMissionStore } from '../../store/useMissionStore';
import { sounds } from '../../utils/soundEngine';

interface ComicViewerProps {
  onDone: () => void;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({ onDone }) => {
  const { astronautName, language } = useMissionStore();
  const panels = getComicPanels(astronautName);

  const [panelIndex, setPanelIndex] = useState(0);
  const current = panels[panelIndex];

  // Typewriter effect state
  const [displayedCaption, setDisplayedCaption] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fullCaption = language === 'en' ? current.captionEn : current.caption;
  const currentLine = language === 'en' ? current.lineEn : current.line;

  // Typewriter effect logic
  useEffect(() => {
    setDisplayedCaption('');
    setIsTyping(true);
    let charIdx = 0;

    const tick = () => {
      if (charIdx <= fullCaption.length) {
        setDisplayedCaption(fullCaption.slice(0, charIdx));
        charIdx++;
        typingTimerRef.current = setTimeout(tick, 22);
      } else {
        setIsTyping(false);
      }
    };

    tick();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [panelIndex, fullCaption]);

  // Keyboard navigation: ArrowRight / Space / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sounds.playClick(400);
        onDone();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (panelIndex > 0) {
          sounds.playClick(500);
          setPanelIndex((p) => p - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelIndex, isTyping]);

  const handleNext = () => {
    if (isTyping) {
      // Fast forward typewriter
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setDisplayedCaption(fullCaption);
      setIsTyping(false);
      return;
    }

    if (panelIndex < panels.length - 1) {
      sounds.playClick(600);
      setPanelIndex((p) => p + 1);
    } else {
      sounds.playSuccess();
      onDone();
    }
  };

  const getNovaImage = (pose: string) => {
    switch (pose) {
      case 'happy':
        return '/assets/nova/nova_happy.png';
      case 'confused':
        return '/assets/nova/nova_confused.png';
      case 'sad':
        return '/assets/nova/nova_sad.png';
      case 'determined':
        return '/assets/nova/nova_determined.png';
      default:
        return '/assets/nova/nova_idle.png';
    }
  };

  // Atmospheric background CSS based on current panel
  const getPanelBgStyle = (bg: string) => {
    switch (bg) {
      case 'launch':
        return 'from-[#0a1835] via-[#091122] to-[#04060a] border-cyan-500/40';
      case 'cruise':
        return 'from-[#071329] via-[#050b18] to-[#02050c] border-blue-500/40';
      case 'eclipse':
        return 'from-[#1c0f2b] via-[#10081c] to-[#05020a] border-purple-500/40';
      case 'cold':
        return 'from-[#091b29] via-[#040e17] to-[#01060a] border-cyan-400/50';
      case 'loss':
        return 'from-[#2b0c10] via-[#170507] to-[#070102] border-red-500/50';
      case 'brief':
      default:
        return 'from-[#1a1711] via-[#0e0c08] to-[#040403] border-amber-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-sans text-white">
      <div
        className={`w-full max-w-4xl bg-gradient-to-b ${getPanelBgStyle(
          current.bg
        )} border-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between min-h-[540px] md:min-h-[580px] p-6 relative`}
      >
        {/* Subtle Tech Grid Lines in Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Top Header: Mission Log & Skip Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold tracking-widest uppercase">
              MISSION CHRONICLES : CASE ASTER-9
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* 6 Step Dots */}
            <div className="flex items-center gap-1.5">
              {panels.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === panelIndex
                      ? 'bg-amber-400 scale-125'
                      : i < panelIndex
                      ? 'bg-amber-400/40'
                      : 'bg-gray-800'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick(400);
                onDone();
              }}
              className="text-gray-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-black/40 border border-gray-800 hover:border-gray-600 cursor-pointer"
            >
              <span>{language === 'en' ? 'SKIP' : 'LEWATI'}</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Visual Art Area */}
        <div className="my-auto py-4 flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
          {/* NOVA Character Visual */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 relative shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
            <img
              src={getNovaImage(current.nova)}
              alt="NOVA Mascot"
              className="max-h-full max-w-full object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-transform duration-300"
            />
          </div>

          {/* NOVA Dialogue Speech Bubble */}
          {currentLine && (
            <div className="max-w-md w-full bg-black/70 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-2 relative">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{current.speaker || 'NOVA TACTICAL AI'}</span>
              </div>
              <p className="text-sm font-sans text-amber-200 leading-relaxed italic">
                "{currentLine}"
              </p>
            </div>
          )}
        </div>

        {/* Bottom Technical Caption Box & Controls */}
        <div
          onClick={handleNext}
          className="bg-black/85 border border-white/15 rounded-xl p-4 cursor-pointer relative z-10 space-y-3 hover:border-amber-400/50 transition-colors"
        >
          <div className="flex items-center justify-between font-mono text-[10px] text-gray-500">
            <span>PANEL {panelIndex + 1} / {panels.length}</span>
            <span className="text-amber-400">
              {isTyping
                ? (language === 'en' ? '[CLICK TO FAST-FORWARD]' : '[KLIK UNTUK MEMPERCEPAT]')
                : (language === 'en' ? '[CLICK TO CONTINUE]' : '[KLIK UNTUK LANJUT]')}
            </span>
          </div>

          <p className="text-sm sm:text-base font-sans leading-relaxed text-slate-100 min-h-[48px]">
            {displayedCaption}
            {isTyping && <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-pulse" />}
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black font-display text-xs tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <span>{panelIndex === panels.length - 1 ? (language === 'en' ? 'ENTER BRIEFING' : 'MULAI INVESTIGASI') : (language === 'en' ? 'NEXT' : 'LANJUT')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
