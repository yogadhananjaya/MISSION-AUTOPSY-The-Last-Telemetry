/* antislop: High-performance SQLite database engine using Node 22+ native node:sqlite */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'orbita.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for high throughput and reliability
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      password_salt TEXT,
      callsign TEXT,
      avatar_url TEXT,
      auth_provider TEXT DEFAULT 'local',
      google_id TEXT UNIQUE,
      role TEXT DEFAULT 'cadet',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at DATETIME NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS player_progress (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      knowledge_points INTEGER DEFAULT 50,
      credits INTEGER DEFAULT 100,
      rank TEXT DEFAULT 'Kadet Antariksa',
      completed_episodes TEXT DEFAULT '["ep01"]',
      stars_data TEXT DEFAULT '{}',
      unlocked_components TEXT DEFAULT '["sa_standard","bat_standard","therm_passive","ant_standard"]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS telemetry_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      callsign TEXT,
      episode_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      survived INTEGER NOT NULL,
      grade TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_telemetry_score ON telemetry_logs(score DESC);
  `);
  console.log('[DB] SQLite database initialized at:', DB_PATH);
}
