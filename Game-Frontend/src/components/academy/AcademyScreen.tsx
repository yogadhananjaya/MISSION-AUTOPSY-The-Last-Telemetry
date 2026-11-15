/* antislop: ORBITA NOVA Academy - Space Learning Center with 6 educational aerospace modules */
import React, { useState } from 'react';
import { 
  GraduationCap, 
  ArrowLeft, 
  BatteryCharging, 
  Sun, 
  Radio, 
  Flame, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  Play, 
  Sliders, 
  Info,
  BookOpen
} from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';
import { useMissionStore } from '../../store/useMissionStore';
import { sounds } from '../../utils/soundEngine';
import { useTranslation } from '../../i18n';

interface ModuleData {
  id: string;
  number: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  insight: {
    heading: string;
    headingEn: string;
    paragraphs: string[];
    paragraphsEn: string[];
    keyPoints: string[];
    keyPointsEn: string[];
  };
  quiz: {
    question: string;
    questionEn: string;
    options: { text: string; textEn: string; isCorrect: boolean; explanation: string; explanationEn: string }[];
  }[];
  practical: {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    paramName: string;
    paramNameEn: string;
    min: number;
    max: number;
    step: number;
    unit: string;
    defaultValue: number;
    calculate: (val: number) => {
      metric1: { label: string; labelEn: string; value: string; status: 'good' | 'warn' | 'crit' };
      metric2: { label: string; labelEn: string; value: string; status: 'good' | 'warn' | 'crit' };
      verdict: string;
      verdictEn: string;
    };
  };
}

