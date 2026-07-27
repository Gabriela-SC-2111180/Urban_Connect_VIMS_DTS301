/**
 * Auth & RBAC routes — EP-04 (Cybersecurity-led; SE integrates).
 *
 * Cards: SEC-1 (hashing/user store), SEC-2 (login/session/logout),
 * SEC-3 (RBAC enforcement), SEC-4 (admin user mgmt), SEC-5/6 (policy/lockout),
 * XC-3 (audit log).
 *
 * OPEN CONTRACT (must be locked with Cybersecurity — see
 * docs/cross-pathway-api-contracts.md and PROJECT-SETUP-STATUS.md):
 *   - token in response body vs httpOnly cookie (frontend prefers cookie)
 *   - exact role names: ADMIN / COORDINATOR / VIEWER
 *   - shape of GET /me (id, name, email, roles[])
 *   - 401 contract for expired/invalid session
 *
 * All handlers are stubs returning 501 until the SEC-* cards are built.
 */
import { Router } from 'express';
import { notImplemented } from './_stub.js';

export const authRouter = Router();

authRouter.post('/login', notImplemented('SEC-2'));
authRouter.post('/logout', notImplemented('SEC-2'));
authRouter.get('/me', notImplemented('SEC-2'));

// Admin user management (SEC-4). RBAC: ADMIN only (SEC-3).
authRouter.get('/users', notImplemented('SEC-4'));
authRouter.post('/users', notImplemented('SEC-4'));
authRouter.patch('/users/:id', notImplemented('SEC-4'));
authRouter.post('/users/:id/deactivate', notImplemented('SEC-4'));
