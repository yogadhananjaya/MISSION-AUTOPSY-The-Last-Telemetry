import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Play } from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { sounds } from '../../utils/soundEngine';
import { getLauncherCapKg } from '../../utils/simulationEngine';
import { useTranslation } from '../../i18n';

export const MissionBriefing: React.FC = () => {
  const { setPhase, activeCase } = useMissionStore();
  const { t, language } = useTranslation();
  const mountRef = useRef<HTMLDivElement>(null);

  // Holographic 3D Satellite Pedestal Rendering (matching Image 4 Center)
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 500;
    const height = mount.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 5, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const blueHoloLight = new THREE.PointLight(0x0284c7, 3, 20);
    blueHoloLight.position.set(0, -2, 0);
    scene.add(blueHoloLight);

    // Spacecraft Group
    const satelliteGroup = new THREE.Group();

    // Central Bus Frame (White metal with solar sensors)
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.6,
    });
    const busGeo = new THREE.BoxGeometry(2.0, 2.2, 2.0);
    const bus = new THREE.Mesh(busGeo, busMat);
    satelliteGroup.add(bus);

    // Top Dish Antenna
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const dishStem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8), dishMat);
    dishStem.position.set(0, 1.4, 0);
    satelliteGroup.add(dishStem);

    const dishDish = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), dishMat);
    dishDish.position.set(0, 1.8, 0);
    dishDish.rotation.x = -Math.PI / 2;
    satelliteGroup.add(dishDish);

    // Solar Wings (matching Image 4's angled blue solar arrays)
    const solarWingMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const panelFrameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });

    // Left Wing (Dual tilted solar panel)
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-2.8, 0.2, 0);
    leftWingGroup.rotation.y = 0.2;

    const leftPanel1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 1.0), solarWingMat);
    const leftFrame1 = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.08, 1.05), panelFrameMat);
    leftWingGroup.add(leftFrame1);
    leftWingGroup.add(leftPanel1);
    satelliteGroup.add(leftWingGroup);

    // Right Wing
    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(2.8, 0.2, 0);
    rightWingGroup.rotation.y = -0.2;

    const rightPanel1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 1.0), solarWingMat);
    const rightFrame1 = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.08, 1.05), panelFrameMat);
    rightWingGroup.add(rightFrame1);
    rightWingGroup.add(rightPanel1);
    satelliteGroup.add(rightWingGroup);

    // Instrument Booms
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const boom1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), boomMat);
    boom1.position.set(0, 0.6, 1.2);
    boom1.rotation.x = 0.5;
    satelliteGroup.add(boom1);

    scene.add(satelliteGroup);

    // Hologram Floating Animation Loop
    let animationFrameId: number;
    let t = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      t += 0.015;

      satelliteGroup.rotation.y += 0.008;
      satelliteGroup.position.y = Math.sin(t) * 0.25;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleStartInvestigation = () => {
    sounds.playClick(800);
    setPhase('investigation');
  };

  return (
    <div className="relative w-full max-w-[1500px] mx-auto flex flex-col justify-between py-2 sm:py-6 space-y-6">
      
      {/* 3-Column Layout Matching Tactical Sci-Fi Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* =========================================================================
            LEFT PANEL: MISSION BRIEF (Tactical Dark Panel with Chamfered Cuts)
            ========================================================================= */}
        <div className="lg:col-span-4 bg-[#141619] border border-black text-white p-6 sm:p-7 space-y-5 clip-chamfer-md shadow-2xl relative">
          
          {/* Micro HUD technical markers */}
          <div className="absolute top-2 right-3 font-mono-tech text-[10px] text-slate-500">
            DOC.REF : BRIEF-01
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#EAB308] rotate-45" />
            <h2 className="text-sm font-bold font-mono-tech tracking-wider text-[#EAB308] uppercase">
              {language === 'en' ? 'MISSION BRIEFING : CASE-01' : 'BRIEFING MISI : KASUS-01'}
            </h2>
          </div>

          {/* Asteroid Thumbnail Preview */}
          <div className="relative border border-slate-700 bg-black aspect-video flex items-center justify-center overflow-hidden">
            {/* Rocky Asteroid Surface Visual */}
            <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
              <defs>
                <radialGradient id="asteroidShading" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
              </defs>
              <rect width="320" height="180" fill="#090B0E" />
              {/* Star dots */}
              <circle cx="40" cy="30" r="1" fill="#ffffff" opacity="0.6" />
              <circle cx="280" cy="45" r="1.5" fill="#ffffff" opacity="0.8" />
              <circle cx="250" cy="140" r="1" fill="#ffffff" opacity="0.5" />
              <circle cx="70" cy="130" r="1.2" fill="#ffffff" opacity="0.7" />
              {/* Target Crosshairs */}
              <line x1="160" y1="20" x2="160" y2="40" stroke="#EAB308" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="160" y1="140" x2="160" y2="160" stroke="#EAB308" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="40" y1="90" x2="60" y2="90" stroke="#EAB308" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="260" y1="90" x2="280" y2="90" stroke="#EAB308" strokeWidth="1" strokeDasharray="2,2" />
              {/* Asteroid Body */}
              <path 
                d="M 60 110 Q 50 60 100 45 Q 160 30 210 50 Q 260 70 250 120 Q 230 160 170 155 Q 100 165 60 110 Z" 
                fill="url(#asteroidShading)" 
                stroke="#64748b" 
                strokeWidth="1.5" 
              />
              {/* Craters */}
              <ellipse cx="120" cy="70" rx="18" ry="12" fill="#334155" stroke="#1e293b" />
              <ellipse cx="170" cy="95" rx="25" ry="16" fill="#1e293b" stroke="#0f172a" />
              <ellipse cx="90" cy="115" rx="14" ry="9" fill="#1e293b" stroke="#0f172a" />
              <ellipse cx="205" cy="65" rx="12" ry="8" fill="#334155" stroke="#1e293b" />
            </svg>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 border border-slate-700 font-mono-tech text-[10px] text-[#EAB308]">
              TARGET : {activeCase.targetObject}
            </div>
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-rose-950/80 border border-rose-600 font-mono-tech text-[9px] text-rose-300">
              {language === 'en' ? 'CARRIER LOST : T+04:20:00' : 'SINYAL PUTUS : T+04:20:00'}
            </div>
          </div>

          {/* Description text */}
          <div className="border-l-2 border-[#EAB308] pl-3 py-1">
            <div className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-widest">
              {t.briefing.incidentDossier}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans mt-0.5">
              {activeCase.incidentSummary}
            </p>
          </div>

          {/* Objective block */}
          <div className="bg-[#1C1F24] border border-slate-800 p-3.5 space-y-1">
            <div className="text-xs font-bold text-[#EAB308] font-mono-tech uppercase tracking-wide flex items-center justify-between">
              <span>{t.briefing.primaryObjective}:</span>
              <span className="text-[10px] text-emerald-400">
                {language === 'en' ? 'CLASS-A INVESTIGATION' : 'INVESTIGASI KELAS A'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {activeCase.objectiveSummary}
            </p>
          </div>
        </div>

        {/* =========================================================================
            CENTER: HOLOGRAPHIC PEDESTAL WITH 3D SATELLITE
            ========================================================================= */}
        <div className="lg:col-span-4 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px] bg-[#141619]/40 border border-black/30 p-4">
          
          {/* Top Ticker Bar */}
          <div className="absolute top-3 inset-x-4 flex items-center justify-between text-[10px] font-mono-tech text-slate-500 border-b border-black/20 pb-1">
            <span>MODEL: ASTER-9 PROBE</span>
            <span className="text-[#EAB308]">ATTITUDE: 3-AXIS GYRO STABILIZED</span>
          </div>

          {/* 3D WebGL Floating Satellite Canvas */}
          <div ref={mountRef} className="w-full h-80 sm:h-96 relative z-10 cursor-grab active:cursor-grabbing" />

          {/* Tactical Holographic Pedestal Platform Base */}
          <div className="absolute bottom-4 sm:bottom-6 w-72 sm:w-88 flex flex-col items-center pointer-events-none">
            {/* Vertical Amber/Gold Hologram Light Cone */}
            <div className="w-48 h-36 bg-gradient-to-t from-amber-500/20 via-amber-400/5 to-transparent blur-md -mb-14" />
            
            {/* Concentric Pedestal Rings */}
            <svg viewBox="0 0 240 70" className="w-full h-auto drop-shadow-[0_0_15px_#f59e0b]">
              <ellipse cx="120" cy="35" rx="110" ry="28" fill="#141619" stroke="#EAB308" strokeWidth="2" strokeDasharray="8,4" />
              <ellipse cx="120" cy="35" rx="85" ry="20" fill="#1C1F24" stroke="#F59E0B" strokeWidth="1.5" />
              <ellipse cx="120" cy="35" rx="55" ry="13" fill="#EAB308" className="animate-pulse" />
              <ellipse cx="120" cy="35" rx="30" ry="7" fill="#ffffff" />
            </svg>
          </div>

          {/* Bottom telemetry indicators */}
          <div className="absolute bottom-2 inset-x-4 flex items-center justify-between text-[9px] font-mono-tech text-slate-500">
            <span>ROT: 0.008 RAD/S</span>
            <span>MASS: {getLauncherCapKg('launch_smallsat_rideshare')} KG</span>
            <span>BUS: 28.0V NOMINAL</span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL: MISSION STATUS WITH PROGRESS BARS
            ========================================================================= */}
        <div className="lg:col-span-4 bg-[#141619] border border-black text-white p-6 sm:p-7 space-y-6 clip-chamfer-md shadow-2xl relative">
          
          <div className="absolute top-2 right-3 font-mono-tech text-[10px] text-slate-500">
            {language === 'en' ? 'SYSTEM ENVELOPE : TELEMETRY' : 'STATUS SISTEM : BATAS TELEMETRI'}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#EAB308] rotate-45" />
            <h2 className="text-sm font-bold font-mono-tech tracking-wider text-[#EAB308] uppercase">
              {language === 'en' ? 'MISSION ENVELOPE LIMITS' : 'BATAS TELEMETRI MISI'}
            </h2>
          </div>

          <div className="space-y-4 font-mono-tech text-xs">
            {/* 1. Budget: $65M */}
            <div className="space-y-1.5 bg-[#1C1F24] p-3 border border-slate-800">
              <div className="flex items-center justify-between text-white font-medium">
                <span className="text-slate-300">
                  {language === 'en' ? '01 : BUDGET CAP' : '01 : BATAS ANGGARAN'}
                </span>
                <span className="font-bold text-[#EAB308]">${activeCase.budgetCapMillion}M MAX</span>
              </div>
              <div className="w-full bg-black h-2 overflow-hidden border border-slate-700">
                <div className="bg-[#EAB308] h-full w-[70%]" />
              </div>
            </div>

            {/* 2. Mass: 140 kg */}
            <div className="space-y-1.5 bg-[#1C1F24] p-3 border border-slate-800">
              <div className="flex items-center justify-between text-white font-medium">
                <span className="text-slate-300">
                  {language === 'en' ? '02 : LAUNCH MASS CAP' : '02 : MASSA PELUNCURAN'}
                </span>
                <span className="font-bold text-cyan-400">{getLauncherCapKg('launch_smallsat_rideshare')} KG</span>
              </div>
              <div className="w-full bg-black h-2 overflow-hidden border border-slate-700">
                <div className="bg-cyan-400 h-full w-[65%]" />
              </div>
            </div>

            {/* 3. Power: 78% */}
            <div className="space-y-1.5 bg-[#1C1F24] p-3 border border-slate-800">
              <div className="flex items-center justify-between text-white font-medium">
                <span className="text-slate-300">
                  {language === 'en' ? '03 : SOLAR BUDGET' : '03 : DAYA SURYA'}
                </span>
                <span className="font-bold text-amber-400">78%</span>
              </div>
              <div className="w-full bg-black h-2 overflow-hidden border border-slate-700">
                <div className="bg-amber-400 h-full w-[78%]" />
              </div>
            </div>

            {/* 4. Fuel: 85% */}
            <div className="space-y-1.5 bg-[#1C1F24] p-3 border border-slate-800">
              <div className="flex items-center justify-between text-white font-medium">
                <span className="text-slate-300">
                  {language === 'en' ? '04 : DELTA-V PROPULSION' : '04 : PROPULSI DELTA-V'}
                </span>
                <span className="font-bold text-emerald-400">85%</span>
              </div>
              <div className="w-full bg-black h-2 overflow-hidden border border-slate-700">
                <div className="bg-emerald-400 h-full w-[85%]" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          BOTTOM RIGHT: START INVESTIGATION BUTTON (Anti-Rounded Tactical Action)
          ========================================================================= */}
      <div className="flex items-center justify-end pt-2">
        <button
          onClick={handleStartInvestigation}
          className="btn-tactical-primary px-8 sm:px-10 py-3.5 text-black font-display font-black text-sm sm:text-base tracking-wider flex items-center gap-3 cursor-pointer shadow-xl hover:scale-[1.02] transition-all"
        >
          <Play className="w-4 h-4 fill-current text-black" />
          <span>{t.briefing.startInvestigation}</span>
        </button>
      </div>

    </div>
  );
};
