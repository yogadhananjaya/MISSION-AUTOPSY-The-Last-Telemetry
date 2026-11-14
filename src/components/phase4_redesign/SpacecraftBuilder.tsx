import React, { useState } from 'react';
import { 
  BatteryCharging, 
  Zap, 
  Thermometer, 
  Radio, 
  Compass, 
  Rocket, 
  Orbit, 
  DollarSign, 
  Scale, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Activity, 
  Layers, 
  Info 
} from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { SPACECRAFT_COMPONENTS } from '../../data/components';
import type { ComponentCategory, SpacecraftComponent } from '../../types/mission';
import { sounds } from '../../utils/soundEngine';
import { SpacecraftXRayInspector } from './SpacecraftXRayInspector';

export const SpacecraftBuilder: React.FC = () => {
  const { 
    redesignConfig, 
    updateRedesignComponent, 
    activeCase, 
    setPhase, 
    startSimulation, 
    simulationRunning, 
    guidedMode 
  } = useMissionStore();

  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('power_generation');

  // Categories config
  const categories: { id: ComponentCategory; label: string; icon: React.ElementType }[] = [
    { id: 'power_generation', label: '01 : Pembangkit Daya', icon: Zap },
    { id: 'energy_storage', label: '02 : Baterai Energi', icon: BatteryCharging },
    { id: 'thermal_control', label: '03 : Proteksi Termal', icon: Thermometer },
    { id: 'payload', label: '04 : Instrumen Sains', icon: Activity },
    { id: 'communications', label: '05 : Telekomunikasi', icon: Radio },
    { id: 'adcs', label: '06 : Navigasi ADCS', icon: Compass },
    { id: 'launch_vehicle', label: '07 : Roket Peluncur', icon: Rocket },
    { id: 'orbit_profile', label: '08 : Profil Orbit', icon: Orbit },
  ];

  // Helper to get component
  const getComp = (id: string) => SPACECRAFT_COMPONENTS.find((c) => c.id === id);

  const solarComp = getComp(redesignConfig.solar);
  const batteryComp = getComp(redesignConfig.battery);
  const thermalComp = getComp(redesignConfig.thermal);
  const commsComp = getComp(redesignConfig.comms);
  const adcsComp = getComp(redesignConfig.adcs);
  const launcherComp = getComp(redesignConfig.launcher);
  const orbitComp = getComp(redesignConfig.orbit);
  const payloadComps = redesignConfig.payloads.map(getComp).filter(Boolean) as SpacecraftComponent[];

  // Calculate live engineering metrics
  const dryBusMassKg = 35;
  const allComps = [
    solarComp,
    batteryComp,
    thermalComp,
    commsComp,
    adcsComp,
    launcherComp,
    orbitComp,
    ...payloadComps,
  ].filter(Boolean) as SpacecraftComponent[];

  const totalMassKg = dryBusMassKg + allComps.reduce((acc, c) => acc + c.massKg, 0);
  const totalCostMillion = allComps.reduce((acc, c) => acc + c.costMillion, 0);

  const maxLauncherMass = redesignConfig.launcher === 'launch_smallsat_rideshare' ? 140 : 350;
  const isOverMass = totalMassKg > maxLauncherMass;
  const isOverBudget = totalCostMillion > activeCase.budgetCapMillion;

  // Power math
  const powerGenW = solarComp?.powerGenerationW || 160;
  const adcsW = adcsComp?.powerConsumptionW || 25;
  const commsW = commsComp?.powerConsumptionW || 50;
  const thermalW = thermalComp?.heaterPowerW || 0;
  const payloadW = payloadComps.reduce((acc, p) => acc + (p?.powerConsumptionW || 0), 0);
  const totalPowerDrawW = 20 + adcsW + commsW + thermalW + payloadW;
  const netPowerSunlit = powerGenW - totalPowerDrawW;

  // Eclipse math
  let eclipseMinutes = 75;
  if (redesignConfig.orbit === 'orbit_low_terminator') eclipseMinutes = 15;
  if (redesignConfig.orbit === 'orbit_distant_quasi') eclipseMinutes = 0;

  const eclipseEnergyRequiredWh = (totalPowerDrawW * (eclipseMinutes / 60));
  const nominalBatteryWh = batteryComp?.energyCapacityWh || 400;

  // Thermal derating check
  let isBatteryAtRisk = false;
  if (redesignConfig.thermal === 'thermal_passive_minimal' && eclipseMinutes > 30) {
    isBatteryAtRisk = true;
  }

  // Laser comms check
  const isLaserIncompatible = 
    redesignConfig.comms === 'comms_optical_laser' && 
    redesignConfig.adcs !== 'adcs_star_tracker_cmas';

  // Toggle payload items (multi-select)
  const handlePayloadToggle = (id: string) => {
    sounds.playClick(750);
    const current = redesignConfig.payloads;
    if (current.includes(id)) {
      if (current.length > 1) {
        updateRedesignComponent('payloads', current.filter((p) => p !== id));
      }
    } else {
      updateRedesignComponent('payloads', [...current, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141619] border border-black text-white p-5 clip-chamfer-md shadow-2xl relative">
        <div className="absolute top-2 right-4 font-mono-tech text-[10px] text-slate-500">
          SYS.CAD : REKAYASA ASTER-9 MK2
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="clip-slanted font-mono-tech text-[10px] uppercase px-2 py-0.5 bg-[#EAB308] text-black font-bold">
              FASE 04 : REKAYASA SISTEM
            </span>
            <span className="text-[11px] text-slate-400 font-mono-tech">
              LAB PERANCANGAN ULANG
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-wide text-white mt-1">
            ARSITEKTUR PERANCANGAN ULANG ASTER-9 MARK II
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Seimbangkan massa, daya surya, kapasitas anggaran, transmisi data, dan margin termal wahana.
          </p>
        </div>

        {/* Real-time Status Badges */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 border font-mono-tech text-xs flex items-center gap-2 ${
            isOverMass ? 'bg-red-950/80 border-red-600 text-red-300 animate-pulse' : 'bg-black border-slate-800 text-slate-300'
          }`}>
            <Scale className="w-4 h-4 text-[#EAB308]" />
            <span>MASSA: <strong className="text-white">{totalMassKg.toFixed(1)} / {maxLauncherMass} kg</strong></span>
          </div>

          <div className={`p-2.5 border font-mono-tech text-xs flex items-center gap-2 ${
            isOverBudget ? 'bg-red-950/80 border-red-600 text-red-300 animate-pulse' : 'bg-black border-slate-800 text-slate-300'
          }`}>
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>ANGGARAN: <strong className="text-white">${totalCostMillion.toFixed(1)}M / ${activeCase.budgetCapMillion}.0M</strong></span>
          </div>
        </div>
      </div>

      {/* Guided Cadet Advice */}
      {guidedMode && (
        <div className="p-3.5 bg-[#1C1F24] border border-slate-800 text-xs text-slate-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#EAB308] font-mono-tech uppercase">ARAHAN REKAYASA SISTEM:</p>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              ASTER-9 kehabisan daya dan membeku di bayangan 75 menit. Solusi perbaikan: ganti panel surya ke GaAs, perbesar baterai, pasang pemanas termal, atau pilih orbit terminator.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          FEATURE: X-RAY SUBSYSTEM INSPECTOR & BEFORE-AFTER VISUAL COMPARISON
          ========================================================================= */}
      <SpacecraftXRayInspector config={redesignConfig} />

      {/* Main Workspace: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Subsystem Categories Navigation & Component Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#141619] border border-black font-mono-tech text-xs">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sounds.playClick(700);
                    setActiveCategory(cat.id);
                  }}
                  className={`flex items-center gap-1.5 p-2 text-left transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#1C1F24] text-[#EAB308] font-bold border-l-2 border-[#EAB308]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1C1F24]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate text-[11px]">{cat.label.split(' : ')[1] || cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Component Options List for Active Category */}
          <div className="space-y-3">
            {SPACECRAFT_COMPONENTS.filter((c) => c.category === activeCategory).map((comp) => {
              const isPayloadCat = activeCategory === 'payload';
              const isSelected = isPayloadCat 
                ? redesignConfig.payloads.includes(comp.id)
                : redesignConfig[activeCategory as keyof typeof redesignConfig] === comp.id;

              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    if (isPayloadCat) {
                      handlePayloadToggle(comp.id);
                    } else {
                      updateRedesignComponent(activeCategory as keyof typeof redesignConfig, comp.id);
                    }
                  }}
                  className={`cursor-pointer p-4 transition-all relative border clip-chamfer-sm ${
                    isSelected
                      ? 'bg-[#1C1F24] border-[#EAB308] text-white shadow-xl shadow-amber-500/10'
                      : 'bg-[#141619] border-black text-slate-300 hover:border-slate-700 hover:bg-[#181A1F]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-white">
                          {comp.name}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[9px] font-mono-tech font-bold px-1.5 py-0.5 bg-[#EAB308] text-black">
                            <Check className="w-3 h-3" /> INSTALLED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {comp.description}
                      </p>
                      <div className="text-[11px] font-mono-tech text-[#EAB308] pt-1">
                        SPEC: {comp.specSummary}
                      </div>
                    </div>

                    {/* Stats pill */}
                    <div className="shrink-0 flex flex-col items-end font-mono-tech text-xs space-y-1 bg-black p-2 border border-slate-800">
                      <span className="text-emerald-400 font-bold">${comp.costMillion}M</span>
                      <span className="text-amber-400">{comp.massKg > 0 ? `${comp.massKg} kg` : 'N/A'}</span>
                      {comp.powerGenerationW ? (
                        <span className="text-[#EAB308] font-semibold">+{comp.powerGenerationW}W</span>
                      ) : null}
                      {comp.powerConsumptionW ? (
                        <span className="text-rose-400 font-semibold">-{comp.powerConsumptionW}W</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Live Engineering Trade-Off Barometer & Warnings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#141619] border border-black text-white p-5 space-y-5 clip-chamfer-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-display font-bold text-sm text-white">
                <Layers className="w-4 h-4 text-[#EAB308]" />
                <span>ENGINEERING CONSEQUENCE BAROMETER</span>
              </div>
              <span className="text-[10px] font-mono-tech px-2 py-0.5 bg-black border border-slate-800 text-[#EAB308]">
                LIVE CAD SIM
              </span>
            </div>

            {/* Metric 1: Mass Capacity Bar */}
            <div className="space-y-1 font-mono-tech text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" /> TOTAL SYSTEM MASS
                </span>
                <span className={isOverMass ? 'text-rose-400 font-bold' : 'text-slate-200 font-bold'}>
                  {totalMassKg.toFixed(1)} / {maxLauncherMass} kg
                </span>
              </div>
              <div className="w-full bg-black h-2 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isOverMass ? 'bg-rose-500' : 'bg-[#EAB308]'
                  }`}
                  style={{ width: `${Math.min(100, (totalMassKg / maxLauncherMass) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Budget Bar */}
            <div className="space-y-1 font-mono-tech text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> BUDGET CEILING
                </span>
                <span className={isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-200 font-bold'}>
                  ${totalCostMillion.toFixed(1)}M / ${activeCase.budgetCapMillion}.0M
                </span>
              </div>
              <div className="w-full bg-black h-2 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isOverBudget ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (totalCostMillion / activeCase.budgetCapMillion) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Power Budget (Sunlit vs Eclipse) */}
            <div className="p-3 bg-black border border-slate-800 space-y-2 font-mono-tech text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Load Consumption:</span>
                <span className="text-rose-400 font-bold">{totalPowerDrawW} W</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sunlit Generation:</span>
                <span className="text-[#EAB308] font-bold">+{powerGenW} W</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Surplus Daya Siang:</span>
                <span className={netPowerSunlit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {netPowerSunlit >= 0 ? `+${netPowerSunlit} W PENGISIAN` : `${netPowerSunlit} W DEFISIT`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kebutuhan Energi Gerhana {eclipseMinutes} Menit:</span>
                <span className="text-purple-400 font-bold">{eclipseEnergyRequiredWh.toFixed(0)} Wh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kapasitas Baterai Terpasang:</span>
                <span className={nominalBatteryWh >= eclipseEnergyRequiredWh ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {nominalBatteryWh} Wh
                </span>
              </div>
            </div>

            {/* Critical Engineering Warnings */}
            <div className="space-y-2 font-mono-tech text-xs">
              {isOverMass && (
                <div className="p-2.5 bg-red-950/70 border border-red-700 text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>PERINGATAN MASSA:</strong> Bobot wahana melampaui kapasitas roket {maxLauncherMass} kg. Tingkatkan kelas peluncur atau kurangi instrumen.</span>
                </div>
              )}

              {isOverBudget && (
                <div className="p-2.5 bg-red-950/70 border border-red-700 text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>PERINGATAN ANGGARAN:</strong> Total biaya proyek melampaui pagu program {activeCase.budgetCapMillion} juta dollar.</span>
                </div>
              )}

              {isBatteryAtRisk && (
                <div className="p-2.5 bg-amber-950/70 border border-amber-700 text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>RISIKO BEKU:</strong> Isolasi pasif saja akan memicu pembekuan baterai selama gerhana {eclipseMinutes} menit.</span>
                </div>
              )}

              {isLaserIncompatible && (
                <div className="p-2.5 bg-purple-950/70 border border-purple-700 text-purple-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>KETIDAKCOCOKAN ADCS:</strong> Pemancar laser membutuhkan pelacak bintang presisi tinggi agar tautan data stabil.</span>
                </div>
              )}

              {!isOverMass && !isOverBudget && !isBatteryAtRisk && !isLaserIncompatible && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-600 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>SPESIFIKASI SEIMBANG:</strong> Semua batas rekayasa dan margin termal terpenuhi dengan aman.</span>
                </div>
              )}
            </div>

            {/* Launch Simulation Action Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  startSimulation();
                  setPhase('simulation');
                }}
                disabled={isOverMass || isOverBudget || simulationRunning}
                className={`w-full flex items-center justify-center gap-2 py-3.5 font-display font-black text-sm tracking-wider transition-all cursor-pointer ${
                  !isOverMass && !isOverBudget && !simulationRunning
                    ? 'btn-tactical-primary text-black shadow-xl shadow-amber-500/20 hover:scale-[1.01]'
                    : 'bg-[#1C1F24] text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>
                  {simulationRunning ? 'MEMULAI SIMULASI...' : 'UJI SIMULASI ORBIT'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
