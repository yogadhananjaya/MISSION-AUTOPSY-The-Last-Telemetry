# ORBITA NOVA — Frontend Mission Control Client
**Team: Certified Space Cap**  
**NASA Space Apps Challenge 2026**

---

## 🌟 Overview
`Game-Frontend` is the high-fidelity interactive simulation client for **ORBITA NOVA: The Last Telemetry**, built with React 19, TypeScript, Tailwind CSS, Three.js, and Zustand.

---

## 🎨 Anti-Slop Visual Design & Aesthetic System
Following strict **Anti-Slop** design principles:
- **Harmonized Aerospace Palette**:
  - Deep Space Cadet Navy/Black: `#0B0E14` / `#070A0F` / `#111520`
  - NASA Telemetry Amber Gold: `#F59E0B` / `#EAB308`
  - Nominal Systems Green: `#10B981`
  - Critical Alert Rose: `#EF4444`
  - High-Voltage Cyan: `#06B6D4` / `#38BDF8`
- **Tactile Chamfered Geometry**: Uses sharp 45-degree angle polygonal cuts (`clip-chamfer-sm`, `clip-chamfer-md`, `clip-slanted`) rather than generic bubbly SaaS cards.
- **Purpose-Driven Data Density**: Monospace telemetry channels, real-time waveform scrubbers, orbital parameter calculators, and realistic NASA mission constraints.

---

## 🛸 Key Features
1. **High-Security Authentication Gate**:
   - Login & Register with Scrypt password verification and rate-limit guard.
   - Continue with Google SSO integration.
2. **NOVA Mascot Callsign Onboarding**:
   - Post-login interactive guide by Nova.
   - Collects explorer callsign and synchronizes with the backend database.
   - Difficulty Selection: Cadet Mode (full telemetry hints) vs Engineer Mode (raw analysis).
3. **Core Gameplay Loop (5-Stage Standard)**:
   - Investigate -> Analyze -> Design -> Execute -> Learn.
4. **Command Hub (8 Core Modules)**:
   - New Mission, Continue Mission, Space Map (Ep 01–06), Co-op Last Stand, Modular Hangar, Crew Album (10 characters, 4 roles), Space Academy, and Leaderboard.
5. **Interactive Space Academy**:
   - 6 Aerospace curriculum modules with theory insight, visual diagrams, interactive scenario parameter sliders, and knowledge check quizzes (+25 KP).

---

## 🚀 Running the Frontend
```bash
cd Game-Frontend
npm install
npm run dev
```
