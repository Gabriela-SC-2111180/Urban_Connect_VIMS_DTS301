/** Unit tests for DBS expiry flagging (FR-1.5) — pure display logic. */
import { describe, expect, it } from 'vitest';
import { dbsFlag } from '../lib/dbs';

const today = new Date('2026-06-16T00:00:00Z');

describe('dbsFlag', () => {
  it('flags missing/pending records', () => {
    expect(dbsFlag({ status: 'NONE' }, today)).toBe('MISSING');
    expect(dbsFlag({ status: 'PENDING' }, today)).toBe('PENDING');
  });

  it('flags expired records (by status or by past expiry date)', () => {
    expect(dbsFlag({ status: 'EXPIRED' }, today)).toBe('EXPIRED');
    expect(dbsFlag({ status: 'CLEAR', expiryDate: '2025-03-01' }, today)).toBe('EXPIRED');
  });

  it('flags certificates expiring within the window', () => {
    expect(dbsFlag({ status: 'CLEAR', expiryDate: '2026-07-01' }, today)).toBe('EXPIRING_SOON');
  });

  it('passes certificates with plenty of validity left', () => {
    expect(dbsFlag({ status: 'CLEAR', expiryDate: '2030-01-01' }, today)).toBe('OK');
  });
});
