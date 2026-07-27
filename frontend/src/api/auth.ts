/**
 * Auth resource module — EP-04 surface (owned by Cybersecurity; mocked here so
 * the login → role-gated app flow runs). Branches on env.useMocks; real paths
 * mirror backend /auth. Token-vs-cookie decision is still open (contracts §EP-04).
 */
import { env } from '../config/env';
import { api } from './client';
import type { AuthUser, LoginResponse } from './types';
import type { ManagedUser, ManagedUserInput } from './domain';
import * as mock from '../mocks/server';

const BASE = 'api/v1/auth';

export function login(email: string, password: string): Promise<LoginResponse> {
  if (env.useMocks) return mock.login(email);
  return api.post<LoginResponse>(`${BASE}/login`, { email, password });
}

/** "Who am I?" — resolves the current session; null when logged out. */
export function me(): Promise<AuthUser | null> {
  if (env.useMocks) return mock.me();
  // Real backend returns 401 when unauthenticated; the client's 401 hook fires,
  // and we surface "no session" as null to the caller.
  return api.get<{ user: AuthUser }>(`${BASE}/me`).then(
    (r) => r.user,
    () => null,
  );
}

export function logout(): Promise<void> {
  if (env.useMocks) return mock.logout();
  return api.post<void>(`${BASE}/logout`);
}

/* FR-4.6 — admin user management. */

export function listUsers(): Promise<ManagedUser[]> {
  if (env.useMocks) return mock.listUsers();
  return api.get<ManagedUser[]>(`${BASE}/users`);
}

export function createUser(input: ManagedUserInput): Promise<ManagedUser> {
  if (env.useMocks) return mock.createUser(input);
  return api.post<ManagedUser>(`${BASE}/users`, input);
}

export function updateUser(
  id: string,
  input: Partial<ManagedUserInput> & { active?: boolean },
): Promise<ManagedUser> {
  if (env.useMocks) return mock.updateUser(id, input);
  return api.patch<ManagedUser>(`${BASE}/users/${id}`, input);
}
