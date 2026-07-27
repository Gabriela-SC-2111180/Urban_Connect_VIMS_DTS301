/**
 * Express application bootstrap.
 *
 * Wires the cross-cutting middleware stack (XC-1) in the correct order:
 *   1. CORS (allow the frontend dev origin)
 *   2. JSON body parsing
 *   3. Request logging (morgan)
 *   4. /health (liveness)
 *   5. /api/v1 domain routers (stubbed — return 501 until their cards land)
 *   6. 404 fallback
 *   7. Centralised error handler (standard JSON error shape)
 *
 * Maps to: XC-1 (API scaffold + error shape), NFR-S3 (documented API),
 * NFR-6 (CORS lock-down). HTTPS/TLS (NFR-A/NFR-2) is deliberately NOT here —
 * local dev is plain HTTP; TLS is a deployment concern, see status doc.
 */
import express, { type Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true, // needed if EP-04 lands on httpOnly cookies (TBC with Cybersecurity)
    }),
  );
  app.use(express.json());
  app.use(morgan(config.logFormat));

  // Liveness check — no auth, no DB. Maps to XC-1 "a health check responds".
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'vims-backend', time: new Date().toISOString() });
  });

  // All domain endpoints live under a versioned prefix.
  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
