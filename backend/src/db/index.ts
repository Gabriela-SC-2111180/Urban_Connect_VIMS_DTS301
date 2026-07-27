/**
 * Database connection module.
 *
 * Choice: better-sqlite3 (synchronous, zero-config, fast, file-based) — see
 * README for the rationale vs Prisma. This module owns ONE shared connection.
 *
 * IMPORTANT (scaffold state): no schema is created here. The entity/data model
 * is card DM-1 (owned by the whole team) and migrations are DM-2. This module
 * only opens a connection and applies safe PRAGMAs so domain cards have
 * something to import. Do not add CREATE TABLE statements here — those belong
 * in migrations (see src/db/migrations/).
 *
 * Maps to: DM-1 (schema, NOT done), DM-2 (migrations, NOT done), XC-2 (only
 * parameterised queries — enforced by using better-sqlite3 prepared statements).
 */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config/env.js';

let db: Database.Database | null = null;

/** Returns the shared SQLite connection, opening it on first use. */
export function getDb(): Database.Database {
  if (db) return db;

  const absolutePath = resolve(process.cwd(), config.dbPath);
  const dir = dirname(absolutePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new Database(absolutePath);
  // Sensible defaults for a multi-reader demo workload.
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

/** Closes the connection (used in tests / graceful shutdown). */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
