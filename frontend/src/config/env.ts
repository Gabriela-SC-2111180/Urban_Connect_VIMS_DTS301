/**
 * Centralised, typed access to build-time environment configuration.
 * One place so feature code never reaches into import.meta.env directly.
 *
 * NFR-2: in deployment the API base URL must be HTTPS. Locally it is plain
 * HTTP against the backend dev server — TLS is a deployment NFR, not scaffolded.
 */

const DEFAULT_API_BASE_URL = 'http://localhost:4000';

/**
 * Whether the frontend serves data from the SCOPED MOCK LAYER (src/mocks/)
 * instead of the real backend. This is the seam that lets us "mimic" the
 * backend and the external systems it integrates (auth/EP-04, dashboard/EP-03,
 * and the DBS check service) so every flow runs end-to-end before those parts
 * are built — see src/mocks/README.md and docs/cross-pathway-api-contracts.md.
 *
 * Default: ON in dev (so the demo runs standalone), OFF in production builds.
 * Force either way with VITE_USE_MOCKS='true' | 'false'.
 */
function resolveUseMocks(): boolean {
  const flag = import.meta.env.VITE_USE_MOCKS;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return import.meta.env.DEV;
}

export const env = {
  /** Base URL of the backend REST API. Override via VITE_API_BASE_URL. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  /** True in `vite` dev mode. */
  isDev: import.meta.env.DEV,
  /** True when the scoped mock service layer backs the API resource modules. */
  useMocks: resolveUseMocks(),
} as const;
