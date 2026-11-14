import type { RedesignConfiguration, SimulationResult, TelemetryPoint } from '../types/mission';
import { SPACECRAFT_COMPONENTS } from '../data/components';

/** Konstanta fisika & aturan. SATU-SATUNYA sumber kebenaran — dilarang menduplikasi di UI. */
export const SIM = {
  DRY_BUS_KG: 35,
  BASE_LOAD_W: 20,
  END_MIN: 360,
  STEP_MIN: 10,
  PAYLOAD_ON_MIN: 150,
  ECLIPSE_START_MIN: 195,
  START_TEMP_C: 18,
  SUN_WARM_C_PER_STEP: 1.5,
  SUN_TEMP_CAP_C: 22,
  DERATE_PER_C: 0.04,
  DERATE_MIN: 0.2,
  V_BASE: 23.5,
  V_SPAN: 4.8,
  V_COLD_SAG_PER_C: 0.1,
  V_COLD_SAG_MAX: 3,
  UVLO_V: 22,
  V_FAILED: 18,
  MIN_END_SOC: 10,
  LAUNCHER_CAP_KG: { launch_smallsat_rideshare: 140, launch_dedicated_medium: 350 } as Record<string, number>,
  ORBIT: {
    orbit_low_terminator: { eclipseMin: 15, science: 1.1 },
    orbit_equatorial_close: { eclipseMin: 75, science: 1.3 },
    orbit_distant_quasi: { eclipseMin: 0, science: 0.65 },
  } as Record<string, { eclipseMin: number; science: number }>,
  // [turun °C per step gerhana, batas bawah °C]
  THERMAL: {
    thermal_passive_minimal: [8.4, -42],
    thermal_mli_blanket: [2.5, -20],
    thermal_active_rhu: [0.4, 8],
  } as Record<string, [number, number]>,
};

export function getLauncherCapKg(launcherId: string): number {
  return SIM.LAUNCHER_CAP_KG[launcherId] ?? 140;
}

export interface SimInput {
  config: RedesignConfiguration;
  budgetCapMillion: number;
  isHypothesisCorrect: boolean;
  pinnedEvidenceIds: string[];
  requiredEvidenceIds: string[];
  redHerringEvidenceIds: string[];
  timeTakenSeconds: number;
}

