/**
 * Notifications routes — EP-05.
 *
 * Cards: NOT-1 (assignment confirmation), NOT-2 (event reminders — scheduled
 * job), NOT-3 (staff change alerts), NOT-4 (notification record/log),
 * NOT-5 (preferences/timing), NOT-6 (failure handling/retry).
 *
 * Depends on: SCH-3 (assignments), DM-1. Note NOT-2 is primarily a scheduled
 * job rather than an HTTP endpoint; the log read (NOT-4) is exposed here.
 * All handlers are stubs returning 501 until the NOT-* cards are built.
 */
import { Router } from 'express';
import { notImplemented } from './_stub.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', notImplemented('NOT-4')); // list notification log
notificationsRouter.get('/preferences', notImplemented('NOT-5'));
notificationsRouter.put('/preferences', notImplemented('NOT-5'));
