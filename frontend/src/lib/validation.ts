/**
 * Shared, framework-agnostic validation helpers (A8-4 / NFR-S6).
 *
 * One place for the field rules every form reconciles client-side (FR-1.9 and
 * the create/edit forms in Areas A1/A3/A4). Pure functions only — no React, no
 * DOM — so they are trivially unit-testable and reusable by any feature card.
 *
 * Server-side validation (backend XC-2) is still authoritative; these exist to
 * give immediate, accessible feedback and to block obviously-invalid saves.
 */

/** Map of field name -> human-readable error message. Empty means "valid". */
export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

/** True when a string has non-whitespace content. */
export function isNonEmpty(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Pragmatic email check — good enough for form feedback, not RFC-perfect. */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** UK-flavoured phone check: digits, spaces, +, (), - ; 7–15 digits overall. */
export function isPhone(value: string): boolean {
  const digits = value.replace(/[^\d]/g, '');
  return /^[+()\d\s-]+$/.test(value.trim()) && digits.length >= 7 && digits.length <= 15;
}

/** True when both dates parse and end is on/after start. */
export function isValidDateRange(start: string, end: string): boolean {
  if (!isNonEmpty(start) || !isNonEmpty(end)) return false;
  const s = Date.parse(start);
  const e = Date.parse(end);
  return !Number.isNaN(s) && !Number.isNaN(e) && e >= s;
}

/** Returns true when an errors map has no entries (all fields valid). */
export function isValid(errors: FieldErrors): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Tiny declarative runner: for each field, the first failing rule's message
 * wins. Keeps form components free of branching validation code.
 */
export interface Rule<T> {
  test: (value: T) => boolean;
  message: string;
}

export function validateField<T>(value: T, rules: Rule<T>[]): string | undefined {
  for (const rule of rules) {
    if (!rule.test(value)) return rule.message;
  }
  return undefined;
}
