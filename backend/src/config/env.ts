/**
 * Centralised, validated configuration loaded from environment variables.
 *
 * Maps to: XC-1 (API scaffold), NFR-A (HTTPS — noted, deferred).
 * Reads keys documented in backend/.env.example. dotenv loads .env in dev;
 * in production the host injects real env vars.
 */
import 'dotenv/config';

function readString(key: string, fallback: string): string {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}

function readInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be an integer, got "${raw}"`);
  }
  return parsed;
}

export const config = {
  nodeEnv: readString('NODE_ENV', 'development'),
  port: readInt('PORT', 4000),
  dbPath: readString('DB_PATH', './data/vims.sqlite'),
  corsOrigin: readString('CORS_ORIGIN', 'http://localhost:5173'),
  logFormat: readString('LOG_FORMAT', 'dev'),
} as const;

export type AppConfig = typeof config;
