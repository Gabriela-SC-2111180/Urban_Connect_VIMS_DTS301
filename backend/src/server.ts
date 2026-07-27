/**
 * Server entry point. Starts the HTTP listener.
 *
 * Maps to: XC-1. Local dev serves plain HTTP; HTTPS/TLS termination for
 * deployment is NFR-A (deferred — see PROJECT-SETUP-STATUS.md).
 */
import { createApp } from './app.js';
import { config } from './config/env.js';
import { closeDb } from './db/index.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[vims-backend] listening on http://localhost:${config.port} (${config.nodeEnv})`);
  console.log(`[vims-backend] health: http://localhost:${config.port}/health`);
});

function shutdown(signal: string): void {
  console.log(`[vims-backend] ${signal} received, shutting down...`);
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
