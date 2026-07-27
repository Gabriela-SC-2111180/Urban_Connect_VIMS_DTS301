/**
 * Mock implementations of the API resource functions (see ./README.md).
 *
 * Each function returns the SAME type its real counterpart in src/api/* will,
 * after a small artificial latency, reading/writing the in-memory `db`. Errors
 * are thrown as the real `ApiError` so pages handle mock and real failures
 * identically.
 *
 * This file mimics: the VIMS backend (EP-01/02/05), EP-04 auth + admin users,
 * and EP-03 dashboard. The DBS external system is mocked separately in ./dbs.ts.
 */
import { ApiError } from '../api/client';
import type {
  Assignment,
  AssignmentView,
  Attendance,
  EventInput,
  EventItem,
  ManagedUser,
  ManagedUserInput,
  NotificationItem,
  Programme,
  ProgrammeInput,
  Volunteer,
  VolunteerInput,
  VolunteerQuery,
} from '../api/domain';
import type { AuthUser, DashboardData, LoginResponse } from '../api/types';
import { runDbsCheck } from './dbs';
import { clone, db, delay, nextId, nowIso } from './store';

function notFound(what: string): never {
  throw new ApiError(404, 'NOT_FOUND', `${what} not found.`);
}

/* ----------------------------- Volunteers ------------------------------ */

