import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import type { QuickCode } from '../../net/protocol';
import { useCoopStore } from '../../store/useCoopStore';
import { sounds } from '../../utils/soundEngine';

const QUICK_COMM_LABELS: Record<QuickCode, string> = {
  POWER_LOW: 'Daya turun!',
  NEED_DIAG: 'Butuh diagnosis',
  TAKING_IT: 'Aku ambil',
  NEED_HELP: 'Tolong bantu',
  DONE: 'Selesai',
  WHICH_FIRST: 'Pilih mana dulu?',
  AGREE: 'Setuju',
  HOLD: 'Tahan!',
};

export const QuickComm: React.FC = () => {
  const { sendQuickComm, quickMessages } = useCoopStore();
  const [cooldown, setCooldown] = useState(false);

  const handleSend = (code: QuickCode) => {
    if (cooldown) return;
    sounds.playClick(800);
    sendQuickComm(code);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);
  };

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {/* Floating Bubbles */}
      <div className="h-14 overflow-hidden relative flex flex-wrap gap-2 items-end justify-start">
        {quickMessages.map((msg) => (
          <div
            key={msg.id}
            className="px-3 py-1 bg-amber-400 text-black font-black text-xs rounded-full shadow-lg border border-black animate-bounce flex items-center gap-1.5"
          >
            <span className="text-[10px] text-black/70 font-mono font-bold uppercase">
              {msg.from}:
            </span>
            <span>{QUICK_COMM_LABELS[msg.code]}</span>
          </div>
        ))}
      </div>

      {/* 8 Quick Comm Buttons */}
      <div className="bg-[#141619] border border-black p-3 rounded-xl space-y-2 shadow-md">
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>KOMUNIKASI TAKTIS CEPAT (QUICK-COMM)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {(Object.keys(QUICK_COMM_LABELS) as QuickCode[]).map((code) => (
            <button
              key={code}
              type="button"
              disabled={cooldown}
              onClick={() => handleSend(code)}
              className="py-2 px-2.5 rounded-lg bg-black/60 hover:bg-amber-400 hover:text-black border border-gray-800 text-gray-300 font-mono text-[11px] font-bold transition-all cursor-pointer truncate disabled:opacity-50"
            >
              {QUICK_COMM_LABELS[code]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
