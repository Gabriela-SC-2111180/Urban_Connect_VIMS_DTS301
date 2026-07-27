/**
 * Top-level API router. Mounts each domain's stub router under /api/v1.
 *
 * Every domain router is WIRED but returns 501 Not Implemented until its
 * kanban cards are built. This lets the frontend hit real (versioned) URLs
 * now and discover the route map, while making it obvious nothing is done yet.
 *
 * Route map (all under /api/v1):
 *   /auth          -> EP-04 (SEC-*)  — Cybersecurity-led, SE integrates
 *   /volunteers    -> EP-01 (VOL-*)
 *   /scheduling    -> EP-02 (SCH-*)
 *   /impact        -> EP-03 (IMP-*)  — Data Analyst consumes
 *   /notifications -> EP-05 (NOT-*)
 *
 * Maps to: XC-1 (documented contract), NFR-S3.
 */
import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { volunteersRouter } from './volunteers.routes.js';
import { schedulingRouter } from './scheduling.routes.js';
import { impactRouter } from './impact.routes.js';
import { notificationsRouter } from './notifications.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/volunteers', volunteersRouter);
apiRouter.use('/scheduling', schedulingRouter);
apiRouter.use('/impact', impactRouter);
apiRouter.use('/notifications', notificationsRouter);
