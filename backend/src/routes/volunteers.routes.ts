/**
 * Volunteer domain routes — EP-01.
 *
 * Cards: VOL-1 (CRUD + validation), VOL-2 (skills), VOL-3 (availability),
 * VOL-4 (DBS status/expiry), VOL-5 (expiry flagging), VOL-6 (search/filter),
 * VOL-7 (archive/deactivate), VOL-8 (assignment history read).
 *
 * Depends on: DM-1/2 (schema), XC-2 (validation), SEC-3 (RBAC).
 * All handlers are stubs returning 501 until the VOL-* cards are built.
 */
import { Router } from 'express';
import { notImplemented } from './_stub.js';

export const volunteersRouter = Router();

volunteersRouter.get('/', notImplemented('VOL-6')); // list/search/filter (paged)
volunteersRouter.post('/', notImplemented('VOL-1')); // create
volunteersRouter.get('/:id', notImplemented('VOL-1')); // read
volunteersRouter.patch('/:id', notImplemented('VOL-1')); // update
volunteersRouter.post('/:id/deactivate', notImplemented('VOL-7')); // soft delete

volunteersRouter.get('/:id/skills', notImplemented('VOL-2'));
volunteersRouter.put('/:id/skills', notImplemented('VOL-2'));
volunteersRouter.get('/:id/availability', notImplemented('VOL-3'));
volunteersRouter.put('/:id/availability', notImplemented('VOL-3'));
volunteersRouter.put('/:id/dbs', notImplemented('VOL-4'));
volunteersRouter.get('/:id/assignments', notImplemented('VOL-8')); // assignment history
