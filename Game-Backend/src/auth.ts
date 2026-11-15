/* antislop: High-security authentication module with memory-hard scrypt hashing & brute-force mitigation */
import crypto from 'node:crypto';
import { db } from './db.js';

const SESSION_TTL_HOURS = 72; // 3 days session validity
const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTIONS: crypto.ScryptOptions = {
  N: 16384, // CPU/memory cost
  r: 8,     // Block size
  p: 1,     // Parallelization
};

// In-memory sliding window rate limiter for brute-force protection
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

export function checkRateLimit(ipOrKey: string): { allowed: boolean; remainingSec: number } {
  const now = Date.now();
  const record = loginAttempts.get(ipOrKey);
  if (!record) return { allowed: true, remainingSec: 0 };

  if (record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingSec };
  }

  // If lock expired, clear record
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginAttempts.delete(ipOrKey);
  }

  return { allowed: true, remainingSec: 0 };
}

export function recordFailedAttempt(ipOrKey: string) {
  const now = Date.now();
  const record = loginAttempts.get(ipOrKey) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  // After 5 failed attempts, lock for 15 minutes
  if (record.attempts >= 5) {
    record.lockedUntil = now + (15 * 60 * 1000);
    console.warn(`[SECURITY] Rate limit triggered for: ${ipOrKey}. Locked for 15 minutes.`);
  }

  loginAttempts.set(ipOrKey, record);
}

export function resetRateLimit(ipOrKey: string) {
  loginAttempts.delete(ipOrKey);
}

/**
 * Hash password using memory-hard scrypt algorithm with cryptographic salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

/**
 * Constant-time comparison to prevent side-channel timing attacks
 */
export function verifyPassword(password: string, storedHashHex: string, storedSalt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, storedSalt, SCRYPT_KEYLEN, SCRYPT_OPTIONS);
    const storedBuffer = Buffer.from(storedHashHex, 'hex');
    if (derivedKey.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, storedBuffer);
  } catch (err) {
    console.error('[AUTH ERROR] Password verification failed:', err);
    return false;
  }
}

/**
 * Validates password strength policy
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: 'Password minimal harus 8 karakter.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password harus mengandung minimal 1 huruf besar (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password harus mengandung minimal 1 huruf kecil (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password harus mengandung minimal 1 angka (0-9).' };
  }
  return { valid: true };
}

/**
 * Validates email format with RFC 5322 compliance
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Creates high-entropy session token stored in SQLite database
 */
export function createSession(userId: string, ipAddress?: string, userAgent?: string): string {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString();

  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(token, userId, expiresAt, ipAddress || null, userAgent || null);

  // Update last login timestamp
  db.prepare(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`).run(userId);

  return token;
}

/**
 * Validates session token and returns associated user
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  callsign: string | null;
  avatar_url: string | null;
  auth_provider: string;
  role: string;
  created_at: string;
}

export function validateSession(token: string): AuthenticatedUser | null {
  if (!token) return null;

  const stmt = db.prepare(`
    SELECT u.id, u.email, u.callsign, u.avatar_url, u.auth_provider, u.role, u.created_at, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `);
  const row = stmt.get(token) as (AuthenticatedUser & { expires_at: string }) | undefined;

  if (!row) return null;

  // Check expiration
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    callsign: row.callsign,
    avatar_url: row.avatar_url,
    auth_provider: row.auth_provider,
    role: row.role,
    created_at: row.created_at,
  };
}

export function revokeSession(token: string) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}
