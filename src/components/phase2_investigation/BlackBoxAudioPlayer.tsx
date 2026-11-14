import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Volume2, 
  Radio, 
  AlertCircle,
  Pin,
  Check
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface BlackBoxAudioPlayerProps {
  onPinEvidence?: () => void;
  isPinned?: boolean;
}

export const BlackBoxAudioPlayer: React.FC<BlackBoxAudioPlayerProps> = ({ 
  onPinEvidence,
  isPinned = false
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const TRANSCRIPT_LINES = [
    {
      time: 'T+04:58:12',
      source: 'SENSOR SURYA',
      text: 'Fluks surya nol watt. Wahana memasuki bayangan tebal asteroid.',
      severity: 'normal'
    },
    {
      time: 'T+04:59:04',
      source: 'SENSOR TERMAL',
      text: 'Suhu baterai melewati minus 20 derajat. Terjadi pembekuan elektrolit ekstrem.',
      severity: 'warning'
    },
    {
      time: 'T+04:59:35',
      source: 'BUS DAYA EPS',
      text: 'Elektrolit membeku. Hambatan dalam melonjak tinggi. Tegangan bus turun ke 22.4V.',
      severity: 'warning'
    },
    {
      time: 'T+05:00:00',
      source: 'KOMPUTER UTAMA',
      text: 'PERINGATAN KRITIS: Tegangan anjlok ke 21.9V. Pemutusan darurat otomatis aktif.',
      severity: 'critical'
    },
    {
      time: 'T+05:00:14',
      source: 'PEMANCAR DSN',
      text: 'Penguat sinyal kehilangan daya. Kuncian DSN terlepas. Kontak terputus total.',
      severity: 'critical'
    },
    {
      time: 'T+05:00:20',
      source: 'ARSIP TELEMETRI',
      text: 'SINYAL DERAU STATIS : PEREKAM PENERBANGAN PADAM',
      severity: 'fatal'
    }
  ];

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      sounds.playRadioBeep();
    } else {
      setIsPlaying(true);
      setCurrentLineIndex(0);
      sounds.playStaticBurst(0.3);
      sounds.playRadioBeep();

      let idx = 0;
      intervalRef.current = setInterval(() => {
        idx++;
        if (idx < TRANSCRIPT_LINES.length) {
          setCurrentLineIndex(idx);
          if (idx === 3 || idx === 4) {
            sounds.playAlarm();
          } else if (idx === 5) {
            sounds.playFlatline(1.5);
          } else {
            sounds.playStaticBurst(0.2);
            sounds.playRadioBeep();
          }
        } else {
          setIsPlaying(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 2400);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="bg-[#141619] border border-black p-4 clip-chamfer-md shadow-2xl relative text-white space-y-3">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          <h3 className="font-display font-bold text-xs tracking-wider uppercase text-white">
            REKAMAN AUDIO KOTAK HITAM : SUARA DARURAT T+05:00
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-[10px]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-slate-400">ARSIP STASIUN DSN</span>
        </div>
      </div>

      {/* Audio Visualizer Waveform Graphic & Player Control */}
      <div className="bg-black border border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Play/Stop Button & Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 font-mono-tech text-xs font-bold flex items-center gap-2 cursor-pointer transition-all clip-chamfer-sm ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                : 'btn-tactical-primary text-black'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>HENTIKAN</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PUTAR AUDIO</span>
              </>
            )}
          </button>

          <div className="text-[10px] font-mono-tech text-slate-400">
            {isPlaying ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                MEMUTAR TRANSKRIPSI AUDIO
              </span>
            ) : (
              <span>Dengarkan rekaman detik terakhir ASTER-9.</span>
            )}
          </div>
        </div>

        {/* Right: Audio Waveform Animation Bars */}
        <div className="flex items-center gap-1 h-7">
          {[12, 24, 16, 28, 8, 22, 18, 26, 14, 20, 28, 10, 18, 25, 12, 16].map((h, i) => (
            <div
              key={i}
              className={`w-1 transition-all duration-150 ${
                isPlaying 
                  ? 'bg-rose-500 shadow-sm shadow-rose-500/50' 
                  : 'bg-slate-700'
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, (h * (Math.sin(Date.now() / 200 + i) + 1.2)))}px` : '4px'
              }}
            />
          ))}
        </div>
      </div>

      {/* Subtitle Teletype Ticker Feed */}
      <div className="bg-[#0B0D10] border border-slate-800 p-3 space-y-1.5 font-mono-tech text-xs min-h-[96px] flex flex-col justify-center">
        <div className="flex items-center justify-between text-[10px] border-b border-slate-800/80 pb-1">
          <span className="text-[#EAB308] font-bold">
            [{TRANSCRIPT_LINES[currentLineIndex].time}] : SUMBER : {TRANSCRIPT_LINES[currentLineIndex].source}
          </span>
          <span className="text-slate-500">BARIS {currentLineIndex + 1} / {TRANSCRIPT_LINES.length}</span>
        </div>

        <p className={`text-xs sm:text-sm font-mono-tech leading-relaxed pt-1 transition-colors ${
          TRANSCRIPT_LINES[currentLineIndex].severity === 'fatal'
            ? 'text-rose-400 font-black animate-pulse'
            : TRANSCRIPT_LINES[currentLineIndex].severity === 'critical'
            ? 'text-amber-300 font-bold'
            : 'text-slate-200'
        }`}>
          "{TRANSCRIPT_LINES[currentLineIndex].text}"
        </p>
      </div>

      {/* Pin Audio Evidence CTA */}
      {onPinEvidence && (
        <div className="flex items-center justify-between pt-1 text-xs font-mono-tech">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>Rekaman audio membuktikan pemutusan kontak radio pada 21.9V.</span>
          </div>

          <button
            onClick={onPinEvidence}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors clip-chamfer-sm ${
              isPinned 
                ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' 
                : 'bg-[#1C1F24] border border-slate-700 hover:border-[#EAB308] text-white hover:text-[#EAB308]'
            }`}
          >
            {isPinned ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>TERSEMAT</span>
              </>
            ) : (
              <>
                <Pin className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>SEMATKAN</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};