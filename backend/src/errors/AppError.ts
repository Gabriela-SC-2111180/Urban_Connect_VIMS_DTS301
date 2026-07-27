/**
 * Application error type. Throw this (or a subclass) anywhere in the request
 * path and the centralised error handler will translate it into the standard
 * JSON error shape.
 *
 * Maps to: XC-1 (single predictable error format).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notImplemented(message = 'Not implemented'): AppError {
    return new AppError(501, 'NOT_IMPLEMENTED', message);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static badRequest(message = 'Bad request', details?: unknown): AppError {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }
}
