import React, { useState } from 'react';
import { Users, Wifi, AlertTriangle, ArrowRight, ShieldCheck, Laptop } from 'lucide-react';
import { useCoopStore, type TransportKind } from '../../store/useCoopStore';
import { normalizeCode } from '../../net/code';
import { sounds } from '../../utils/soundEngine';

interface CoopLandingProps {
  onBackToHub: () => void;
}

export const CoopLanding: React.FC<CoopLandingProps> = ({ onBackToHub }) => {
  const { createLobby, joinLobby, error, clearError } = useCoopStore();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [transportKind, setTransportKind] = useState<TransportKind>('peer');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    sounds.playClick(600);
    clearError();
    setLoading(true);
    await createLobby(name, transportKind);
    setLoading(false);
  };

  const handleJoin = async () => {
    sounds.playClick(600);
    clearError();
    if (!code.trim()) return;
    setLoading(true);
    await joinLobby(name, code, transportKind);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 select-none font-sans text-white p-4">
      {/* Header */}
      <div className="bg-[#141619] border border-black p-6 rounded-2xl shadow-2xl text-center space-y-2 relative overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 mx-auto flex items-center justify-center text-amber-400">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black font-display text-amber-400 tracking-wide uppercase">
          CO-OP MULTIPLAYER LOBBY
        </h1>
        <p className="text-xs text-gray-400 font-sans max-w-md mx-auto">
          Sambungkan dua laptop secara peer-to-peer (WebRTC) atau mainkan dua tab dalam mode lokal.
        </p>

        {/* Transport Toggle */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(400);
              setTransportKind((k) => (k === 'peer' ? 'broadcast' : 'peer'));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border flex items-center gap-2 cursor-pointer transition-all ${
              transportKind === 'peer'
                ? 'border-green-500/50 bg-green-950/30 text-green-300'
                : 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300'
            }`}
          >
            {transportKind === 'peer' ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Mode: WebRTC 2 Laptop (PeerJS)</span>
              </>
            ) : (
              <>
                <Laptop className="w-3.5 h-3.5" />
                <span>Mode: 2 Tab Lokal (BroadcastChannel)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-red-950/80 border border-red-500 text-red-300 rounded-lg text-xs font-mono flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-gray-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode Selector & Form */}
      <div className="bg-[#141619] border border-black p-6 rounded-2xl shadow-xl space-y-5">
        {/* Toggle Mode */}
        <div className="grid grid-cols-2 gap-2 bg-black/60 p-1.5 rounded-xl border border-gray-800">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(500);
              setMode('create');
              clearError();
            }}
            className={`py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
              mode === 'create'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            BUAT LOBI BARU
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick(500);
              setMode('join');
              clearError();
            }}
            className={`py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
              mode === 'join'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            GABUNG LOBI
          </button>
        </div>

        {/* Player Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-gray-400 block">
            NAMA PANGGILAN ASTRONOT (MAKS 16 KARAKTER):
          </label>
          <input
            type="text"
            maxLength={16}
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ''))}
            placeholder="Contoh: Ryan, Sarah, Elena..."
            className="w-full px-4 py-2.5 rounded-lg bg-black/60 border border-gray-700 text-sm font-mono text-white placeholder-gray-600 focus:border-amber-400 outline-none"
          />
        </div>

        {/* Join Code Field if mode === 'join' */}
        {mode === 'join' && (
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-400 block">
              KODE LOBI (MISAL: NOVA-8W9X):
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(normalizeCode(e.target.value))}
              placeholder="NOVA-XXXX"
              className="w-full px-4 py-2.5 rounded-lg bg-black/60 border border-gray-700 text-sm font-mono text-amber-300 placeholder-gray-600 focus:border-amber-400 outline-none uppercase tracking-widest"
            />
          </div>
        )}

        {/* Action Button */}
        {mode === 'create' ? (
          <button
            type="button"
            disabled={loading}
            onClick={handleCreate}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black font-display text-xs tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <span>MEMBUAT SERVER LOBI...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>BUAT LOBI & JADI TUAN RUMAH</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled={loading || !code.trim()}
            onClick={handleJoin}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black font-display text-xs tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <span>MENGHUBUNGKAN KE KODE...</span>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>GABUNG KE LOBI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Return back button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToHub}
          className="text-xs font-mono text-gray-500 hover:text-amber-400 underline cursor-pointer"
        >
          ← Kembali ke Menu Utama
        </button>
      </div>
    </div>
  );
};
