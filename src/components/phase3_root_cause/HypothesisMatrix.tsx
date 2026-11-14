import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Layers,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { sounds } from '../../utils/soundEngine';
import { CausalityDominoBoard } from './CausalityDominoBoard';

export const HypothesisMatrix: React.FC = () => {
  const { 
    activeCase, 
    pinnedEvidences, 
    selectedHypothesisId, 
    selectHypothesis, 
    submitHypothesis, 
    hypothesisSubmitted, 
    isHypothesisCorrect, 
    lastSubmitMissingCount,
    setPhase,
    guidedMode 
  } = useMissionStore();

  const [hasAttempted, setHasAttempted] = useState(hypothesisSubmitted);

  const selectedHyp = activeCase.hypotheses.find((h) => h.id === selectedHypothesisId);

  const handleSubmit = () => {
    if (!selectedHypothesisId) return;
    submitHypothesis();
    setHasAttempted(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141619] border border-black text-white p-5 clip-chamfer-md shadow-2xl relative">
        <div className="absolute top-2 right-4 font-mono-tech text-[10px] text-slate-500">
          DEWAN : PENENTUAN AKAR MASALAH
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="clip-slanted font-mono-tech text-[10px] uppercase px-2 py-0.5 bg-[#EAB308] text-black font-bold">
              FASE 03 : MATRIKS AKAR MASALAH
            </span>
            <span className="text-[11px] text-slate-400 font-mono-tech">
              VERIFIKASI DEWAN PENYELIDIK
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-wide text-white mt-1">
            PENENTUAN AKAR MASALAH DAN BUKTI HIPOTESIS
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans leading-relaxed">
            Pilih hipotesis kegagalan yang didukung oleh bukti anomali telemetri.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto font-mono-tech text-xs bg-black px-3 py-2 border border-slate-800">
          <Layers className="w-4 h-4 text-[#EAB308]" />
          <span className="text-[#EAB308] font-bold">{pinnedEvidences.length} BUKTI TERSEDIA</span>
        </div>
      </div>

      {/* Guided Mode Info */}
      {guidedMode && (
        <div className="p-3.5 bg-[#1C1F24] border border-slate-800 text-xs text-slate-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#EAB308] font-mono-tech uppercase">ARAHAN KAUSALITAS TEKNIK:</p>
            <p className="text-slate-300 text-[11px] mt-0.5 font-sans leading-relaxed">
              Pelajari urutan sebab akibat. Mengapa voltase bus jatuh ke 21.0V? Apakah panel surya hancur atau baterai membeku di dalam bayangan tanpa pemanas? Perhatikan suhu minus 11.6 derajat dan waktu masuk gerhana.
            </p>
          </div>
        </div>
      )}

      {/* Pinned Evidence Summary Row */}
      <div className="bg-[#141619] border border-black text-white p-4 space-y-2 clip-chamfer-sm shadow-xl">
        <h3 className="font-mono-tech text-xs font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#EAB308]" />
          <span>BUKTI TELEMETRI KOTAK HITAM :</span>
        </h3>
        
        {pinnedEvidences.length === 0 ? (
          <div className="p-4 bg-black border border-slate-800 text-xs font-mono-tech text-[#EAB308] flex items-center justify-between">
            <span>Belum ada bukti tersemat dari Studio Telemetri.</span>
            <button
              onClick={() => setPhase('investigation')}
              className="text-[#EAB308] underline hover:text-white cursor-pointer font-bold uppercase tracking-wider"
            >
              KEMBALI KE LAB
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 font-mono-tech text-xs">
            {pinnedEvidences.map((ev, idx) => (
              <div key={ev.id} className="p-2.5 bg-[#1C1F24] border border-slate-800 text-slate-300">
                <div className="flex items-center justify-between text-[#EAB308] font-bold text-[11px]">
                  <span>BUKTI {String(idx + 1).padStart(2, '0')} : {ev.timeStr}</span>
                  <span className="uppercase text-slate-400">{ev.metric}</span>
                </div>
                <div className="font-semibold text-white mt-1 truncate">{ev.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          FEATURE: INTERACTIVE CAUSALITY CHAIN PUZZLE (Papan Benang Merah Kausalitas)
          ========================================================================= */}
      <CausalityDominoBoard 
        isSolved={selectedHypothesisId === 'hyp_cryo_battery_freeze' && hasAttempted}
        onSolved={(hypId) => {
          selectHypothesis(hypId);
        }}
      />

      {/* Hypotheses Selection Grid */}
      <div className="space-y-3">
        <h3 className="font-mono-tech text-xs font-bold text-slate-800 uppercase tracking-wider">
          PILIH HIPOTESIS UNTUK SIDANG DEWAN :
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeCase.hypotheses.map((hyp, idx) => {
            const isSelected = selectedHypothesisId === hyp.id;
            const terpenuhi = hyp.requiredEvidenceIds.filter((id) =>
              pinnedEvidences.some((e) => e.id === id)
            ).length;

            return (
              <div
                key={hyp.id}
                onClick={() => selectHypothesis(hyp.id)}
                className={`cursor-pointer p-5 transition-all flex flex-col justify-between border clip-chamfer-sm ${
                  isSelected
                    ? 'bg-[#1C1F24] border-[#EAB308] shadow-xl shadow-amber-500/10 text-white'
                    : 'bg-[#141619] border-black text-slate-300 hover:border-slate-700 hover:bg-[#181A1F]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-[10px] uppercase px-2 py-0.5 bg-black border border-slate-800 text-[#EAB308] font-bold">
                      HIPOTESIS {String(idx + 1).padStart(2, '0')} : {hyp.category.toUpperCase()}
                    </span>
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center ${
                      isSelected ? 'border-[#EAB308] bg-[#EAB308]' : 'border-slate-600 bg-black'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-black" />}
                    </div>
                  </div>

                  <h4 className="font-display font-bold text-base text-white mt-3 leading-snug">
                    {hyp.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                    {hyp.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono-tech text-slate-400 flex items-center justify-between">
                  <span>{terpenuhi}/{hyp.requiredEvidenceIds.length} BUKTI TERPENUHI</span>
                  {isSelected && <span className="text-[#EAB308] font-bold">TERPILIH</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission & Feedback Card */}
      <div className="bg-[#141619] border border-black text-white p-6 space-y-4 clip-chamfer-md shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono-tech text-slate-500 uppercase">
              KONFIRMASI
            </div>
            <h4 className="font-display font-bold text-base text-white mt-0.5">
              KONFIRMASI DIAGNOSIS DEWAN PENYELIDIK
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Diagnosis yang terbukti memberikan izin bagi tim teknik untuk memulai perancangan ulang wahana.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {pinnedEvidences.length === 0 && (
              <span className="font-mono-tech text-[11px] text-amber-400">
                Sematkan minimal 1 bukti telemetri sebelum mengirim.
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={!selectedHypothesisId || pinnedEvidences.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
                selectedHypothesisId && pinnedEvidences.length > 0
                  ? 'btn-tactical-primary text-black shadow-lg shadow-amber-500/20'
                  : 'bg-[#1C1F24] text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>KIRIM DIAGNOSIS</span>
            </button>
          </div>
        </div>

        {/* Detailed Result Card */}
        {hasAttempted && selectedHyp && (
          <div className={`p-4 border font-mono-tech text-xs space-y-3 transition-all ${
            isHypothesisCorrect
              ? 'bg-[#141619] border-emerald-500 text-emerald-200'
              : 'bg-[#141619] border-rose-600 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {isHypothesisCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300">DIAGNOSIS AKURAT : AKAR MASALAH TERBUKTI PLUS 300 EXP</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-rose-300">DIAGNOSIS TIDAK SESUAI DENGAN BUKTI TELEMETRI</span>
                </>
              )}
            </div>

            {lastSubmitMissingCount > 0 && (
              <div className="p-3 bg-amber-950/70 border border-amber-600 text-amber-300 font-mono-tech text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Diagnosis dikirim dengan {lastSubmitMissingCount} bukti wajib belum disematkan (kehilangan poin).</span>
              </div>
            )}

            <p className="text-slate-200 leading-relaxed font-sans">
              {selectedHyp.engineeringExplanation}
            </p>

            {isHypothesisCorrect && (
              <div className="p-3 bg-black border border-emerald-700/60 text-emerald-300 space-y-1">
                <div className="font-bold font-mono-tech">MANDAT REKAYASA FASE 4 :</div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300 font-sans">
                  <li>Tingkatkan kapasitas baterai menjadi 850 Wh atau tipe Padat Kriogenik untuk bertahan di bayangan 75 menit.</li>
                  <li>Pasang pemanas termal aktif MLI dan pemanas RHU untuk mencegah sel membeku di bawah minus 10 derajat.</li>
                  <li>Atau ubah orbit lintasan wahana menjadi orbit terminator dengan gerhana singkat 15 menit.</li>
                </ul>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick(400);
            setPhase('investigation');
          }}
          className="text-xs font-mono-tech text-slate-600 hover:text-black flex items-center gap-1.5 cursor-pointer font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>KEMBALI KE LAB</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick(600);
            setPhase('redesign');
          }}
          disabled={!hasAttempted}
          className={`flex items-center gap-2 px-6 py-3 font-display font-black text-xs tracking-wider transition-all cursor-pointer ${
            hasAttempted
              ? 'btn-tactical-primary text-black shadow-lg shadow-amber-500/20'
              : 'bg-[#141619] text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>MULAI REKAYASA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
