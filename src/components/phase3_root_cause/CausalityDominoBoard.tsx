import React, { useState } from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Layers,
  Moon,
  Zap,
  Thermometer,
  AlertTriangle
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface CausalityDominoBoardProps {
  onSolved: (hypothesisId: string) => void;
  isSolved: boolean;
}

interface DominoBlock {
  id: string;
  step: number;
  timeTag: string;
  title: string;
  metric: string;
  icon: React.ElementType;
  color: string;
  bgActive: string;
}

const DOMINO_STEPS: DominoBlock[] = [
  {
    id: 'step_1',
    step: 1,
    timeTag: 'T+03:15',
    title: 'MASUK BAYANGAN ASTEROID',
    metric: 'Gerhana Total 75 Menit',
    icon: Moon,
    color: 'text-purple-400',
    bgActive: 'border-purple-500 bg-purple-950/40'
  },
  {
    id: 'step_2',
    step: 2,
    timeTag: 'T+03:16',
    title: 'GENERASI SURYA PADAM',
    metric: 'Fluks Daya Nol Watt',
    icon: Zap,
    color: 'text-[#EAB308]',
    bgActive: 'border-amber-500 bg-amber-950/40'
  },
  {
    id: 'step_3',
    step: 3,
    timeTag: 'T+04:10',
    title: 'BATERAI MEMBEKU',
    metric: 'Suhu Sel Minus 28 Derajat',
    icon: Thermometer,
    color: 'text-cyan-400',
    bgActive: 'border-cyan-500 bg-cyan-950/40'
  },
  {
    id: 'step_4',
    step: 4,
    timeTag: 'T+05:00',
    title: 'BLACKOUT LISTRIK TOTAL',
    metric: 'Batas Tegangan 21.9V',
    icon: AlertTriangle,
    color: 'text-rose-400',
    bgActive: 'border-rose-500 bg-rose-950/40'
  }
];

