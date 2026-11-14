import type { CaseFile, TelemetryPoint } from '../types/mission';

// Helper to generate realistic high-resolution telemetry curve
function generateAster9Telemetry(): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];

  for (let m = 0; m <= 360; m += 10) {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    const timeStr = `T+${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    let solar = 160;
    let powerDraw = 75;
    let isEclipse = false;
    let busVoltage = 28.2;
    let batterySOC = 100;
    let batteryTemp = 18;
    let dataBuffered = 5;
    let downlinkRate = 500;
    let signalSNR = 14.8;
    let eventLog: string | undefined = undefined;
    let severity: 'nominal' | 'warning' | 'critical' | 'fatal' = 'nominal';

    // Phase 1: Nominal cruise
    if (m < 150) {
      batterySOC = Math.max(96, 100 - (m * 0.02));
      batteryTemp = 18 + Math.sin(m * 0.05) * 2;
      busVoltage = 28.2 - (100 - batterySOC) * 0.01;
      signalSNR = 14.5 + Math.cos(m * 0.02) * 0.5;
    }
    // Phase 2: Spectrometer Activation at T+02:30 (m = 150)
    else if (m >= 150 && m < 195) {
      powerDraw = 220; // 75W bus + 95W spectrometer + ADCS 50W
      solar = 160;     // 60W net discharge deficit
      dataBuffered = 5 + (m - 150) * 1.5;
      batterySOC = 97 - ((m - 150) / 45) * 10; // drops to ~87%
      batteryTemp = 19;
      busVoltage = 27.5 - (100 - batterySOC) * 0.02;
      if (m === 150) {
        eventLog = 'PERINTAH: Spektrometer multispektral aktif. Kalibrasi sensor selesai.';
      }
    }
    // Phase 3: Asteroid Shadow / Eclipse at T+03:15 (m = 195)
    else if (m >= 195 && m < 250) {
      isEclipse = true;
      solar = 0; // zero solar generation in umbra!
      powerDraw = 220;
      dataBuffered = 72 + (m - 195) * 1.2;
      
      // Cooling rapidly due to lack of MLI & active heaters
      const eclipseMinutes = m - 195;
      batteryTemp = 19 - (eclipseMinutes * 0.7); // drops past 0°C to -19°C
      
      // Battery SOC draining fast without solar
      batterySOC = 87 - (eclipseMinutes * 0.9); // drops to ~38%
      busVoltage = 26.5 - (eclipseMinutes * 0.05);

      if (m === 195) {
        eventLog = 'ORBIT: Wahana memasuki bayangan gerhana asteroid. Fluks surya nol watt.';
        severity = 'warning';
      } else if (m === 230) {
        eventLog = 'PERINGATAN: Suhu sel baterai anjlok di bawah nol derajat. Hambatan naik.';
        severity = 'warning';
      }
    }
    // Phase 4: Cryogenic Battery Voltage Sag at T+04:10 (m = 250) to T+05:00 (m = 300)
    else if (m >= 250 && m < 300) {
      isEclipse = true;
      solar = 0;
      powerDraw = 210;
      const deepEclipseMins = m - 250;
      batteryTemp = -19.5 - (deepEclipseMins * 0.35); // drops down to -37°C!
      // Cryo voltage collapse: effective capacity plummets
      batterySOC = Math.max(2, 38 - (deepEclipseMins * 0.7));
      busVoltage = Math.max(22.1, 24.0 - (deepEclipseMins * 0.038));
      signalSNR = Math.max(6.0, 14.0 - (deepEclipseMins * 0.15));
      severity = 'critical';

      if (m === 250) {
        eventLog = 'KRITIS: Pembekuan termal sektor negatif. Hambatan baterai melonjak.';
      } else if (m === 280) {
        eventLog = 'PERINGATAN KRITIS: Voltase anjlok 22.4V mendekati batas pemutusan darurat.';
      }
    }
    // Phase 5: UVLO Trip and Loss of Signal at T+05:00 (m = 300) to T+06:00 (m = 360)
    else {
      isEclipse = m < 320; // still in shadow until 320
      solar = isEclipse ? 0 : 160;
      powerDraw = 0;
      batterySOC = 0;
      batteryTemp = -42 + (m > 320 ? (m - 320) * 0.5 : 0);
      busVoltage = 18.2; // Dead bus below UVLO
      downlinkRate = 0;
      signalSNR = -2.5; // No carrier lock
      severity = 'fatal';

      if (m === 300) {
        eventLog = 'KEGAGALAN FATAL: Tegangan anjlok 21.9V di bawah batas UVLO. Sistem padam total.';
      } else if (m === 330) {
        eventLog = 'SINYAL HILANG: Stasiun bumi kehilangan kuncian sinyal. Wahana tidak merespons.';
      }
    }

    points.push({
      timeStr,
      timeMinutes: m,
      busVoltage: Number(busVoltage.toFixed(2)),
      solarOutput: Math.round(solar),
      batterySOC: Math.max(0, Math.round(batterySOC)),
      batteryTemp: Number(batteryTemp.toFixed(1)),
      powerConsumption: Math.round(powerDraw),
      dataBuffered: Math.round(dataBuffered),
      downlinkRate: Math.round(downlinkRate),
      signalSNR: Number(signalSNR.toFixed(1)),
      isEclipse,
      eventLog,
      severity,
    });
  }

  return points;
}

export const CASE_FILES: CaseFile[] = [
  {
    id: 'case_aster9',
    missionName: 'ASTER-9 : Investigasi Asteroid Antariksa',
    targetObject: 'Asteroid Bennu Dekat Bumi',
    targetDistanceAU: 1.25,
    incidentTime: 'MET T+05:30:00 Waktu Misi',
    budgetCapMillion: 65.0,
    maxPayloadMassKg: 180,
    objectiveSummary: 
      'Petakan topografi permukaan asteroid dan komposisi mineral batuan dari orbit dekat 8 km.',
    incidentSummary: 
      'Pada jam kelima operasi, wahana ASTER-9 memutus transmisi data ilmiah. Komunikasi telemetri hilang total. Laporan kotak hitam siap diinvestigasi.',
    legacyConfiguration: {
      solar: 'solar_silicon_fixed',
      battery: 'battery_li_ion_basic',
      thermal: 'thermal_passive_minimal',
      payloads: ['payload_spectrometer', 'payload_lidar_altimeter'],
      comms: 'comms_x_band_dish',
      adcs: 'adcs_reaction_wheels_rcs',
      launcher: 'launch_smallsat_rideshare',
      orbit: 'orbit_equatorial_close',
    },
    telemetryLogs: generateAster9Telemetry(),
    keyEvidencePool: [
      {
        id: 'ev_power_deficit',
        timeStr: 'T+02:30',
        timeMinutes: 150,
        metric: 'power_draw',
        value: 'Konsumsi 220W vs Surya 160W defisit 60W',
        observedText: 'Saat spektrometer aktif, konsumsi daya total melampaui kemampuan sel surya silikon.',
      },
      {
        id: 'ev_eclipse_entry',
        timeStr: 'T+03:15',
        timeMinutes: 195,
        metric: 'solar',
        value: 'Fluks Surya : 0W Bayangan',
        observedText: 'Wahana masuk ke bayangan asteroid selama 75 menit. Baterai menanggung seluruh beban tanpa pasokan surya.',
      },
      {
        id: 'ev_cryo_freeze',
        timeStr: 'T+04:10',
        timeMinutes: 250,
        metric: 'battery_temp',
        value: 'Suhu Baterai : -28°C Beku',
        observedText: 'Tanpa pemanas aktif, suhu baterai anjlok. Hambatan dalam baterai melonjak tinggi.',
      },
      {
        id: 'ev_uvlo_cutoff',
        timeStr: 'T+05:00',
        timeMinutes: 300,
        metric: 'voltage',
        value: 'Tegangan Bus : 21.9V Cutoff',
        observedText: 'Tegangan bus jatuh di bawah ambang batas aman. Pemutusan darurat otomatis mematikan pemancar radio.',
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
          'Diagnosis Salah. Antena pemancar bekerja normal hingga menit ke-300. Hilang sinyal terjadi akibat pemutusan tegangan bus utama.',
      },
    ],
  },
];
