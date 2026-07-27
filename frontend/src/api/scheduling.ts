/**
 * Scheduling resource module — EP-02 (FR-2.x). Programmes, events, assignments,
 * attendance. Branches on env.useMocks; real paths mirror backend /scheduling.
 */
import { env } from '../config/env';
import { api } from './client';
import type {
  Assignment,
  AssignmentView,
  Attendance,
  EventInput,
  EventItem,
  Programme,
  ProgrammeInput,
} from './domain';
import * as mock from '../mocks/server';

const BASE = 'api/v1/scheduling';

export function listProgrammes(): Promise<Programme[]> {
  if (env.useMocks) return mock.listProgrammes();
  return api.get<Programme[]>(`${BASE}/programmes`);
}

export function createProgramme(input: ProgrammeInput): Promise<Programme> {
  if (env.useMocks) return mock.createProgramme(input);
  return api.post<Programme>(`${BASE}/programmes`, input);
}

export function listEvents(): Promise<EventItem[]> {
  if (env.useMocks) return mock.listEvents();
  return api.get<EventItem[]>(`${BASE}/events`);
}

export function createEvent(input: EventInput): Promise<EventItem> {
  if (env.useMocks) return mock.createEvent(input);
  return api.post<EventItem>(`${BASE}/events`, input);
}

export function listEventAssignments(eventId: string): Promise<AssignmentView[]> {
  if (env.useMocks) return mock.listEventAssignments(eventId);
  return api.get<AssignmentView[]>(`${BASE}/events/${eventId}/assignments`);
}

/** FR-2.3 — assign a volunteer to an event (also triggers FR-5.1 confirmation). */
export function assignVolunteer(eventId: string, volunteerId: string): Promise<Assignment> {
  if (env.useMocks) return mock.assignVolunteer(eventId, volunteerId);
  return api.post<Assignment>(`${BASE}/events/${eventId}/assignments`, { volunteerId });
}

/** FR-2.5 — record attendance for an assignment. */
export function recordAttendance(assignmentId: string, attendance: Attendance): Promise<Assignment> {
  if (env.useMocks) return mock.recordAttendance(assignmentId, attendance);
  return api.patch<Assignment>(`${BASE}/assignments/${assignmentId}`, { attendance });
}
