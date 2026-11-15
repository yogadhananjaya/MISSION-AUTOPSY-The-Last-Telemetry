/* antislop: Authentication routes for Registration, Login, Google OAuth, and Session Verification */
import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { 
  hashPassword, 
  verifyPassword, 
  validatePasswordStrength, 
  validateEmail, 
  createSession, 
  validateSession, 
  revokeSession,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit
} from '../auth.js';

export const authRouter = Router();

// Middleware to extract bearer token
export function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Otorisasi dibutuhkan: Token tidak disertakan.' });
  }

  const user = validateSession(token);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Sesi telah kedaluwarsa atau tidak valid. Silakan login kembali.' });
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

/**
 * POST /api/auth/register
 * Secure account registration with scrypt password hashing
 */
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email dan password wajib diisi.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Konfirmasi password tidak cocok.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Format email tidak valid.' });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return res.status(400).json({ success: false, error: strength.reason });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email ini sudah terdaftar. Silakan login.' });
    }

    const userId = crypto.randomUUID();
    const { hash, salt } = hashPassword(password);

    db.exec('BEGIN TRANSACTION;');
    try {
      db.prepare(`
        INSERT INTO users (id, email, password_hash, password_salt, auth_provider, role)
        VALUES (?, ?, ?, ?, 'local', 'cadet')
      `).run(userId, normalizedEmail, hash, salt);

      db.prepare(`
        INSERT INTO player_progress (user_id, knowledge_points, credits, rank)
        VALUES (?, 50, 100, 'Kadet Antariksa')
      `).run(userId);

      db.exec('COMMIT;');
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const token = createSession(userId, clientIp, userAgent);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        callsign: null, // Nova will collect this right after!
        avatar_url: null,
        auth_provider: 'local',
        role: 'cadet',
      },
      message: 'Registrasi berhasil. Selamat datang di ORBITA NOVA.',
    });
  } catch (err: any) {
    console.error('[AUTH ERROR /register]:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem saat mendaftar akun.' });
  }
});

/**
 * POST /api/auth/login
 * Secure authentication with brute-force rate limiting
 */
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `${clientIp}:${email}`;

    // Rate limit check
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Akses diblokir sementara karena terlalu banyak percobaan gagal. Silakan tunggu ${rateCheck.remainingSec} detik.`,
      });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email dan password wajib diisi.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare(`
      SELECT id, email, password_hash, password_salt, callsign, avatar_url, auth_provider, role
      FROM users WHERE email = ?
    `).get(normalizedEmail) as any;

    if (!user || !user.password_hash || !user.password_salt) {
      recordFailedAttempt(rateLimitKey);
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    const isValid = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      recordFailedAttempt(rateLimitKey);
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(rateLimitKey);

    const userAgent = req.headers['user-agent'] || 'unknown';
    const token = createSession(user.id, clientIp, userAgent);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        callsign: user.callsign,
        avatar_url: user.avatar_url,
        auth_provider: user.auth_provider,
        role: user.role,
      },
      message: 'Login berhasil.',
    });
  } catch (err: any) {
    console.error('[AUTH ERROR /login]:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem saat proses login.' });
  }
});

/**
 * POST /api/auth/google
 * High-security Google OAuth SSO authentication / registration
 */
authRouter.post('/google', (req: Request, res: Response) => {
  try {
    const { email, name, avatarUrl, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ success: false, error: 'Data otentikasi Google tidak lengkap.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    let user = db.prepare('SELECT id, email, callsign, avatar_url, auth_provider, role FROM users WHERE email = ? OR google_id = ?')
      .get(normalizedEmail, googleId) as any;

    if (!user) {
      // New user registering with Google
      const userId = crypto.randomUUID();
      db.exec('BEGIN TRANSACTION;');
      try {
        db.prepare(`
          INSERT INTO users (id, email, google_id, avatar_url, auth_provider, role)
          VALUES (?, ?, ?, ?, 'google', 'cadet')
        `).run(userId, normalizedEmail, googleId, avatarUrl || null);

        db.prepare(`
          INSERT INTO player_progress (user_id, knowledge_points, credits, rank)
          VALUES (?, 50, 100, 'Kadet Antariksa')
        `).run(userId);

        db.exec('COMMIT;');
      } catch (e) {
        db.exec('ROLLBACK;');
        throw e;
      }

      user = {
        id: userId,
        email: normalizedEmail,
        callsign: null, // Nova will prompt for callsign!
        avatar_url: avatarUrl || null,
        auth_provider: 'google',
        role: 'cadet',
      };
    } else {
      // Existing user: update avatar if provided
      if (avatarUrl && !user.avatar_url) {
        db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, user.id);
        user.avatar_url = avatarUrl;
      }
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const token = createSession(user.id, clientIp, userAgent);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        callsign: user.callsign,
        avatar_url: user.avatar_url,
        auth_provider: user.auth_provider,
        role: user.role,
      },
      message: 'Login Google berhasil.',
    });
  } catch (err: any) {
    console.error('[AUTH ERROR /google]:', err);
    return res.status(500).json({ success: false, error: 'Gagal melakukan otentikasi dengan akun Google.' });
  }
});

/**
 * GET /api/auth/me
 * Validate session token and return user profile
 */
authRouter.get('/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.json({ success: true, user });
});

/**
 * POST /api/auth/logout
 * Revoke active session token
 */
authRouter.post('/logout', authenticateToken, (req: Request, res: Response) => {
  const token = (req as any).token;
  revokeSession(token);
  return res.json({ success: true, message: 'Berhasil keluar dari sistem.' });
});
