/**
 * Dashboard resource module — EP-03 (FR-3.x). INTEGRATION surface: the Data
 * Analyst pathway owns the real numbers; we own the call + the embed. Branches
 * on env.useMocks; real path mirrors backend /impact. Shape per
 * docs/cross-pathway-api-contracts.md (NOT yet locked with the Data Analyst).
 */
import { env } from '../config/env';
import { api } from './client';
import type { DashboardData } from './types';
import * as mock from '../mocks/server';

const BASE = 'api/v1/impact';

/** FR-3.3 — the numbers behind the dashboard charts. */
export function getDashboard(): Promise<DashboardData> {
  if (env.useMocks) return mock.getDashboard();
  return api.get<DashboardData>(`${BASE}/dashboard`);
}
