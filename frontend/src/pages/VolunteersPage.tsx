/**
 * Volunteers — Area A3 / EP-01 (OWNED). Must-level frames & flows:
 *  - FR-1.7 list + search/filter        - FR-1.1–1.4 create/edit form
 *  - FR-1.9 client validation           - FR-1.4 DBS capture + run check
 *  - FR-1.5 DBS expiry flagging          - FR-1.6 assignment history
 *
 * Should/Could items (FR-1.8 archive UI) are intentionally OUT of this pass.
 * Unstyled — design owned by the design team. Data via the volunteers resource
 * module (mock-backed in dev).
 */
import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVolunteer,
  listVolunteerAssignments,
  listVolunteers,
  submitDbsCheck,
  updateVolunteer,
} from '../api/volunteers';
import type { DbsStatus, Volunteer, VolunteerInput, VolunteerQuery } from '../api/domain';
import { dbsFlag, dbsFlagLabel } from '../lib/dbs';
import { isEmail, isNonEmpty, isPhone, type FieldErrors } from '../lib/validation';
import { Async, DataTable, InlineMessage, SelectField, StatusBadge, TextField, type Column } from '../ui';

const DBS_FILTER_OPTIONS = [
  { value: 'CLEAR', label: 'Clear' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'NONE', label: 'None' },
];

