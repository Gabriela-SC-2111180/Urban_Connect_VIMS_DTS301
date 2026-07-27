/** Unit tests for the shared validation helpers (FR-1.9 / NFR-S6). */
import { describe, expect, it } from 'vitest';
import { isEmail, isNonEmpty, isPhone, isValidDateRange } from '../lib/validation';

describe('validation', () => {
  it('isNonEmpty rejects blank/whitespace', () => {
    expect(isNonEmpty('')).toBe(false);
    expect(isNonEmpty('   ')).toBe(false);
    expect(isNonEmpty('x')).toBe(true);
  });

  it('isEmail accepts well-formed, rejects malformed', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('no-at')).toBe(false);
    expect(isEmail('a@b')).toBe(false);
  });

  it('isPhone accepts UK-style numbers, rejects junk', () => {
    expect(isPhone('07700 900111')).toBe(true);
    expect(isPhone('+44 113 496 0000')).toBe(true);
    expect(isPhone('12')).toBe(false);
    expect(isPhone('abc')).toBe(false);
  });

  it('isValidDateRange requires end on/after start', () => {
    expect(isValidDateRange('2026-01-01', '2026-12-31')).toBe(true);
    expect(isValidDateRange('2026-12-31', '2026-01-01')).toBe(false);
    expect(isValidDateRange('', '2026-01-01')).toBe(false);
  });
});
