/**
 * Notifications resource module — EP-05 (FR-5.x, UI surfacing). Sending is
 * backend-driven; the frontend reads the log/feed. Branches on env.useMocks.
 */
import { env } from '../config/env';
import { api } from './client';
import type { NotificationItem } from './domain';
import * as mock from '../mocks/server';

const BASE = 'api/v1/notifications';

/** FR-5.4 (read side) — the notification log / feed. */
export function listNotifications(): Promise<NotificationItem[]> {
  if (env.useMocks) return mock.listNotifications();
  return api.get<NotificationItem[]>(BASE);
}
