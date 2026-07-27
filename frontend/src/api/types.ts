/**
 * Shared API/type contracts for cross-pathway integration points.
 *
 * SOURCE OF TRUTH: docs/cross-pathway-api-contracts.md
 *
 * IMPORTANT: The shapes below are PLACEHOLDERS aligned to the *example* shapes
 * in that doc. They are NOT yet agreed with the owning pathways. See
 * frontend/SETUP-NOTES.md "Questions for the design team" before relying on them.
 *  - EP-04 auth (user/role) shape + exact role names: owned by Cybersecurity.
 *  - EP-03 dashboard data shape + filters: owned by Data Analyst.
 *
 * The one shape that IS confirmed is the standard API error body, reconciled
 * against backend/src/middleware/errorHandler.ts (XC-1) — see ApiErrorBody below.
 */

/* ------------------------------------------------------------------ */
/* Standard error shape (CONFIRMED — matches backend XC-1)            */
/* ------------------------------------------------------------------ */

/** The exact JSON error body every backend endpoint returns on failure. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/* ------------------------------------------------------------------ */
/* EP-04 — Auth & roles (NOT YET AGREED with Cybersecurity)           */
/* ------------------------------------------------------------------ */

// TODO(EP-04): confirm exact role string names with Cybersecurity. Our route
// guards and nav-by-role logic must match these EXACTLY (see contracts doc §3).
export type Role = 'ADMIN' | 'COORDINATOR' | 'VIEWER';

// TODO(EP-04): confirm field names/shape of the current-user payload.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

// TODO(EP-04): agree token vs httpOnly cookie. Cookie is the documented
// preference; if cookie, `token` here is dropped entirely.
export interface LoginResponse {
  user: AuthUser;
  token?: string;
}

/* ------------------------------------------------------------------ */
/* EP-03 — Impact dashboard (NOT YET AGREED with Data Analyst)        */
/* ------------------------------------------------------------------ */

// TODO(EP-03): agree which charts exist and each data point's shape.
export interface ChartPoint {
  label: string;
  value: number;
}

// TODO(EP-03): agree the full dashboard payload + filter params (from/to/programmeId).
export interface DashboardData {
  totalVolunteers: number;
  hoursByProgramme: ChartPoint[];
  attendanceTrend: Array<{ date: string; value: number }>;
}
