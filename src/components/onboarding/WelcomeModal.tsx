import React, { useState } from 'react';
import { 
  Rocket, 
  BookOpen, 
  Settings, 
  ArrowLeft, 
  PenLine, 
  ChevronRight, 
  Star,
  ShieldAlert,
  Activity,
  Compass,
  Wrench,
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { AstroMascot } from './AstroMascot';
import { sounds } from '../../utils/soundEngine';

export const WelcomeModal: React.FC = () => {
  const { 
    onboardingStep, 
    setOnboardingStep, 
    astronautName, 
    setAstronautName, 
    setIsFirstTimePlayer, 
    tutorialStep, 
    setTutorialStep, 
    startGame,
    audioEnabled,
    toggleAudio
  } = useMissionStore();

  const [inputName, setInputName] = useState(astronautName || '');
  const [nameError, setNameError] = useState('');

  const handleStartClick = () => {
    sounds.playClick(800);
    setOnboardingStep('enter_name');
  };

  const handleNameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputName.trim()) {
      sounds.playAlarm();
      setNameError('Please enter your explorer / astronaut name!');
      return;
    }
    setNameError('');
    setAstronautName(inputName.trim());
    sounds.playClick(750);
    setOnboardingStep('check_experience');
  };

  const handleExperienceSelect = (isFirstTime: boolean) => {
    setIsFirstTimePlayer(isFirstTime);
    if (isFirstTime) {
      setOnboardingStep('tutorial');
      setTutorialStep(0);
    } else {
      startGame();
    }
  };

  // Tutorial Steps guided by Nova
  const TUTORIAL_PAGES = [
    {
      title: '1 : BRIEFING INSIDEN ASTER-9',
      subtitle: 'KEGAGALAN WAHANA ANTARIKSA',
      icon: ShieldAlert,
      mascotMood: 'sad' as const,
      color: 'text-red-400',
      description: 
        'Misi hilang kontak di antariksa. Selidiki sinyal telemetri rusak dan temukan penyebabnya. Rancang ulang wahana agar selamat.',
      tip: 'Sinyal telemetri menyimpan jejak anomali.',
    },
    {
      title: '2 : STUDIO TELEMETRI KOTAK HITAM',
      subtitle: 'ANALISIS DAN SEMAT BUKTI',
      icon: Activity,
      mascotMood: 'analyzing' as const,
      color: 'text-cyan-400',
      description: 
        'Geser penanda waktu untuk memeriksa 4 kanal data telemetri. Temukan anomali daya dan suhu. Sematkan data janggal sebagai bukti forensik.',
      tip: 'Perhatikan saat wahana memasuki bayangan gerhana pada T+03:15.',
    },
    {
      title: '3 : MATRIKS AKAR MASALAH',
      subtitle: 'VERIFIKASI BUKTI ILMIAH',
      icon: Compass,
      mascotMood: 'explaining' as const,
      color: 'text-purple-400',
      description: 
        'Cocokkan bukti telemetri dengan hipotesis kegagalan. Buktikan akar masalah kepada dewan evaluasi. Dapatkan persetujuan dana rancang ulang.',
      tip: 'Diagnosis tepat membuka akses laboratorium perancangan ulang.',
    },
    {
      title: '4 : REKAYASA SISTEM WAHANA',
      subtitle: 'OPTIMASI ENAM TITIK TRADE-OFF',
      icon: Wrench,
      mascotMood: 'determined' as const,
      color: 'text-amber-400',
      description: 
        'Pasang modul baru berdaya tahan tinggi. Pantau batas anggaran 65 juta dolar dan bobot roket. Jaga keseimbangan antara massa dan daya.',
      tip: 'Baterai berat menambah massa, instrumen sains butuh daya ekstra.',
    },
    {
      title: '5 : SIMULASI PENERBANGAN 3D',
      subtitle: 'UJI KETAHANAN BAYANGAN',
      icon: Rocket,
      mascotMood: 'determined' as const,
      color: 'text-blue-400',
      description: 
        'Uji wahana melintasi bayangan gelap asteroid secara langsung. Pastikan kapasitas baterai dan pemanas bekerja optimal. Hindari pemutusan daya darurat.',
      tip: 'Putar sudut pandang wahana 3D dengan menyeret kursor mouse.',
    },
    {
      title: '6 : EVALUASI DAN SERTIFIKAT',
      subtitle: 'PENILAIAN LIMA PILAR MISI',
      icon: Trophy,
      mascotMood: 'celebrating' as const,
      color: 'text-emerald-400',
      description: 
        'Terima evaluasi berdasarkan lima pilar resmi misi. Unduh sertifikat kelulusan dalam format teks. Buktikan keberhasilan rekayasa antariksa Anda.',
      tip: 'Sistem siap dijalankan, Penjelajah.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none" style={{ background: '#090B0E' }}>
      
      {/* ================================================================
          SCREEN 1: WELCOME SCREEN (WARM TACTICAL ORANGE & WHITE)
          ================================================================ */}
      {onboardingStep === 'welcome' && (
        <div className="relative w-full h-full flex flex-col overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 30% 60%, #1c1308 0%, #120d06 45%, #080a0e 85%)' }}
        >
          {/* Subtle starfield & tactical grid */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Orange nebula aura upper right */}
            <div className="absolute -top-20 right-0 w-[700px] h-[500px]"
              style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.2) 0%, rgba(245,158,11,0.08) 45%, transparent 70%)' }} />
            {/* Amber rim upper center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
              style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 65%)' }} />
            {/* Blueprint Grid Lines */}
            <div className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Earth / Celestial limb bottom left */}
          <div className="absolute pointer-events-none"
            style={{
              bottom: '-260px', left: '-220px',
              width: '640px', height: '640px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 65% 35%, #2a1708 0%, #170e04 35%, #07090e 65%)',
              border: '2px solid rgba(249,115,22,0.6)',
              boxShadow: '0 0 80px rgba(249,115,22,0.35), inset 0 0 60px rgba(245,158,11,0.15)',
            }}
          />

          {/* HUD corner brackets (Sharp Tactical 1px Black & Orange) */}
          <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-orange-500/70 pointer-events-none" />
          <div className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-orange-500/70 pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 border-orange-500/70 pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-orange-500/70 pointer-events-none" />

          {/* Top bar: NASA logo + audio */}
          <div className="relative z-10 flex items-center justify-between px-8 pt-7">
            {/* NASA Space Apps Badge */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="48" fill="#0b3d91"/>
                  {[[28,26],[70,32],[50,16],[66,66],[34,62]].map(([x,y],i) => (
                    <circle key={i} cx={x} cy={y} r="2" fill="white"/>
                  ))}
                  <path d="M 12 52 Q 50 12 88 48 Q 62 50 38 62 Z" fill="#fc3d21"/>
                  <text x="50" y="60" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial,sans-serif" textAnchor="middle" letterSpacing="1">NASA</text>
                  <ellipse cx="50" cy="50" rx="44" ry="17" fill="none" stroke="#fc3d21" strokeWidth="2.5" transform="rotate(-28 50 50)"/>
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-black text-white tracking-widest uppercase font-mono">NASA</div>
                <div className="text-[11px] font-bold text-slate-200 tracking-widest font-mono">SPACE APPS</div>
                <div className="text-[10px] text-orange-400 font-mono tracking-widest font-bold">CHALLENGE 2026</div>
              </div>
            </div>

            {/* Audio toggle */}
            <button onClick={toggleAudio}
              className="p-2 bg-[#14171E] border border-black hover:border-orange-500 text-slate-300 hover:text-white transition-colors cursor-pointer clip-chamfer-sm"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5 text-orange-400"/> : <VolumeX className="w-5 h-5 text-slate-500"/>}
            </button>
          </div>

          {/* Center: Big Title + Tagline + START Button */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6">
            <div className="relative mb-2">
              {/* MISSION AUTOPSY - White text with Orange Halo Glow */}
              <h1 className="font-black uppercase leading-none tracking-tight font-display"
                style={{ fontSize: 'clamp(3.5rem, 9vw, 7rem)' }}>
                <span className="block text-white"
                  style={{ textShadow: '0 0 30px #f97316, 0 0 60px rgba(249,115,22,0.6), 0 0 100px rgba(234,88,12,0.3)' }}>
                  MISSION
                </span>
                <span className="block text-white -mt-2"
                  style={{ textShadow: '0 0 30px #f97316, 0 0 60px rgba(249,115,22,0.6), 0 0 100px rgba(234,88,12,0.3)' }}>
                  AUTOPSY
                </span>
              </h1>

              {/* The Last Telemetry subtitle */}
              <p className="text-orange-400 font-bold tracking-widest mt-1 uppercase font-mono"
                style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', textShadow: '0 0 20px rgba(249,115,22,0.8)' }}>
                The Last Telemetry
              </p>
            </div>

            {/* Tagline */}
            <p className="text-slate-200 font-mono tracking-wide mt-5 text-sm sm:text-base">
              Setiap Kegagalan Meninggalkan Jejak Sinyal.
            </p>

            {/* START Button: Tactical Orange with Black Outline */}
            <button onClick={handleStartClick}
              className="mt-8 flex items-center gap-3 font-display font-black tracking-widest text-black cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xl"
              style={{
                padding: '14px 48px',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f59e0b 100%)',
                boxShadow: '0 0 30px rgba(249,115,22,0.7), inset 0 1px 0 rgba(255,255,255,0.4)',
                border: '1px solid #000000',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              <Play className="w-5 h-5 fill-current"/>
              <span>MULAI</span>
            </button>
          </div>

          {/* Bottom credit bar */}
          <div className="relative z-10 flex items-center justify-between px-8 pb-7 text-xs font-mono text-slate-400 border-t border-black/40">
            <span>By <span className="text-orange-400 font-bold tracking-wider">ORBITA NOVA</span></span>
            <span className="text-slate-300 hidden sm:block">NASA SPACE APPS 2026</span>
          </div>
        </div>
      )}


      {/* ================================================================
          SCREEN 2: NOVA GREETING & NAME INPUT (ORANGE, WHITE, BLACK LINES)
          ================================================================ */}
      {onboardingStep === 'enter_name' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, #1e1308 0%, #120d06 50%, #080a0e 100%)' }}
        >
          {/* Subtle blueprint grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Settings - top right */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button onClick={toggleAudio}
              className="p-2.5 bg-[#14171E] border border-black hover:border-orange-500 text-slate-300 hover:text-white transition-colors clip-chamfer-sm cursor-pointer"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5 text-orange-400"/> : <VolumeX className="w-5 h-5 text-slate-500"/>}
            </button>
            <div className="p-2.5 bg-[#14171E] border border-black text-orange-400 clip-chamfer-sm">
              <Settings className="w-5 h-5"/>
            </div>
          </div>

          {/* Main content: Nova left + Dialog right */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full max-w-5xl px-6 md:px-10">
            
            {/* Left: Nova mascot large, floating */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-3xl"
                  style={{ background: 'rgba(249,115,22,0.2)', transform: 'scale(1.3)' }}/>
                <AstroMascot mood="happy" size="xl"/>
              </div>
            </div>

            {/* Right: Speech bubble + name input */}
            <div className="w-full max-w-md space-y-5">
              
              {/* Speech bubble panel with orange accent line */}
              <div className="relative p-6 space-y-3 bg-[#14171E] border border-black border-l-4 border-l-orange-500 shadow-2xl clip-chamfer-md"
                style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                {/* Star + Hello header */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-orange-400 text-orange-400 drop-shadow-[0_0_8px_#f97316]"/>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide font-display uppercase">
                    Halo, Penjelajah!
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                  Saya Nova, pemandu misi Anda.
                </p>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                  Mari selidiki penyebab kegagalan wahana ini bersama.
                </p>

                <div className="flex justify-end pt-1">
                  <span className="text-orange-400 font-mono text-base font-bold">&gt;&gt;</span>
                </div>
              </div>

              {/* Name input form */}
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="relative">
                  <div className="flex items-center gap-3 px-4 py-3.5 bg-[#10131A] border border-black clip-chamfer-sm"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    <PenLine className="w-5 h-5 text-orange-400 shrink-0"/>
                    <input
                      type="text"
                      value={inputName}
                      onChange={(e) => { setInputName(e.target.value); if (nameError) setNameError(''); }}
                      placeholder="Masukkan nama Anda..."
                      className="w-full bg-transparent font-mono text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none"
                      autoFocus
                    />
                    <ChevronRight className="w-5 h-5 text-orange-400/80 shrink-0"/>
                  </div>
                  {nameError && (
                    <p className="text-xs font-mono text-red-400 mt-1.5 pl-2">{nameError}</p>
                  )}
                </div>

                {/* Back link + Continue button */}
                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => setOnboardingStep('welcome')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4"/>
                    <span>KEMBALI</span>
                  </button>

                  <button type="submit"
                    className="btn-tactical-primary px-8 py-2.5 text-black font-display font-black text-sm tracking-wider cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current"/>
                    <span>LANJUT</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ================================================================
          SCREEN 3: EXPERIENCE CHECK (TACTICAL ORANGE & WHITE CARDS)
          ================================================================ */}
      {onboardingStep === 'check_experience' && (
        <div className="relative w-full h-full flex flex-col overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 25% 60%, #1e1308 0%, #120d06 50%, #080a0e 100%)' }}
        >
          {/* Subtle blueprint grid */}
          <div className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Top speech bubble */}
          <div className="relative z-10 flex justify-center px-6 pt-10 pb-4">
            <div className="max-w-xl w-full p-5 text-center bg-[#14171E] border border-black border-t-2 border-t-orange-500 clip-chamfer-md shadow-2xl">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-display uppercase tracking-wide">
                Sebelum mulai, apakah Anda sudah memahami alur investigasi?
              </h2>
            </div>
          </div>

          {/* Center: Nova left + 2 cards right */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center flex-1 gap-8 md:gap-14 px-6">
            
            {/* Nova with !! surprise marks */}
            <div className="shrink-0 relative">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-3xl"
                  style={{ background: 'rgba(249,115,22,0.18)', transform: 'scale(1.2)' }}/>
                <AstroMascot mood="surprised" size="xl" showExclamation={true}/>
              </div>
            </div>

            {/* Two choice cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-sm sm:max-w-md">
              
              {/* Card 1: Not Yet */}
              <button
                onClick={() => handleExperienceSelect(true)}
                className="cursor-pointer p-6 flex flex-col items-center text-center space-y-4 bg-[#14171E] border border-black hover:border-orange-500 transition-all hover:scale-105 clip-chamfer-md shadow-xl group"
              >
                <div className="p-3 bg-[#1C2028] border border-slate-700 group-hover:border-orange-500 rounded">
                  <BookOpen className="w-8 h-8 text-orange-400 group-hover:text-orange-200 transition-colors"/>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white font-display uppercase">BELUM PAHAM</h3>
                  <p className="text-xs text-slate-300 mt-1">Pelajari panduan dulu.</p>
                </div>
              </button>

              {/* Card 2: Yes I'm Ready */}
              <button
                onClick={() => handleExperienceSelect(false)}
                className="cursor-pointer p-6 flex flex-col items-center text-center space-y-4 bg-[#14171E] border border-orange-500/80 hover:border-orange-400 transition-all hover:scale-105 clip-chamfer-md shadow-xl group"
              >
                <div className="p-3 bg-orange-500 text-black rounded font-bold shadow-md">
                  <Rocket className="w-8 h-8 text-black"/>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-400 font-display uppercase">SUDAH SIAP</h3>
                  <p className="text-xs text-slate-300 mt-1">Langsung mulai misi.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom bar: Back button + explorer name */}
          <div className="relative z-10 flex items-center justify-between px-8 pb-8 border-t border-black/40">
            <button
              onClick={() => setOnboardingStep('enter_name')}
              className="flex items-center gap-2 font-mono font-bold text-sm text-white px-5 py-2 bg-[#14171E] border border-black hover:border-orange-500 clip-chamfer-sm transition-all hover:scale-105 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4"/>
              <span>KEMBALI</span>
            </button>

            <div className="text-xs font-mono text-slate-400">
              PENJELAJAH : <span className="text-orange-400 font-bold">{astronautName || 'PENJELAJAH'}</span>
            </div>
          </div>
        </div>
      )}


      {/* ================================================================
          SCREEN 4: NOVA'S INTERACTIVE TUTORIAL (ORANGE & WHITE THEME)
          ================================================================ */}
      {onboardingStep === 'tutorial' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-4"
          style={{ background: 'radial-gradient(ellipse at 25% 50%, #1c1308 0%, #120d06 55%, #080a0e 100%)' }}
        >
          {/* Subtle blueprint grid */}
          <div className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          
          <div className="relative z-10 max-w-3xl w-full p-6 md:p-8 space-y-6 mx-4 bg-[#14171E] border border-black clip-chamfer-md shadow-2xl"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Top: Progress badge + Skip */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="font-mono text-[11px] uppercase px-3 py-1 font-bold bg-orange-500/15 text-orange-400 border border-orange-500/40 clip-chamfer-sm">
                PANDUAN NOVA : LANGKAH {tutorialStep + 1} DARI {TUTORIAL_PAGES.length}
              </span>
              <button onClick={() => startGame()}
                className="text-xs font-mono text-slate-400 hover:text-orange-300 underline transition-colors cursor-pointer"
              >
                LEWATI PANDUAN
              </button>
            </div>

            {/* Tutorial content */}
            {(() => {
              const page = TUTORIAL_PAGES[tutorialStep];
              const Icon = page.icon;
              return (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="shrink-0 flex flex-col items-center">
                      <AstroMascot mood={page.mascotMood} size="md"/>
                      <span className="font-mono text-xs text-orange-400 font-bold mt-1">NOVA</span>
                    </div>

                    <div className="space-y-3 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2.5">
                        <Icon className="w-6 h-6 text-orange-400"/>
                        <h3 className="font-bold text-xl text-white font-display uppercase">{page.title}</h3>
                      </div>
                      <p className="font-mono text-xs text-orange-300 font-semibold tracking-wide">{page.subtitle}</p>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">{page.description}</p>
                      <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 flex items-start gap-2.5 clip-chamfer-sm">
                        <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5"/>
                        <span className="text-xs font-mono text-orange-200"><strong>Petunjuk Nova :</strong> {page.tip}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dot indicators */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {TUTORIAL_PAGES.map((_, idx) => (
                      <button key={idx} onClick={() => setTutorialStep(idx)}
                        className={`h-2 transition-all cursor-pointer ${
                          idx === tutorialStep ? 'w-8 bg-orange-400 shadow-sm shadow-orange-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Footer nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => { tutorialStep > 0 ? setTutorialStep(tutorialStep - 1) : setOnboardingStep('check_experience'); }}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4"/>
                <span>{tutorialStep === 0 ? 'PILIHAN AWAL' : 'KEMBALI'}</span>
              </button>

              {tutorialStep < TUTORIAL_PAGES.length - 1 ? (
                <button onClick={() => setTutorialStep(tutorialStep + 1)}
                  className="btn-tactical-primary px-6 py-2.5 text-black font-display font-black text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
                >
                  <span>LANGKAH BERIKUTNYA</span>
                  <ChevronRight className="w-4 h-4"/>
                </button>
              ) : (
                <button onClick={() => startGame()}
                  className="btn-tactical-primary px-7 py-2.5 text-black font-display font-black text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
                >
                  <Rocket className="w-4 h-4"/>
                  <span>MULAI MISI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