const MODULES: ModuleData[] = [
  {
    id: 'mod01',
    number: '01',
    title: 'Sistem Daya Elektrik & Baterai',
    titleEn: 'Electrical Power System & Battery Management',
    subtitle: 'Prinsip Pembangkitan, Penyimpanan, & Krisis Gerhana',
    subtitleEn: 'Power Generation, Storage Dynamics & Eclipse Transit',
    icon: BatteryCharging,
    accentColor: '#f59e0b',
    insight: {
      heading: 'Dinamika Energi di Ruang Antariksa',
      headingEn: 'Energy Dynamics in Deep Space Operations',
      paragraphs: [
        'Satelit antariksa bergantung pada Electrical Power System (EPS) untuk menghasilkan, meregulasi, dan menyimpan energi. Sumber energi primer berasal dari foton matahari yang dikonversi oleh susunan panel surya fotovoltaik.',
        'Saat satelit melintasi bayangan benda angkasa (Eclipse / Umbra), produksi panel surya turun drastis ke 0 Watt. Di sinilah bank baterai kimia mengambil alih seluruh beban subsistem.',
        'Pada suhu ekstrem di bawah -10°C, reaksi elektrokimia baterai melambat. Voltase bus mengalami penurunan tajam (Cryogenic Voltage Sag). Jika tegangan bus anjlok di bawah batas Under-Voltage Lockout (UVLO 22V), komputer satelit akan mati mendadak.'
      ],
      paragraphsEn: [
        'Spacecraft rely on the Electrical Power System (EPS) to generate, regulate, and store electrical energy. The primary source is solar irradiance converted by photovoltaic arrays.',
        'When the spacecraft enters the shadow of an asteroid or planetary body (Eclipse / Umbra), solar output plummets to 0 Watts. The chemical battery bank must sustain the entire critical bus load.',
        'Under extreme cryogenic temperatures below -10°C, electrochemical kinetics slow down, causing severe Cryogenic Voltage Sag. If the bus voltage drops below the Under-Voltage Lockout threshold (UVLO 22V), onboard avionics enter an unrecoverable blackout.'
      ],
      keyPoints: [
        'Panel surya memproduksi 0W saat fase eclipse bayangan penuh (Umbra).',
        'Baterai dingin mengalami penurunan kapasitas efektif dan voltase output.',
        'Heater aktif diperlukan untuk menjaga sel baterai tetap di atas -10°C.',
        'Batas aman tegangan bus nominal wahana adalah 28V ± 4V.'
      ],
      keyPointsEn: [
        'Photovoltaic arrays generate 0W during total shadow eclipse (Umbra).',
        'Cold battery cells suffer dramatic capacity degradation and voltage sag.',
        'Active heaters are essential to maintain cell temperatures above -10°C.',
        'Nominal avionics power bus voltage standard is 28V ± 4V.'
      ]
    },
    quiz: [
      {
        question: 'Apa yang terjadi pada baterai satelit saat suhu turun di bawah -15°C tanpa pemanas?',
        questionEn: 'What happens to satellite batteries when temperature drops below -15°C without active heating?',
        options: [
          {
            text: 'Resistansi internal naik dan voltase anjlok drastis (Voltage Sag).',
            textEn: 'Internal resistance spikes and bus voltage collapses (Voltage Sag).',
            isCorrect: true,
            explanation: 'Reaksi kimia terhambat pada suhu beku, memicu drop voltase di bawah ambang UVLO.',
            explanationEn: 'Chemical kinetics slow down dramatically in extreme cold, triggering UVLO cutoff.'
          },
          {
            text: 'Kapasitas baterai meningkat karena efek superkonduktivitas.',
            textEn: 'Battery capacity increases due to superconductivity effects.',
            isCorrect: false,
            explanation: 'Baterai kimia antariksa bukan superkonduktor; dingin justru melumpuhkan difusi ion.',
            explanationEn: 'Chemical batteries are not superconductors; cryogenic cold severely degrades ion transport.'
          },
          {
            text: 'Produksi panel surya otomatis bertambah untuk mengimbangi baterai.',
            textEn: 'Solar array power automatically increases to compensate.',
            isCorrect: false,
            explanation: 'Panel surya tidak menghasilkan daya di dalam bayangan gerhana (0 W).',
            explanationEn: 'Solar panels generate zero power inside occulted shadows.'
          }
        ]
      },
      {
        question: 'Apa fungsi utama dari ambang batas UVLO (Under-Voltage Lockout)?',
        questionEn: 'What is the primary function of the UVLO (Under-Voltage Lockout) threshold?',
        options: [
          {
            text: 'Mematikan subsistem secara darurat sebelum baterai rusak permanen akibat deep discharge.',
            textEn: 'Trigger emergency load shedding to prevent irreversible cell damage from deep discharge.',
            isCorrect: true,
            explanation: 'UVLO melindungi kesehatan sel baterai dari kerusakan struktural akibat pengosongan total.',
            explanationEn: 'UVLO protects battery chemistry from permanent degradation caused by unrecoverable depletion.'
          },
          {
            text: 'Meningkatkan frekuensi pemancar radio ke stasiun bumi.',
            textEn: 'Boost radio transmitter frequency to Earth ground stations.',
            isCorrect: false,
            explanation: 'UVLO adalah mekanisme pengamanan daya elektrik, bukan modul frekuensi radio.',
            explanationEn: 'UVLO is an electrical protection threshold, not a communications protocol.'
          }
        ]
      }
    ],
    practical: {
      title: 'Simulasi Beban Eclipse vs Suhu Baterai',
      titleEn: 'Eclipse Load vs Battery Temperature Simulator',
      description: 'Atur daya pemanas aktif baterai (Heater Watts) untuk melihat kestabilan voltase bus saat melintasi gerhana 60 menit.',
      descriptionEn: 'Adjust active battery heater power (Heater Watts) to observe bus voltage stability during a 60-minute eclipse.',
      paramName: 'Daya Pemanas Baterai',
      paramNameEn: 'Battery Heater Power',
      min: 0,
      max: 60,
      step: 5,
      unit: 'W',
      defaultValue: 25,
      calculate: (val: number) => {
        const temp = -25 + (val * 0.7);
        const voltage = temp < -10 ? 21.0 + (temp + 25) * 0.25 : 26.5 + (temp * 0.05);
        const isSafe = temp >= -5 && voltage >= 24;
        const isWarn = temp >= -15 && voltage >= 22;
        return {
          metric1: {
            label: 'Suhu Baterai',
            labelEn: 'Battery Temp',
            value: `${temp.toFixed(1)} °C`,
            status: temp >= -5 ? 'good' : (temp >= -15 ? 'warn' : 'crit')
          },
          metric2: {
            label: 'Voltase Bus',
            labelEn: 'Bus Voltage',
            value: `${voltage.toFixed(1)} V`,
            status: voltage >= 24 ? 'good' : (voltage >= 22 ? 'warn' : 'crit')
          },
          verdict: isSafe 
            ? 'NOMINAL: Sel baterai hangat, sistem beroperasi stabil melintasi gerhana.' 
            : (isWarn ? 'PERINGATAN: Tegangan mendekati batas UVLO, risiko fluktuasi data.' : 'KRITIS: Voltase anjlok di bawah 22V! Sistem mengalami pemadaman total (Blackout).'),
          verdictEn: isSafe 
            ? 'NOMINAL: Cells conditioned, power bus remains stable through eclipse.' 
            : (isWarn ? 'WARNING: Voltage approaching UVLO margin; telemetry at risk.' : 'CRITICAL: Voltage below 22V UVLO threshold! Spacecraft blackout occurs.')
        };
      }
    }
  },
  {
    id: 'mod02',
    number: '02',
    title: 'Teknologi Panel Surya Antariksa',
    titleEn: 'Space Photovoltaic Array Engineering',
    subtitle: 'Efisiensi Sel GaAs vs Silikon, Sudut Kosinus, & Degradasi',
    subtitleEn: 'GaAs vs Silicon Cells, Cosine Losses & Radiation Aging',
    icon: Sun,
    accentColor: '#38bdf8',
    insight: {
      heading: 'Fisika Panel Surya di Luar Atmosfer',
      headingEn: 'Photovoltaic Physics Beyond Atmosphere',
      paragraphs: [
        'Di orbit antariksa, tidak ada atmosfer untuk menyaring radiasi surya (Solar Constant pada 1 AU ~ 1361 W/m²). Namun fluks energi yang diterima sel bergantung pada sudut datang cahaya matahari (Sun Angle).',
        'Hukum Kosinus Lambert menyatakan bahwa daya yang dipanen sebanding dengan cos(θ). Jika satelit miring 45 derajat terhadap matahari, produksi energi berkurang hingga ~30%.',
        'Teknologi sel surya modern menggunakan Triple-Junction Gallium Arsenide (GaAs) dengan efisiensi mencapai ~30%, jauh melampaui sel Silikon konvensional (~17%). Namun radiasi proton kosmik secara perlahan mendegradasi kisi kristal sel sekitar 1-2% per tahun operasional.'
      ],
      paragraphsEn: [
        'In space, there is no atmospheric attenuation (Solar Constant at 1 AU ~ 1361 W/m²). However, flux harvested by the solar array depends strictly on the Sun-Pointing Angle.',
        "Lambert's Cosine Law dictates that array output scales with cos(θ). If the spacecraft slews 45° off-sun, power production drops by ~30%.",
        'State-of-the-art space missions deploy Triple-Junction Gallium Arsenide (GaAs) cells with ~30% conversion efficiency, outperforming traditional Silicon cells (~17%). Nevertheless, cosmic proton bombardment degrades crystalline lattice cells by 1-2% annually.'
      ],
      keyPoints: [
        'Daya keluaran panel = Efisiensi × Area × Fluks Surya × cos(Sudut Datang).',
        'Sel GaAs memiliki ketahanan radiasi dan efisiensi jauh lebih tinggi dibanding Silikon.',
        'Sistem kendali orientasi (ADCS) harus menjaga panel tegak lurus ke arah matahari.',
        'Degradasi tahunan harus diperhitungkan dalam kalkulasi Power Margin akhir misi.'
      ],
      keyPointsEn: [
        'Array Output = Efficiency × Surface Area × Solar Flux × cos(Incident Angle).',
        'Gallium Arsenide (GaAs) cells offer superior radiation tolerance and 30%+ efficiency.',
        'Attitude Determination and Control (ADCS) must maintain normal sun-pointing alignment.',
        'Annual degradation must be factored into end-of-life (EOL) power margin reserves.'
      ]
    },
    quiz: [
      {
        question: 'Jika sudut datang matahari miring sebesar 60° dari garis normal panel surya, berapa daya yang dihasilkan dibanding orientasi tegak lurus?',
        questionEn: 'If the solar incidence angle is 60° from array normal, what fraction of full power is produced?',
        options: [
          {
            text: '50% (karena cos(60°) = 0.50)',
            textEn: '50% (because cos(60°) = 0.50)',
            isCorrect: true,
            explanation: 'Fluks energi berkurang proporsional dengan kosinus sudut datang.',
            explanationEn: 'Photovoltaic energy flux scales directly with the cosine of the sun angle.'
          },
          {
            text: '100% (cahaya matahari di antariksa selalu terkonsentrasi)',
            textEn: '100% (space sunlight is always concentrated)',
            isCorrect: false,
            explanation: 'Luas area proyeksi efektif berkurang saat panel miring.',
            explanationEn: 'Effective cross-sectional collection area shrinks when tilted.'
          }
        ]
      }
    ],
    practical: {
      title: 'Kalkulator Sudut Datang & Output Watt',
      titleEn: 'Sun Angle & Photovoltaic Yield Calculator',
      description: 'Gerakkan sudut kemiringan panel terhadap matahari untuk melihat penurunan daya kosinus.',
      descriptionEn: 'Vary the array tilt angle relative to the sun vector to observe cosine losses.',
      paramName: 'Sudut Kemiringan (Theta)',
      paramNameEn: 'Tilt Angle (Theta)',
      min: 0,
      max: 85,
      step: 5,
      unit: '°',
      defaultValue: 15,
      calculate: (val: number) => {
        const rad = (val * Math.PI) / 180;
        const cosFactor = Math.cos(rad);
        const rawWatts = 420 * cosFactor;
        return {
          metric1: {
            label: 'Efisiensi Orientasi',
            labelEn: 'Pointing Factor',
            value: `${(cosFactor * 100).toFixed(0)} %`,
            status: cosFactor >= 0.85 ? 'good' : (cosFactor >= 0.5 ? 'warn' : 'crit')
          },
          metric2: {
            label: 'Daya Terapanen',
            labelEn: 'Harvested Power',
            value: `${rawWatts.toFixed(0)} W`,
            status: rawWatts >= 350 ? 'good' : (rawWatts >= 200 ? 'warn' : 'crit')
          },
          verdict: cosFactor >= 0.85 
            ? 'OPTIMAL: Daya surya cukup untuk menyuplai seluruh instrumen sains dan mengisi baterai.'
            : (cosFactor >= 0.5 ? 'SUBOPTIMAL: Daya terbatas, hanya cukup untuk telemetri dasar.' : 'KRITIS: Kosinus drop drastis! Baterai mulai terkuras untuk menutupi defisit.'),
          verdictEn: cosFactor >= 0.85 
            ? 'OPTIMAL: Photovoltaic output sufficient to power science payloads and recharge batteries.'
            : (cosFactor >= 0.5 ? 'SUBOPTIMAL: Restricted power budget; only baseline telemetry sustained.' : 'CRITICAL: Severe cosine losses! Battery begins discharging to cover shortfall.')
        };
      }
    }
  },
  {
    id: 'mod03',
    number: '03',
    title: 'Sistem Komunikasi Antariksa',
    titleEn: 'Deep Space Telecommunications',
    subtitle: 'Deep Space Network (DSN), High Gain Antenna, & Laser DSOC',
    subtitleEn: 'Deep Space Network 70m Dishes, High-Gain Tracking & Laser Links',
    icon: Radio,
    accentColor: '#10b981',
    insight: {
      heading: 'Menembus Jarak Jutaan Kilometer',
      headingEn: 'Bridging Millions of Kilometers in Deep Space',
      paragraphs: [
        'Komunikasi antariksa jarak jauh mengandalkan gelombang elektromagnetik gelombang mikro (X-Band 8.4 GHz atau Ka-Band 32 GHz). Sinyal mengalami redaman jarak kuadrat (Free Space Path Loss) yang sangat masif.',
        'NASA Deep Space Network (DSN) menggunakan tiga kompleks antena raksasa (Goldstone, Madrid, Canberra) berdiameter 34 meter hingga 70 meter untuk menangkap sinyal selemah 1 attowatt (10⁻¹⁸ W).',
        'Antena High-Gain (HGA) memfokuskan pancaran gelombang ke berkas sempit yang tajam. Kesalahan penunjuk (Pointing Error) sekecil 0.5 derajat dapat menyebabkan Loss of Signal (LOS). Teknologi terbaru Deep Space Optical Communications (DSOC) menggunakan laser inframerah untuk meningkatkan laju data hingga 10–100 kali lipat.'
      ],
      paragraphsEn: [
        'Deep-space communication relies on microwave frequencies (X-Band 8.4 GHz or Ka-Band 32 GHz). Signals suffer immense Free Space Path Loss proportional to the inverse square of distance.',
        'The NASA Deep Space Network (DSN) utilizes three ground complexes (Goldstone, Madrid, Canberra) equipped with 34m and 70m parabolic dishes capable of discerning signals down to 1 attowatt (10⁻¹⁸ W).',
        'High-Gain Antennas (HGA) focus RF energy into a pencil-thin beam. A pointing misorientation as small as 0.5° can cause immediate Loss of Signal (LOS). Deep Space Optical Communications (DSOC) leverages pulsed infrared lasers to boost data rates by 10x-100x over traditional RF.'
      ],
      keyPoints: [
        'Redaman sinyal meningkat drastis seiring kuadrat jarak wahana ke bumi (1/R²).',
        'Antena High-Gain membutuhkan akurasi penunjuk (Pointing Accuracy) sangat tinggi.',
        'Margin SNR di atas 3 dB adalah syarat mutlak agar paket data tidak mengalami bit corruption.',
        'Sistem komunikasi laser fotonik menawarkan bandwidth gigabit namun sensitif terhadap goyangan orientasi.'
      ],
      keyPointsEn: [
        'Signal attenuation scales with the inverse square of interplanetary distance (1/R²).',
        'High-Gain Antennas require extreme gimbal pointing precision.',
        'An SNR margin above +3 dB is the baseline threshold to prevent catastrophic packet corruption.',
        'Optical photonic laser links provide gigabit throughput but demand micro-radian pointing stability.'
      ]
    },
    quiz: [
      {
        question: 'Mengapa antena High-Gain Antenna (HGA) tidak selalu digunakan sepanjang waktu?',
        questionEn: 'Why is a High-Gain Antenna (HGA) not kept active at all times?',
        options: [
          {
            text: 'Berkas sinyalnya sangat sempit dan membutuhkan orientasi wahana mengarah presisi ke bumi.',
            textEn: 'Its beamwidth is extremely narrow and requires precise closed-loop pointing at Earth.',
            isCorrect: true,
            explanation: 'Jika satelit berputar tak terkendali (tumbling), hanya antena omni-direksional Low-Gain yang bisa menangkap sinyal darurat.',
            explanationEn: 'If a spacecraft is tumbling, only an omnidirectional Low-Gain Antenna can maintain emergency carrier locks.'
          },
          {
            text: 'HGA hanya dapat mengirim data suara dan tidak bisa mengirim gambar.',
            textEn: 'HGA can only transmit voice data and cannot downlink science images.',
            isCorrect: false,
            explanation: 'HGA justru dirancang khusus untuk mentransmisikan data sains berkecepatan tinggi.',
            explanationEn: 'HGA is expressly engineered for high-bandwidth science telemetry payloads.'
          }
        ]
      }
    ],
    practical: {
      title: 'Simulator Margin Sinyal DSN (SNR Budget)',
      titleEn: 'DSN Link Margin & SNR Budget Simulator',
      description: 'Atur diameter reflektor antena wahana untuk melihat dampaknya terhadap laju downlink data sains.',
      descriptionEn: 'Adjust spacecraft antenna dish diameter to evaluate downlink throughput to DSN 70m stations.',
      paramName: 'Diameter Antena Parabola',
      paramNameEn: 'Dish Reflector Diameter',
      min: 0.5,
      max: 3.0,
      step: 0.25,
      unit: 'm',
      defaultValue: 1.5,
      calculate: (val: number) => {
        const snr = (val * 4.2) - 1.5;
        const rateKbps = Math.round(Math.pow(val, 2) * 64);
        return {
          metric1: {
            label: 'Link Margin (SNR)',
            labelEn: 'SNR Margin',
            value: `${snr.toFixed(1)} dB`,
            status: snr >= 5 ? 'good' : (snr >= 2 ? 'warn' : 'crit')
          },
          metric2: {
            label: 'Laju Data Downlink',
            labelEn: 'Downlink Rate',
            value: `${rateKbps} kbps`,
            status: rateKbps >= 150 ? 'good' : (rateKbps >= 50 ? 'warn' : 'crit')
          },
          verdict: snr >= 5 
            ? 'KONEKSI SEMPURNA: Paket telemetri dan data spektrometri ditransmisikan tanpa packet loss.'
            : (snr >= 2 ? 'MARGIN MINIMAL: Laju bit dikurangi untuk mencegah galat parity data.' : 'LOSS OF LOCK: Sinyal tenggelam di bawah noise lantai kosmik DSN!'),
          verdictEn: snr >= 5 
            ? 'ROBUST LINK: Zero packet drops; high-resolution science images streaming continuously.'
            : (snr >= 2 ? 'MARGINAL LINK: Data rate stepped down to preserve parity integrity.' : 'LOSS OF LOCK: Carrier submerged beneath thermal cosmic noise floor!')
        };
      }
    }
  },
  {
    id: 'mod04',
    number: '04',
    title: 'Propulsi & Manajemen Termal',
    titleEn: 'Propulsion & Space Thermal Management',
    subtitle: 'Vakum Mutlak, Selimut MLI, Pemanas RHU, & Pendorong Gas Dingin',
    subtitleEn: 'Thermal Vacuum, Multi-Layer Insulation, RHU Heaters & Cold Gas Jets',
    icon: Flame,
    accentColor: '#ec4899',
    insight: {
      heading: 'Menaklukkan Suhu Ekstrem di Luar Angkasa',
      headingEn: 'Conquering Thermal Extremes in Deep Vacuum',
      paragraphs: [
        'Di ruang hampa udara, tidak ada konveksi atmosfer untuk mentransfer panas. Panas hanya dapat berpindah melalui konduksi internal antar struktur padat dan radiasi gelombang elektromagnetik inframerah ke latar belakang angkasa 3 Kelvin (-270°C).',
        'Sisi satelit yang menghadap langsung ke matahari dapat mendidih hingga +120°C, sementara sisi bayangan mendingin hingga -150°C. Gradien termal yang timpang ini menyebabkan tegangan mekanis pada avionik dan tangki propelan.',
        'Sistem termal pasif menggunakan selimut Multi-Layer Insulation (MLI terbuat dari Mylar/Kapton berlapis aluminium) untuk memantulkan radiasi, sedangkan radiator emisi membuang panas berlebih. Pendorong gas dingin (Cold Gas Nitrogen) memberikan impuls halus tanpa menghasilkan api pembakaran bersuhu tinggi.'
      ],
      paragraphsEn: [
        'In space vacuum, convection cannot occur. Heat transfer is strictly limited to structural conduction and radiative emission toward the 3-Kelvin (-270°C) cosmic microwave background.',
        'The sun-facing side of a spacecraft can bake at +120°C, while shadowed appendages plunge to -150°C. This severe thermal gradient causes thermal fatigue across propellant lines and avionics.',
        'Passive thermal design uses aluminized Mylar/Kapton Multi-Layer Insulation (MLI) blankets to reflect radiative heat, while optical solar reflectors radiate internal waste heat. Cold gas thrusters provide clean attitude pulses without corrosive rocket exhaust plumes.'
      ],
      keyPoints: [
        'Ruang hampa meniadakan konveksi udara; hanya radiasi dan konduksi yang bekerja.',
        'Selimut MLI memantulkan hingga 95% radiasi termal eksternal.',
        'Tangki propelan monopropelan hidrazin membeku pada +2°C dan membutuhkan pemanas aktif.',
        'Distribusi panas internal diatur melalui heat pipes berfluida amonia tertutup.'
      ],
      keyPointsEn: [
        'Space vacuum eliminates convective cooling; only radiative and conductive heat paths exist.',
        'Multi-Layer Insulation (MLI) blankets reflect up to 95% of incident thermal radiation.',
        'Hydrazine propellant freezes at +2°C, requiring constant active heating line protection.',
        'Internal waste heat is transported to external radiator sinks via sealed ammonia heat pipes.'
      ]
    },
    quiz: [
      {
        question: 'Bagaimana cara satelit membuang panas berlebih yang dihasilkan oleh komputer avionik di ruang angkasa?',
        questionEn: 'How does a satellite reject excess heat generated by onboard avionics in space?',
        options: [
          {
            text: 'Memancarkan radiasi inframerah melalui panel radiator khusus yang menghadap ke angkasa dingin.',
            textEn: 'Radiating infrared energy through dedicated radiator panels oriented toward deep space.',
            isCorrect: true,
            explanation: 'Radiasi termal adalah satu-satunya mekanisme pelepasan panas di lingkungan vakum antariksa.',
            explanationEn: 'Thermal radiation is the sole mechanism for rejecting heat into interplanetary vacuum.'
          },
          {
            text: 'Menggunakan kipas pendingin udara seperti komputer di bumi.',
            textEn: 'Using high-speed cooling fans identical to desktop computers.',
            isCorrect: false,
            explanation: 'Kipas tidak berfungsi di ruang hampa karena tidak ada molekul udara untuk ditiup.',
            explanationEn: 'Fans are useless in vacuum because there is no ambient gas medium to circulate.'
          }
        ]
      }
    ],
    practical: {
      title: 'Keseimbangan Termal MLI vs Suhu Wahana',
      titleEn: 'MLI Insulation vs Core Temperature Simulator',
      description: 'Ubah lapisan selimut insulasi termal (Lapisan MLI) untuk menguji keseimbangan suhu inti satelit.',
      descriptionEn: 'Vary the number of Multi-Layer Insulation (MLI) foil layers to examine core temperature equilibrium.',
      paramName: 'Jumlah Lapisan MLI',
      paramNameEn: 'MLI Foil Layers',
      min: 5,
      max: 30,
      step: 1,
      unit: 'lapisan',
      defaultValue: 15,
      calculate: (val: number) => {
        const coreTemp = 45 - (val * 1.6);
        return {
          metric1: {
            label: 'Suhu Inti Wahana',
            labelEn: 'Core Temperature',
            value: `${coreTemp.toFixed(1)} °C`,
            status: coreTemp >= 5 && coreTemp <= 25 ? 'good' : (coreTemp > 25 && coreTemp <= 40 ? 'warn' : 'crit')
          },
          metric2: {
            label: 'Fluks Emisi Radiator',
            labelEn: 'Radiator Emission Flux',
            value: `${(180 - (val * 3.5)).toFixed(0)} W/m²`,
            status: 'good'
          },
          verdict: coreTemp >= 5 && coreTemp <= 25 
            ? 'TERMAL IDEAL: Suhu berada di zona emas 5°C - 25°C, pelumas giroskop dan tangki propelan aman.'
            : (coreTemp > 25 ? 'TERLALU HANGAT: Risiko degradasi semikonduktor mikroprosesor.' : 'TERLALU DINGIN: Propelan membeku dan cairan isolator mengeras!'),
          verdictEn: coreTemp >= 5 && coreTemp <= 25 
            ? 'IDEAL ZONE: Temperature within nominal 5°C - 25°C range; reaction wheels and fuel lines protected.'
            : (coreTemp > 25 ? 'ELEVATED TEMP: Semiconductor lifetime degraded by overheating.' : 'CRYOGENIC FREEZE: Monopropellant lines at risk of freezing!')
        };
      }
    }
  },
  {
    id: 'mod05',
    number: '05',
    title: 'Integrasi Sistem Wahana Antariksa',
    titleEn: 'Spacecraft Systems Integration',
    subtitle: 'Ketergantungan Subsistem, Kegagalan Berantai, & Redundansi',
    subtitleEn: 'Cross-Subsystem Cascades, Fault Trees & EPS Cross-Strapping',
    icon: Cpu,
    accentColor: '#8b5cf6',
    insight: {
      heading: 'Arsitektur Sistem Terpadu Misi Luar Angkasa',
      headingEn: 'Holistic Architecture of Deep Space Probes',
      paragraphs: [
        'Sebuah wahana antariksa bukanlah kumpulan komponen yang terisolasi, melainkan organisme terintegrasi erat. Kegagalan pada satu subsistem (misalnya lonjakan penarikan daya muatan instrumen sains) dapat memicu kegagalan berantai ke subsistem daya, yang kemudian melumpuhkan pemanas termal, dan berujung pada hilangnya komunikasi radio.',
        'Systems Engineering menekankan prinsip "Decoupling" dan "Cross-Strapping": jalur listrik ganda (Redundant Power Buses A & B) dan isolasi beban otomatis agar anomali di satu sirkuit tidak merembet ke modul komputasi utama.',
        'Saat terjadi krisis daya mendadak, sistem manajemen muatan harus mampu melakukan Load Shedding: memutus daya instrumen non-kritis dalam hitungan milidetik untuk menyelamatkan sistem penunjang kehidupan dan modul radio pengendali.'
      ],
      paragraphsEn: [
        'A deep-space probe is not a loose assembly of isolated parts, but a tightly coupled cyber-physical system. A fault in one subsystem (e.g., an unpredicted payload power spike) triggers cascading failure in the EPS, starving thermal heaters, and causing catastrophic loss of carrier lock.',
        'Systems Engineering mandates strict Decoupling and Cross-Strapping: redundant power distribution harnesses (Main Bus A and B) and automatic circuit isolation to prevent localized shorts from compromising flight computers.',
        'During an unpredicted energy crisis, autonomous flight software executes Load Shedding: instantaneously killing power to non-essential science instruments to preserve attitude control and emergency radio beacons.'
      ],
      keyPoints: [
        'Kegagalan satu subsistem berisiko memicu efek domino jika isolasi sirkuit gagal.',
        'Redundansi A/B (Dual-String) memastikan satelit tetap hidup meski ada satu komponen hangus.',
        'Load shedding otomatis mengorbankan sains sementara demi keselamatan wahana.',
        'Cross-strapping menghubungkan cadangan daya ke pemancar darurat.'
      ],
      keyPointsEn: [
        'Single-point failures propagate cascades unless strict electrical isolation is enforced.',
        'Dual-String (A/B) redundancy guarantees survival even if an entire converter burns out.',
        'Autonomous load shedding sacrifices science returns to guarantee spacecraft survival.',
        'Cross-strapping bridges secondary power buses to emergency transmitters.'
      ]
    },
    quiz: [
      {
        question: 'Apa tujuan utama dari strategi "Autonomous Load Shedding" saat voltase bus mulai turun?',
        questionEn: 'What is the primary goal of "Autonomous Load Shedding" when bus voltage starts sagging?',
        options: [
          {
            text: 'Memutus daya ke instrumen sains non-esensial demi menjaga daya komputer penerbangan dan telemetri.',
            textEn: 'Disconnect non-essential science payloads to preserve avionics and emergency communication.',
            isCorrect: true,
            explanation: 'Sains bisa ditunda; kelangsungan hidup fisik satelit adalah prioritas tertinggi.',
            explanationEn: 'Science data can wait; the physical survival of the probe is the unconditional priority.'
          },
          {
            text: 'Mematikan seluruh sensor termasuk pemancar radio agar baterai terisi penuh.',
            textEn: 'Shut down all radio transmitters to allow batteries to charge instantly.',
            isCorrect: false,
            explanation: 'Mematikan pemancar radio akan menyebabkan hilangnya kendali total dari stasiun bumi.',
            explanationEn: 'Killing communications leads to loss of ground station contact and mission loss.'
          }
        ]
      }
    ],
    practical: {
      title: 'Uji Prioritas Alokasi Daya (Load Shedding Triage)',
      titleEn: 'Autonomous Load Shedding & Resource Allocation Triage',
      description: 'Tentukan berapa banyak daya yang dipangkas dari instrumen sains saat kapasitas baterai berada di 35%.',
      descriptionEn: 'Select how many Watts of payload power are shed when battery state-of-charge drops to 35%.',
      paramName: 'Beban Sains yang Dipangkas',
      paramNameEn: 'Science Load Shedding',
      min: 0,
      max: 120,
      step: 10,
      unit: 'W',
      defaultValue: 60,
      calculate: (val: number) => {
        const netDeficit = 80 - val;
        const survivalHours = netDeficit <= 0 ? 12.0 : Math.max(0.5, 4.0 - (netDeficit * 0.04));
        return {
          metric1: {
            label: 'Defisit Daya Bus',
            labelEn: 'Net Power Balance',
            value: `${netDeficit <= 0 ? `+${Math.abs(netDeficit)}` : `-${netDeficit}`} W`,
            status: netDeficit <= 0 ? 'good' : (netDeficit <= 30 ? 'warn' : 'crit')
          },
          metric2: {
            label: 'Waktu Bertahan Baterai',
            labelEn: 'Survival Runway',
            value: `${survivalHours.toFixed(1)} jam`,
            status: survivalHours >= 6 ? 'good' : (survivalHours >= 2 ? 'warn' : 'crit')
          },
          verdict: netDeficit <= 0 
            ? 'SURPLUS DAYA: Wahana berhasil menstabilkan bus elektrik; transmisi darurat beroperasi penuh.' 
            : (netDeficit <= 30 ? 'DEFISIT MODERAT: Daya baterai menipis secara perlahan, butuh intervensi stasiun bumi.' : 'KRITIS: Baterai terkuras habis dalam tempo singkat! UVLO mematikan komputer dalam 30 menit.'),
          verdictEn: netDeficit <= 0 
            ? 'POSITIVE BALANCE: Bus stabilized; emergency carrier beacon transmits loud and clear.' 
            : (netDeficit <= 30 ? 'MODERATE SHORTFALL: Battery draining slowly; ground commands required.' : 'CRITICAL DEPLETION: Rapid battery collapse! UVLO cutoff imminent.')
        };
      }
    }
  },
  {
    id: 'mod06',
    number: '06',
    title: 'Manajemen Misi & Rekayasa Sistem',
    titleEn: 'Mission Management & Systems Engineering',
    subtitle: 'Batasan Anggaran & Massa, FDIR Otonom, & Trade-Off Misi',
    subtitleEn: 'Budget & Mass Constraints, Autonomous FDIR & Flight Trades',
    icon: ShieldCheck,
    accentColor: '#eab308',
    insight: {
      heading: 'Seni Kompromi Rekayasa Antariksa',
      headingEn: 'The Art of Engineering Trade-offs in Space Exploration',
      paragraphs: [
        'Tidak ada satelit antariksa yang memiliki sumber daya tak terbatas. Setiap gram massa peluncuran menelan biaya bahan bakar roket, dan setiap dolar anggaran harus dipertanggungjawabkan kepada lembaga penerbangan.',
        'Sistem FDIR (Fault Detection, Isolation, and Recovery) adalah otak otonom satelit. Ketika telemetri mendeteksi kondisi abnormal di luar batas aman (Out of Bounds), algoritma FDIR segera mengeksekusi rencana kontinjensi tanpa menunggu sinyal kendali dari stasiun bumi yang bisa memakan jeda jeda waktu komunikasi (Light Time Delay) hingga berjam-jam.',
        'Pelajaran terpenting dari investigasi kegagalan satelit: Komponen termahal bukan jaminan desain terbaik. Desain unggul adalah desain yang paling seimbang dalam batas margin massa, anggaran, dan daya operasi.'
      ],
      paragraphsEn: [
        'No spacecraft enjoys infinite resources. Every single gram of payload mass exacts launch vehicle fuel penalties, and every dollar must withstand rigorous agency review.',
        'Fault Detection, Isolation, and Recovery (FDIR) is the spacecraft autonomous survival brain. When sensors detect Out of Bounds telemetry, FDIR triggers contingency recovery modes immediately without waiting for light-time communication delays to Earth (which can take hours across the solar system).',
        'The primary lesson of space accident investigations: The most expensive hardware does not equate to the optimal spacecraft. True engineering triumph is achieving robust survivability within strict mass, cost, and power margins.'
      ],
      keyPoints: [
        'Setiap subsistem memiliki alokasi anggaran (Budget) dan batas massa (Mass Cap).',
        'FDIR mandiri melindungi wahana dari jeda komunikasi interplanet (Light-Time Delay).',
        'Trade-off terbaik memprioritaskan keandalan misi di atas kompleksitas fitur.',
        'Review investigasi anomali menghasilkan standar keselamatan untuk misi masa depan.'
      ],
      keyPointsEn: [
        'Every subsystem operates within strict Budget envelopes and Launch Mass Caps.',
        'Autonomous FDIR protects against multi-minute or multi-hour interplanetary communication lag.',
        'Optimal engineering trades favor simplicity and verified reliability over fragile features.',
        'Forensic flight reviews drive flight safety standards for the next generation of spacecraft.'
      ]
    },
    quiz: [
      {
        question: 'Mengapa satelit di luar angkasa membutuhkan sistem FDIR mandiri daripada selalu menunggu instruksi dari Flight Director di bumi?',
        questionEn: 'Why do deep-space probes require autonomous FDIR instead of awaiting Flight Director commands from Earth?',
        options: [
          {
            text: 'Karena jarak antariksa menghasilkan jeda waktu sinyal (Light-Time Delay) yang membuat respon manusia terlambat saat krisis mendadak.',
            textEn: 'Because interplanetary distances induce light-time delays, rendering human real-time intervention impossible.',
            isCorrect: true,
            explanation: 'Sinyal dari Jupiter atau asteroid butuh 15-45 menit untuk sampai ke bumi; krisis kelistrikan terjadi dalam hitungan detik.',
            explanationEn: 'Radio signals take 15-45 minutes each way from the asteroid belt; electrical collapses happen in seconds.'
          },
          {
            text: 'Karena komputer satelit memiliki kecerdasan buatan yang tidak boleh diintervensi manusia.',
            textEn: 'Because spacecraft AI is legally forbidden from taking human input.',
            isCorrect: false,
            explanation: 'Stasiun bumi tetap memegang komando tertinggi saat tautan komunikasi stabil.',
            explanationEn: 'Flight directors on Earth maintain ultimate authority whenever downlink locks are active.'
          }
        ]
      }
    ],
    practical: {
      title: 'Simulator Margin Massa vs Anggaran Peluncuran',
      titleEn: 'Mass Margin vs Launch Budget Trade-off Simulator',
      description: 'Atur alokasi material perisai radiasi ekstra untuk mengamati sisa margin anggaran misi.',
      descriptionEn: 'Adjust radiation shielding mass allocation to observe remaining mission budget margin.',
      paramName: 'Massa Perisai Radiasi Tambahan',
      paramNameEn: 'Shielding Mass Allocation',
      min: 0,
      max: 100,
      step: 10,
      unit: 'kg',
      defaultValue: 40,
      calculate: (val: number) => {
        const totalMass = 380 + val;
        const totalCostM = 85 + (val * 0.45);
        const massCap = 450;
        const budgetCap = 120;
        const isMassOk = totalMass <= massCap;
        const isCostOk = totalCostM <= budgetCap;
        return {
          metric1: {
            label: 'Total Massa Wahana',
            labelEn: 'Total Spacecraft Mass',
            value: `${totalMass} / ${massCap} kg`,
            status: isMassOk ? (totalMass <= 430 ? 'good' : 'warn') : 'crit'
          },
          metric2: {
            label: 'Estimasi Biaya Misi',
            labelEn: 'Mission Budget',
            value: `$${totalCostM.toFixed(1)}M / $${budgetCap}M`,
            status: isCostOk ? (totalCostM <= 110 ? 'good' : 'warn') : 'crit'
          },
          verdict: isMassOk && isCostOk 
            ? 'LAYAK TERBANG: Konfigurasi memenuhi batas kapasitas roket peluncur dan pagu anggaran misi.' 
            : (!isMassOk ? 'KELEBIHAN BOBOT: Massa melampaui batas roket! Wahana gagal mencapai lintasan transfer asteroid.' : 'OVER-BUDGET: Anggaran melampaui pagu dewan evaluasi!'),
          verdictEn: isMassOk && isCostOk 
            ? 'FLIGHT QUALIFIED: Configuration strictly conforms to launch vehicle payload margins and budget caps.' 
            : (!isMassOk ? 'OVERWEIGHT: Exceeds launch vehicle capacity! Transfer orbit insertion fails.' : 'OVER BUDGET: Cost violates Flight Review Board allocation!')
        };
      }
    }
  }
];

