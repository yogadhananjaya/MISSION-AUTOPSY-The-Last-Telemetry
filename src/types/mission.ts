// Comprehensive types for MISSION AUTOPSY - The Last Telemetry
// NASA Space Apps Challenge 2026

export type GamePhase = 
  | 'briefing'       // Phase 1: Mission Briefing & Incident Alert
  | 'investigation'  // Phase 2: Black Box Telemetry Scrubbing
  | 'root_cause'     // Phase 3: Root Cause Analysis & Evidence Linking
  | 'redesign'       // Phase 4: Systems Engineering & Spacecraft Builder
  | 'simulation'     // Phase 5: 3D Flight Operations & Real-time Simulation
  | 'debrief';       // Phase 6: Mission Debrief & NASA Scoring

export type UserRole = 
  | 'flight_director'   // Overall mission oversight, go/no-go decisions
  | 'power_thermal'     // Electrical and thermal subsystem specialist
  | 'science_payload'   // Scientific instruments and research yield
  | 'comms_analyst';    // Telemetry, antenna link margin, deep space network

export interface TelemetryPoint {
  timeStr: string;         // e.g. "T+00:00"
  timeMinutes: number;     // e.g. 0 to 360
  busVoltage: number;      // Volts (nominal: 28V, UVLO at <22V)
  solarOutput: number;     // Watts (0W during eclipse)
  batterySOC: number;      // State of charge (0 - 100%)
  batteryTemp: number;     // Celsius (optimal: 0 to 25°C, freezing: <-20°C, thermal runaway: >55°C)
  powerConsumption: number;// Watts (varies by payload duty cycle)
  dataBuffered: number;    // Megabytes in flash recorder
  downlinkRate: number;    // kbps
  signalSNR: number;       // Signal to Noise Ratio in dB (loss of lock < 3dB)
  isEclipse: boolean;      // In shadow of asteroid or celestial body
  eventLog?: string;       // Log event occurred at this timestamp
  severity?: 'nominal' | 'warning' | 'critical' | 'fatal';
}

export interface AnomalyEvidence {
  id: string;
  timeStr: string;
  timeMinutes: number;
  metric: 'voltage' | 'solar' | 'battery_soc' | 'battery_temp' | 'power_draw' | 'comms' | 'thermal';
  value: string;
  observedText: string;
  isRedHerring?: boolean;
}

export interface Hypothesis {
  id: string;
  title: string;
  category: 'electrical' | 'thermal' | 'payload' | 'telecom' | 'propulsion';
  description: string;
  requiredEvidenceIds: string[];
  isCorrect: boolean;
  engineeringExplanation: string;
}

export type ComponentCategory = 
  | 'power_generation'
  | 'energy_storage'
  | 'thermal_control'
  | 'payload'
  | 'communications'
  | 'adcs'
  | 'launch_vehicle'
  | 'orbit_profile';

export interface SpacecraftComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  massKg: number;
  costMillion: number;
  powerGenerationW?: number;
  powerConsumptionW?: number;
  energyCapacityWh?: number;
  thermalProtection?: string;
  minTempOperable?: number;
  maxTempOperable?: number;
  heaterPowerW?: number;
  dataRateKbps?: number;
  scienceValue?: number; // 0 - 100
  description: string;
  specSummary: string;
  recommendedRole?: UserRole;
}

export interface CaseFile {
  id: string;
  missionName: string;
  targetObject: string;
  targetDistanceAU: number; // Astronomical Units
  incidentTime: string;
  budgetCapMillion: number;
  maxPayloadMassKg: number;
  objectiveSummary: string;
  incidentSummary: string;
  legacyConfiguration: {
    solar: string;
    battery: string;
    thermal: string;
    payloads: string[];
    comms: string;
    adcs: string;
    launcher: string;
    orbit: string;
  };
  telemetryLogs: TelemetryPoint[];
  hypotheses: Hypothesis[];
  keyEvidencePool: AnomalyEvidence[];
}

export interface RedesignConfiguration {
  solar: string;
  battery: string;
  thermal: string;
  payloads: string[];
  comms: string;
  adcs: string;
  launcher: string;
  orbit: string;
}

export interface SimulationResult {
  completed: boolean;
  survivedTimeMinutes: number;
  totalTimeMinutes: number;
  scienceYieldScore: number; // 0 - 100
  powerMarginPercent: number;
  thermalMarginCelsius: number;
  finalMassKg: number;
  finalCostMillion: number;
  linkMarginDB: number;
  outcomeType: 'success' | 'partial' | 'failure';
  failureReason?: string;
  telemetryTrace: TelemetryPoint[];
  scoreBreakdown: {
    investigationAccuracy: number; // out of 300
    engineeringDesign: number;     // out of 250
    missionSuccess: number;        // out of 250
    resourceEfficiency: number;    // out of 150
    decisionSpeed: number;         // out of 50
    totalScore: number;            // out of 1000
    grade: 'A+' | 'A' | 'B' | 'C' | 'FAIL';
  };
}
