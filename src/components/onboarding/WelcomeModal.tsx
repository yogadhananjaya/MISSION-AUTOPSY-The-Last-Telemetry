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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none" style={{ background: '#030816' }}>
      
      {/* ================================================================
          SCREEN 1: WELCOME SCREEN  //  matching mockup image 1
          Deep space bg, NASA logo top-left, big neon title center,
          satellite top-right, Earth limb bottom-left, START button
          ================================================================ */}
      {onboardingStep === 'welcome' && (
        <div className="relative w-full h-full flex flex-col overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 30% 60%, #0a1f4a 0%, #05112a 40%, #030816 80%)' }}
        >
          {/* Deep space starfield  //  many fine dots */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Blue nebula cloud upper right */}
            <div className="absolute -top-20 right-0 w-[700px] h-[500px]"
              style={{ background: 'radial-gradient(ellipse, rgba(29,78,216,0.35) 0%, rgba(14,165,233,0.12) 45%, transparent 70%)' }} />
            {/* Cyan rim upper center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
              style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.15) 0%, transparent 65%)' }} />
            {/* Fine starfield SVG */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {[
                [8,6],[14,22],[22,8],[30,15],[38,5],[45,25],[52,12],[60,20],[68,8],[75,18],
                [82,10],[88,25],[93,14],[96,30],[4,40],[12,48],[20,35],[28,52],[36,42],[44,38],
                [50,55],[58,45],[66,50],[74,36],[80,48],[85,38],[90,55],[3,65],[10,72],[18,60],
                [26,78],[34,65],[40,72],[48,68],[55,80],[63,70],[70,76],[78,62],[84,70],[91,65],
                [5,85],[13,90],[21,82],[29,88],[37,80],[44,92],[51,86],[59,80],[67,90],[73,84],
                [80,88],[87,78],[94,85],[16,55],[48,42],[72,28],[90,42],[33,30],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={i % 5 === 0 ? 1.5 : i % 3 === 0 ? 1.2 : 0.8}
                  fill={i % 7 === 0 ? '#38bdf8' : i % 4 === 0 ? '#93c5fd' : '#ffffff'}
                  opacity={0.4 + (i % 6) * 0.1}
                />
              ))}
            </svg>
          </div>

          {/* Earth limb  //  bottom left large glowing arc */}
          <div className="absolute pointer-events-none"
            style={{
              bottom: '-260px', left: '-220px',
              width: '640px', height: '640px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 65% 35%, #1e4db7 0%, #0d2f7a 35%, #040e2b 65%)',
              border: '3px solid rgba(56,189,248,0.75)',
              boxShadow: '0 0 80px rgba(56,189,248,0.4), inset 0 0 60px rgba(14,165,233,0.15)',
            }}
          >
            {/* Atmosphere glow rim */}
            <div className="absolute inset-0 rounded-full"
              style={{ boxShadow: 'inset 0 0 40px rgba(56,189,248,0.3), 0 0 120px rgba(56,189,248,0.3)' }} />
            {/* Cloud wisps */}
            <div className="absolute rounded-full blur-xl opacity-30"
              style={{ top:'18%', right:'12%', width:'55%', height:'30%', background:'white', transform:'rotate(25deg)' }} />
            <div className="absolute rounded-full blur-lg opacity-20"
              style={{ top:'50%', left:'20%', width:'35%', height:'18%', background:'white', transform:'rotate(-10deg)' }} />
          </div>

          {/* Satellite / spacecraft illustration  //  top right */}
          <div className="absolute pointer-events-none"
            style={{ top: '40px', right: '60px', width: '240px', height: '210px', opacity: 0.9 }}
          >
            <svg viewBox="0 0 240 210" className="w-full h-full drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]">
              {/* Body */}
              <rect x="96" y="80" width="48" height="48" rx="4" fill="#c8d6e5" stroke="#38bdf8" strokeWidth="2"/>
              <rect x="100" y="84" width="20" height="20" rx="2" fill="#b0bec5" opacity="0.6"/>
              {/* Dish */}
              <ellipse cx="120" cy="68" rx="16" ry="6" fill="#ecf0f1" stroke="#78909c" strokeWidth="1.5"/>
              <line x1="120" y1="68" x2="120" y2="80" stroke="#90a4ae" strokeWidth="2"/>
              {/* Left solar panel arm */}
              <line x1="96" y1="104" x2="40" y2="104" stroke="#78909c" strokeWidth="3"/>
              <rect x="12" y="90" width="58" height="28" rx="3" fill="#1565c0" stroke="#38bdf8" strokeWidth="1.5"/>
              <line x1="30" y1="90" x2="30" y2="118" stroke="#42a5f5" strokeWidth="1"/>
              <line x1="48" y1="90" x2="48" y2="118" stroke="#42a5f5" strokeWidth="1"/>
              <line x1="66" y1="90" x2="66" y2="118" stroke="#42a5f5" strokeWidth="1"/>
              {/* Right solar panel arm */}
              <line x1="144" y1="104" x2="200" y2="104" stroke="#78909c" strokeWidth="3"/>
              <rect x="170" y="90" width="58" height="28" rx="3" fill="#1565c0" stroke="#38bdf8" strokeWidth="1.5"/>
              <line x1="188" y1="90" x2="188" y2="118" stroke="#42a5f5" strokeWidth="1"/>
              <line x1="206" y1="90" x2="206" y2="118" stroke="#42a5f5" strokeWidth="1"/>
              <line x1="224" y1="90" x2="224" y2="118" stroke="#42a5f5" strokeWidth="1"/>
              {/* Glow halo below */}
              <ellipse cx="120" cy="150" rx="60" ry="10" fill="rgba(56,189,248,0.2)"/>
              {/* Signal lines */}
              <line x1="120" y1="62" x2="100" y2="20" stroke="#38bdf8" strokeWidth="0.8" opacity="0.5" strokeDasharray="4,3"/>
              <line x1="120" y1="62" x2="140" y2="20" stroke="#38bdf8" strokeWidth="0.8" opacity="0.5" strokeDasharray="4,3"/>
            </svg>
          </div>

          {/* HUD corner brackets */}
          <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg pointer-events-none" />

          {/* Top bar: NASA logo + audio */}
          <div className="relative z-10 flex items-center justify-between px-8 pt-7">
            {/* NASA Space Apps Badge */}
            <div className="flex items-center gap-3">
              {/* NASA meatball */}
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="48" fill="#0b3d91"/>
                  {/* Stars */}
                  {[[28,26],[70,32],[50,16],[66,66],[34,62]].map(([x,y],i) => (
                    <circle key={i} cx={x} cy={y} r="2" fill="white"/>
                  ))}
                  {/* Red chevron / swoosh */}
                  <path d="M 12 52 Q 50 12 88 48 Q 62 50 38 62 Z" fill="#fc3d21"/>
                  {/* NASA text */}
                  <text x="50" y="60" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial,sans-serif" textAnchor="middle" letterSpacing="1">NASA</text>
                  {/* Orbit ellipse */}
                  <ellipse cx="50" cy="50" rx="44" ry="17" fill="none" stroke="#fc3d21" strokeWidth="2.5" transform="rotate(-28 50 50)"/>
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-black text-white tracking-widest uppercase font-mono">NASA</div>
                <div className="text-[11px] font-bold text-slate-200 tracking-widest font-mono">SPACE APPS</div>
                <div className="text-[10px] text-cyan-400 font-mono tracking-widest">CHALLENGE 2026</div>
              </div>
            </div>

            {/* Audio toggle */}
            <button onClick={toggleAudio}
              className="p-2 rounded-lg border border-cyan-500/40 bg-slate-900/60 text-slate-300 hover:text-white transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5 text-cyan-400"/> : <VolumeX className="w-5 h-5 text-slate-500"/>}
            </button>
          </div>

          {/* Center  //  Big title + tagline + START */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6">
            {/* Title group */}
            <div className="relative mb-2">
              {/* Rocket icon + orbit trail top-right of title */}
              <div className="absolute -top-10 -right-6 opacity-90">
                <svg viewBox="0 0 70 70" width="60" height="60">
                  <ellipse cx="20" cy="48" rx="52" ry="17" fill="none" stroke="#38bdf8" strokeWidth="2.5"
                    transform="rotate(-22 20 48)" strokeDasharray="150" strokeDashoffset="20" opacity="0.8"/>
                  <path d="M 50 12 Q 68 7 68 26 Q 55 30 44 42 Z" fill="white" stroke="#38bdf8" strokeWidth="1.5"/>
                  <polygon points="43,41 35,48 40,36" fill="#38bdf8"/>
                  <polygon points="54,22 60,14 50,20" fill="#38bdf8"/>
                  <path d="M 42 44 Q 34 56 38 48 Z" fill="#38bdf8"/>
                </svg>
              </div>

              {/* MISSION AUTOPSY  //  large glowing text */}
              <h1 className="font-black uppercase leading-none tracking-tight font-sans"
                style={{ fontSize: 'clamp(3.5rem, 9vw, 7rem)' }}>
                <span className="block text-white"
                  style={{ textShadow: '0 0 30px #38bdf8, 0 0 60px rgba(56,189,248,0.5), 0 0 100px rgba(56,189,248,0.25)' }}>
                  MISSION
                </span>
                <span className="block text-white -mt-2"
                  style={{ textShadow: '0 0 30px #38bdf8, 0 0 60px rgba(56,189,248,0.5), 0 0 100px rgba(56,189,248,0.25)' }}>
                  AUTOPSY
                </span>
              </h1>

              {/* The Last Telemetry subtitle */}
              <p className="text-cyan-300 font-medium italic tracking-wide mt-1"
                style={{ fontSize: 'clamp(1.1rem, 3vw, 1.75rem)', textShadow: '0 0 20px rgba(14,165,233,0.8)' }}>
                The Last Telemetry
              </p>
            </div>

            {/* Tagline */}
            <p className="text-slate-200 font-mono tracking-wide mt-5"
              style={{ fontSize: 'clamp(0.8rem, 1.8vw, 1rem)' }}>
              Setiap Kegagalan Meninggalkan Jejak Sinyal.
            </p>

            {/* START Button  //  glowing pill */}
            <button onClick={handleStartClick}
              className="mt-8 flex items-center gap-3 font-mono font-bold tracking-widest text-white cursor-pointer transition-all hover:scale-105 active:scale-95"
              style={{
                padding: '14px 44px',
                borderRadius: '50px',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #1d6fdb 0%, #0ea5e9 50%, #2563eb 100%)',
                boxShadow: '0 0 25px rgba(14,165,233,0.6), 0 0 50px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1px solid rgba(56,189,248,0.6)',
              }}
            >
              <Play className="w-5 h-5 fill-current"/>
              <span>MULAI</span>
            </button>
          </div>

          {/* Bottom credit bar */}
          <div className="relative z-10 flex items-center justify-between px-8 pb-7 text-xs font-mono text-slate-400">
            <span>By <span className="text-slate-200 font-semibold tracking-wider">ORBITA NOVA</span></span>
            <span className="text-cyan-400/60 hidden sm:block">NASA SPACE APPS 2026</span>
          </div>
        </div>
      )}


      {/* ================================================================
          SCREEN 2: NOVA GREETING & NAME INPUT  //  matching mockup image 2
          Dark cockpit bg, Nova robot large left, speech bubble + input right
          ================================================================ */}
      {onboardingStep === 'enter_name' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, #061535 0%, #030c22 50%, #020816 100%)' }}
        >
          {/* Cockpit panel decorations  //  left and right bulkheads */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10 telemetry-grid"/>
            {/* Left metallic frame */}
            <div className="absolute inset-y-0 left-0 w-28 sm:w-40"
              style={{ background: 'linear-gradient(to right, #020a1e, #041230, transparent)', borderRight: '1px solid rgba(56,189,248,0.1)' }}/>
            {/* Right metallic frame */}
            <div className="absolute inset-y-0 right-0 w-28 sm:w-40"
              style={{ background: 'linear-gradient(to left, #020a1e, #041230, transparent)', borderLeft: '1px solid rgba(56,189,248,0.1)' }}/>
            {/* Blue backlight glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[150px]"
              style={{ background: 'rgba(14,165,233,0.08)' }}/>
            {/* Stars */}
            <svg className="absolute inset-0 w-full h-full opacity-50">
              {[[10,8],[22,18],[35,6],[48,22],[62,10],[75,25],[88,8],[92,30],[5,45],[18,38],[30,50],[45,42],[58,55],[70,40],[82,52],[95,45],[8,70],[20,62],[33,75],[47,68],[60,80],[72,70],[85,65],[92,78]].map(([x,y],i)=>(
                <circle key={i} cx={`${x}%`} cy={`${y}%`} r={i%4===0?1.2:0.7} fill={i%5===0?'#38bdf8':'white'} opacity={0.3+i%4*0.1}/>
              ))}
            </svg>
            {/* Top viewport frame arc */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 opacity-20"
              style={{ borderBottom: '1px solid rgba(56,189,248,0.3)', borderRadius: '0 0 50% 50%' }}/>
          </div>

          {/* Settings gear - top right */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button onClick={toggleAudio}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white transition-colors"
              style={{ background: 'rgba(7,20,50,0.8)', border: '1px solid rgba(56,189,248,0.3)' }}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5 text-cyan-400"/> : <VolumeX className="w-5 h-5 text-slate-500"/>}
            </button>
            <div className="p-2.5 rounded-xl"
              style={{ background: 'rgba(7,20,50,0.8)', border: '1px solid rgba(56,189,248,0.3)' }}>
              <Settings className="w-5 h-5 text-cyan-400"/>
            </div>
          </div>

          {/* Main content: Nova left + Dialog right */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full max-w-5xl px-6 md:px-10">
            
            {/* Left  //  Nova mascot large, floating */}
            <div className="shrink-0 flex flex-col items-center">
              {/* Glow behind Nova */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-3xl"
                  style={{ background: 'rgba(56,189,248,0.15)', transform: 'scale(1.3)' }}/>
                <AstroMascot mood="happy" size="xl"/>
              </div>
              {/* Sparkle particles */}
              <div className="absolute pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 300 300" className="animate-spin" style={{ animationDuration:'20s' }}>
                  <circle cx="150" cy="30" r="3" fill="#38bdf8" opacity="0.7"/>
                  <circle cx="270" cy="150" r="2" fill="white" opacity="0.5"/>
                  <circle cx="80" cy="240" r="2.5" fill="#38bdf8" opacity="0.6"/>
                </svg>
              </div>
            </div>

            {/* Right  //  Speech bubble + name input */}
            <div className="w-full max-w-md space-y-5">
              
              {/* Speech bubble panel */}
              <div className="relative rounded-2xl p-6 space-y-3"
                style={{
                  background: 'rgba(5,18,50,0.85)',
                  border: '1px solid rgba(56,189,248,0.4)',
                  boxShadow: '0 0 30px rgba(56,189,248,0.1), inset 0 1px 0 rgba(56,189,248,0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Speech bubble pointer arrow  //  left side */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-0 h-0"
                  style={{
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderRight: '12px solid rgba(56,189,248,0.4)',
                  }}/>
                
                {/* Star + Hello header */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_#f59e0b]"/>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide font-sans">
                    Halo, Penjelajah!
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                  Saya Nova, pemandu misi Anda.
                </p>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                  Mari selidiki penyebab kegagalan wahana ini bersama.
                </p>

                {/* >> chevron bottom right */}
                <div className="flex justify-end pt-1">
                  <span className="text-cyan-400 font-mono text-base font-bold">&gt;&gt;</span>
                </div>
              </div>

              {/* Name input form */}
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="relative">
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                    style={{
                      background: 'rgba(5,18,50,0.7)',
                      border: '1px solid rgba(56,189,248,0.4)',
                      boxShadow: 'inset 0 1px 0 rgba(56,189,248,0.1)',
                    }}
                  >
                    <PenLine className="w-5 h-5 text-cyan-400 shrink-0"/>
                    <input
                      type="text"
                      value={inputName}
                      onChange={(e) => { setInputName(e.target.value); if (nameError) setNameError(''); }}
                      placeholder="Masukkan nama Anda..."
                      className="w-full bg-transparent font-mono text-sm sm:text-base text-cyan-300 placeholder:text-slate-500 focus:outline-none"
                      autoFocus
                    />
                    <ChevronRight className="w-5 h-5 text-cyan-400/80 shrink-0"/>
                  </div>
                  {nameError && (
                    <p className="text-xs font-mono text-red-400 mt-1.5 pl-2">{nameError}</p>
                  )}
                </div>

                {/* Back link + Continue button */}
                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => setOnboardingStep('welcome')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4"/>
                    <span>KEMBALI</span>
                  </button>

                  <button type="submit"
                    className="flex items-center gap-2 font-mono font-bold text-sm text-white tracking-wider cursor-pointer transition-all hover:scale-105 active:scale-95"
                    style={{
                      padding: '10px 28px',
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #1d6fdb 0%, #0ea5e9 100%)',
                      boxShadow: '0 0 20px rgba(14,165,233,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
                      border: '1px solid rgba(56,189,248,0.5)',
                    }}
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
          SCREEN 3: EXPERIENCE CHECK  //  matching mockup image 3
          Nova left with !! marks, speech bubble top, 2 choice cards, back btn
          ================================================================ */}
      {onboardingStep === 'check_experience' && (
        <div className="relative w-full h-full flex flex-col overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 25% 60%, #061535 0%, #030c22 50%, #020816 100%)' }}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-10 telemetry-grid"/>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[150px]"
              style={{ background: 'rgba(14,165,233,0.07)' }}/>
            {/* Hologram platform floor glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-16 rounded-full blur-2xl"
              style={{ background: 'rgba(56,189,248,0.12)' }}/>
            {/* Stage platform ring */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-80 h-6 rounded-full"
              style={{ border: '1px solid rgba(56,189,248,0.2)', background: 'rgba(14,165,233,0.05)' }}/>
          </div>

          {/* Top speech bubble  //  full width centered */}
          <div className="relative z-10 flex justify-center px-6 pt-10 pb-4">
            <div className="max-w-xl w-full rounded-2xl px-6 py-5 text-center"
              style={{
                background: 'rgba(5,18,50,0.85)',
                border: '1px solid rgba(56,189,248,0.4)',
                boxShadow: '0 0 30px rgba(56,189,248,0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-sans tracking-wide">
                Sebelum mulai, apakah Anda sudah memahami alur investigasi?
              </h2>
              {/* Speech bubble tail pointing down */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0"
                style={{
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderTop: '12px solid rgba(56,189,248,0.4)',
                }}/>
            </div>
          </div>

          {/* Center  //  Nova left + 2 cards right */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center flex-1 gap-8 md:gap-14 px-6">
            
            {/* Nova with !! surprise marks */}
            <div className="shrink-0 relative">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-3xl"
                  style={{ background: 'rgba(56,189,248,0.12)', transform: 'scale(1.2)' }}/>
                <AstroMascot mood="surprised" size="xl" showExclamation={true}/>
              </div>
            </div>

            {/* Two choice cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-sm sm:max-w-md">
              
              {/* Card 1: Not Yet */}
              <button
                onClick={() => handleExperienceSelect(true)}
                className="cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center space-y-4 transition-all hover:scale-105 group"
                style={{
                  background: 'rgba(5,18,50,0.7)',
                  border: '1.5px solid rgba(56,189,248,0.5)',
                  boxShadow: '0 0 20px rgba(56,189,248,0.1)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(56,189,248,0.3)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.9)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(56,189,248,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.5)'; }}
              >
                <div className="p-3 rounded-xl"
                  style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(56,189,248,0.4)' }}>
                  <BookOpen className="w-9 h-9 text-cyan-400 group-hover:text-cyan-200 transition-colors"/>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white font-sans">BELUM PAHAM</h3>
                  <p className="text-xs text-slate-300 mt-1">Pelajari panduan dulu.</p>
                </div>
              </button>

              {/* Card 2: Yes I'm Ready */}
              <button
                onClick={() => handleExperienceSelect(false)}
                className="cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center space-y-4 transition-all hover:scale-105 group"
                style={{
                  background: 'rgba(15,5,40,0.7)',
                  border: '1.5px solid rgba(168,85,247,0.55)',
                  boxShadow: '0 0 20px rgba(168,85,247,0.1)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(168,85,247,0.3)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.9)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(168,85,247,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.55)'; }}
              >
                <div className="p-3 rounded-xl"
                  style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)' }}>
                  <Rocket className="w-9 h-9 text-purple-400 group-hover:text-purple-200 transition-colors"/>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white font-sans">SUDAH SIAP</h3>
                  <p className="text-xs text-slate-300 mt-1">Langsung mulai misi.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom bar: Back button + explorer name */}
          <div className="relative z-10 flex items-center justify-between px-8 pb-8">
            <button
              onClick={() => setOnboardingStep('enter_name')}
              className="flex items-center gap-2 font-mono font-bold text-sm text-white cursor-pointer transition-all hover:scale-105"
              style={{
                padding: '10px 22px',
                borderRadius: '50px',
                background: 'rgba(5,18,50,0.8)',
                border: '1px solid rgba(56,189,248,0.4)',
                boxShadow: '0 0 15px rgba(56,189,248,0.1)',
              }}
            >
              <ArrowLeft className="w-4 h-4"/>
              <span>KEMBALI</span>
            </button>

            <div className="text-xs font-mono text-slate-400">
              PENJELAJAH : <span className="text-cyan-400 font-bold">{astronautName || 'PENJELAJAH'}</span>
            </div>
          </div>
        </div>
      )}


      {/* ================================================================
          SCREEN 4: NOVA'S INTERACTIVE TUTORIAL
          ================================================================ */}
      {onboardingStep === 'tutorial' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-4"
          style={{ background: 'radial-gradient(ellipse at 25% 50%, #061535 0%, #030c22 55%, #020816 100%)' }}
        >
          <div className="absolute inset-0 opacity-10 telemetry-grid pointer-events-none"/>
          
          <div className="relative z-10 max-w-3xl w-full rounded-3xl p-6 md:p-8 space-y-6 mx-4"
            style={{
              background: 'rgba(5,15,40,0.9)',
              border: '1px solid rgba(56,189,248,0.3)',
              boxShadow: '0 0 60px rgba(56,189,248,0.1), inset 0 1px 0 rgba(56,189,248,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Top: Progress badge + Skip */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <span className="font-mono text-[11px] uppercase px-3 py-1 rounded-full font-bold"
                style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}>
                PANDUAN NOVA : LANGKAH {tutorialStep + 1} DARI {TUTORIAL_PAGES.length}
              </span>
              <button onClick={() => startGame()}
                className="text-xs font-mono text-slate-400 hover:text-cyan-300 underline transition-colors"
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
                      <span className="font-mono text-xs text-cyan-400 font-bold mt-1">NOVA</span>
                    </div>

                    <div className="space-y-3 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2.5">
                        <Icon className={`w-6 h-6 ${page.color}`}/>
                        <h3 className="font-bold text-xl text-white font-sans">{page.title}</h3>
                      </div>
                      <p className="font-mono text-xs text-cyan-400 font-semibold tracking-wide">{page.subtitle}</p>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">{page.description}</p>
                      <div className="p-3.5 rounded-xl flex items-start gap-2.5"
                        style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(56,189,248,0.3)' }}>
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"/>
                        <span className="text-xs font-mono text-cyan-200"><strong>Petunjuk Nova :</strong> {page.tip}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dot indicators */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {TUTORIAL_PAGES.map((_, idx) => (
                      <button key={idx} onClick={() => setTutorialStep(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === tutorialStep ? 'w-8 bg-cyan-400 shadow-sm shadow-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Footer nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => { tutorialStep > 0 ? setTutorialStep(tutorialStep - 1) : setOnboardingStep('check_experience'); }}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4"/>
                <span>{tutorialStep === 0 ? 'PILIHAN AWAL' : 'KEMBALI'}</span>
              </button>

              {tutorialStep < TUTORIAL_PAGES.length - 1 ? (
                <button onClick={() => setTutorialStep(tutorialStep + 1)}
                  className="flex items-center gap-2 font-mono font-bold text-xs text-white cursor-pointer hover:scale-105 transition-all"
                  style={{
                    padding: '10px 22px', borderRadius: '50px',
                    background: 'linear-gradient(135deg, #1d6fdb 0%, #0ea5e9 100%)',
                    boxShadow: '0 0 15px rgba(14,165,233,0.4)',
                    border: '1px solid rgba(56,189,248,0.5)',
                  }}
                >
                  <span>LANGKAH BERIKUTNYA</span>
                  <ChevronRight className="w-4 h-4"/>
                </button>
              ) : (
                <button onClick={() => startGame()}
                  className="flex items-center gap-2 font-mono font-bold text-xs text-white cursor-pointer hover:scale-105 transition-all"
                  style={{
                    padding: '10px 24px', borderRadius: '50px',
                    background: 'linear-gradient(135deg, #1d6fdb 0%, #0ea5e9 100%)',
                    boxShadow: '0 0 25px rgba(14,165,233,0.5)',
                    border: '1px solid rgba(56,189,248,0.5)',
                  }}
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
