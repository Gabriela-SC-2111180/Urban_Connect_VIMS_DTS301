/**
 * Volunteers resource module — EP-01 (FR-1.x). The ONLY place volunteer
 * endpoints are named. Pages call these; they never touch the client or mocks.
 *
 * Each function branches on `env.useMocks`: serve from the scoped mock layer in
 * dev, or call the real backend route (mirrors backend/src/routes/volunteers.routes.ts).
 * Real paths are wired but unexercised until the VOL-* cards ship.
 */
import { env } from '../config/env';
import { api } from './client';
import type { Volunteer, VolunteerInput, VolunteerQuery, AssignmentView } from './domain';
import * as mock from '../mocks/server';

const BASE = 'api/v1/volunteers';

export function listVolunteers(query: VolunteerQuery = {}): Promise<Volunteer[]> {
  if (env.useMocks) return mock.listVolunteers(query);
  return api.get<Volunteer[]>(BASE, {
    params: {
      search: query.search,
      skill: query.skill,
      dbsStatus: query.dbsStatus,
      includeArchived: query.includeArchived,
    },
  });
}

export function getVolunteer(id: string): Promise<Volunteer> {
  if (env.useMocks) return mock.getVolunteer(id);
  return api.get<Volunteer>(`${BASE}/${id}`);
}

export function createVolunteer(input: VolunteerInput): Promise<Volunteer> {
  if (env.useMocks) return mock.createVolunteer(input);
  return api.post<Volunteer>(BASE, input);
}

export function updateVolunteer(id: string, input: VolunteerInput): Promise<Volunteer> {
  if (env.useMocks) return mock.updateVolunteer(id, input);
  return api.patch<Volunteer>(`${BASE}/${id}`, input);
}

/** FR-1.4 — submit the volunteer to the (mocked) DBS service and store the result. */
export function submitDbsCheck(id: string): Promise<Volunteer> {
  if (env.useMocks) return mock.submitDbsCheck(id);
  return api.put<Volunteer>(`${BASE}/${id}/dbs`, {});
}

/** FR-1.6 — assignment history. */
export function listVolunteerAssignments(id: string): Promise<AssignmentView[]> {
  if (env.useMocks) return mock.listVolunteerAssignments(id);
  return api.get<AssignmentView[]>(`${BASE}/${id}/assignments`);
}
