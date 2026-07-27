/**
 * DBS display logic (FR-1.5) — REAL app logic, not a mock. Derives the warning
 * state of a stored DBS record relative to "today" so the UI can flag expired
 * and soon-to-expire certificates consistently. Pure + unit-testable.
 *
 * (The DBS *check service* itself is external and mocked in src/mocks/dbs.ts;
 * this only interprets a record we already hold.)
 */
import type { DbsRecord } from '../api/domain';

export type DbsFlag = 'OK' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING' | 'PENDING';

export function dbsFlag(record: DbsRecord, today: Date = new Date(), windowDays = 60): DbsFlag {
  if (record.status === 'NONE') return 'MISSING';
  if (record.status === 'PENDING') return 'PENDING';
  if (record.status === 'EXPIRED') return 'EXPIRED';
  if (!record.expiryDate) return 'OK';

  const expiry = Date.parse(record.expiryDate);
  if (Number.isNaN(expiry)) return 'OK';
  const msLeft = expiry - today.getTime();
  if (msLeft < 0) return 'EXPIRED';
  if (msLeft < windowDays * 24 * 60 * 60 * 1000) return 'EXPIRING_SOON';
  return 'OK';
}

/** Short human label for a DBS flag, for badges/status text. */
export function dbsFlagLabel(flag: DbsFlag): string {
  switch (flag) {
    case 'OK':
      return 'DBS valid';
    case 'EXPIRING_SOON':
      return 'DBS expiring soon';
    case 'EXPIRED':
      return 'DBS expired';
    case 'PENDING':
      return 'DBS pending';
    case 'MISSING':
      return 'No DBS';
  }
}
