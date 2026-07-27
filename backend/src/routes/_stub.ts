/**
 * Shared helper for scaffold stub routes.
 *
 * Returns a handler that always responds with the standard 501 error shape.
 * Use it on placeholder endpoints so the route exists and is discoverable,
 * but it is unmistakably "not built yet" (and consistent with XC-1's error
 * format via AppError.notImplemented).
 */
import type { RequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export function notImplemented(card: string): RequestHandler {
  return (_req, _res, next) => {
    next(AppError.notImplemented(`Not implemented yet — owned by card ${card}`));
  };
}
