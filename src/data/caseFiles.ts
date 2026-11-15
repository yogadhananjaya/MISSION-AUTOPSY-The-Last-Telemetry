import type { CaseFile, RedesignConfiguration, AnomalyEvidence, Hypothesis } from '../types/mission';
import { runMissionSimulation, SIM } from '../utils/simulationEngine';

export const ASTER9_LEGACY_CONFIG: RedesignConfiguration = {
  solar: 'solar_silicon_fixed',
  battery: 'battery_li_ion_basic',
  thermal: 'thermal_passive_minimal',
  payloads: ['payload_spectrometer', 'payload_lidar_altimeter'],
  comms: 'comms_x_band_dish',
  adcs: 'adcs_reaction_wheels_rcs',
  launcher: 'launch_smallsat_rideshare',
  orbit: 'orbit_equatorial_close',
};

const legacyRun = runMissionSimulation({
  config: ASTER9_LEGACY_CONFIG,
  budgetCapMillion: 65,
  isHypothesisCorrect: false,
  pinnedEvidenceIds: [],
  requiredEvidenceIds: [],
  redHerringEvidenceIds: [],
  timeTakenSeconds: 180,
});

const pDeficit = legacyRun.telemetryTrace.find((t) => t.timeMinutes >= 150 && t.powerConsumption > t.solarOutput);
const pEclipse = legacyRun.telemetryTrace.find((t) => t.isEclipse);
const pCryo = legacyRun.telemetryTrace.find((t) => t.batteryTemp < -10);
const pFatal = legacyRun.telemetryTrace.find((t) => t.severity === 'fatal');

const defTimeStr = pDeficit?.timeStr ?? 'T+02:30';
const defTimeMin = pDeficit?.timeMinutes ?? 150;
const defLoad = pDeficit?.powerConsumption ?? 260;
const defSolar = pDeficit?.solarOutput ?? 160;
const defDelta = defLoad - defSolar;

const eclTimeStr = pEclipse?.timeStr ?? 'T+03:20';
const eclTimeMin = pEclipse?.timeMinutes ?? 200;

const cryoTimeStr = pCryo?.timeStr ?? 'T+03:50';
const cryoTimeMin = pCryo?.timeMinutes ?? 230;
const cryoTemp = pCryo?.batteryTemp ?? -11.6;

const fatalTimeStr = pFatal?.timeStr ?? 'T+04:20';
const fatalTimeMin = pFatal?.timeMinutes ?? 260;
const fatalVoltage = pFatal?.busVoltage ?? 21.0;

