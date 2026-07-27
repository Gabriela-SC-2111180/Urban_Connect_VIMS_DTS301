/**
 * Programmes & Events — Area A4 / EP-02 (OWNED). Must-level frames & flows:
 *  - FR-2.1 create programme            - FR-2.2 create event under a programme
 *  - FR-2.3 assign volunteer (surfaces skills + availability + DBS)
 *  - FR-2.5 record attendance
 *
 * Should/Could items (FR-2.4 double-booking, FR-2.6 calendar, FR-2.7 reschedule,
 * FR-2.8 filled/required) are OUT of this pass. Unstyled — design owned elsewhere.
 */
import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignVolunteer,
  createEvent,
  createProgramme,
  listEventAssignments,
  listEvents,
  listProgrammes,
  recordAttendance,
} from '../api/scheduling';
import { listVolunteers } from '../api/volunteers';
import type { Attendance, EventInput, ProgrammeInput } from '../api/domain';
import { dbsFlag, dbsFlagLabel } from '../lib/dbs';
import { isNonEmpty, isValidDateRange } from '../lib/validation';
import { Async, DataTable, InlineMessage, SelectField, StatusBadge, TextField } from '../ui';

const ATTENDANCE_OPTIONS: Attendance[] = ['PENDING', 'ATTENDED', 'NO_SHOW', 'CANCELLED'];

export default function SchedulingPage() {
  const [selectedProgramme, setSelectedProgramme] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');

  return (
    <main>
      <h1>Programmes &amp; Events</h1>
      <ProgrammesSection selected={selectedProgramme} onSelect={setSelectedProgramme} />
      {selectedProgramme ? (
        <EventsSection programmeId={selectedProgramme} selectedEvent={selectedEvent} onSelectEvent={setSelectedEvent} />
      ) : (
        <p>Select a programme to see and add its events.</p>
      )}
      {selectedEvent ? <EventDetail eventId={selectedEvent} /> : null}
    </main>
  );
}

/* ------------------------------- programmes ------------------------------ */

function ProgrammesSection({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const queryClient = useQueryClient();
  const programmesQuery = useQuery({ queryKey: ['programmes'], queryFn: listProgrammes });
  const [form, setForm] = useState<ProgrammeInput>({ title: '', description: '', category: '', startDate: '', endDate: '' });
  const [error, setError] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: createProgramme,
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['programmes'] });
      onSelect(created.id);
      setForm({ title: '', description: '', category: '', startDate: '', endDate: '' });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isNonEmpty(form.title)) return setError('Title is required.');
    if (!isValidDateRange(form.startDate, form.endDate)) return setError('Enter a valid start/end date range.');
    setError(undefined);
    mutation.mutate(form);
  }

  return (
    <section aria-label="Programmes">
      <h2>Programmes</h2>
      <Async query={programmesQuery} empty="No programmes yet — create the first below.">
        {(rows) => (
          <ul>
            {rows.map((p) => (
              <li key={p.id}>
                <button type="button" aria-pressed={selected === p.id} onClick={() => onSelect(p.id)}>
                  {p.title} ({p.category})
                </button>
              </li>
            ))}
          </ul>
        )}
      </Async>

      <form onSubmit={handleSubmit} noValidate>
        <h3>New programme</h3>
        <TextField id="prog-title" label="Title" value={form.title} required
          onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
        <TextField id="prog-category" label="Category" value={form.category}
          onChange={(v) => setForm((f) => ({ ...f, category: v }))} />
        <TextField id="prog-description" label="Description" value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
        <TextField id="prog-start" label="Start date" type="date" value={form.startDate} required
          onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} />
        <TextField id="prog-end" label="End date" type="date" value={form.endDate} required
          onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} />
        {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create programme'}
        </button>
      </form>
    </section>
  );
}

/* --------------------------------- events -------------------------------- */

