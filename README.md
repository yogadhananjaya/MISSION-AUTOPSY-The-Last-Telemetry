# ORBITA NOVA — The Last Telemetry
### NASA Space Apps Challenge 2026
**Team: Certified Space Cap**

---

## 🚀 About the Project
**ORBITA NOVA: The Last Telemetry** is an educational space systems engineering and forensic autopsy simulation game developed for the NASA Space Apps Challenge 2026 by **Team Certified Space Cap**.

Pemain bertindak sebagai investigator forensik penerbangan antariksa yang menganalisis telemetri satelit (ASTER-9, dsb.), mendiagnosis akar anomali kelistrikan/termal saat melintasi gerhana asteroid, merekayasa ulang komponen satelit di Hangar modular, dan menguji kemampuan bertahan hidup wahana melalui simulasi orbit 3D.

---

## 📂 Architecture & Directory Structure
Proyek ini memisahkan frontend dan backend secara bersih:

```
NASA 2026/
├── Game-Frontend/              # Client Interactive Simulator (React 19 + Vite + Tailwind + Three.js)
│   ├── src/
│   │   ├── components/
│   │   │   ├── academy/        # Space Learning Center (6 Aerospace Modules + Quizzes)
│   │   │   ├── auth/           # High-Security Tier-1 Auth Portal & Google SSO
│   │   │   ├── common/         # Tactical Header, HoloPanel, NvButton, GameLogo
│   │   │   ├── coop/           # Realtime Co-op Last Stand (PeerJS + BroadcastChannel)
│   │   │   ├── leaderboard/    # Global & Weekly Forensic Leaderboard
│   │   │   ├── lobby/          # Command Hub & 10-Character Crew Album
│   │   │   ├── minigames/      # Crisis Minigames (Cables, Power, Antenna Alignment)
│   │   │   ├── onboarding/     # NOVA Mascot Welcome & Explorer Callsign Collector
│   │   │   ├── phase1_briefing/# Mission Briefing & Incident Dossier
│   │   │   ├── phase2_investigation/# 4-Channel Telemetry Studio & Black Box Audio
│   │   │   ├── phase3_root_cause/# 3-Tier Hypothesis Matrix
│   │   │   ├── phase3b_rewind/ # Interactive Crisis Rewind Sandbox
│   │   │   ├── phase4_redesign/# Modular Spacecraft Refit & Budget/Mass Constraints
│   │   │   ├── phase5_simulation/# 3D Orbital Trajectory & Flight Telemetry
│   │   │   └── phase6_debrief/ # Debriefing, NASA 5 Pillars, Ghost Replay, Share Card
│   │   ├── data/               # Case Files, Crew Roster (10 Characters), Component Catalog
│   │   ├── services/           # Backend API Client with Resilient Offline Fallback
│   │   └── store/              # Zustand Stores (Mission, Auth, Coop, Progress, Score)
│   └── package.json
│
├── Game-Backend/               # Mission Control Backend API & Database (Node.js + Express)
│   ├── src/
│   │   ├── auth.ts             # Memory-Hard Scrypt Hashing & Brute-Force Rate Limiter
│   │   ├── db.ts               # Native SQLite Database (node:sqlite WAL mode)
│   │   ├── routes/
│   │   │   ├── authRoutes.ts   # Register, Login, Google OAuth, Session Guard
│   │   │   └── userRoutes.ts   # Callsign Update, Player Progress, Leaderboard, Telemetry
│   │   └── server.ts           # Express Application Server & Health Check
│   ├── data/
│   │   └── orbita.db           # Persistent SQLite Database
│   └── package.json
│
└── package.json                # Root Workspace
```

---

## 🛡️ High-Security Authentication & Database
- **Backend Database**: Didukung SQLite native (`node:sqlite`) dengan journaling WAL.
- **Kriptografi Scrypt**: Hashing kata sandi memory-hard dengan garam acak 32-byte kriptografis ($N=16384, r=8, p=1$).
- **Perlindungan Serangan Waktu (Constant-Time)**: Menggunakan `crypto.timingSafeEqual`.
- **Sliding-Window Rate Limiting**: Mengunci IP/akun selama 15 menit jika gagal 5 kali berturut-turut untuk mencegah brute-force.
- **Google OAuth SSO**: Masuk dengan akun Google secara aman.
- **Onboarding NOVA**: Setelah login berhasil, NOVA langsung menyapa penjelajah untuk menginput nama panggilan (*Callsign*) dan memilih protokol kesulitan (*Cadet Mode* vs *Engineer Mode*).

---

## 🎨 Konsistensi Visual (Anti-Slop Design)
- **Palet Warna Senada & Padu**:
  - Warna Latar: *Deep Space Cadet Charcoal* (`#0B0E14` / `#070A0F` / `#111520`).
  - Aksen Telemetri: *NASA Gold / Amber* (`#F59E0B` / `#EAB308`).
  - Status Nominal: *Emerald Green* (`#10B981`).
  - Status Bahaya: *Rose Crimson* (`#EF4444`).
  - Status Komunikasi Fotonik: *Electric Cyan* (`#06B6D4` / `#38BDF8`).
- **Geometri Chamfered**: Tepi sudut 45 derajat poligonal tajam berstandar antarmuka militer/aerospace, meniadakan kartu *bubbly SaaS* yang generik.

---

## 🛠️ Cara Menjalankan

### Menjalankan Backend
```bash
cd Game-Backend
npm install
npm run dev
# Server aktif di http://localhost:3001
```

### Menjalankan Frontend
```bash
cd Game-Frontend
npm install
npm run dev
# Client aktif di http://localhost:5173
```
