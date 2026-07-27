/**
 * Scheduling domain routes — EP-02.
 *
 * Cards: SCH-1 (programme CRUD), SCH-2 (event scheduling), SCH-3 (assign
 * volunteers), SCH-4 (double-booking warning), SCH-5 (attendance),
 * SCH-6 (event list/calendar), SCH-7 (edit/reschedule/cancel + change record).
 *
 * Depends on: Volunteer domain (EP-01), DM-1/2, SEC-3.
 * All handlers are stubs returning 501 until the SCH-* cards are built.
 */
import { Router } from 'express';
import { notImplemented } from './_stub.js';

export const schedulingRouter = Router();

// Programmes (SCH-1)
schedulingRouter.get('/programmes', notImplemented('SCH-1'));
schedulingRouter.post('/programmes', notImplemented('SCH-1'));
schedulingRouter.get('/programmes/:id', notImplemented('SCH-1'));
schedulingRouter.patch('/programmes/:id', notImplemented('SCH-1'));

// Events (SCH-2, SCH-6, SCH-7)
schedulingRouter.get('/events', notImplemented('SCH-6'));
schedulingRouter.post('/events', notImplemented('SCH-2'));
schedulingRouter.get('/events/:id', notImplemented('SCH-2'));
schedulingRouter.patch('/events/:id', notImplemented('SCH-7'));

// Assignments & attendance (SCH-3, SCH-4, SCH-5)
schedulingRouter.post('/events/:id/assignments', notImplemented('SCH-3'));
schedulingRouter.patch('/assignments/:id/attendance', notImplemented('SCH-5'));
