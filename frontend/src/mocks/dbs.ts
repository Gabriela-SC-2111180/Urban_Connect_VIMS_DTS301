/**
 * SCOPED MOCK of the DBS (Disclosure and Barring Service) check system.
 *
 * The DBS is a genuinely EXTERNAL UK government service VIMS would integrate
 * with to verify a volunteer's background check (FR-1.4 capture / FR-1.5
 * expiry). We do not own it and it is not part of any team member's pathway —
 * so to demonstrate the volunteer DBS flow we mimic it here, clearly scoped:
 *
 *  - lives entirely in this file,
 *  - only reachable via the mock branch of src/api/volunteers.ts,
 *  - returns the SAME shape (DbsRecord) the real integration would populate.
 *
 * Swap-out plan: when a real DBS integration (or backend proxy to it) exists,
 * the volunteers resource module calls that instead; this file is deleted.
 */
import type { DbsRecord } from '../api/domain';
import { delay } from './store';

const DBS_VALIDITY_YEARS = 3;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addYears(from: Date, years: number): Date {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

let certSeq = 50_000;
function nextCertNumber(): string {
  certSeq += 1;
  return `DBS-0${certSeq}`;
}

/**
 * Mimic "submit a volunteer for a DBS check". The real service is asynchronous
 * (days/weeks); here we simulate an instant CLEAR result so the flow completes
 * in a demo. A real integration would return PENDING and notify on completion.
 *
 * `simulatePending` lets a caller demonstrate the in-progress state instead.
 */
export async function runDbsCheck(simulatePending = false): Promise<DbsRecord> {
  if (simulatePending) {
    return delay<DbsRecord>({ status: 'PENDING' }, 400);
  }
  const issued = new Date();
  const expiry = addYears(issued, DBS_VALIDITY_YEARS);
  return delay<DbsRecord>(
    {
      status: 'CLEAR',
      certificateNumber: nextCertNumber(),
      issuedDate: isoDate(issued),
      expiryDate: isoDate(expiry),
    },
    600,
  );
}
