import type { RedesignConfiguration, SimulationResult, TelemetryPoint } from '../types/mission';
import { SPACECRAFT_COMPONENTS } from '../data/components';

export function runMissionSimulation(
  config: RedesignConfiguration,
  caseCapMillion: number,
  investigationCorrect: boolean,
  pinnedEvidenceCount: number,
  timeTakenSeconds: number = 180
): SimulationResult {
  // Helper to find component by ID
  const getComp = (id: string) => SPACECRAFT_COMPONENTS.find((c) => c.id === id);

  const solarComp = getComp(config.solar);
  const batteryComp = getComp(config.battery);
  const thermalComp = getComp(config.thermal);
  const commsComp = getComp(config.comms);
  const adcsComp = getComp(config.adcs);
  const launcherComp = getComp(config.launcher);
  const orbitComp = getComp(config.orbit);
  const payloadComps = config.payloads.map(getComp).filter(Boolean);

  // 1. Calculate Mass & Cost
  const dryBusMassKg = 35; // structural frame, harness, central computer
  let totalMassKg = dryBusMassKg;
  let totalCostMillion = 0;

  const allActiveComponents = [
    solarComp,
    batteryComp,
    thermalComp,
    commsComp,
    adcsComp,
    launcherComp,
    orbitComp,
    ...payloadComps,
  ].filter(Boolean);

  for (const comp of allActiveComponents) {
    if (comp) {
      totalMassKg += comp.massKg;
      totalCostMillion += comp.costMillion;
    }
  }

  // 2. Launch Vehicle limits
  const maxLauncherMass = config.launcher === 'launch_smallsat_rideshare' ? 140 : 350;
  const isOverMass = totalMassKg > maxLauncherMass;
  const isOverBudget = totalCostMillion > caseCapMillion;

  // 3. Orbit Parameters
  let eclipseMinutes = 75;
  let scienceResolutionMultiplier = 1.0;
  if (config.orbit === 'orbit_low_terminator') {
    eclipseMinutes = 15;
    scienceResolutionMultiplier = 1.1;
  } else if (config.orbit === 'orbit_equatorial_close') {
    eclipseMinutes = 75;
    scienceResolutionMultiplier = 1.3;
  } else if (config.orbit === 'orbit_distant_quasi') {
    eclipseMinutes = 0;
    scienceResolutionMultiplier = 0.65;
  }

  // 4. Power & Thermal Parameters
  const isRTG = config.solar === 'power_nextgen_rtg';
  const baselineSolarW = solarComp?.powerGenerationW || 160;
  const batteryCapacityWh = batteryComp?.energyCapacityWh || 400;
  const minOperableTemp = batteryComp?.minTempOperable || -10;

  // Consumption
  const adcsPowerW = adcsComp?.powerConsumptionW || 25;
  const commsPowerW = commsComp?.powerConsumptionW || 50;
  const thermalHeaterW = thermalComp?.heaterPowerW || 0;
  const payloadPowerW = payloadComps.reduce((acc, p) => acc + (p?.powerConsumptionW || 0), 0);
  const totalPowerConsumptionW = 20 + adcsPowerW + commsPowerW + thermalHeaterW + payloadPowerW;

  // ADCS & Optical Comms compatibility check
  let linkMarginDB = 14.5;
  if (config.comms === 'comms_optical_laser') {
    if (config.adcs !== 'adcs_star_tracker_cmas') {
      linkMarginDB = 2.1; // optical laser loses line-of-sight without high-precision star trackers!
    } else {
      linkMarginDB = 18.2;
    }
  } else if (config.comms === 'comms_s_band_patch') {
    linkMarginDB = 9.0;
  } else {
    linkMarginDB = 15.0;
  }

  // 5. Generate Simulation Telemetry Trace (360 minutes)
  const telemetryTrace: TelemetryPoint[] = [];
  let currentSOC = 100;
  let currentTemp = 18;
  let currentBufferMB = 0;
  let survivedTimeMinutes = 360;
  let failed = false;
  let failureReason = '';

  const eclipseStartMin = 180;
  const eclipseEndMin = eclipseStartMin + eclipseMinutes;

  for (let m = 0; m <= 360; m += 10) {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    const timeStr = `T+${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    const inEclipse = m >= eclipseStartMin && m < eclipseEndMin;
    const solarGeneration = isRTG ? baselineSolarW : (inEclipse ? 0 : baselineSolarW);

    // Thermal simulation
    if (inEclipse) {
      if (config.thermal === 'thermal_passive_minimal') {
        currentTemp = Math.max(-42, currentTemp - 4.5);
      } else if (config.thermal === 'thermal_mli_blanket') {
        currentTemp = Math.max(-12, currentTemp - 1.2);
      } else {
        // active RHU + Heaters
        currentTemp = Math.max(8, currentTemp - 0.2);
      }
    } else {
      // warming in sun
      currentTemp = Math.min(22, currentTemp + 1.5);
    }

    // Battery capacity derating factor under cold temp
    let thermalDeratingFactor = 1.0;
    if (currentTemp < minOperableTemp) {
      const degreesBelow = minOperableTemp - currentTemp;
      thermalDeratingFactor = Math.max(0.2, 1.0 - degreesBelow * 0.04);
    }
    const effectiveCapacityWh = batteryCapacityWh * thermalDeratingFactor;

    // Power calculation
    const netPowerW = solarGeneration - totalPowerConsumptionW;
    const deltaEnergyWh = (netPowerW * 10) / 60; // 10 minutes step

    if (!failed) {
      if (netPowerW < 0) {
        // Discharging battery
        const requiredDischarge = Math.abs(deltaEnergyWh);
        const socDropPercent = (requiredDischarge / effectiveCapacityWh) * 100;
        currentSOC = Math.max(0, currentSOC - socDropPercent);
      } else {
        // Charging battery
        const socGainPercent = (deltaEnergyWh / effectiveCapacityWh) * 100;
        currentSOC = Math.min(100, currentSOC + socGainPercent);
      }
    }

    // Bus voltage modeling
    let busVoltage = 28.0;
    if (!failed) {
      busVoltage = 23.5 + (currentSOC / 100) * 4.8;
      // Voltage sag under cryogenic freeze
      if (currentTemp < -15) {
        busVoltage -= 2.2;
      }
    } else {
      busVoltage = 18.0;
    }

    // Science data throughput
    const dataGenKbps = payloadComps.reduce((acc, p) => acc + (p?.dataRateKbps || 0), 0);
    const downlinkKbps = commsComp?.dataRateKbps || 200;
    const mbGenerated = (dataGenKbps * 600) / 8 / 1024;
    const mbDownlinked = (downlinkKbps * 600) / 8 / 1024;
    currentBufferMB = Math.max(0, currentBufferMB + (mbGenerated - mbDownlinked));

    // Check failure conditions
    let severity: 'nominal' | 'warning' | 'critical' | 'fatal' = 'nominal';
    let eventLog: string | undefined = undefined;

    if (isOverMass && m === 0) {
      failed = true;
      survivedTimeMinutes = 0;
      failureReason = `LAUNCH_ABORT: Spacecraft mass (${totalMassKg.toFixed(1)} kg) melampaui payload capacity peluncur (${maxLauncherMass} kg).`;
      severity = 'fatal';
      eventLog = failureReason;
    } else if (busVoltage < 22.0 && !failed) {
      failed = true;
      survivedTimeMinutes = m;
      failureReason = `UVLO_TRIP: Tegangan bus jatuh ke ${busVoltage.toFixed(1)}V saat T+${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}. Subsistem daya padam.`;
      severity = 'fatal';
      eventLog = failureReason;
    } else if (linkMarginDB < 3.0 && !failed && m === 60) {
      severity = 'warning';
      eventLog = 'COMMS_WARNING: Low optical pointing stability. Sinyal laser mengalami packet loss parah.';
    }

    telemetryTrace.push({
      timeStr,
      timeMinutes: m,
      busVoltage: Number(busVoltage.toFixed(2)),
      solarOutput: Math.round(solarGeneration),
      batterySOC: Math.max(0, Math.round(currentSOC)),
      batteryTemp: Number(currentTemp.toFixed(1)),
      powerConsumption: Math.round(totalPowerConsumptionW),
      dataBuffered: Math.round(currentBufferMB),
      downlinkRate: Math.round(downlinkKbps),
      signalSNR: Number(linkMarginDB.toFixed(1)),
      isEclipse: inEclipse,
      eventLog,
      severity,
    });
  }

  // 6. Science Yield Calculation
  const baseScienceSum = payloadComps.reduce((acc, p) => acc + (p?.scienceValue || 0), 0);
  let scienceYieldScore = Math.min(100, Math.round(baseScienceSum * scienceResolutionMultiplier));
  if (failed) {
    scienceYieldScore = Math.round((scienceYieldScore * (survivedTimeMinutes / 360)) * 0.4);
  }

  // 7. Calculate 5-Pillar Score
  // 1. Investigation Accuracy (300 pts)
  let investigationScore = 0;
  if (investigationCorrect) {
    investigationScore += 200;
  }
  investigationScore += Math.min(100, pinnedEvidenceCount * 25);

  // 2. Engineering Design (250 pts)
  let engineeringScore = 0;
  const powerSurplus = baselineSolarW - totalPowerConsumptionW;
  if (powerSurplus >= 20) engineeringScore += 60;
  else if (powerSurplus >= 0) engineeringScore += 35;

  if (config.thermal === 'thermal_active_rhu') engineeringScore += 70;
  else if (config.thermal === 'thermal_mli_blanket') engineeringScore += 40;

  if (linkMarginDB >= 10) engineeringScore += 60;
  else if (linkMarginDB >= 3) engineeringScore += 30;

  if (batteryComp?.id === 'battery_solid_state_cryo' || batteryComp?.id === 'battery_li_ion_extended') {
    engineeringScore += 60;
  }

  // 3. Mission Success (250 pts)
  let missionSuccessScore = 0;
  if (!failed) {
    missionSuccessScore = Math.round((scienceYieldScore / 100) * 250);
  } else {
    missionSuccessScore = Math.round((survivedTimeMinutes / 360) * 80);
  }

  // 4. Resource Efficiency (150 pts)
  let resourceEfficiencyScore = 0;
  if (!isOverBudget && !isOverMass) {
    const budgetSavedRatio = Math.max(0, (caseCapMillion - totalCostMillion) / caseCapMillion);
    const massMarginRatio = Math.max(0, (maxLauncherMass - totalMassKg) / maxLauncherMass);
    resourceEfficiencyScore = Math.round(budgetSavedRatio * 90 + massMarginRatio * 60);
  }

  // 5. Decision Speed (50 pts)
  let speedScore = 50;
  if (timeTakenSeconds > 600) speedScore = 20;
  else if (timeTakenSeconds > 300) speedScore = 35;

  const totalScore = Math.min(1000, 
    investigationScore + 
    engineeringScore + 
    missionSuccessScore + 
    resourceEfficiencyScore + 
    speedScore
  );

  let grade: 'A+' | 'A' | 'B' | 'C' | 'FAIL' = 'FAIL';
  if (!failed) {
    if (totalScore >= 880) grade = 'A+';
    else if (totalScore >= 750) grade = 'A';
    else if (totalScore >= 600) grade = 'B';
    else grade = 'C';
  }

  return {
    completed: !failed,
    survivedTimeMinutes,
    totalTimeMinutes: 360,
    scienceYieldScore,
    powerMarginPercent: Number(((baselineSolarW / totalPowerConsumptionW - 1) * 100).toFixed(1)),
    thermalMarginCelsius: Number((currentTemp - minOperableTemp).toFixed(1)),
    finalMassKg: Number(totalMassKg.toFixed(1)),
    finalCostMillion: Number(totalCostMillion.toFixed(2)),
    linkMarginDB: Number(linkMarginDB.toFixed(1)),
    outcomeType: !failed ? 'success' : (survivedTimeMinutes > 180 ? 'partial' : 'failure'),
    failureReason: failed ? failureReason : undefined,
    telemetryTrace,
    scoreBreakdown: {
      investigationAccuracy: investigationScore,
      engineeringDesign: engineeringScore,
      missionSuccess: missionSuccessScore,
      resourceEfficiency: resourceEfficiencyScore,
      decisionSpeed: speedScore,
      totalScore,
      grade,
    },
  };
}