export default function VolunteersPage() {
  const [query, setQuery] = useState<VolunteerQuery>({});
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [creating, setCreating] = useState(false);
  const [historyFor, setHistoryFor] = useState<Volunteer | null>(null);

  const volunteersQuery = useQuery({
    queryKey: ['volunteers', query],
    queryFn: () => listVolunteers(query),
  });

  const columns: Column<Volunteer>[] = [
    { header: 'Name', cell: (v) => `${v.firstName} ${v.lastName}` },
    { header: 'Email', cell: (v) => v.email },
    { header: 'Skills', cell: (v) => v.skills.join(', ') || '—' },
    {
      header: 'DBS',
      cell: (v) => {
        const flag = dbsFlag(v.dbs);
        return <StatusBadge label={dbsFlagLabel(flag)} tone={flag === 'OK' ? 'success' : flag === 'EXPIRED' ? 'error' : 'warn'} />;
      },
    },
    {
      header: 'Actions',
      cell: (v) => (
        <>
          <button type="button" onClick={() => { setEditing(v); setCreating(false); }}>
            Edit
          </button>{' '}
          <button type="button" onClick={() => setHistoryFor(v)}>
            History
          </button>
        </>
      ),
    },
  ];

  return (
    <main>
      <h1>Volunteers</h1>

      {/* FR-1.7 — search + filter */}
      <section aria-label="Search and filter">
        <TextField
          id="volunteer-search"
          label="Search (name or email)"
          value={query.search ?? ''}
          onChange={(search) => setQuery((q) => ({ ...q, search: search || undefined }))}
        />
        <SelectField
          id="volunteer-dbs-filter"
          label="DBS status"
          value={query.dbsStatus ?? ''}
          onChange={(value) => setQuery((q) => ({ ...q, dbsStatus: (value || undefined) as DbsStatus | undefined }))}
          options={DBS_FILTER_OPTIONS}
          placeholder="Any"
        />
        <label>
          <input
            type="checkbox"
            checked={query.includeArchived ?? false}
            onChange={(e) => setQuery((q) => ({ ...q, includeArchived: e.target.checked || undefined }))}
          />
          Include archived
        </label>
      </section>

      <button type="button" onClick={() => { setCreating(true); setEditing(null); }}>
        New volunteer
      </button>

      {(creating || editing) && (
        <VolunteerForm
          key={editing?.id ?? 'new'}
          existing={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}

      <Async query={volunteersQuery} empty="No volunteers match your search.">
        {(rows) => <DataTable columns={columns} rows={rows} getRowKey={(v) => v.id} caption="Volunteers" />}
      </Async>

      {historyFor && <AssignmentHistory volunteer={historyFor} onClose={() => setHistoryFor(null)} />}
    </main>
  );
}

/* --------------------------- create / edit form -------------------------- */

function toCsv(values: string[]): string {
  return values.join(', ');
}
function fromCsv(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function blankInput(): VolunteerInput {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    skills: [],
    availability: [],
    dbs: { status: 'NONE' },
  };
}

function VolunteerForm({ existing, onClose }: { existing: Volunteer | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<VolunteerInput>(existing ? stripVolunteer(existing) : blankInput());
  const [skillsText, setSkillsText] = useState(existing ? toCsv(existing.skills) : '');
  const [availabilityText, setAvailabilityText] = useState(existing ? toCsv(existing.availability) : '');
  const [errors, setErrors] = useState<FieldErrors<keyof VolunteerInput>>({});

  const saveMutation = useMutation({
    mutationFn: (input: VolunteerInput) =>
      existing ? updateVolunteer(existing.id, input) : createVolunteer(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      onClose();
    },
  });

  // FR-1.4 — run the (mocked external) DBS check for an existing volunteer.
  const dbsMutation = useMutation({
    mutationFn: () => submitDbsCheck(existing!.id),
    onSuccess: (updated) => {
      setForm((f) => ({ ...f, dbs: updated.dbs }));
      void queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: VolunteerInput = { ...form, skills: fromCsv(skillsText), availability: fromCsv(availabilityText) };

    // FR-1.9 — mandatory fields + format validation.
    const fieldErrors: FieldErrors<keyof VolunteerInput> = {};
    if (!isNonEmpty(next.firstName)) fieldErrors.firstName = 'First name is required.';
    if (!isNonEmpty(next.lastName)) fieldErrors.lastName = 'Last name is required.';
    if (!isEmail(next.email)) fieldErrors.email = 'Enter a valid email address.';
    if (!isPhone(next.phone)) fieldErrors.phone = 'Enter a valid phone number.';
    if (!isNonEmpty(next.emergencyContactName)) fieldErrors.emergencyContactName = 'Emergency contact name is required.';
    if (!isPhone(next.emergencyContactPhone)) fieldErrors.emergencyContactPhone = 'Enter a valid emergency contact number.';
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    saveMutation.mutate(next);
  }

  const flag = dbsFlag(form.dbs);

  return (
    <section aria-label={existing ? 'Edit volunteer' : 'New volunteer'}>
      <h2>{existing ? `Edit ${existing.firstName} ${existing.lastName}` : 'New volunteer'}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <TextField id="firstName" label="First name" value={form.firstName} required error={errors.firstName}
          onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} />
        <TextField id="lastName" label="Last name" value={form.lastName} required error={errors.lastName}
          onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
        <TextField id="email" label="Email" type="email" value={form.email} required error={errors.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        <TextField id="phone" label="Phone" value={form.phone} required error={errors.phone}
          onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
        <TextField id="address" label="Address" value={form.address}
          onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
        <TextField id="emergencyContactName" label="Emergency contact name" value={form.emergencyContactName}
          required error={errors.emergencyContactName}
          onChange={(v) => setForm((f) => ({ ...f, emergencyContactName: v }))} />
        <TextField id="emergencyContactPhone" label="Emergency contact phone" value={form.emergencyContactPhone}
          required error={errors.emergencyContactPhone}
          onChange={(v) => setForm((f) => ({ ...f, emergencyContactPhone: v }))} />
        <TextField id="skills" label="Skills (comma separated)" value={skillsText} onChange={setSkillsText} />
        <TextField id="availability" label="Availability days (comma separated)" value={availabilityText}
          onChange={setAvailabilityText} />

        {/* FR-1.4 / FR-1.5 — DBS status + run check */}
        <fieldset>
          <legend>DBS (Disclosure &amp; Barring Service)</legend>
          <p>
            Status: <StatusBadge label={dbsFlagLabel(flag)} tone={flag === 'OK' ? 'success' : 'warn'} />
            {form.dbs.expiryDate ? ` · expires ${form.dbs.expiryDate}` : ''}
          </p>
          {existing ? (
            <button type="button" onClick={() => dbsMutation.mutate()} disabled={dbsMutation.isPending}>
              {dbsMutation.isPending ? 'Submitting to DBS…' : 'Run DBS check'}
            </button>
          ) : (
            <p>Save the volunteer first, then run their DBS check.</p>
          )}
          {dbsMutation.isError ? <InlineMessage tone="error">DBS check failed. Try again.</InlineMessage> : null}
        </fieldset>

        {saveMutation.isError ? (
          <InlineMessage tone="error">
            {saveMutation.error instanceof Error ? saveMutation.error.message : 'Could not save.'}
          </InlineMessage>
        ) : null}

        <button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving…' : 'Save volunteer'}
        </button>{' '}
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </section>
  );
}

function stripVolunteer(v: Volunteer): VolunteerInput {
  return {
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email,
    phone: v.phone,
    address: v.address,
    emergencyContactName: v.emergencyContactName,
    emergencyContactPhone: v.emergencyContactPhone,
    skills: v.skills,
    availability: v.availability,
    dbs: v.dbs,
  };
}

/* --------------------------- assignment history -------------------------- */

function AssignmentHistory({ volunteer, onClose }: { volunteer: Volunteer; onClose: () => void }) {
  const historyQuery = useQuery({
    queryKey: ['volunteer-assignments', volunteer.id],
    queryFn: () => listVolunteerAssignments(volunteer.id),
  });

  return (
    <section aria-label="Assignment history">
      <h2>
        Assignment history — {volunteer.firstName} {volunteer.lastName}
      </h2>
      <button type="button" onClick={onClose}>
        Close
      </button>
      <Async query={historyQuery} empty="No assignments yet.">
        {(rows) => (
          <DataTable
            columns={[
              { header: 'Programme', cell: (a) => a.programmeTitle },
              { header: 'Event', cell: (a) => a.eventTitle },
              { header: 'Date', cell: (a) => a.eventDate },
              { header: 'Attendance', cell: (a) => a.attendance },
            ]}
            rows={rows}
            getRowKey={(a) => a.id}
            caption="Assignment history"
          />
        )}
      </Async>
    </section>
  );
}
