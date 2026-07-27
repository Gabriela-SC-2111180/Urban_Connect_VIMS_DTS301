/**
 * Tests for the scoped mock service layer — proves the cross-cutting flows the
 * frames depend on: auth login/session and the assignment → confirmation
 * notification side effect (FR-5.1).
 */
import { describe, expect, it } from 'vitest';
import { assignVolunteer, listNotifications, login, me } from '../mocks/server';

describe('mock auth', () => {
  it('logs in a seeded user and resolves the session', async () => {
    const res = await login('eva.cameron@urbanconnect.org');
    expect(res.user.roles).toContain('ADMIN');
    const who = await me();
    expect(who?.email).toBe('eva.cameron@urbanconnect.org');
  });

  it('rejects an unknown account', () => {
    expect(() => login('nobody@example.org')).toThrow();
  });
});

describe('mock assignment flow', () => {
  it('assigning a volunteer surfaces a confirmation notification (FR-5.1)', async () => {
    const before = await listNotifications();
    const assignment = await assignVolunteer('evt_2', 'vol_3');
    expect(assignment.eventId).toBe('evt_2');

    const after = await listNotifications();
    expect(after.length).toBe(before.length + 1);
    expect(after[0]?.type).toBe('ASSIGNMENT');
  });

  it('refuses a duplicate assignment', async () => {
    await expect(assignVolunteer('evt_1', 'vol_1')).rejects.toThrow();
  });
});