const fmt = (m: number) => `T+${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export function runMissionSimulation(inp: SimInput): SimulationResult {
  const { config } = inp;
  const getComp = (id: string) => SPACECRAFT_COMPONENTS.find((c) => c.id === id);
  const solar = getComp(config.solar), battery = getComp(config.battery), thermal = getComp(config.thermal);
  const comms = getComp(config.comms), adcs = getComp(config.adcs);
  const parts = [solar, battery, thermal, comms, adcs, getComp(config.launcher), getComp(config.orbit),
    ...config.payloads.map(getComp)].filter((c): c is NonNullable<typeof c> => !!c);

  const massKg = SIM.DRY_BUS_KG + parts.reduce((a, c) => a + c.massKg, 0);
  const costMillion = parts.reduce((a, c) => a + c.costMillion, 0);
  const capKg = getLauncherCapKg(config.launcher);
  const isOverMass = massKg > capKg;
  const isOverBudget = costMillion > inp.budgetCapMillion;

  const orbit = SIM.ORBIT[config.orbit] ?? SIM.ORBIT.orbit_equatorial_close;
  const eclStart = SIM.ECLIPSE_START_MIN, eclEnd = eclStart + orbit.eclipseMin;
  const isRTG = config.solar === 'power_nextgen_rtg';
  const solarW = solar?.powerGenerationW ?? 0;
  const capWh = battery?.energyCapacityWh ?? 400;
  const minOp = battery?.minTempOperable ?? -10;
  const [coolRate, coolFloor] = SIM.THERMAL[config.thermal] ?? SIM.THERMAL.thermal_passive_minimal;
  const rtgHeat = isRTG && config.thermal !== 'thermal_passive_minimal';

  const idleLoadW = SIM.BASE_LOAD_W + (adcs?.powerConsumptionW ?? 0) + (comms?.powerConsumptionW ?? 0)
    + (thermal?.heaterPowerW ?? 0) + (solar?.powerConsumptionW ?? 0);
  const payloadW = config.payloads.reduce((a, id) => a + (getComp(id)?.powerConsumptionW ?? 0), 0);
  const dataGenKbps = config.payloads.reduce((a, id) => a + (getComp(id)?.dataRateKbps ?? 0), 0);
  const downKbps = comms?.dataRateKbps ?? 0;

  let linkMarginDB = 15.0;
  if (config.comms === 'comms_optical_laser') linkMarginDB = config.adcs === 'adcs_star_tracker_cmas' ? 18.2 : 2.1;
  else if (config.comms === 'comms_s_band_patch') linkMarginDB = 9.0;

  const trace: TelemetryPoint[] = [];
  let energyWh = capWh, tempC = SIM.START_TEMP_C, bufMB = 0;
  let failed = false, failureReason = '', survived = SIM.END_MIN;
  let seenEclipse = false, seenCold = false, seenWarnV = false;

  for (let m = 0; m <= SIM.END_MIN; m += SIM.STEP_MIN) {
    const inEclipse = m >= eclStart && m < eclEnd;
    const genW = isRTG ? solarW : inEclipse ? 0 : solarW;
    const loadW = idleLoadW + (m >= SIM.PAYLOAD_ON_MIN ? payloadW : 0);

    if (inEclipse) tempC = Math.max(coolFloor, tempC - (rtgHeat ? coolRate * 0.5 : coolRate));
    else tempC = Math.min(SIM.SUN_TEMP_CAP_C, tempC + SIM.SUN_WARM_C_PER_STEP);

    const below = Math.max(0, minOp - tempC);
    const derate = Math.max(SIM.DERATE_MIN, 1 - below * SIM.DERATE_PER_C);
    const effCapWh = capWh * derate;

    if (!failed) energyWh = Math.min(effCapWh, energyWh + ((genW - loadW) * SIM.STEP_MIN) / 60);
    const soc = Math.max(0, (energyWh / capWh) * 100);

    let v = SIM.V_BASE + SIM.V_SPAN * Math.min(1, soc / 100);
    if (tempC < minOp) v -= Math.min(SIM.V_COLD_SAG_MAX, SIM.V_COLD_SAG_PER_C * (minOp - tempC));

    let severity: TelemetryPoint['severity'] = 'nominal';
    let eventLog: string | undefined;
    if (!failed && energyWh <= 0) {
      failed = true; survived = m; failureReason = `ENERGY_DEPLETED: Energi baterai habis pada ${fmt(m)}.`;
    } else if (!failed && v < SIM.UVLO_V) {
      failed = true; survived = m; failureReason = `UVLO_TRIP: Tegangan bus ${v.toFixed(1)}V < ${SIM.UVLO_V}V pada ${fmt(m)}.`;
    }
    if (failed) { v = Math.min(v, SIM.V_FAILED); }

    if (m === survived && failed) { severity = 'fatal'; eventLog = failureReason; }
    else if (!failed && m === SIM.PAYLOAD_ON_MIN) { eventLog = 'PAYLOAD_ON: instrumen sains dinyalakan.'; }
    else if (!failed && inEclipse && !seenEclipse) { eventLog = `ECLIPSE_ENTRY: masuk bayangan ${orbit.eclipseMin} menit.`; }
    else if (!failed && tempC < minOp && !seenCold) { severity = 'critical'; eventLog = `BATTERY_COLD: ${tempC.toFixed(1)}°C di bawah batas ${minOp}°C.`; }
    else if (!failed && v < 24.5 && !seenWarnV) { severity = 'warning'; eventLog = `BUS_UNDERVOLT: ${v.toFixed(1)}V.`; }
    if (inEclipse) seenEclipse = true;
    if (tempC < minOp) seenCold = true;
    if (v < 24.5) seenWarnV = true;

    if (m >= SIM.PAYLOAD_ON_MIN && !failed) {
      bufMB = Math.max(0, bufMB + ((dataGenKbps - downKbps) * 600) / 8 / 1024);
    }
    trace.push({
      timeStr: fmt(m), timeMinutes: m, busVoltage: Number(v.toFixed(2)), solarOutput: Math.round(genW),
      batterySOC: Math.round(soc), batteryTemp: Number(tempC.toFixed(1)), powerConsumption: Math.round(loadW),
      dataBuffered: Math.round(bufMB), downlinkRate: Math.round(downKbps), signalSNR: Number(linkMarginDB.toFixed(1)),
      isEclipse: inEclipse, eventLog, severity,
    });
  }

  const last = trace[trace.length - 1];
  if (!failed && last.batterySOC < SIM.MIN_END_SOC) {
    failed = true; survived = SIM.END_MIN;
    failureReason = `POWER_DEFICIT: SOC akhir ${last.batterySOC}% < ${SIM.MIN_END_SOC}%; beban ${Math.round(idleLoadW + payloadW)}W > pembangkit ${solarW}W.`;
  }
  if (!failed && isOverMass) { failed = true; survived = 0; failureReason = `LAUNCH_ABORT: massa ${massKg.toFixed(1)} kg > kapasitas ${capKg} kg.`; }
  if (!failed && isOverBudget) { failed = true; survived = 0; failureReason = `BUDGET_EXCEEDED: $${costMillion.toFixed(1)}M > batas $${inp.budgetCapMillion}M.`; }
  const launchBlocked = isOverMass || isOverBudget;

  const minTemp = Math.min(...trace.map((t) => t.batteryTemp));
  const baseScience = config.payloads.reduce((a, id) => a + (getComp(id)?.scienceValue ?? 0), 0);
  let science = Math.min(100, Math.round(baseScience * orbit.science));
  if (failed) science = Math.round(science * (survived / SIM.END_MIN) * 0.4);

  // Pilar 1 — Investigasi (300)
  const reqHit = inp.requiredEvidenceIds.filter((id) => inp.pinnedEvidenceIds.includes(id)).length;
  const herring = inp.redHerringEvidenceIds.filter((id) => inp.pinnedEvidenceIds.includes(id)).length;
  let inv = (inp.isHypothesisCorrect ? 150 : 0) + Math.max(0, reqHit * 30 - herring * 20);
  if (inp.isHypothesisCorrect && reqHit === inp.requiredEvidenceIds.length && herring === 0) inv += 30;
  inv = Math.min(300, inv);

  // Pilar 2 — Rekayasa (250)
  let eng = 0;
  if (!launchBlocked) {
    eng += last.batterySOC >= 40 ? 80 : last.batterySOC >= 20 ? 60 : last.batterySOC >= 10 ? 40 : 0;
    eng += minTemp >= minOp + 10 ? 70 : minTemp >= minOp ? 40 : 0;
    eng += linkMarginDB >= 10 ? 50 : linkMarginDB >= 3 ? 25 : 0;
    eng += last.dataBuffered <= 600 ? 50 : last.dataBuffered <= 1500 ? 25 : 0;
    if (failed) eng = Math.round(eng * 0.3);
  }

  // Pilar 3 — Sains/Misi (250)
  const mission = failed ? Math.round((survived / SIM.END_MIN) * 60) : Math.round((science / 100) * 250);

  // Pilar 4 — Efisiensi (150)
  let eff = 0;
  if (!failed) {
    eff = Math.round(Math.max(0, (inp.budgetCapMillion - costMillion) / inp.budgetCapMillion) * 90
      + Math.max(0, (capKg - massKg) / capKg) * 60);
  }

  // Pilar 5 — Kecepatan (50)
  const speed = inp.timeTakenSeconds <= 300 ? 50 : inp.timeTakenSeconds <= 600 ? 35 : 20;

  const total = Math.min(1000, inv + eng + mission + eff + speed);
  const grade: 'A+' | 'A' | 'B' | 'C' | 'FAIL' = failed ? 'FAIL' : total >= 880 ? 'A+' : total >= 750 ? 'A' : total >= 600 ? 'B' : 'C';

  return {
    completed: !failed,
    survivedTimeMinutes: survived,
    totalTimeMinutes: SIM.END_MIN,
    scienceYieldScore: science,
    powerMarginPercent: Number(((solarW / (idleLoadW + payloadW) - 1) * 100).toFixed(1)),
    thermalMarginCelsius: Number((minTemp - minOp).toFixed(1)),
    finalMassKg: Number(massKg.toFixed(1)),
    finalCostMillion: Number(costMillion.toFixed(2)),
    linkMarginDB: Number(linkMarginDB.toFixed(1)),
    outcomeType: !failed ? 'success' : survived > eclStart ? 'partial' : 'failure',
    failureReason: failed ? failureReason : undefined,
    telemetryTrace: trace,
    scoreBreakdown: { investigationAccuracy: inv, engineeringDesign: eng, missionSuccess: mission,
      resourceEfficiency: eff, decisionSpeed: speed, totalScore: total, grade },
  };
}

export function previewConfig(config: RedesignConfiguration, budgetCapMillion: number) {
  const r = runMissionSimulation({ config, budgetCapMillion, isHypothesisCorrect: true,
    pinnedEvidenceIds: [], requiredEvidenceIds: [], redHerringEvidenceIds: [], timeTakenSeconds: 180 });
  const t = r.telemetryTrace;
  return { massKg: r.finalMassKg, costMillion: r.finalCostMillion, launcherCapKg: getLauncherCapKg(config.launcher),
    minTempC: Math.min(...t.map((x) => x.batteryTemp)), endSOC: t[t.length - 1].batterySOC,
    maxLoadW: Math.max(...t.map((x) => x.powerConsumption)), solarW: Math.max(...t.map((x) => x.solarOutput)),
    willFail: !r.completed, failureReason: r.failureReason };
}