export const CASE_FILES: CaseFile[] = [
  {
    id: 'case_aster9',
    missionName: 'ASTER-9 : Investigasi Asteroid Antariksa',
    missionNameEn: 'ASTER-9 : Deep Space Asteroid Autopsy',
    targetObject: 'Asteroid Bennu Dekat Bumi',
    targetObjectEn: 'Near-Earth Asteroid Bennu',
    targetDistanceAU: 1.25,
    incidentTime: 'MET T+04:20:00 Waktu Misi',
    incidentTimeEn: 'MET T+04:20:00 Mission Elapsed Time',
    budgetCapMillion: 65.0,
    maxPayloadMassKg: 180,
    objectiveSummary: 
      'Petakan topografi permukaan asteroid dan komposisi mineral batuan dari orbit dekat 8 km.',
    objectiveSummaryEn:
      'Map asteroid surface topography and mineral composition from close 8 km orbit.',
    incidentSummary: 
      'Pada jam keempat operasi, wahana ASTER-9 memutus transmisi data ilmiah. Komunikasi telemetri hilang total pada T+04:20 setelah wahana masuk bayangan asteroid.',
    incidentSummaryEn:
      'At T+04:20, ASTER-9 ceased science downlinks. Deep Space Network lost carrier signal entirely after spacecraft entered asteroid shadow.',
    legacyConfiguration: ASTER9_LEGACY_CONFIG,
    telemetryLogs: legacyRun.telemetryTrace,
    keyEvidencePool: [
      {
        id: 'ev_power_deficit',
        timeStr: defTimeStr,
        timeMinutes: defTimeMin,
        metric: 'power_draw',
        value: `Beban ${defLoad}W vs Surya ${defSolar}W defisit ${defDelta}W`,
        valueEn: `Load ${defLoad}W vs Solar ${defSolar}W deficit ${defDelta}W`,
        observedText: `Beban ${defLoad} W vs pembangkit surya ${defSolar} W, defisit ${defDelta} W`,
        observedTextEn: `Payload power draw ${defLoad} W exceeds solar array output ${defSolar} W, deficit ${defDelta} W`,
      },
      {
        id: 'ev_eclipse_entry',
        timeStr: eclTimeStr,
        timeMinutes: eclTimeMin,
        metric: 'solar',
        value: 'Pembangkit Surya : 0W Bayangan',
        valueEn: 'Solar Array Output: 0W Eclipse',
        observedText: 'Pembangkit surya jatuh ke 0 W — wahana memasuki bayangan',
        observedTextEn: 'Photovoltaic output drops to 0 W — spacecraft enters asteroid umbra shadow',
      },
      {
        id: 'ev_cryo_freeze',
        timeStr: cryoTimeStr,
        timeMinutes: cryoTimeMin,
        metric: 'battery_temp',
        value: `Suhu Baterai : ${cryoTemp}°C Beku`,
        valueEn: `Battery Temp: ${cryoTemp}°C Frozen`,
        observedText: `Suhu sel ${cryoTemp}°C di bawah batas operasi baterai (-10°C)`,
        observedTextEn: `Cell core temperature ${cryoTemp}°C falls below lithium-ion freezing threshold (-10°C)`,
      },
      {
        id: 'ev_uvlo_cutoff',
        timeStr: fatalTimeStr,
        timeMinutes: fatalTimeMin,
        metric: 'voltage',
        value: `Tegangan Bus : ${fatalVoltage.toFixed(1)}V Cutoff`,
        valueEn: `Bus Voltage: ${fatalVoltage.toFixed(1)}V Cutoff`,
        observedText: `Tegangan bus ${fatalVoltage.toFixed(1)} V di bawah ambang UVLO ${SIM.UVLO_V} V — pemadaman`,
        observedTextEn: `Main electrical bus ${fatalVoltage.toFixed(1)} V drops below UVLO threshold ${SIM.UVLO_V} V — black out`,
      },
      {
        id: 'ev_fake_micrometeoroid',
        timeStr: 'T+01:20',
        timeMinutes: 80,
        metric: 'solar',
        value: 'Fluktuasi Kecil : 2W pada Panel',
        valueEn: 'Minor Jitter: 2W Array Fluctuation',
        observedText: 'Sensor getaran mendeteksi goyangan mekanis ringan saat panel surya reposisi orientasi.',
        observedTextEn: 'Vibration accelerometer logs harmless mechanical jitter during solar array slew.',
        isRedHerring: true,
      },
      {
        id: 'ev_fake_doppler_drift',
        timeStr: 'T+03:00',
        timeMinutes: 180,
        metric: 'comms',
        value: 'Pergeseran Doppler : +120 Hz',
        valueEn: 'Doppler Shift: +120 Hz',
        observedText: 'Pergeseran frekuensi radio akibat lintasan wahana terhadap stasiun penerima DSN.',
        observedTextEn: 'Expected carrier frequency offset caused by orbital velocity relative to DSN dish.',
        isRedHerring: true,
      },
    ],
    hypotheses: [
      {
        id: 'hyp_thermal_electrical_collapse',
        title: 'Kerusakan Bertingkat Termal dan Listrik saat Gerhana',
        titleEn: 'Thermal and Electrical Cascading Failure in Eclipse',
        category: 'electrical',
        description: 
          'Kapasitas baterai minim saat gerhana dan ketiadaan pemanas membuat baterai membeku. Tegangan anjlok drastis lalu memutus bus daya utama.',
        descriptionEn:
          'Insufficient battery capacity and absence of active heaters caused cell freezing in eclipse. Terminal voltage collapsed below UVLO cutoff.',
        requiredEvidenceIds: ['ev_power_deficit', 'ev_eclipse_entry', 'ev_cryo_freeze', 'ev_uvlo_cutoff'],
        isCorrect: true,
        engineeringExplanation: 
          'Diagnosis Akurat! Baterai standar membeku di bawah minus 10 derajat. Masuk bayangan 75 menit dengan beban instrumen penuh menguras baterai dan memutus total daya sistem.',
        engineeringExplanationEn:
          'Accurate Forensic Diagnosis! Lithium-ion chemistry freezes below -10°C. A 75-minute eclipse with un-throttled payloads fully drained the cold battery and tripped the Under-Voltage Lockout (UVLO).',
      },
      {
        id: 'hyp_micrometeoroid_impact',
        title: 'Benturan Tabrakan Mikrometeoroid pada Panel Surya',
        titleEn: 'Micrometeoroid Impact on Photovoltaic Array',
        category: 'propulsion',
        description: 
          'Partikel debu asteroid berkecepatan tinggi merusak fisik panel surya sehingga wahana kehilangan daya mendadak.',
        descriptionEn:
          'High-velocity asteroidal dust particle physically shattered solar panels, causing sudden power loss.',
        requiredEvidenceIds: ['ev_fake_micrometeoroid'],
        isCorrect: false,
        engineeringExplanation: 
          'Diagnosis Salah. Data telemetri menunjukkan panel surya menghasilkan 160W konstan hingga wahana masuk bayangan asteroid.',
        engineeringExplanationEn:
          'False Diagnosis. Telemetry confirms solar panels generated steady 160W right until the spacecraft entered the planetary umbra.',
      },
      {
        id: 'hyp_antenna_gimbal_jam',
        title: 'Macet Mekanis pada Poros Antena Pemancar',
        titleEn: 'Mechanical Gimbal Jam on High-Gain Antenna',
        category: 'telecom',
        description: 
          'Motor penggerak antena pemancar macet sehingga sinyal tidak lagi mengarah ke stasiun penerima Bumi.',
        descriptionEn:
          'Gimbal drive motor seized up, causing high-gain antenna dish to lose line-of-sight pointing toward Earth.',
        requiredEvidenceIds: ['ev_fake_doppler_drift'],
        isCorrect: false,
        engineeringExplanation: 
          'Diagnosis Salah. Antena pemancar bekerja normal hingga menit ke-260. Hilang sinyal terjadi akibat pemutusan tegangan bus utama.',
        engineeringExplanationEn:
          'False Diagnosis. Transmitter dish retained nominal DSN lock up until minute 260. Carrier was lost due to main bus voltage collapse.',
      },
    ],
  },
];

export function getLocalizedCaseFile(caseFile: CaseFile, lang: 'en' | 'id'): CaseFile {
  if (lang === 'en') {
    return {
      ...caseFile,
      missionName: caseFile.missionNameEn || caseFile.missionName,
      targetObject: caseFile.targetObjectEn || caseFile.targetObject,
      incidentTime: caseFile.incidentTimeEn || caseFile.incidentTime,
      objectiveSummary: caseFile.objectiveSummaryEn || caseFile.objectiveSummary,
      incidentSummary: caseFile.incidentSummaryEn || caseFile.incidentSummary,
      keyEvidencePool: caseFile.keyEvidencePool.map((ev: AnomalyEvidence) => ({
        ...ev,
        value: ev.valueEn || ev.value,
        observedText: ev.observedTextEn || ev.observedText,
      })),
      hypotheses: caseFile.hypotheses.map((hyp: Hypothesis) => ({
        ...hyp,
        title: hyp.titleEn || hyp.title,
        description: hyp.descriptionEn || hyp.description,
        engineeringExplanation: hyp.engineeringExplanationEn || hyp.engineeringExplanation,
      })),
    };
  }
  return caseFile;
}