function EventsSection({
  programmeId,
  selectedEvent,
  onSelectEvent,
}: {
  programmeId: string;
  selectedEvent: string;
  onSelectEvent: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const eventsQuery = useQuery({ queryKey: ['events'], queryFn: listEvents });
  const [form, setForm] = useState<Omit<EventInput, 'programmeId'>>({
    title: '',
    date: '',
    startTime: '',
    location: '',
    requiredVolunteers: 1,
  });
  const [error, setError] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: (input: EventInput) => createEvent(input),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      onSelectEvent(created.id);
      setForm({ title: '', date: '', startTime: '', location: '', requiredVolunteers: 1 });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isNonEmpty(form.title)) return setError('Event title is required.');
    if (!isNonEmpty(form.date)) return setError('Event date is required.');
    setError(undefined);
    mutation.mutate({ ...form, programmeId });
  }

  return (
    <section aria-label="Events">
      <h2>Events</h2>
      <Async query={eventsQuery} empty="No events yet for this programme.">
        {(rows) => {
          const forProgramme = rows.filter((ev) => ev.programmeId === programmeId);
          if (forProgramme.length === 0) return <InlineMessage>No events yet for this programme.</InlineMessage>;
          return (
            <ul>
              {forProgramme.map((ev) => (
                <li key={ev.id}>
                  <button type="button" aria-pressed={selectedEvent === ev.id} onClick={() => onSelectEvent(ev.id)}>
                    {ev.title} — {ev.date} {ev.startTime} ({ev.location})
                  </button>
                </li>
              ))}
            </ul>
          );
        }}
      </Async>

      <form onSubmit={handleSubmit} noValidate>
        <h3>New event</h3>
        <TextField id="evt-title" label="Title" value={form.title} required
          onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
        <TextField id="evt-date" label="Date" type="date" value={form.date} required
          onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
        <TextField id="evt-time" label="Start time" type="time" value={form.startTime}
          onChange={(v) => setForm((f) => ({ ...f, startTime: v }))} />
        <TextField id="evt-location" label="Location" value={form.location}
          onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
        <TextField id="evt-required" label="Volunteers required" type="number" value={String(form.requiredVolunteers)}
          onChange={(v) => setForm((f) => ({ ...f, requiredVolunteers: Math.max(1, Number(v) || 1) }))} />
        {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create event'}
        </button>
      </form>
    </section>
  );
}

/* ------------------------------ event detail ----------------------------- */

function EventDetail({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const assignmentsQuery = useQuery({
    queryKey: ['event-assignments', eventId],
    queryFn: () => listEventAssignments(eventId),
  });
  const volunteersQuery = useQuery({ queryKey: ['volunteers', {}], queryFn: () => listVolunteers({}) });
  const [pickVolunteer, setPickVolunteer] = useState('');
  const [assignError, setAssignError] = useState<string | undefined>();

  const assignMutation = useMutation({
    mutationFn: (volunteerId: string) => assignVolunteer(eventId, volunteerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['event-assignments', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setPickVolunteer('');
      setAssignError(undefined);
    },
    onError: (err) => setAssignError(err instanceof Error ? err.message : 'Could not assign volunteer.'),
  });

  const attendanceMutation = useMutation({
    mutationFn: ({ assignmentId, attendance }: { assignmentId: string; attendance: Attendance }) =>
      recordAttendance(assignmentId, attendance),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['event-assignments', eventId] }),
  });

  return (
    <section aria-label="Event assignments">
      <h2>Assign volunteers</h2>

      {/* FR-2.3 — assign a volunteer; the picker surfaces skills, availability and DBS. */}
      <Async query={volunteersQuery} empty="No active volunteers to assign.">
        {(volunteers) => (
          <div>
            <SelectField
              id="assign-volunteer"
              label="Volunteer (skills · availability · DBS shown)"
              value={pickVolunteer}
              onChange={setPickVolunteer}
              placeholder="Choose a volunteer"
              options={volunteers.map((v) => ({
                value: v.id,
                label: `${v.firstName} ${v.lastName} — ${v.skills.join('/') || 'no skills'} · ${
                  v.availability.join('/') || 'n/a'
                } · ${dbsFlagLabel(dbsFlag(v.dbs))}`,
              }))}
            />
            <button type="button" disabled={!pickVolunteer || assignMutation.isPending} onClick={() => assignMutation.mutate(pickVolunteer)}>
              {assignMutation.isPending ? 'Assigning…' : 'Assign to event'}
            </button>
            {assignError ? <InlineMessage tone="error">{assignError}</InlineMessage> : null}
          </div>
        )}
      </Async>

      <h3>Assigned volunteers</h3>
      <Async query={assignmentsQuery} empty="No volunteers assigned yet.">
        {(rows) => (
          <DataTable
            columns={[
              { header: 'Volunteer', cell: (a) => a.volunteerName },
              {
                header: 'Attendance',
                cell: (a) => (
                  <select
                    aria-label={`Attendance for ${a.volunteerName}`}
                    value={a.attendance}
                    onChange={(e) =>
                      attendanceMutation.mutate({ assignmentId: a.id, attendance: e.target.value as Attendance })
                    }
                  >
                    {ATTENDANCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ),
              },
              { header: 'Status', cell: (a) => <StatusBadge label={a.attendance} /> },
            ]}
            rows={rows}
            getRowKey={(a) => a.id}
            caption="Assigned volunteers"
          />
        )}
      </Async>
    </section>
  );
}
