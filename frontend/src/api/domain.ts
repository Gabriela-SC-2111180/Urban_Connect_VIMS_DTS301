/**
 * Domain TypeScript types for the OWNED frontend epics (EP-01/02/05) plus the
 * admin-user shape for FR-4.6.
 *
 * These are the shapes our pages and the scoped mock layer (src/mocks/) agree
 * on. For the OWNED epics we get to define them; where they overlap a
 * cross-pathway contract (auth roles in src/api/types.ts) we reuse that type.
 *
 * NOTE: these describe demo-grade data. Field choices follow the functional
 * requirements (FR-1.x volunteers, FR-2.x scheduling, FR-5.x notifications),
 * not a finalised backend schema (DM-1). When the backend lands its schema the
 * resource modules adapt; pages keep coding against these.
 */
import type { Role } from './types';

/* ------------------------------------------------------------------ */
/* EP-01 — Volunteers (FR-1.x) — OWNED                                 */
/* ------------------------------------------------------------------ */

/**
 * DBS = Disclosure and Barring Service: the UK background-check a volunteer
 * needs for many roles (FR-1.4 capture, FR-1.5 expiry flagging). The actual
 * check is performed by an EXTERNAL system we don't own — see src/mocks/dbs.ts
 * for the scoped mock that mimics it during development.
 */
export type DbsStatus = 'NONE' | 'PENDING' | 'CLEAR' | 'EXPIRED';

export interface DbsRecord {
  status: DbsStatus;
  /** Certificate number returned by the DBS service once CLEAR. */
  certificateNumber?: string;
  /** ISO date (yyyy-mm-dd) the certificate was issued. */
  issuedDate?: string;
  /** ISO date the certificate expires; drives FR-1.5 flagging. */
  expiryDate?: string;
}

export interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  /** FR-1.2 — predefined + custom skills, flattened to free strings here. */
  skills: string[];
  /** FR-1.3 — demo-grade availability as day labels (e.g. 'Mon', 'Sat'). */
  availability: string[];
  /** FR-1.4 / FR-1.5 — DBS status + expiry. */
  dbs: DbsRecord;
  /** FR-1.8 — archived volunteers are retained but hidden from active lists. */
  archived: boolean;
  createdAt: string;
}

/** Payload for create/edit (FR-1.1–1.4). Id/createdAt/archived are server-set. */
export type VolunteerInput = Omit<Volunteer, 'id' | 'createdAt' | 'archived'>;

/** FR-1.7 — list/search/filter query. */
export interface VolunteerQuery {
  search?: string;
  skill?: string;
  dbsStatus?: DbsStatus;
  includeArchived?: boolean;
}

/* ------------------------------------------------------------------ */
/* EP-02 — Programmes, Events, Assignments (FR-2.x) — OWNED            */
/* ------------------------------------------------------------------ */

export interface Programme {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
}

export type ProgrammeInput = Omit<Programme, 'id'>;

export interface EventItem {
  id: string;
  programmeId: string;
  title: string;
  date: string;
  startTime: string;
  location: string;
  /** FR-2.2 / FR-2.8 — how many volunteers the event needs. */
  requiredVolunteers: number;
}

export type EventInput = Omit<EventItem, 'id'>;

export type Attendance = 'PENDING' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED';

export interface Assignment {
  id: string;
  eventId: string;
  volunteerId: string;
  /** FR-2.5 — attendance outcome recorded after the event. */
  attendance: Attendance;
  createdAt: string;
}

/** Assignment joined with the names the UI shows (FR-1.6 history, FR-2.3). */
export interface AssignmentView extends Assignment {
  volunteerName: string;
  eventTitle: string;
  eventDate: string;
  programmeTitle: string;
}

/* ------------------------------------------------------------------ */
/* EP-05 — Notifications (FR-5.x) — OWNED (UI surfacing)               */
/* ------------------------------------------------------------------ */

export type NotificationType = 'ASSIGNMENT' | 'REMINDER' | 'CHANGE';
export type NotificationStatus = 'SENT' | 'PENDING' | 'FAILED';

export interface NotificationItem {
  id: string;
  recipientName: string;
  type: NotificationType;
  message: string;
  /** ISO timestamp. */
  timestamp: string;
  status: NotificationStatus;
}

/* ------------------------------------------------------------------ */
/* FR-4.6 — Admin user management (EP-04 surface, mocked here)          */
/* ------------------------------------------------------------------ */

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export type ManagedUserInput = Omit<ManagedUser, 'id' | 'active'>;
