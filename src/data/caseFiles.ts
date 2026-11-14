import type { CaseFile, RedesignConfiguration } from '../types/mission';
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
    targetObject: 'Asteroid Bennu Dekat Bumi',
    targetDistanceAU: 1.25,
    incidentTime: 'MET T+04:20:00 Waktu Misi',
    budgetCapMillion: 65.0,
    maxPayloadMassKg: 180,
    objectiveSummary: 
      'Petakan topografi permukaan asteroid dan komposisi mineral batuan dari orbit dekat 8 km.',
    incidentSummary: 
      'Pada jam keempat operasi, wahana ASTER-9 memutus transmisi data ilmiah. Komunikasi telemetri hilang total pada T+04:20 setelah wahana masuk bayangan asteroid.',
    legacyConfiguration: ASTER9_LEGACY_CONFIG,
    telemetryLogs: legacyRun.telemetryTrace,
    keyEvidencePool: [
      {
        id: 'ev_power_deficit',
        timeStr: defTimeStr,
        timeMinutes: defTimeMin,
        metric: 'power_draw',
        value: `Beban ${defLoad}W vs Surya ${defSolar}W defisit ${defDelta}W`,
        observedText: `Beban ${defLoad} W vs pembangkit surya ${defSolar} W, defisit ${defDelta} W`,
      },
      {
        id: 'ev_eclipse_entry',
        timeStr: eclTimeStr,
        timeMinutes: eclTimeMin,
        metric: 'solar',
        value: 'Pembangkit Surya : 0W Bayangan',
        observedText: 'Pembangkit surya jatuh ke 0 W — wahana memasuki bayangan',
      },
      {
        id: 'ev_cryo_freeze',
        timeStr: cryoTimeStr,
        timeMinutes: cryoTimeMin,
        metric: 'battery_temp',
        value: `Suhu Baterai : ${cryoTemp}°C Beku`,
        observedText: `Suhu sel ${cryoTemp}°C di bawah batas operasi baterai (-10°C)`,
      },
      {
        id: 'ev_uvlo_cutoff',
        timeStr: fatalTimeStr,
        timeMinutes: fatalTimeMin,
        metric: 'voltage',
        value: `Tegangan Bus : ${fatalVoltage.toFixed(1)}V Cutoff`,
        observedText: `Tegangan bus ${fatalVoltage.toFixed(1)} V di bawah ambang UVLO ${SIM.UVLO_V} V — pemadaman`,
      },
      {
        id: 'ev_fake_micrometeoroid',
        timeStr: 'T+01:20',
        timeMinutes: 80,
        metric: 'solar',
        value: 'Fluktuasi Kecil : 2W pada Panel',
        observedText: 'Sensor getaran mendeteksi goyangan mekanis ringan saat panel surya reposisi orientasi.',
        isRedHerring: true,
      },
      {
        id: 'ev_fake_doppler_drift',
        timeStr: 'T+03:00',
        timeMinutes: 180,
        metric: 'comms',
        value: 'Pergeseran Doppler : +120 Hz',
        observedText: 'Pergeseran frekuensi radio akibat lintasan wahana terhadap stasiun penerima DSN.',
        isRedHerring: true,
      },
    ],
    hypotheses: [
      {
        id: 'hyp_thermal_electrical_collapse',
        title: 'Kerusakan Bertingkat Termal dan Listrik saat Gerhana',
        category: 'electrical',
        description: 
          'Kapasitas baterai minim saat gerhana dan ketiadaan pemanas membuat baterai membeku. Tegangan anjlok drastis lalu memutus bus daya utama.',
        requiredEvidenceIds: ['ev_power_deficit', 'ev_eclipse_entry', 'ev_cryo_freeze', 'ev_uvlo_cutoff'],
        isCorrect: true,
        engineeringExplanation: 
          'Diagnosis Akurat! Baterai standar membeku di bawah minus 10 derajat. Masuk bayangan 75 menit dengan beban instrumen penuh menguras baterai dan memutus total daya sistem.',
      },
      {
        id: 'hyp_micrometeoroid_impact',
        title: 'Benturan Tabrakan Mikrometeoroid pada Panel Surya',
        category: 'propulsion',
        description: 
          'Partikel debu asteroid berkecepatan tinggi merusak fisik panel surya sehingga wahana kehilangan daya mendadak.',
        requiredEvidenceIds: ['ev_fake_micrometeoroid'],
        isCorrect: false,
        engineeringExplanation: 
          'Diagnosis Salah. Data telemetri menunjukkan panel surya menghasilkan 160W konstan hingga wahana masuk bayangan asteroid.',
      },
      {
        id: 'hyp_antenna_gimbal_jam',
        title: 'Macet Mekanis pada Poros Antena Pemancar',
        category: 'telecom',
        description: 
          'Motor penggerak antena pemancar macet sehingga sinyal tidak lagi mengarah ke stasiun penerima Bumi.',
        requiredEvidenceIds: ['ev_fake_doppler_drift'],
        isCorrect: false,
        engineeringExplanation: 
          'Diagnosis Salah. Antena pemancar bekerja normal hingga menit ke-260. Hilang sinyal terjadi akibat pemutusan tegangan bus utama.',
      },
    ],
  },
];
