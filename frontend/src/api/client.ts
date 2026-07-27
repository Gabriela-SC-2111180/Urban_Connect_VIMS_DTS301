/**
 * The single typed API client for the whole frontend (NFR-S3, A8-1).
 *
 * Responsibilities (one place, every feature uses it):
 *  - Resolve the base URL from env (src/config/env.ts).
 *  - Typed JSON request helpers (get/post/put/patch/del).
 *  - Normalise every failure into one ApiError (matches backend XC-1 shape).
 *  - Provide a single 401 -> logout hook point.
 *
 * Deliberately NO real endpoints here — feature/foundation kanban cards add
 * typed resource functions on top of this. Credentials handling (cookie vs
 * bearer) is stubbed pending the EP-04 decision (see SETUP-NOTES.md).
 */
import { env } from '../config/env';
import type { ApiErrorBody } from './types';

/** Normalised client-side error. Thrown by every request helper on failure. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * 401 hook point. Auth (EP-04) is owned by Cybersecurity; here we expose a
 * single seam the auth provider registers into, so a 401 anywhere triggers
 * logout (A8-1 / A1-5) without the client importing auth state.
 *
 * TODO(EP-04): the auth provider should call registerUnauthorizedHandler() to
 * wire real logout + redirect-to-login behaviour.
 */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler = () => {
  // Placeholder until the auth provider registers a real handler.
  if (env.isDev) console.warn('[api] 401 received but no unauthorized handler is registered yet (EP-04 stub).');
};

export function registerUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  /** Query params appended to the URL. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Extra headers merged over the defaults. */
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(path.replace(/^\//, ''), env.apiBaseUrl.replace(/\/?$/, '/'));
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(method: string, path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.params), {
      method,
      // TODO(EP-04): if auth uses httpOnly cookies, this stays 'include';
      // if bearer tokens, attach the Authorization header here instead.
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options.signal,
    });
  } catch (cause) {
    // Network failure / CORS / abort — no HTTP status available.
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server.', cause);
  }

  if (response.status === 401) {
    onUnauthorized();
  }

  // Parse body if present (some endpoints return 204 No Content).
  const text = await response.text();
  const data: unknown = text ? safeJsonParse(text) : undefined;

  if (!response.ok) {
    throw toApiError(response.status, data);
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Map a non-OK response into the normalised ApiError using the backend shape. */
function toApiError(status: number, data: unknown): ApiError {
  if (isApiErrorBody(data)) {
    return new ApiError(status, data.error.code, data.error.message, data.error.details);
  }
  return new ApiError(status, 'UNKNOWN', `Request failed with status ${status}.`, data);
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error === 'object' &&
    (value as ApiErrorBody).error !== null &&
    typeof (value as ApiErrorBody).error.code === 'string'
  );
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, body, options),
  del: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options),
};

// TODO: add typed resource modules per feature area, e.g.
//   src/api/volunteers.ts -> listVolunteers(), createVolunteer() (A3 / EP-01)
//   src/api/scheduling.ts, src/api/notifications.ts, src/api/auth.ts, src/api/dashboard.ts
// Each builds on `api.*` above. No real endpoint paths are hardcoded yet.