interface AcademyScreenProps {
  onBack: () => void;
}

export const AcademyScreen: React.FC<AcademyScreenProps> = ({ onBack }) => {
  const { language } = useTranslation();
  const { setOnboardingStep, setTutorialStep } = useMissionStore();
  const { knowledgePoints, addKnowledgePoints, getRank } = useProgressStore();

  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'insight' | 'quiz' | 'practical'>('insight');
  const [practicalVal, setPracticalVal] = useState<number>(MODULES[0].practical.defaultValue);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const currentModule = MODULES[activeModuleIndex];
  const rank = getRank();

  const handleSelectModule = (index: number) => {
    sounds.playClick(750);
    setActiveModuleIndex(index);
    setPracticalVal(MODULES[index].practical.defaultValue);
    setActiveTab('insight');
  };

  const handleAnswerQuiz = (modId: string, qIdx: number, optIdx: number, isCorrect: boolean) => {
    const key = `${modId}_q${qIdx}`;
    if (quizAnswers[key] !== undefined) return;

    sounds.playClick(600);
    setQuizAnswers(prev => ({ ...prev, [key]: optIdx }));

    if (isCorrect) {
      sounds.playSuccess();
      addKnowledgePoints(25);
    } else {
      sounds.playAlarm();
    }
  };

  const handleReplayTutorial = () => {
    sounds.playClick(800);
    setTutorialStep(0);
    setOnboardingStep('tutorial');
  };

  const practicalOutcome = currentModule.practical.calculate(practicalVal);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col font-sans select-none blueprint-grid">
      
      {/* Top Navigation Bar */}
      <header className="border-b border-black/80 bg-[#121620]/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick(650);
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A202C] hover:bg-orange-500 hover:text-black text-slate-300 font-mono text-xs font-bold rounded transition-colors cursor-pointer border border-black"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'en' ? 'COMMAND HUB' : 'MENU UTAMA'}</span>
          </button>

          <div className="h-6 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wider">
                ORBITA NOVA ACADEMY
              </h1>
              <p className="text-[10px] font-mono text-slate-400">
                {language === 'en' ? 'AEROSPACE SYSTEMS LEARNING CENTER' : 'PUSAT PEMBELAJARAN SISTEM ANTARIKSA'}
              </p>
            </div>
          </div>
        </div>

        {/* Player Knowledge Points & Rank Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {language === 'en' ? 'Rank Status' : 'Pangkat Misi'}
            </span>
            <span className="font-display font-black text-xs text-orange-400 uppercase tracking-wide">
              {language === 'en' ? rank.titleEn : rank.title}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141824] border border-black rounded clip-chamfer-sm">
            <Award className="w-4 h-4 text-orange-400" />
            <div className="text-right">
              <div className="font-mono text-xs font-bold text-white">
                {knowledgePoints} <span className="text-[9px] text-orange-400">KP</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleReplayTutorial}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 font-mono text-xs font-bold rounded transition-colors cursor-pointer"
            title={language === 'en' ? 'Replay 5-Step System Tutorial' : 'Ulang Tutorial Dasar 5 Tahap'}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'en' ? 'REPLAY TUTORIAL' : 'ULANG TUTORIAL'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT: 6 Module Selector Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-2 shrink-0">
          <div className="text-xs font-mono text-slate-400 tracking-wider uppercase px-1 pb-1">
            {language === 'en' ? 'CURRICULUM MODULES' : 'MODUL PEMBELAJARAN'}
          </div>

          <div className="space-y-2">
            {MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              const isSelected = activeModuleIndex === idx;
              return (
                <div
                  key={mod.id}
                  onClick={() => handleSelectModule(idx)}
                  className={`p-3.5 border transition-all cursor-pointer rounded clip-chamfer-sm flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-[#182030] border-orange-500 text-white shadow-lg translate-x-1' 
                      : 'bg-[#11141E]/90 border-black/80 hover:border-slate-700 text-slate-300 hover:bg-[#161B26]'
                  }`}
                >
                  <div 
                    className="p-2 rounded shrink-0 transition-colors"
                    style={{ 
                      backgroundColor: isSelected ? mod.accentColor : '#1C2230',
                      color: isSelected ? '#000' : mod.accentColor 
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-orange-400">
                        EP {mod.number}
                      </span>
                    </div>
                    <div className="font-display font-bold text-xs truncate leading-snug">
                      {language === 'en' ? mod.titleEn : mod.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {language === 'en' ? mod.subtitleEn : mod.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Note Box */}
          <div className="mt-4 p-4 bg-[#141824]/90 border border-black rounded clip-chamfer-sm text-xs font-sans text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 text-orange-400 font-mono font-bold text-[11px] uppercase">
              <Info className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'AEROSPACE PEDAGOGY' : 'PEDAGOGI ANTARIKSA'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {language === 'en'
                ? 'Orbita Nova modules bridge real NASA mission physics with accessible interactive tools. Earn KP by answering correctly on your first attempt.'
                : 'Modul Orbita Nova menghubungkan fisika misi nyata NASA dengan simulasi interaktif. Dapatkan KP dengan menjawab kuis dengan tepat.'}
            </p>
          </div>
        </aside>

        {/* RIGHT: Module Detail & Interactive Workspace */}
        <main className="flex-1 flex flex-col bg-[#111520]/95 border border-black rounded clip-chamfer-md shadow-2xl overflow-hidden">
          
          {/* Module Header Banner */}
          <div className="p-5 sm:p-6 border-b border-black bg-gradient-to-r from-[#161C2C] to-[#0E131E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-orange-500 text-black text-[10px] font-mono font-black uppercase rounded">
                  {language === 'en' ? `MODULE ${currentModule.number}` : `MODUL ${currentModule.number}`}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {language === 'en' ? 'STANDALONE ACADEMY STUDY' : 'STUDI MANDIRI AKADEMI'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-display font-black text-white mt-1 uppercase tracking-wide">
                {language === 'en' ? currentModule.titleEn : currentModule.title}
              </h2>
              <p className="text-xs sm:text-sm font-sans text-slate-300 mt-0.5">
                {language === 'en' ? currentModule.subtitleEn : currentModule.subtitle}
              </p>
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-[#0A0D14] p-1 border border-black rounded">
              <button
                onClick={() => { sounds.playClick(650); setActiveTab('insight'); }}
                className={`px-3 py-1.5 font-mono text-xs font-bold rounded transition-colors cursor-pointer ${
                  activeTab === 'insight' 
                    ? 'bg-orange-500 text-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'en' ? 'INSIGHT' : 'MATERI'}
              </button>
              <button
                onClick={() => { sounds.playClick(650); setActiveTab('practical'); }}
                className={`px-3 py-1.5 font-mono text-xs font-bold rounded transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'practical' 
                    ? 'bg-orange-500 text-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'SCENARIO' : 'SIMULASI'}</span>
              </button>
              <button
                onClick={() => { sounds.playClick(650); setActiveTab('quiz'); }}
                className={`px-3 py-1.5 font-mono text-xs font-bold rounded transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'quiz' 
                    ? 'bg-orange-500 text-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'QUIZ' : 'KUIS'}</span>
              </button>
            </div>
          </div>

          {/* Module Body Content based on Tab */}
          <div className="p-5 sm:p-7 flex-1 overflow-y-auto space-y-6">
            
            {/* TAB 1: MISSION INSIGHT & VISUAL SCHEMATIC */}
            {activeTab === 'insight' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-orange-400 uppercase tracking-wide">
                    {language === 'en' ? currentModule.insight.headingEn : currentModule.insight.heading}
                  </h3>
                  <div className="mt-3 space-y-3 text-sm font-sans text-slate-200 leading-relaxed">
                    {(language === 'en' ? currentModule.insight.paragraphsEn : currentModule.insight.paragraphs).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Key Takeaways Card */}
                <div className="p-4 bg-[#141A26] border border-black border-l-4 border-l-orange-500 rounded clip-chamfer-sm space-y-2.5">
                  <div className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400" />
                    <span>{language === 'en' ? 'KEY ENGINEERING CONCEPTS' : 'POIN PENTING REKAYASA'}</span>
                  </div>
                  <ul className="space-y-1.5 pl-6 list-disc text-xs sm:text-sm text-slate-300">
                    {(language === 'en' ? currentModule.insight.keyPointsEn : currentModule.insight.keyPoints).map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                {/* Visual Technical Diagram Box */}
                <div className="p-5 bg-[#0C0F17] border border-black rounded clip-chamfer-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{language === 'en' ? 'SUBSYSTEM SCHEMATIC DIAGRAM' : 'DIAGRAM SKEMATIK SUBSISTEM'}</span>
                    <span className="text-orange-400 font-bold">NASA TECHNICAL REFERENCE</span>
                  </div>

                  <div className="h-44 sm:h-52 w-full bg-[#080B10] border border-slate-800 rounded flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />
                    
                    {/* Dynamic SVG Visual Representation */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-2xl animate-pulse"
                        style={{ borderColor: currentModule.accentColor, backgroundColor: `${currentModule.accentColor}20` }}
                      >
                        <currentModule.icon className="w-8 h-8" style={{ color: currentModule.accentColor }} />
                      </div>
                      <div className="font-mono text-xs text-white uppercase tracking-widest font-bold">
                        {language === 'en' ? currentModule.titleEn : currentModule.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 max-w-md">
                        {language === 'en' ? currentModule.subtitleEn : currentModule.subtitle}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action button to test practical simulator */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { sounds.playClick(750); setActiveTab('practical'); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider rounded transition-transform hover:scale-105 cursor-pointer shadow-lg"
                  >
                    <span>{language === 'en' ? 'TEST INTERACTIVE SCENARIO' : 'UJI SIMULASI PRAKTIK'}</span>
                    <Play className="w-3.5 h-3.5 fill-black" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PRACTICAL INTERACTIVE SCENARIO */}
            {activeTab === 'practical' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-orange-400 uppercase tracking-wide">
                    {language === 'en' ? currentModule.practical.titleEn : currentModule.practical.title}
                  </h3>
                  <p className="text-sm font-sans text-slate-300 mt-1">
                    {language === 'en' ? currentModule.practical.descriptionEn : currentModule.practical.description}
                  </p>
                </div>

                {/* Interactive Slider Card */}
                <div className="p-6 bg-[#141A26] border border-black rounded clip-chamfer-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-bold text-white uppercase">
                      {language === 'en' ? currentModule.practical.paramNameEn : currentModule.practical.paramName}
                    </label>
                    <span className="font-mono text-sm font-bold text-orange-400 px-3 py-1 bg-black border border-orange-500/40 rounded">
                      {practicalVal} {currentModule.practical.unit}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={currentModule.practical.min}
                    max={currentModule.practical.max}
                    step={currentModule.practical.step}
                    value={practicalVal}
                    onChange={(e) => {
                      sounds.playClick(500);
                      setPracticalVal(parseFloat(e.target.value));
                    }}
                    className="w-full accent-orange-500 cursor-pointer h-2 bg-[#0B0D12] rounded-lg"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{currentModule.practical.min} {currentModule.practical.unit}</span>
                    <span>{currentModule.practical.max} {currentModule.practical.unit}</span>
                  </div>
                </div>

                {/* Dynamic Calculated Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0F131D] border border-black rounded clip-chamfer-sm">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      {language === 'en' ? practicalOutcome.metric1.labelEn : practicalOutcome.metric1.label}
                    </div>
                    <div className={`font-mono text-xl sm:text-2xl font-black mt-1 ${
                      practicalOutcome.metric1.status === 'good' ? 'text-emerald-400' :
                      practicalOutcome.metric1.status === 'warn' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {practicalOutcome.metric1.value}
                    </div>
                  </div>

                  <div className="p-4 bg-[#0F131D] border border-black rounded clip-chamfer-sm">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      {language === 'en' ? practicalOutcome.metric2.labelEn : practicalOutcome.metric2.label}
                    </div>
                    <div className={`font-mono text-xl sm:text-2xl font-black mt-1 ${
                      practicalOutcome.metric2.status === 'good' ? 'text-emerald-400' :
                      practicalOutcome.metric2.status === 'warn' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {practicalOutcome.metric2.value}
                    </div>
                  </div>
                </div>

                {/* Technical Verdict Analysis */}
                <div className="p-4 bg-[#141824] border border-black rounded clip-chamfer-sm space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {language === 'en' ? 'ENGINEERING VERDICT' : 'EVALUASI REKAYASA TEKNIS'}
                  </span>
                  <p className="font-sans text-sm text-slate-200 font-semibold leading-relaxed">
                    {language === 'en' ? practicalOutcome.verdictEn : practicalOutcome.verdict}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { sounds.playClick(750); setActiveTab('quiz'); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider rounded transition-transform hover:scale-105 cursor-pointer shadow-lg"
                  >
                    <span>{language === 'en' ? 'TAKE KNOWLEDGE QUIZ (+KP)' : 'AMBIL KUIS PEMAHAMAN (+KP)'}</span>
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: KNOWLEDGE CHECK QUIZ */}
            {activeTab === 'quiz' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-orange-400 uppercase tracking-wide flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span>{language === 'en' ? 'KNOWLEDGE CHECK QUIZ' : 'UJI PEMAHAMAN REKAYASA'}</span>
                  </h3>
                  <p className="text-sm font-sans text-slate-300 mt-1">
                    {language === 'en'
                      ? 'Answer correctly to earn +25 Knowledge Points (KP) and increase your Mission Rank.'
                      : 'Jawab dengan tepat untuk memperoleh +25 Knowledge Points (KP) dan meningkatkan pangkat misi Anda.'}
                  </p>
                </div>

                <div className="space-y-5">
                  {currentModule.quiz.map((q, qIdx) => {
                    const ansKey = `${currentModule.id}_q${qIdx}`;
                    const selectedOptIdx = quizAnswers[ansKey];
                    const isAnswered = selectedOptIdx !== undefined;

                    return (
                      <div key={qIdx} className="p-5 bg-[#141A26] border border-black rounded clip-chamfer-sm space-y-4">
                        <div className="font-display font-bold text-sm sm:text-base text-white">
                          <span className="text-orange-400 mr-2">Q{qIdx + 1}.</span>
                          {language === 'en' ? q.questionEn : q.question}
                        </div>

                        <div className="space-y-2.5">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedOptIdx === optIdx;
                            let btnStyle = 'bg-[#0E121A] border-black text-slate-300 hover:bg-[#1A2232] hover:text-white';
                            
                            if (isAnswered) {
                              if (opt.isCorrect) {
                                btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                              } else if (isChosen && !opt.isCorrect) {
                                btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                              } else {
                                btnStyle = 'bg-[#0E121A] border-black text-slate-500 opacity-50';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswered}
                                onClick={() => handleAnswerQuiz(currentModule.id, qIdx, optIdx, opt.isCorrect)}
                                className={`w-full p-3.5 border rounded text-left text-xs sm:text-sm font-sans flex items-start justify-between gap-3 transition-colors cursor-pointer ${btnStyle}`}
                              >
                                <span>{language === 'en' ? opt.textEn : opt.text}</span>
                                {isAnswered && opt.isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                )}
                                {isAnswered && isChosen && !opt.isCorrect && (
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation upon answer */}
                        {isAnswered && (
                          <div className="p-3 bg-[#0A0D14] border border-black rounded text-xs font-mono text-slate-300">
                            <span className="text-orange-400 font-bold mr-1.5">[ANALISIS]:</span>
                            {language === 'en' 
                              ? q.options[selectedOptIdx].explanationEn 
                              : q.options[selectedOptIdx].explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </main>
      </div>

    </div>
  );
};
