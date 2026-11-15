/* antislop: User routes for Callsign assignment by Nova, player progress, and mission telemetry */
import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { authenticateToken } from './authRoutes.js';

export const userRouter = Router();

/**
 * POST /api/user/callsign
 * Nova Mascot collects and records the explorer's callsign in the database
 */
userRouter.post('/callsign', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { callsign } = req.body;

    if (!callsign || !callsign.trim()) {
      return res.status(400).json({ success: false, error: 'Callsign tidak boleh kosong.' });
    }

    const cleanCallsign = callsign.trim().toUpperCase().slice(0, 24);

    db.prepare(`UPDATE users SET callsign = ? WHERE id = ?`).run(cleanCallsign, user.id);

    return res.json({
      success: true,
      callsign: cleanCallsign,
      message: `Callsign [${cleanCallsign}] resmi terdaftar di database komando NASA.`,
    });
  } catch (err: any) {
    console.error('[USER ERROR /callsign]:', err);
    return res.status(500).json({ success: false, error: 'Gagal memperbarui callsign.' });
  }
});

/**
 * GET /api/user/progress
 * Retrieve player progress, rank, credits, knowledge points, and completed episodes
 */
userRouter.get('/progress', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const row = db.prepare('SELECT * FROM player_progress WHERE user_id = ?').get(user.id) as any;

    if (!row) {
      return res.json({
        success: true,
        progress: {
          knowledgePoints: 50,
          credits: 100,
          rank: 'Kadet Antariksa',
          completed: ['ep01'],
          stars: {},
          unlockedComponents: ['sa_standard', 'bat_standard', 'therm_passive', 'ant_standard'],
        },
      });
    }

    return res.json({
      success: true,
      progress: {
        knowledgePoints: row.knowledge_points,
        credits: row.credits,
        rank: row.rank,
        completed: JSON.parse(row.completed_episodes || '["ep01"]'),
        stars: JSON.parse(row.stars_data || '{}'),
        unlockedComponents: JSON.parse(row.unlocked_components || '[]'),
      },
    });
  } catch (err: any) {
    console.error('[USER ERROR /progress GET]:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat progres pemain.' });
  }
});

/**
 * POST /api/user/progress
 * Update player progress (e.g. earned credits, knowledge points from Academy quizzes, completed episodes)
 */
userRouter.post('/progress', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { knowledgePoints, credits, rank, completed, stars, unlockedComponents } = req.body;

    db.prepare(`
      INSERT INTO player_progress (user_id, knowledge_points, credits, rank, completed_episodes, stars_data, unlocked_components, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        knowledge_points = excluded.knowledge_points,
        credits = excluded.credits,
        rank = excluded.rank,
        completed_episodes = excluded.completed_episodes,
        stars_data = excluded.stars_data,
        unlocked_components = excluded.unlocked_components,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      user.id,
      knowledgePoints ?? 50,
      credits ?? 100,
      rank ?? 'Kadet Antariksa',
      JSON.stringify(completed ?? ['ep01']),
      JSON.stringify(stars ?? {}),
      JSON.stringify(unlockedComponents ?? [])
    );

    return res.json({ success: true, message: 'Progres misi berhasil disinkronkan ke database.' });
  } catch (err: any) {
    console.error('[USER ERROR /progress POST]:', err);
    return res.status(500).json({ success: false, error: 'Gagal menyimpan progres pemain.' });
  }
});

/**
 * GET /api/leaderboard
 * Global leaderboard fetched directly from SQLite database
 */
userRouter.get('/leaderboard', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT 
        u.callsign, 
        u.role, 
        p.knowledge_points, 
        p.rank,
        COALESCE(MAX(t.score), 0) as high_score,
        COUNT(t.id) as missions_flown
      FROM users u
      LEFT JOIN player_progress p ON u.id = p.user_id
      LEFT JOIN telemetry_logs t ON u.id = t.user_id
      WHERE u.callsign IS NOT NULL
      GROUP BY u.id
      ORDER BY high_score DESC, p.knowledge_points DESC
      LIMIT 20
    `).all() as any[];

    const leaderboard = rows.map((r, idx) => ({
      rank: idx + 1,
      callsign: r.callsign || 'ANONYMOUS',
      role: r.role || 'cadet',
      rankTitle: r.rank || 'Kadet Antariksa',
      knowledgePoints: r.knowledge_points || 50,
      score: r.high_score,
      missionsFlown: r.missions_flown,
    }));

    return res.json({ success: true, leaderboard });
  } catch (err: any) {
    console.error('[LEADERBOARD ERROR]:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat papan peringkat.' });
  }
});

/**
 * POST /api/telemetry/submit
 * Log forensic simulation mission results to database
 */
userRouter.post('/telemetry/submit', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { episodeId, score, survived, grade } = req.body;

    const recordId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO telemetry_logs (id, user_id, callsign, episode_id, score, survived, grade)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      recordId,
      user.id,
      user.callsign || 'UNKNOWN',
      episodeId || 'ep01',
      score || 0,
      survived ? 1 : 0,
      grade || 'nominal'
    );

    return res.json({ success: true, recordId, message: 'Data telemetri berhasil diarsip.' });
  } catch (err: any) {
    console.error('[TELEMETRY SUBMIT ERROR]:', err);
    return res.status(500).json({ success: false, error: 'Gagal mencatat telemetri misi.' });
  }
});
