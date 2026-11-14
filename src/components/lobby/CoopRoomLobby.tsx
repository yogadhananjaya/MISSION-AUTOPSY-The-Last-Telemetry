import React, { useState } from 'react';
import { 
  Users, 
  ArrowLeft, 
  Check, 
  Copy, 
  Compass, 
  Activity, 
  Wrench, 
  Radio, 
  Rocket, 
  Send,
  Sparkles,
  Volume2
} from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface CoopRoomLobbyProps {
  onBack: () => void;
  onLaunchCoopMission: (selectedRole: string) => void;
  astronautName: string;
}

interface CoopRole {
  id: string;
  code: string;
  title: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  accentBorder: string;
  duties: string[];
  exclusiveActions: string[];
  assignedPlayer: {
    name: string;
    isHost: boolean;
    ping: string;
    isReady: boolean;
    avatar: string;
  } | null;
}

export const CoopRoomLobby: React.FC<CoopRoomLobbyProps> = ({ 
  onBack, 
  onLaunchCoopMission, 
  astronautName 
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('flight_director');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; role: string; text: string; time: string }>>([
    { sender: 'Dr. Chen', role: 'DATA DETECTIVE', text: 'Telemetry beacon lock established on ASTER-9. Ready to inspect black box logs!', time: '14:02:11' },
    { sender: 'Eng. Marcus', role: 'SYSTEMS ENGINEER', text: 'CAD workbench connected. I have the battery and MLI heater specs on standby.', time: '14:02:25' },
    { sender: astronautName || 'Mister', role: 'FLIGHT DIRECTOR', text: 'Mission cap verified at $65M. Team, prepare to find the root cause.', time: '14:02:39' },
  ]);
  const [inputChat, setInputChat] = useState<string>('');
  const [playerReadyState, setPlayerReadyState] = useState<boolean>(true);

  const roomCode = 'NASA-ALPHA-26';

  const roles: CoopRole[] = [
    {
      id: 'flight_director',
      code: '01',
      title: 'FLIGHT DIRECTOR',
      sublabel: 'COMMAND & RESOURCE CONTROLLER',
      icon: Compass,
      color: 'text-[#EAB308]',
      badgeBg: 'bg-[#EAB308] text-black',
      accentBorder: 'border-[#EAB308]',
      duties: [
        'Otorisasi keputusan Go No-Go di setiap fase misi.',
        'Kendalikan alokasi anggaran total hingga batas 65 juta dollar.',
        'Tentukan profil lintasan orbit wahana penyelidik.',
        'Pimpin koordinasi komunikasi dan tetapkan prioritas tindakan kru.'
      ],
      exclusiveActions: [
        'Otorisasi Fase',
        'Persetujuan Anggaran',
        'Koreksi Lintasan'
      ],
      assignedPlayer: {
        name: `${(astronautName || 'Mister').toUpperCase()} ANDA`,
        isHost: true,
        ping: '18ms',
        isReady: playerReadyState,
        avatar: '/assets/nova/c40b7188/31_mascot.png'
      }
    },
    {
      id: 'data_detective',
      code: '02',
      title: 'DATA DETECTIVE',
      sublabel: 'FORENSIK TELEMETRI KOTAK HITAM',
      icon: Activity,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500 text-black',
      accentBorder: 'border-cyan-400',
      duties: [
        'Kendalikan pemutar linimasa telemetri kotak hitam.',
        'Deteksi anomali pada tegangan, suhu, fluks surya, dan sinyal.',
        'Sematkan bukti penting ke berkas resmi penyelidikan.',
        'Rumuskan hipotesis ilmiah akar masalah kegagalan misi.'
      ],
      exclusiveActions: [
        'Kendali Linimasa',
        'Sematkan Bukti',
        'Tentukan Hipotesis'
      ],
      assignedPlayer: {
        name: 'DR. CHEN VECTRA',
        isHost: false,
        ping: '24ms',
        isReady: true,
        avatar: '/assets/nova/c40b7188/31_mascot.png'
      }
    },
    {
      id: 'systems_engineer',
      code: '03',
      title: 'SYSTEMS ENGINEER',
      sublabel: 'SPESIALIS PERANGKAT KERAS WAHANA',
      icon: Wrench,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500 text-black',
      accentBorder: 'border-emerald-400',
      duties: [
        'Rancang ulang arsitektur wahana pada laboratorium CAD.',
        'Pilih sel surya, kapasitas baterai, dan pemanas termal.',
        'Hitung keseimbangan daya saat fase bayangan gelap.',
        'Pastikan bobot wahana tidak melampaui batas roket peluncur.'
      ],
      exclusiveActions: [
        'Ganti Komponen',
        'Keseimbangan Termal',
        'Alokasi Massa'
      ],
      assignedPlayer: {
        name: 'ENG. MARCUS FORGE',
        isHost: false,
        ping: '31ms',
        isReady: true,
        avatar: '/assets/nova/c40b7188/31_mascot.png'
      }
    }
  ];

  const handleCopyCode = () => {
    sounds.playClick(800);
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    sounds.playClick(650);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setChatMessages(prev => [
      ...prev,
      {
        sender: astronautName || 'Mister',
        role: roles.find(r => r.id === selectedRoleId)?.title || 'OPERATOR',
        text: inputChat.trim(),
        time: timeStr
      }
    ]);
    setInputChat('');
  };

  const handleQuickPing = (pingText: string) => {
    sounds.playClick(750);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setChatMessages(prev => [
      ...prev,
      {
        sender: astronautName || 'Mister',
        role: roles.find(r => r.id === selectedRoleId)?.title || 'OPERATOR',
        text: pingText,
        time: timeStr
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1013] flex flex-col overflow-hidden text-white select-none">
      
      {/* Top Tactical Room Header */}
      <header className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-3 bg-[#141619] border-b border-black">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => { sounds.playClick(600); onBack(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2329] border border-slate-700 text-xs font-mono text-[#EAB308] hover:text-white hover:border-[#EAB308] transition-colors cursor-pointer clip-chamfer-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">KEMBALI</span>
          </button>
          
          <div className="h-5 w-px bg-slate-800" />
          
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
              <h1 className="text-sm sm:text-base font-bold font-display tracking-wider uppercase text-white">
                PUSAT KENDALI OPERASI BERSAMA
              </h1>
            </div>
            <div className="text-[10px] font-mono-tech text-slate-400">
              TARGET : KASUS 01 PEMULIHAN ASTER-9
            </div>
          </div>
        </div>

        {/* Room Code & Invite Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-black border border-slate-800 text-xs font-mono-tech">
            <span className="text-slate-400">KODE RUANG :</span>
            <span className="font-bold text-[#EAB308] tracking-widest">{roomCode}</span>
            <button
              onClick={handleCopyCode}
              title="Salin Kode Undangan"
              className="ml-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#1C1F24] border border-slate-700 text-[10px] font-mono-tech text-emerald-400">
            <Radio className="w-3.5 h-3.5" />
            <span>DSN L-BAND : 18ms</span>
          </div>
        </div>
      </header>

      {/* Main Grid: 3 Role Pods (Left 8 cols) + Live Tactical Comms & Ready Check (Right 4 cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-4 sm:p-6 gap-6 blueprint-grid-dark">
        
        {/* =========================================================================
            LEFT SECTION: 3 ASYMMETRIC ROLE PODS (8 COLS)
            ========================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EAB308]" />
              <h2 className="font-display font-bold text-sm tracking-wider text-white uppercase">
                DIVISI OPERASI : PILIH PERAN ANDA
              </h2>
            </div>
            <span className="text-[10px] font-mono-tech text-slate-400">
              3 PERAN DENGAN TUGAS BERBEDA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRoleId === role.id;
              const player = role.assignedPlayer;

              return (
                <div
                  key={role.id}
                  onClick={() => {
                    sounds.playClick(750);
                    setSelectedRoleId(role.id);
                  }}
                  className={`border transition-all cursor-pointer p-4 flex flex-col justify-between clip-chamfer-md ${
                    isSelected
                      ? `bg-[#181B22] ${role.accentBorder} shadow-2xl ring-1 ring-[#EAB308]/40`
                      : 'bg-[#141619] border-black text-slate-300 hover:border-slate-700 hover:bg-[#1A1D24]'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Role Header */}
                    <div className="flex items-center justify-between">
                      <span className={`clip-slanted font-mono-tech text-[10px] font-bold px-2 py-0.5 ${role.badgeBg}`}>
                        PERAN {role.code}
                      </span>
                      <Icon className={`w-4 h-4 ${role.color}`} />
                    </div>

                    <div>
                      <h3 className="font-display font-black text-base text-white tracking-wide">
                        {role.title}
                      </h3>
                      <div className="text-[10px] font-mono-tech text-slate-400">
                        {role.sublabel}
                      </div>
                    </div>

                    {/* Assigned Player Slot Box */}
                    <div className="bg-black/80 border border-slate-800 p-2.5 space-y-1">
                      <div className="text-[9px] font-mono-tech text-slate-500 uppercase flex items-center justify-between">
                        <span>OPERATOR ASSIGNED:</span>
                        {player?.isHost && (
                          <span className="text-[#EAB308] font-bold">ROOM HOST</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="font-mono-tech text-xs font-bold text-white truncate max-w-[130px]">
                          {player ? player.name : 'SLOT KOSONG'}
                        </span>
                        {player?.isReady ? (
                          <span className="text-[9px] font-mono-tech font-bold px-1.5 py-0.2 bg-emerald-950 border border-emerald-600 text-emerald-400">
                            READY
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono-tech font-bold px-1.5 py-0.2 bg-amber-950 border border-amber-600 text-amber-400">
                            WAITING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Core Duties List */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-mono-tech text-slate-400 uppercase font-bold">
                        TANGGUNG JAWAB TEKNIS:
                      </div>
                      <ul className="space-y-1 text-[11px] font-sans text-slate-300 leading-snug">
                        {role.duties.map((duty, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#EAB308] text-[9px] shrink-0 mt-0.5">•</span>
                            <span>{duty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Exclusive Actions Box */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[9px] font-mono-tech text-slate-400 uppercase">
                      HAK AKSES EKSKLUSIF:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.exclusiveActions.map((action, idx) => (
                        <span 
                          key={idx}
                          className="text-[9px] font-mono-tech px-1.5 py-0.5 bg-[#0D0F12] border border-slate-800 text-slate-300"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* How Co-Op Works Infographic Card */}
          <div className="bg-[#141619] border border-black p-4 clip-chamfer-md space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-[#EAB308]">
              <Sparkles className="w-4 h-4" />
              <span>CARA KERJA OPERASI BERSAMA :</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Tiap pemain memiliki peran khusus. Data Detective menyelidiki telemetri. Systems Engineer merancang wahana tahan dingin. Flight Director menyetujui anggaran dan manuver. Komunikasi antarpemain menentukan keberhasilan misi.
            </p>
          </div>

        </div>

        {/* =========================================================================
            RIGHT SECTION: MISSION COMMS & READY LAUNCH (4 COLS)
            ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Tactical Chat & Audio Comms Feed */}
          <div className="bg-[#141619] border border-black p-4 clip-chamfer-md flex-1 flex flex-col justify-between space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#EAB308]" />
                <span className="font-display font-bold text-xs uppercase text-white tracking-wider">
                  KOMUNIKASI SUARA MISI
                </span>
              </div>
              <span className="text-[10px] font-mono-tech text-emerald-400">
                SUARA TERHUBUNG
              </span>
            </div>

            {/* Message Feed */}
            <div className="space-y-2.5 overflow-y-auto max-h-56 lg:max-h-80 pr-1 text-xs font-mono-tech">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="bg-black/60 border border-slate-800 p-2 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#EAB308] font-bold">{msg.sender} : {msg.role}</span>
                    <span className="text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-200 font-sans text-xs leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Tactical Pings */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[9px] font-mono-tech text-slate-400 uppercase">
                SINYAL TAKTIS CEPAT :
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono-tech">
                <button
                  type="button"
                  onClick={() => handleQuickPing('Voltase anjlok pada menit ketiga. Butuh baterai lebih besar.')}
                  className="p-1.5 bg-[#1C1F24] border border-slate-700 hover:border-[#EAB308] text-slate-300 hover:text-white text-left truncate cursor-pointer"
                >
                  ⚡ Anomali Voltase
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPing('Suhu turun drastis. Aktifkan pemanas termal sekarang.')}
                  className="p-1.5 bg-[#1C1F24] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-left truncate cursor-pointer"
                >
                  ❄️ Baterai Beku
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPing('Anggaran mencukupi. Otorisasi peluncuran disetujui.')}
                  className="p-1.5 bg-[#1C1F24] border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white text-left truncate cursor-pointer"
                >
                  ✅ Anggaran Disetujui
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPing('Semua subsistem siap. Menunggu perintah peluncuran.')}
                  className="p-1.5 bg-[#1C1F24] border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white text-left truncate cursor-pointer"
                >
                  🚀 Siap Luncur
                </button>
              </div>
            </div>

            {/* Input Chat Form */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-1">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                placeholder="Kirim pesan radio ke tim..."
                className="flex-1 bg-black border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-[#EAB308]"
              />
              <button
                type="submit"
                className="p-2 bg-[#1F2329] border border-slate-700 hover:border-[#EAB308] text-[#EAB308] hover:text-white transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Launch / Ready Action Card */}
          <div className="bg-[#141619] border border-black p-5 clip-chamfer-md space-y-3 shadow-2xl">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <span className="text-slate-400">STATUS KRU :</span>
              <span className="text-emerald-400 font-bold">3 OPERATOR SIAP</span>
            </div>

            <button
              onClick={() => {
                sounds.playClick(900);
                onLaunchCoopMission(selectedRoleId);
              }}
              className="w-full btn-tactical-primary py-3.5 text-black font-display font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-black" />
              <span>MULAI MISI BERSAMA</span>
            </button>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick(500);
                  setPlayerReadyState(!playerReadyState);
                }}
                className={`text-[10px] font-mono-tech px-3 py-1 border transition-colors cursor-pointer ${
                  playerReadyState 
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300' 
                    : 'bg-[#1C1F24] border-slate-700 text-slate-400'
                }`}
              >
                {playerReadyState ? 'STATUS : SIAP' : 'STATUS : BELUM SIAP'}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};