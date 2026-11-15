export type Language = 'en' | 'id';

export interface Translations {
  common: {
    back: string;
    close: string;
    confirm: string;
    cancel: string;
    continue: string;
    next: string;
    prev: string;
    details: string;
    status: string;
    warning: string;
    critical: string;
    fatal: string;
    nominal: string;
    locked: string;
  };
  header: {
    flightDirectorate: string;
    briefing: string;
    investigation: string;
    rootCause: string;
    redesign: string;
    simulation: string;
    debrief: string;
    activeCadet: string;
    returnToLobby: string;
    audioOn: string;
    audioOff: string;
    fullscreen: string;
    langEn: string;
    langId: string;
  };
  onboarding: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    welcomeDesc: string;
    badgeText: string;
    nameLabel: string;
    namePlaceholder: string;
    nameHint: string;
    startBtn: string;
    expTitle: string;
    expNewbie: string;
    expNewbieDesc: string;
    expVeteran: string;
    expVeteranDesc: string;
    tutorialSkip: string;
    tutorialFinish: string;
  };
  lobby: {
    activeCadet: string;
    newGame: string;
    newGameSub: string;
    missions: string;
    missionsSub: string;
    events: string;
    eventsSub: string;
    crew: string;
    crewSub: string;
    coOp: string;
    coOpSub: string;
    settings: string;
    settingsSub: string;
    deployMission: string;
    resumeMission: string;
    lockedWarehouse: string;
    activeProgress: string;
    forensicPhase: string;
    targetDossier: string;
    objectiveLabel: string;
    cycleCrew: string;
  };
  roster: {
    albumTitle: string;
    detailTitle: string;
    totalCrew: string;
    allCrew: string;
    command: string;
    telemetry: string;
    epsPower: string;
    engineering: string;
    sortList: string;
    sortLevel: string;
    sortRarity: string;
    levelLabel: string;
    statusTab: string;
    skillsTab: string;
    equipmentTab: string;
    breakthroughTab: string;
    assignRole: string;
    roleSpecialization: string;
    divisionLabel: string;
  };
  briefing: {
    title: string;
    incidentTime: string;
    targetBody: string;
    targetDistance: string;
    budgetCap: string;
    maxPayloadMass: string;
    primaryObjective: string;
    incidentDossier: string;
    telemetryHint: string;
    startInvestigation: string;
    launchSpecs: string;
  };
  investigation: {
    studioTitle: string;
    blackBoxTitle: string;
    visualizerTitle: string;
    eclipseZone: string;
    busVoltage: string;
    solarGeneration: string;
    batterySOC: string;
    batteryTemp: string;
    powerLoad: string;
    linkSNR: string;
    pinEvidence: string;
    pinnedEvidence: string;
    pinnedCount: string;
    proceedToRootCause: string;
    glitchDetected: string;
    scrubHint: string;
    uvloThreshold: string;
    freezingThreshold: string;
  };
  rootCause: {
    matrixTitle: string;
    matrixSubtitle: string;
    causalChainTitle: string;
    pinnedEvidencePool: string;
    hypothesesTitle: string;
    requiredEvidenceLabel: string;
    submitDiagnosis: string;
    correctDiagnosis: string;
    incorrectDiagnosis: string;
    missingEvidenceWarning: string;
    proceedToRedesign: string;
  };
  redesign: {
    builderTitle: string;
    builderSubtitle: string;
    solarSubsystem: string;
    batterySubsystem: string;
    thermalSubsystem: string;
    payloadSuite: string;
    launcherSubsystem: string;
    powerBalance: string;
    massBudget: string;
    costBudget: string;
    launchSimulation: string;
    replayLegacyFailure: string;
    massLimitWarning: string;
    budgetLimitWarning: string;
  };
  simulation: {
    title: string;
    trajectoryProgress: string;
    targetDuration: string;
    orbitEventLog: string;
    sunlitPhase: string;
    eclipsePhase: string;
    nominalTelemetry: string;
    systemFailed: string;
    proceedToDebrief: string;
  };
  debrief: {
    title: string;
    missionGrade: string;
    fivePillarsTitle: string;
    accuracyPillar: string;
    engineeringPillar: string;
    missionSuccessPillar: string;
    resourcePillar: string;
    speedPillar: string;
    ghostReplayTitle: string;
    ghostReplayDesc: string;
    legacyDesignLabel: string;
    refitMark2Label: string;
    subsystemComparison: string;
    legacyAster9: string;
    refitMark2: string;
    engineeringImpact: string;
    lessonsLearned: string;
    lessonsLearnedText: string;
    retryMission: string;
    modifyDesign: string;
    exportReport: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      back: 'BACK',
      close: 'CLOSE',
      confirm: 'CONFIRM',
      cancel: 'CANCEL',
      continue: 'CONTINUE',
      next: 'NEXT',
      prev: 'PREV',
      details: 'DETAILS',
      status: 'STATUS',
      warning: 'WARNING',
      critical: 'CRITICAL',
      fatal: 'FATAL',
      nominal: 'NOMINAL',
      locked: 'LOCKED',
    },
    header: {
      flightDirectorate: 'DEEP SPACE FORENSIC FLIGHT DIRECTORATE',
      briefing: 'BRIEFING',
      investigation: 'INVESTIGATION',
      rootCause: 'ROOT CAUSE',
      redesign: 'REDESIGN',
      simulation: 'SIMULATION',
      debrief: 'DEBRIEF',
      activeCadet: 'ACTIVE CADET',
      returnToLobby: 'RETURN TO HANGAR',
      audioOn: 'MUTE AUDIO',
      audioOff: 'UNMUTE AUDIO',
      fullscreen: 'TOGGLE FULLSCREEN',
      langEn: 'EN',
      langId: 'ID',
    },
    onboarding: {
      welcomeTitle: 'ORBITA NOVA : FLIGHT DIRECTORATE',
      welcomeSubtitle: 'NASA Deep Space Anomaly Forensic Simulation',
      welcomeDesc: 'Welcome to the deep space forensic operations center. Investigate telemetry blackouts, diagnose cascade failures, and re-engineer exploration spacecraft.',
      badgeText: 'AUTHORIZED PERSONNEL ONLY',
      nameLabel: 'ENTER CALLSIGN / ASTRONAUT NAME',
      namePlaceholder: 'e.g., CDR. SHEPARD',
      nameHint: 'Your callsign will be permanently recorded in the flight debrief dossier.',
      startBtn: 'INITIALIZE MISSION CONTROL',
      expTitle: 'OPERATIONAL EXPERIENCE LEVEL',
      expNewbie: 'CADET FLIGHT CONTROLLER (GUIDED)',
      expNewbieDesc: 'Includes automated HUD diagnostic hints and telemetry guidance.',
      expVeteran: 'FLIGHT INVESTIGATION CHIEF (EXPERT)',
      expVeteranDesc: 'Unrestricted raw telemetry stream with zero automatic assists.',
      tutorialSkip: 'SKIP BRIEFING',
      tutorialFinish: 'PROCEED TO HANGAR',
    },
    lobby: {
      activeCadet: 'ACTIVE CADET',
      newGame: 'NEW MISSION',
      newGameSub: 'INITIAL INCIDENT',
      missions: 'DOSSIER',
      missionsSub: 'INVESTIGATION LOGS',
      events: 'EVENTS',
      eventsSub: 'DSN PROTOCOL 2026',
      crew: 'CREW ROSTER',
      crewSub: 'SPECIALIST ALBUM',
      coOp: 'CO-OP SQUAD',
      coOpSub: 'LINK PEER CONSOLE',
      settings: 'SETTINGS',
      settingsSub: 'AUDIO & GRAPHICS',
      deployMission: 'LAUNCH INVESTIGATION',
      resumeMission: 'RESUME INVESTIGATION',
      lockedWarehouse: 'Access Restricted. Submit Root Cause diagnosis before modifying hardware.',
      activeProgress: 'ACTIVE PROGRESS : CASE 01',
      forensicPhase: 'FORENSIC PHASE',
      targetDossier: 'INCIDENT DOSSIER',
      objectiveLabel: 'PRIMARY OBJECTIVE',
      cycleCrew: 'CYCLE OPERATOR',
    },
    roster: {
      albumTitle: 'CREW ARCHIVE ALBUM',
      detailTitle: 'SPECIALIST DOSSIER',
      totalCrew: 'TOTAL SPECIALISTS',
      allCrew: 'ALL CREW',
      command: 'COMMAND',
      telemetry: 'TELEMETRY',
      epsPower: 'EPS POWER',
      engineering: 'ENGINEERING',
      sortList: 'DEFAULT ORDER',
      sortLevel: 'BY LEVEL',
      sortRarity: 'BY RARITY',
      levelLabel: 'LV.',
      statusTab: 'STATUS',
      skillsTab: 'SKILLS',
      equipmentTab: 'EQUIPMENT',
      breakthroughTab: 'BREAKTHROUGH',
      assignRole: 'ASSIGN AS ACTIVE CONTROLLER',
      roleSpecialization: 'SPECIALIZATION',
      divisionLabel: 'DIVISION',
    },
    briefing: {
      title: 'INCIDENT BRIEFING DOSSIER',
      incidentTime: 'INCIDENT TIMESTAMP',
      targetBody: 'TARGET CELESTIAL BODY',
      targetDistance: 'HELIOCENTRIC DISTANCE',
      budgetCap: 'MAXIMUM BUDGET CAP',
      maxPayloadMass: 'MAX LAUNCH VEHICLE CAPACITY',
      primaryObjective: 'PRIMARY MISSION OBJECTIVE',
      incidentDossier: 'INCIDENT TELEMETRY REPORT',
      telemetryHint: 'Mission Control lost telemetry contact during asteroid eclipse entry. Review recorded sensor traces to reconstruct failure chain.',
      startInvestigation: 'OPEN TELEMETRY STUDIO',
      launchSpecs: 'FLIGHT HARDWARE SPECIFICATIONS',
    },
    investigation: {
      studioTitle: 'TELEMETRY FORENSIC STUDIO',
      blackBoxTitle: 'AUDIO COCKPIT BLACK BOX',
      visualizerTitle: 'SPACECRAFT SCHEMATIC CUTAWAY',
      eclipseZone: 'ECLIPSE UMBRA ZONE',
      busVoltage: 'BUS VOLTAGE',
      solarGeneration: 'SOLAR GENERATION',
      batterySOC: 'BATTERY SOC',
      batteryTemp: 'BATTERY TEMP',
      powerLoad: 'POWER DRAW',
      linkSNR: 'DSN LINK SNR',
      pinEvidence: 'PIN EVIDENCE',
      pinnedEvidence: 'PINNED EVIDENCE',
      pinnedCount: 'EVIDENCE LOGGED',
      proceedToRootCause: 'PROCEED TO ROOT CAUSE MATRIX',
      glitchDetected: 'ANOMALY DETECTED',
      scrubHint: 'Drag timeline slider to inspect temporal variations across subsystems.',
      uvloThreshold: 'UVLO CUTOFF THRESHOLD',
      freezingThreshold: '0°C FREEZING THRESHOLD',
    },
    rootCause: {
      matrixTitle: 'ROOT CAUSE HYPOTHESIS MATRIX',
      matrixSubtitle: 'Correlate pinned forensic evidence to test failure hypotheses.',
      causalChainTitle: 'SUBSYSTEM CAUSALITY DOMINO BOARD',
      pinnedEvidencePool: 'PINNED EVIDENCE POOL',
      hypothesesTitle: 'FORMULATED HYPOTHESES',
      requiredEvidenceLabel: 'REQUIRED EVIDENCE CORRELATIONS',
      submitDiagnosis: 'SUBMIT ROOT CAUSE DIAGNOSIS',
      correctDiagnosis: 'DIAGNOSIS CONFIRMED ACCURATE',
      incorrectDiagnosis: 'DIAGNOSIS REJECTED',
      missingEvidenceWarning: 'Additional supporting evidence required before submission.',
      proceedToRedesign: 'PROCEED TO SPACECRAFT REFIT',
    },
    redesign: {
      builderTitle: 'SPACECRAFT REFIT & RE-ENGINEERING',
      builderSubtitle: 'Reconfigure electrical, thermal, and payload subsystems within mass and budget limits.',
      solarSubsystem: 'POWER GENERATION',
      batterySubsystem: 'ENERGY STORAGE',
      thermalSubsystem: 'THERMAL PROTECTION',
      payloadSuite: 'SCIENTIFIC PAYLOAD SUITE',
      launcherSubsystem: 'LAUNCH VEHICLE TIER',
      powerBalance: 'POWER MARGIN BALANCE',
      massBudget: 'SPACECRAFT MASS BUDGET',
      costBudget: 'FINANCIAL COST BUDGET',
      launchSimulation: 'LAUNCH FLIGHT SIMULATION',
      replayLegacyFailure: 'REPLAY LEGACY FAILURE',
      massLimitWarning: 'Total mass exceeds launch vehicle capacity.',
      budgetLimitWarning: 'Total cost exceeds mission program cap.',
    },
    simulation: {
      title: 'ORBITAL FLIGHT SIMULATION HUD',
      trajectoryProgress: 'ORBITAL TRAJECTORY PROGRESS',
      targetDuration: 'TARGET MET DURATION',
      orbitEventLog: 'ORBITAL TELEMETRY EVENT LOG',
      sunlitPhase: 'SUNLIT ORBIT SECTOR',
      eclipsePhase: 'ECLIPSE UMBRA ZONE',
      nominalTelemetry: 'ALL TELEMETRY NOMINAL',
      systemFailed: 'SPACECRAFT BLACKOUT / MISSION FAILED',
      proceedToDebrief: 'PROCEED TO FLIGHT DEBRIEF',
    },
    debrief: {
      title: 'MISSION POST-FLIGHT DEBRIEF',
      missionGrade: 'EVALUATION GRADE',
      fivePillarsTitle: 'NASA 5-PILLAR SYSTEM EVALUATION',
      accuracyPillar: 'PILLAR 01 : ACCURACY',
      engineeringPillar: 'PILLAR 02 : ENGINEERING',
      missionSuccessPillar: 'PILLAR 03 : MISSION SCIENCE',
      resourcePillar: 'PILLAR 04 : BUDGET EFFICIENCY',
      speedPillar: 'PILLAR 05 : DECISION SPEED',
      ghostReplayTitle: 'GHOST REPLAY : TELEMETRY VOLTAGE COMPARISON',
      ghostReplayDesc: 'Red dashed curve shows legacy spacecraft power collapse. Green solid curve confirms refit design stability.',
      legacyDesignLabel: 'Legacy ASTER-9 Design',
      refitMark2Label: 'Refit Mark II Design',
      subsystemComparison: 'SUBSYSTEM COMPARISON : LEGACY VS REFIT MARK II',
      legacyAster9: 'Failed ASTER-9',
      refitMark2: 'Refit Mark II',
      engineeringImpact: 'Engineering Impact',
      lessonsLearned: 'AEROSPACE ENGINEERING PRINCIPLES LEARNED',
      lessonsLearnedText: 'In space systems engineering, no subsystem operates in isolation. Trimming thermal insulation froze the battery cells. Frozen chemistry induced voltage collapse. Voltage collapse tripped the UVLO cutoff, terminating the flight. Mission success demands harmonic balance across power, mass, thermal control, and cost.',
      retryMission: 'RETRY CASE',
      modifyDesign: 'MODIFY DESIGN',
      exportReport: 'EXPORT DOSSIER',
    },
  },
  id: {
    common: {
      back: 'KEMBALI',
      close: 'TUTUP',
      confirm: 'KONFIRMASI',
      cancel: 'BATAL',
      continue: 'LANJUT',
      next: 'LANJUT',
      prev: 'SEBELUMNYA',
      details: 'DETAIL',
      status: 'STATUS',
      warning: 'PERINGATAN',
      critical: 'KRITIS',
      fatal: 'FATAL',
      nominal: 'NOMINAL',
      locked: 'TERKUNCI',
    },
    header: {
      flightDirectorate: 'DIREKTORAT OPERASI INVESTIGASI ANTARIKSA',
      briefing: 'BRIEFING',
      investigation: 'INVESTIGASI',
      rootCause: 'AKAR MASALAH',
      redesign: 'DESAIN ULANG',
      simulation: 'SIMULASI',
      debrief: 'DEBRIEF',
      activeCadet: 'KADET AKTIF',
      returnToLobby: 'KEMBALI KE HANGAR',
      audioOn: 'SENYAPKAN SUARA',
      audioOff: 'AKTIFKAN SUARA',
      fullscreen: 'LAYAR PENUH',
      langEn: 'EN',
      langId: 'ID',
    },
    onboarding: {
      welcomeTitle: 'ORBITA NOVA : DIREKTORAT MISI',
      welcomeSubtitle: 'Simulasi Forensik Anomali Antariksa Dalam NASA',
      welcomeDesc: 'Selamat datang di pusat kendali investigasi kegagalan antariksa dalam. Selidiki telemetri pemadaman satelit, diagnosis kerusakan bertingkat, dan rancang ulang wahana antariksa.',
      badgeText: 'HANYA PERSONEL BERWENANG',
      nameLabel: 'MASUKKAN CALLSIGN / NAMA KADET',
      namePlaceholder: 'misal, KADET DIRGANTARA',
      nameHint: 'Callsign Anda akan tercatat permanen pada lembar evaluasi akhir misi.',
      startBtn: 'MEMULAI OPERASI KENDALI MISI',
      expTitle: 'TINGKAT PENGALAMAN OPERASIONAL',
      expNewbie: 'KADET OPERATOR BARU (PANDUAN LENGKAP)',
      expNewbieDesc: 'Disertai petunjuk diagnostik HUD dan arahan telemetri otomatis.',
      expVeteran: 'KEPALA TIM INVESTIGASI (AHLI)',
      expVeteranDesc: 'Aliran telemetri murni tanpa bantuan otomatis.',
      tutorialSkip: 'LEWATI PENJELASAN',
      tutorialFinish: 'MASUK KE HANGAR',
    },
    lobby: {
      activeCadet: 'KADET AKTIF',
      newGame: 'GAME BARU',
      newGameSub: 'KASUS PERDANA',
      missions: 'TUGAS',
      missionsSub: 'MISI INVESTIGASI',
      events: 'EVENT',
      eventsSub: 'PROTOKOL DSN 2026',
      crew: 'AWAK MISI',
      crewSub: 'ALBUM SPESIALIS',
      coOp: 'TIM CO-OP',
      coOpSub: 'SAMBUNG KONSOL PEER',
      settings: 'PENGATURAN',
      settingsSub: 'AUDIO & GRAFIK',
      deployMission: 'LUNCURKAN INVESTIGASI',
      resumeMission: 'LANJUTKAN INVESTIGASI',
      lockedWarehouse: 'Akses Dibatasi. Selesaikan diagnosis akar masalah sebelum mengubah konfigurasi.',
      activeProgress: 'PROGRES AKTIF : KASUS 01',
      forensicPhase: 'FASE FORENSIK',
      targetDossier: 'BERKAS INSIDEN',
      objectiveLabel: 'SASARAN UTAMA',
      cycleCrew: 'GANTI OPERATOR',
    },
    roster: {
      albumTitle: 'ALBUM ARSIP AWAK',
      detailTitle: 'DETAIL SPESIALIS',
      totalCrew: 'TOTAL SPESIALIS',
      allCrew: 'SEMUA AWAK',
      command: 'KOMANDO',
      telemetry: 'TELEMETRI',
      epsPower: 'DAYA EPS',
      engineering: 'REKAYASA',
      sortList: 'URUTAN DAFTAR',
      sortLevel: 'URUTAN LEVEL',
      sortRarity: 'URUTAN RARITAS',
      levelLabel: 'LV.',
      statusTab: 'STATUS',
      skillsTab: 'KEAHLIAN',
      equipmentTab: 'PERALATAN',
      breakthroughTab: 'PENINGKATAN',
      assignRole: 'TETAPKAN SEBAGAI OPERATOR AKTIF',
      roleSpecialization: 'SPESIALISASI',
      divisionLabel: 'DIVISI',
    },
    briefing: {
      title: 'BERKAS INSIDEN MISI',
      incidentTime: 'WAKTU TERJADINYA INSIDEN',
      targetBody: 'BENDA LANGIT SASARAN',
      targetDistance: 'JARAK DARI MATAHARI',
      budgetCap: 'BATAS ANGGARAN MAKSIMAL',
      maxPayloadMass: 'KAPASITAS MASSA PELUNCUR',
      primaryObjective: 'SASARAN UTAMA MISI',
      incidentDossier: 'LAPORAN TELEMETRI INSIDEN',
      telemetryHint: 'Kendali Misi kehilangan kontak telemetri saat wahana masuk bayangan gerhana asteroid. Periksa grafik sensor untuk merekonstruksi rantai kegagalan.',
      startInvestigation: 'BUKA STUDIO TELEMETRI',
      launchSpecs: 'SPESIFIKASI WAHANA PENERBANGAN',
    },
    investigation: {
      studioTitle: 'STUDIO FORENSIK TELEMETRI',
      blackBoxTitle: 'KOTAK HITAM SUARA KOKPIT',
      visualizerTitle: 'SKEMATIK SUBSISTEM WAHANA',
      eclipseZone: 'ZONA BAYANGAN GERHANA',
      busVoltage: 'TEGANGAN BUS',
      solarGeneration: 'DAYA SURYA',
      batterySOC: 'KAPASITAS BATERAI',
      batteryTemp: 'SUHU BATERAI',
      powerLoad: 'KONSUMSI DAYA',
      linkSNR: 'MARGIN SINYAL DSN',
      pinEvidence: 'SEMATKAN BUKTI',
      pinnedEvidence: 'BUKTI TERSEMAT',
      pinnedCount: 'BUKTI TERCATAT',
      proceedToRootCause: 'LANJUT KE MATRIKS AKAR MASALAH',
      glitchDetected: 'ANOMALI TERDETEKSI',
      scrubHint: 'Geser penunjuk waktu untuk melihat perubahan parameter antarsubsistem.',
      uvloThreshold: 'AMBANG BATAS PEMADAMAN UVLO',
      freezingThreshold: 'AMBANG 0°C TITIK BEKU',
    },
    rootCause: {
      matrixTitle: 'MATRIKS HIPOTESIS AKAR MASALAH',
      matrixSubtitle: 'Korelasikan bukti telemetri untuk menguji hipotesis penyebab kegagalan.',
      causalChainTitle: 'PAPAN KAUSALITAS DOMINO SUBSISTEM',
      pinnedEvidencePool: 'DAFTAR BUKTI TERSEMAT',
      hypothesesTitle: 'HIPOTESIS TERSEDIA',
      requiredEvidenceLabel: 'KORELASI BUKTI DIBUTUHKAN',
      submitDiagnosis: 'KIRIMKAN DIAGNOSIS AKAR MASALAH',
      correctDiagnosis: 'DIAGNOSIS TERKONFIRMASI AKURAT',
      incorrectDiagnosis: 'DIAGNOSIS DITOLAK',
      missingEvidenceWarning: 'Bukti pendukung belum lengkap untuk mengajukan diagnosis.',
      proceedToRedesign: 'LANJUT KE RANCANG ULANG WAHANA',
    },
    redesign: {
      builderTitle: 'BENGKEL RANCANG ULANG WAHANA',
      builderSubtitle: 'Konfigurasikan ulang subsistem daya, termal, dan instrumen dalam batas massa dan anggaran.',
      solarSubsystem: 'PEMBANGKIT DAYA',
      batterySubsystem: 'PENYIMPANAN ENERGI',
      thermalSubsystem: 'PROTEKSI TERMAL',
      payloadSuite: 'PAKET INSTRUMEN SAINS',
      launcherSubsystem: 'ROKET PELUNCUR',
      powerBalance: 'NERACA CADANGAN DAYA',
      massBudget: 'ANGGARAN MASSA WAHANA',
      costBudget: 'ANGGARAN BIAYA PROGRAM',
      launchSimulation: 'UJI SIMULASI PENERBANGAN',
      replayLegacyFailure: 'PUTAR ULANG KEGAGALAN LAMA',
      massLimitWarning: 'Total massa melebihi kapasitas roket peluncur.',
      budgetLimitWarning: 'Total biaya melebihi pagu anggaran misi.',
    },
    simulation: {
      title: 'HUD SIMULASI LINTASAN ORBIT',
      trajectoryProgress: 'PROGRES LINTASAN ORBIT',
      targetDuration: 'TARGET DURASI MISI',
      orbitEventLog: 'LOG PERISTIWA TELEMETRI ORBIT',
      sunlitPhase: 'SEKTOR TERANG MATAHARI',
      eclipsePhase: 'ZONA BAYANGAN GERHANA',
      nominalTelemetry: 'SELURUH TELEMETRI NOMINAL',
      systemFailed: 'PEMADAMAN WAHANA / MISI GAGAL',
      proceedToDebrief: 'LANJUT KE EVALUASI MISI',
    },
    debrief: {
      title: 'EVALUASI AKHIR PASCA PENERBANGAN',
      missionGrade: 'NILAI EVALUASI',
      fivePillarsTitle: 'EVALUASI 5 PILAR SISTEM NASA',
      accuracyPillar: 'PILAR 01 : AKURASI',
      engineeringPillar: 'PILAR 02 : REKAYASA',
      missionSuccessPillar: 'PILAR 03 : SAINS MISI',
      resourcePillar: 'PILAR 04 : ANGGARAN',
      speedPillar: 'PILAR 05 : KECEPATAN',
      ghostReplayTitle: 'GHOST REPLAY : PERBANDINGAN TELEMETRI TEGANGAN BUS',
      ghostReplayDesc: 'Garis merah putus-putus menunjukkan keruntuhan tegangan wahana lama. Garis hijau membuktikan stabilitas desain baru.',
      legacyDesignLabel: 'Desain ASTER-9 Lama',
      refitMark2Label: 'Desain Refit Mark II Baru',
      subsystemComparison: 'PERBANDINGAN SUBSISTEM : DASAR LAMA VS REFIT MARK II',
      legacyAster9: 'Wahana Gagal ASTER-9',
      refitMark2: 'Refit Mark II',
      engineeringImpact: 'Dampak Rekayasa',
      lessonsLearned: 'PRINSIP PEMBELAJARAN REKAYASA ANTARIKSA',
      lessonsLearnedText: 'Dalam rekayasa misi antariksa, tidak ada subsistem yang bekerja sendirian. Pengurangan isolasi termal membuat baterai membeku. Baterai beku memicu kejatuhan tegangan. Kejatuhan tegangan mematikan sistem komputer secara permanen. Misi yang sukses adalah keseimbangan harmonis antara massa, daya, ketahanan termal, dan anggaran.',
      retryMission: 'ULANGI KASUS',
      modifyDesign: 'UBAH DESAIN',
      exportReport: 'UNDUH LAPORAN',
    },
  },
};
