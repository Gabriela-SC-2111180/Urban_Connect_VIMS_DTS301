/**
 * Smoke test for the scaffold: proves the app boots, /health returns 200 JSON,
 * unknown routes return the standard 404 error shape, and a stub domain route
 * returns the standard 501 error shape (XC-1).
 *
 * Uses Node's built-in fetch against an ephemeral listener — no extra deps.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app.js';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('scaffold smoke tests', () => {
  it('GET /health returns 200 and ok status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });

  it('unknown route returns standard 404 error shape', async () => {
    const res = await fetch(`${baseUrl}/does-not-exist`);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe('NOT_FOUND');
    expect(typeof body.error.message).toBe('string');
  });

  it('stub domain route returns standard 501 error shape', async () => {
    const res = await fetch(`${baseUrl}/api/v1/volunteers`);
    expect(res.status).toBe(501);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('NOT_IMPLEMENTED');
  });
});