export function listVolunteers(query: VolunteerQuery = {}): Promise<Volunteer[]> {
  const search = query.search?.trim().toLowerCase();
  const result = db.volunteers.filter((v) => {
    if (!query.includeArchived && v.archived) return false;
    if (query.dbsStatus && v.dbs.status !== query.dbsStatus) return false;
    if (query.skill && !v.skills.some((s) => s.toLowerCase() === query.skill!.toLowerCase())) return false;
    if (search) {
      const haystack = `${v.firstName} ${v.lastName} ${v.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
  return delay(clone(result));
}

export function getVolunteer(id: string): Promise<Volunteer> {
  const found = db.volunteers.find((v) => v.id === id);
  if (!found) notFound('Volunteer');
  return delay(clone(found));
}

export function createVolunteer(input: VolunteerInput): Promise<Volunteer> {
  const created: Volunteer = { ...clone(input), id: nextId('vol'), archived: false, createdAt: nowIso() };
  db.volunteers.unshift(created);
  return delay(clone(created));
}

export function updateVolunteer(id: string, input: VolunteerInput): Promise<Volunteer> {
  const existing = db.volunteers.find((v) => v.id === id);
  if (!existing) notFound('Volunteer');
  Object.assign(existing, clone(input));
  return delay(clone(existing));
}

/** Wires the scoped DBS mock: submit the volunteer and store the result (FR-1.4). */
export async function submitDbsCheck(id: string): Promise<Volunteer> {
  const existing = db.volunteers.find((v) => v.id === id);
  if (!existing) notFound('Volunteer');
  existing.dbs = await runDbsCheck();
  return clone(existing);
}

/** FR-1.6 — a volunteer's assignment history, joined for display. */
export function listVolunteerAssignments(id: string): Promise<AssignmentView[]> {
  const views = db.assignments.filter((a) => a.volunteerId === id).map(toAssignmentView);
  return delay(views);
}

/* --------------------------- Scheduling -------------------------------- */

export function listProgrammes(): Promise<Programme[]> {
  return delay(clone(db.programmes));
}

export function createProgramme(input: ProgrammeInput): Promise<Programme> {
  const created: Programme = { ...clone(input), id: nextId('prog') };
  db.programmes.unshift(created);
  return delay(clone(created));
}

export function listEvents(): Promise<EventItem[]> {
  return delay(clone(db.events));
}

export function createEvent(input: EventInput): Promise<EventItem> {
  if (!db.programmes.some((p) => p.id === input.programmeId)) notFound('Programme');
  const created: EventItem = { ...clone(input), id: nextId('evt') };
  db.events.unshift(created);
  return delay(clone(created));
}

export function listEventAssignments(eventId: string): Promise<AssignmentView[]> {
  const views = db.assignments.filter((a) => a.eventId === eventId).map(toAssignmentView);
  return delay(views);
}

/** FR-2.3 assignment + FR-5.1: assigning a volunteer also queues a confirmation. */
export async function assignVolunteer(eventId: string, volunteerId: string): Promise<Assignment> {
  const event = db.events.find((e) => e.id === eventId);
  if (!event) notFound('Event');
  const volunteer = db.volunteers.find((v) => v.id === volunteerId);
  if (!volunteer) notFound('Volunteer');

  if (db.assignments.some((a) => a.eventId === eventId && a.volunteerId === volunteerId)) {
    throw new ApiError(409, 'ALREADY_ASSIGNED', 'That volunteer is already assigned to this event.');
  }

  const created: Assignment = {
    id: nextId('asg'),
    eventId,
    volunteerId,
    attendance: 'PENDING',
    createdAt: nowIso(),
  };
  db.assignments.push(created);

  // FR-5.1 — surface a confirmation notification as a side effect of assignment.
  db.notifications.unshift({
    id: nextId('ntf'),
    recipientName: `${volunteer.firstName} ${volunteer.lastName}`,
    type: 'ASSIGNMENT',
    message: `You have been assigned to “${event.title}” on ${event.date}.`,
    timestamp: nowIso(),
    status: 'SENT',
  });

  return delay(clone(created));
}

/** FR-2.5 — record attendance outcome for an assignment. */
export function recordAttendance(assignmentId: string, attendance: Attendance): Promise<Assignment> {
  const existing = db.assignments.find((a) => a.id === assignmentId);
  if (!existing) notFound('Assignment');
  existing.attendance = attendance;
  return delay(clone(existing));
}

function toAssignmentView(a: Assignment): AssignmentView {
  const volunteer = db.volunteers.find((v) => v.id === a.volunteerId);
  const event = db.events.find((e) => e.id === a.eventId);
  const programme = event ? db.programmes.find((p) => p.id === event.programmeId) : undefined;
  return {
    ...clone(a),
    volunteerName: volunteer ? `${volunteer.firstName} ${volunteer.lastName}` : 'Unknown volunteer',
    eventTitle: event?.title ?? 'Unknown event',
    eventDate: event?.date ?? '',
    programmeTitle: programme?.title ?? 'Unknown programme',
  };
}

/* --------------------------- Notifications ----------------------------- */

export function listNotifications(): Promise<NotificationItem[]> {
  const sorted = [...db.notifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return delay(clone(sorted));
}

/* ----------------------------- Dashboard ------------------------------- */

/** EP-03 mock — chart numbers derived from current store data. */
export function getDashboard(): Promise<DashboardData> {
  const activeVolunteers = db.volunteers.filter((v) => !v.archived);
  const hoursByProgramme = db.programmes.map((p) => {
    const eventIds = db.events.filter((e) => e.programmeId === p.id).map((e) => e.id);
    const attended = db.assignments.filter((a) => eventIds.includes(a.eventId) && a.attendance === 'ATTENDED');
    return { label: p.title, value: attended.length * 3 }; // ~3 hours per attended slot (demo)
  });
  const attendanceTrend = [
    { date: '2026-03-01', value: 8 },
    { date: '2026-04-01', value: 12 },
    { date: '2026-05-01', value: 17 },
    { date: '2026-06-01', value: 21 },
  ];
  return delay({ totalVolunteers: activeVolunteers.length, hoursByProgramme, attendanceTrend });
}

/* -------------------------- Auth + admin users ------------------------- */

let currentUser: AuthUser | null = null;

function toAuthUser(u: ManagedUser): AuthUser {
  return { id: u.id, name: u.name, email: u.email, roles: [u.role] };
}

/** EP-04 mock login. Password is ignored (demo); any seeded, active user logs in. */
export function login(email: string): Promise<LoginResponse> {
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !user.active) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'No active account matches those details.');
  }
  currentUser = toAuthUser(user);
  return delay({ user: clone(currentUser) });
}

/** "Who am I?" — resolves the session set by login(); null when logged out. */
export function me(): Promise<AuthUser | null> {
  return delay(currentUser ? clone(currentUser) : null);
}

export function logout(): Promise<void> {
  currentUser = null;
  return delay(undefined);
}

export function listUsers(): Promise<ManagedUser[]> {
  return delay(clone(db.users));
}

export function createUser(input: ManagedUserInput): Promise<ManagedUser> {
  if (db.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new ApiError(409, 'EMAIL_TAKEN', 'A user with that email already exists.');
  }
  const created: ManagedUser = { ...clone(input), id: nextId('usr'), active: true };
  db.users.push(created);
  return delay(clone(created));
}

export function updateUser(id: string, input: Partial<ManagedUserInput> & { active?: boolean }): Promise<ManagedUser> {
  const existing = db.users.find((u) => u.id === id);
  if (!existing) notFound('User');
  Object.assign(existing, clone(input));
  return delay(clone(existing));
}
