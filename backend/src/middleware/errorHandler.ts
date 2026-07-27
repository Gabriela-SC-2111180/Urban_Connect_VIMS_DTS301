/**
 * Centralised error-handling middleware + 404 fallback.
 *
 * Defines THE single standard JSON error shape for the whole API (XC-1).
 * Every error response — thrown AppError, unexpected exception, or unknown
 * route — comes back in this exact shape so the frontend can rely on it:
 *
 *   {
 *     "error": {
 *       "code": "BAD_REQUEST",
 *       "message": "Human-readable summary",
 *       "details": { ... }   // optional, e.g. per-field validation errors
 *     }
 *   }
 *
 * Maps to: XC-1 (standard error shape). Frontend: this shape is recorded in
 * PROJECT-SETUP-STATUS.md so the typed API client can match it.
 */
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** 404 handler for unmatched routes — registered after all routers. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.path}`));
};

/** Final error handler — must be registered last and keep all four args. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const message = isAppError ? err.message : 'An unexpected error occurred';

  // Log full error server-side; never leak internals to the client (NFR-6 spirit).
  // AppErrors are deliberate, controlled responses (incl. 501 stubs) — don't spam
  // the log with their stack traces. Only log genuinely unexpected failures.
  if (!isAppError) {
    console.error('[error]', err);
  }

  const body: ApiErrorBody = { error: { code, message } };
  if (isAppError && err.details !== undefined) {
    body.error.details = err.details;
  }

  res.status(statusCode).json(body);
};
