/**
 * Impact / Reporting routes — EP-03 (Data Analyst leads metrics; SE owns
 * capture, validation, aggregation, and the data API the dashboard consumes).
 *
 * Cards: IMP-1 (capture), IMP-2 (aggregate metrics), IMP-3 (filtering),
 * IMP-4 (dashboard data API — SE owns, Data Analyst consumes), IMP-5 (funder
 * report), IMP-6 (export PDF/CSV).
 *
 * OPEN CONTRACT (must be locked with the Data Analyst pathway — see
 * docs/cross-pathway-api-contracts.md and PROJECT-SETUP-STATUS.md):
 *   - exact dashboard data shape (which charts, label/value points)
 *   - filter params (?from=&to=&programmeId=)
 *   - empty/error shape for charts
 *
 * All handlers are stubs returning 501 until the IMP-* cards are built.
 */
import { Router } from 'express';
import { notImplemented } from './_stub.js';

export const impactRouter = Router();

impactRouter.post('/records', notImplemented('IMP-1')); // capture outcome data
impactRouter.get('/metrics', notImplemented('IMP-2')); // aggregate totals (+ filters: IMP-3)
impactRouter.get('/dashboard', notImplemented('IMP-4')); // dashboard data feed
impactRouter.get('/report', notImplemented('IMP-5')); // funder report
impactRouter.get('/report/export', notImplemented('IMP-6')); // PDF/CSV export