export const CausalityDominoBoard: React.FC<CausalityDominoBoardProps> = ({ onSolved, isSolved }) => {
  // Player-selected sequence of block IDs
  const [selectedChain, setSelectedChain] = useState<string[]>(isSolved ? ['step_1', 'step_2', 'step_3', 'step_4'] : []);
  const [hasFailedAttempt, setHasFailedAttempt] = useState<boolean>(false);

  const handleSelectBlock = (blockId: string) => {
    if (selectedChain.includes(blockId) || isSolved) return;
    sounds.playClick(600 + selectedChain.length * 100);

    const newChain = [...selectedChain, blockId];
    setSelectedChain(newChain);

    if (newChain.length === 4) {
      // Validate correct sequence: step_1 -> step_2 -> step_3 -> step_4
      const isCorrect = newChain[0] === 'step_1' && newChain[1] === 'step_2' && newChain[2] === 'step_3' && newChain[3] === 'step_4';
      if (isCorrect) {
        sounds.playSuccess();
        setHasFailedAttempt(false);
        onSolved('hyp_cryo_battery_freeze');
      } else {
        sounds.playAlarm();
        setHasFailedAttempt(true);
      }
    }
  };

  const handleResetChain = () => {
    sounds.playClick(400);
    setSelectedChain([]);
    setHasFailedAttempt(false);
  };

  return (
    <div className="bg-[#141619] border border-black p-5 clip-chamfer-md shadow-2xl relative text-white space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#EAB308] rotate-45" />
            <h3 className="font-display font-black text-sm sm:text-base tracking-wider text-white uppercase">
              RANTAI KAUSALITAS : PAPAN BENANG MERAH
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Klik urutan 4 mata rantai peristiwa di bawah ini untuk membuktikan alur sebab akibat.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {selectedChain.length > 0 && !isSolved && (
            <button
              onClick={handleResetChain}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1F2329] border border-slate-700 hover:border-slate-500 text-xs font-mono-tech text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          )}

          {isSolved && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono-tech text-xs font-bold clip-chamfer-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>BENANG MERAH TERBUKTI</span>
            </span>
          )}
        </div>
      </div>

      {/* Visual Connected Domino Chain Output */}
      <div className="bg-black/80 border border-slate-800 p-4 space-y-2">
        <div className="text-[10px] font-mono-tech text-slate-500 uppercase flex items-center justify-between">
          <span>ALUR RANTAI PENYEBAB : {selectedChain.length} DARI 4 BALOK :</span>
          <span>{isSolved ? 'KASUS TERSELESAIKAN' : 'PILIH BALOK SECARA BERURUTAN'}</span>
        </div>

        {selectedChain.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono-tech text-slate-500 border border-dashed border-slate-800">
            Klik salah satu balok peristiwa di bawah untuk memulai rangkaian sebab akibat.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {selectedChain.map((blockId, index) => {
              const block = DOMINO_STEPS.find(b => b.id === blockId)!;
              const Icon = block.icon;
              return (
                <div key={blockId} className="relative flex items-center">
                  <div className={`w-full p-3 border ${block.bgActive} space-y-1 relative clip-chamfer-sm shadow-lg`}>
                    <div className="flex items-center justify-between font-mono-tech text-[10px]">
                      <span className="text-[#EAB308] font-bold">TAHAP {index + 1}</span>
                      <span className="text-slate-400">{block.timeTag}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <Icon className={`w-4 h-4 shrink-0 ${block.color}`} />
                      <div className="font-display font-bold text-xs text-white uppercase truncate">
                        {block.title}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono-tech text-slate-400">
                      {block.metric}
                    </div>
                  </div>

                  {index < selectedChain.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 z-10 w-6 h-6 items-center justify-center bg-[#EAB308] text-black font-black text-xs rounded-full shadow-md">
                      ➔
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hasFailedAttempt && (
          <div className="p-2.5 bg-rose-950/80 border border-rose-600 text-rose-300 font-mono-tech text-xs flex items-center justify-between">
            <span>Urutan tidak tepat. Hubungan sebab akibat harus dimulai dari fenomena fisik ke reaksi sistem.</span>
            <button onClick={handleResetChain} className="underline font-bold text-white cursor-pointer">
              ULANGI
            </button>
          </div>
        )}
      </div>

      {/* Available Unselected Blocks to Click */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#EAB308]" />
          <span>PERISTIWA ANOMALI YANG TERSEDIA :</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DOMINO_STEPS.map((block) => {
            const Icon = block.icon;
            const isAlreadySelected = selectedChain.includes(block.id);

            return (
              <button
                key={block.id}
                onClick={() => handleSelectBlock(block.id)}
                disabled={isAlreadySelected || isSolved}
                className={`p-3 text-left border transition-all cursor-pointer clip-chamfer-sm ${
                  isAlreadySelected
                    ? 'bg-[#0E1013] border-slate-800 opacity-40 cursor-not-allowed'
                    : 'bg-[#1C1F24] border-slate-700 hover:border-[#EAB308] hover:bg-[#242830] text-white shadow-md'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono-tech">
                  <span className="text-slate-400">{block.timeTag}</span>
                  <span className={block.color}>TITIK KEJADIAN</span>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <Icon className={`w-4 h-4 shrink-0 ${block.color}`} />
                  <div className="font-display font-bold text-xs text-white uppercase truncate">
                    {block.title}
                  </div>
                </div>

                <div className="text-[10px] font-mono-tech text-slate-400 mt-1">
                  {block.metric}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification Victory Banner */}
      {isSolved && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-200 flex items-center gap-3 font-mono-tech text-xs">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-emerald-300 uppercase">AKAR MASALAH TERBUKTI SECARA ILMIAH :</div>
            <div className="text-slate-200 text-[11px] font-sans">
              Satelit masuk bayangan tebal. Panel surya mati total. Suhu sel jatuh ke minus 28 derajat. Tegangan bus anjlok ke 21.9V dan memicu pemadaman darurat.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};