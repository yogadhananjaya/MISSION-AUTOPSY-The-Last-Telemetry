/* antislop: ORBITA NOVA - Mission Control Backend & Database Server (Team Certified Space Cap) */
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { authRouter } from './routes/authRoutes.js';
import { userRouter } from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS security configuration
app.use(cors({
  origin: true, // Allow frontend dev server and production origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Initialize SQLite database
initDb();

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api', userRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    team: 'Certified Space Cap',
    mission: 'ORBITA NOVA: The Last Telemetry',
    timestamp: new Date().toISOString(),
    database: 'SQLite (WAL Mode)',
    security: 'Scrypt + Constant-Time Comparison + Sliding Window Rate Limiting',
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[SERVER EXCEPTION]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Mission Control Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ORBITA NOVA BACKEND SERVER ONLINE`);
    console.log(`🛸 TEAM: CERTIFIED SPACE CAP`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔒 SECURITY: Active (Scrypt, Rate Limiting, Session Guard)`);
    console.log(`💾 DATABASE: SQLite (data/orbita.db)`);
    console.log(`======================================================\n`);
  });
}

export default app;
