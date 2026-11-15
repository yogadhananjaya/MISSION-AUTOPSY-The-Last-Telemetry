# ORBITA NOVA — Mission Control Backend & Database
**Team: Certified Space Cap**  
**NASA Space Apps Challenge 2026**

---

## 🌟 Overview
`Game-Backend` is the high-security backend server and persistent database powering **ORBITA NOVA**. Engineered with zero-compromise security protocols, memory-hard password derivation, rate-limited brute-force mitigation, and integrated Google OAuth Single Sign-On (SSO).

---

## 🛡️ Security Architecture
1. **Memory-Hard Password Derivation (Scrypt)**
   - Algorithm: `scrypt` with 32-byte cryptographically secure random salt.
   - Cost Parameters: $N=16384$, $r=8$, $p=1$, Output Key Length = 64 bytes.
   - Immune to GPU and ASIC brute-force rainbow table attacks.
2. **Side-Channel Timing Attack Prevention**
   - Verification uses `crypto.timingSafeEqual` in constant time ($O(1)$) to eliminate timing leakages.
3. **Sliding-Window Rate Limiter**
   - Automatically blocks IP/credential brute-force spamming. After 5 consecutive failed attempts, access is locked for 15 minutes.
4. **High-Entropy Session Tokens**
   - 64-byte random hexadecimal cryptographic tokens with automatic TTL expiration (72 hours).
5. **Google OAuth 2.0 / SSO Support**
   - Secure account linking and identity verification.

---

## 💾 Database Architecture (SQLite WAL)
- Powered by Node.js 22+ native `node:sqlite` (`DatabaseSync`).
- Zero external binary dependencies; runs cross-platform with full ACID transaction guarantees.
- Stored on disk at `Game-Backend/data/orbita.db`.
- **Tables**:
  - `users`: User identity, authentication provider, scrypt hash, callsign, and role.
  - `sessions`: Active bearer tokens, expiration, user agent, and client IP.
  - `player_progress`: Knowledge points, rank, credits, completed episodes, and unlocked components.
  - `telemetry_logs`: Simulation flight records, anomaly forensic scores, and survivability logs.

---

## 📡 API Reference

### Authentication Endpoints
- `POST /api/auth/register`
  - Body: `{ email, password, confirmPassword }`
  - Returns: `{ success: true, token, user }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Rate-limited with brute-force protection.
- `POST /api/auth/google`
  - Body: `{ email, name, avatarUrl, googleId }`
  - Automatically provisions secure player account and session token.
- `GET /api/auth/me`
  - Header: `Authorization: Bearer <token>`
  - Returns user profile.
- `POST /api/auth/logout`
  - Revokes active session token.

### User & Progress Endpoints
- `POST /api/user/callsign`
  - Assigns the explorer's callsign collected by NOVA Mascot.
- `GET /api/user/progress`
  - Returns knowledge points, mission rank, and credits.
- `POST /api/user/progress`
  - Persists episode completions and Academy quiz rewards (+25 KP).
- `GET /api/leaderboard`
  - Returns global top pilots and forensic scores from database.
- `POST /api/telemetry/submit`
  - Logs simulation survivability telemetry.

---

## 🚀 Running the Backend
```bash
cd Game-Backend
npm install
npm run dev
# Server will start on http://localhost:3001
```
