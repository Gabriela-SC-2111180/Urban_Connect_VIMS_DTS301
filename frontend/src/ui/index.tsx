/**
 * Minimal shared UI primitives (Area A7 seed). UNSTYLED ON PURPOSE — visual
 * design (tokens, layout, polish) is owned by the design team. These exist only
 * to express the FRAMES and FLOWS accessibly and consistently while features
 * are built, and to give forms a11y (label/error association) for free (FR-1.9).
 *
 * Keep this small. When the real design system lands, components swap one-for-one.
 */
import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

/* ------------------------------- messages ------------------------------- */

export function InlineMessage({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'error' | 'success';
}) {
  // Errors assert politely-but-promptly; info/success are polite live regions.
  const role = tone === 'error' ? 'alert' : 'status';
  return (
    <p role={role} data-tone={tone}>
      {children}
    </p>
  );
}

/** Async-state wrapper for a React Query result: loading / error / empty / data. */
export function Async<T>({
  query,
  children,
  empty = 'Nothing to show yet.',
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  empty?: ReactNode;
}) {
  if (query.isPending) return <p role="status">Loading…</p>;
  if (query.isError) {
    const message = query.error instanceof Error ? query.error.message : 'Something went wrong.';
    return <InlineMessage tone="error">{message}</InlineMessage>;
  }
  const data = query.data;
  if (data === undefined || (Array.isArray(data) && data.length === 0)) {
    return <InlineMessage>{empty}</InlineMessage>;
  }
  return <>{children(data)}</>;
}

/* -------------------------------- inputs -------------------------------- */

interface BaseFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
}

function FieldShell({ id, label, required, error, children }: BaseFieldProps & { children: ReactNode }) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div data-field={id}>
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" data-tone="error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required,
  error,
  placeholder,
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required,
  error,
  placeholder,
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <select
        id={id}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/* ------------------------------ data display ---------------------------- */

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  caption?: string;
}) {
  return (
    <table>
      {caption ? <caption>{caption}</caption> : null}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.header} scope="col">
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)}>
            {columns.map((c) => (
              <td key={c.header}>{c.cell(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Text status pill — colour/shape is the design team's; we expose the value. */
export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: string }) {
  return <span data-badge={tone}>{label}</span>;
}
