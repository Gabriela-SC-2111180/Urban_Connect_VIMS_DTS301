/**
 * In-memory seeded store for the scoped mock layer (see ./README.md).
 *
 * Holds demo data for the OWNED epics plus the mocked EP-03/EP-04 surfaces.
 * State lives for the lifetime of the page (resets on reload) — enough to make
 * create/edit/assign/attend flows feel real in a demo. NOT persistence.
 */
import type {
  Assignment,
  EventItem,
  ManagedUser,
  NotificationItem,
  Programme,
  Volunteer,
} from '../api/domain';

/* ----------------------------- id + timing ----------------------------- */

let seq = 2000;
/** Monotonic, prefixed id generator (deterministic-ish for a demo session). */
export function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}_${seq}`;
}

/** Resolve `value` after a small latency so loading states are visible (NFR-S4 UX). */
export function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Deep copy so callers can't mutate the store by reference. Demo data is JSON-safe. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/* ------------------------------- seed data ------------------------------ */

const volunteers: Volunteer[] = [
  {
    id: 'vol_1',
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'amara.okafor@example.org',
    phone: '07700 900111',
    address: '12 Bridge St, Leeds, LS1 4DA',
    emergencyContactName: 'Ngozi Okafor',
    emergencyContactPhone: '07700 900222',
    skills: ['First Aid', 'Driving'],
    availability: ['Mon', 'Wed', 'Sat'],
    dbs: { status: 'CLEAR', certificateNumber: 'DBS-001234', issuedDate: '2024-02-01', expiryDate: '2027-02-01' },
    archived: false,
    createdAt: '2025-11-02T09:00:00.000Z',
  },
  {
    id: 'vol_2',
    firstName: 'Tom',
    lastName: 'Whitfield',
    email: 'tom.whitfield@example.org',
    phone: '07700 900333',
    address: '4 Canal View, Leeds, LS9 8AA',
    emergencyContactName: 'Sarah Whitfield',
    emergencyContactPhone: '07700 900444',
    skills: ['Mentoring', 'IT Support'],
    availability: ['Tue', 'Thu'],
    // Expiring soon relative to 2026-06-16 — exercises the FR-1.5 flag path.
    dbs: { status: 'CLEAR', certificateNumber: 'DBS-004567', issuedDate: '2023-07-10', expiryDate: '2026-07-10' },
    archived: false,
    createdAt: '2025-12-01T10:30:00.000Z',
  },
  {
    id: 'vol_3',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.org',
    phone: '07700 900555',
    address: '88 Hill Top, Bradford, BD1 2QP',
    emergencyContactName: 'Raj Sharma',
    emergencyContactPhone: '07700 900666',
    skills: ['Event Planning', 'First Aid'],
    availability: ['Sat', 'Sun'],
    dbs: { status: 'PENDING' },
    archived: false,
    createdAt: '2026-01-15T14:00:00.000Z',
  },
  {
    id: 'vol_4',
    firstName: 'Daniel',
    lastName: 'Owusu',
    email: 'daniel.owusu@example.org',
    phone: '07700 900777',
    address: '23 Park Lane, Leeds, LS3 1BB',
    emergencyContactName: 'Efua Owusu',
    emergencyContactPhone: '07700 900888',
    skills: ['Driving'],
    availability: ['Mon', 'Fri'],
    // Already expired — shows the EXPIRED state directly.
    dbs: { status: 'EXPIRED', certificateNumber: 'DBS-007788', issuedDate: '2022-03-01', expiryDate: '2025-03-01' },
    archived: false,
    createdAt: '2025-10-20T08:15:00.000Z',
  },
  {
    id: 'vol_5',
    firstName: 'Grace',
    lastName: 'Bennett',
    email: 'grace.bennett@example.org',
    phone: '07700 900999',
    address: '5 Meadow Rd, Wakefield, WF1 3CC',
    emergencyContactName: 'Paul Bennett',
    emergencyContactPhone: '07700 900100',
    skills: ['Fundraising', 'Mentoring'],
    availability: ['Wed', 'Thu', 'Fri'],
    dbs: { status: 'NONE' },
    archived: true,
    createdAt: '2025-09-05T11:45:00.000Z',
  },
];

const programmes: Programme[] = [
  {
    id: 'prog_1',
    title: 'Community Food Bank',
    description: 'Weekly food distribution across Leeds neighbourhoods.',
    category: 'Welfare',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: 'prog_2',
    title: 'Youth Mentoring',
    description: 'After-school mentoring for 11–16 year olds.',
    category: 'Education',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
  },
];

const events: EventItem[] = [
  {
    id: 'evt_1',
    programmeId: 'prog_1',
    title: 'Saturday Food Drive',
    date: '2026-06-20',
    startTime: '09:00',
    location: 'Leeds Community Hall',
    requiredVolunteers: 4,
  },
  {
    id: 'evt_2',
    programmeId: 'prog_1',
    title: 'Midweek Distribution',
    date: '2026-06-24',
    startTime: '17:30',
    location: 'Bradford Centre',
    requiredVolunteers: 3,
  },
  {
    id: 'evt_3',
    programmeId: 'prog_2',
    title: 'Mentoring Session — Cohort A',
    date: '2026-06-23',
    startTime: '16:00',
    location: 'St Mary’s School',
    requiredVolunteers: 2,
  },
];

const assignments: Assignment[] = [
  { id: 'asg_1', eventId: 'evt_1', volunteerId: 'vol_1', attendance: 'PENDING', createdAt: '2026-06-10T09:00:00.000Z' },
  { id: 'asg_2', eventId: 'evt_1', volunteerId: 'vol_2', attendance: 'PENDING', createdAt: '2026-06-10T09:05:00.000Z' },
  { id: 'asg_3', eventId: 'evt_3', volunteerId: 'vol_1', attendance: 'ATTENDED', createdAt: '2026-05-12T16:00:00.000Z' },
];

const notifications: NotificationItem[] = [
  {
    id: 'ntf_1',
    recipientName: 'Amara Okafor',
    type: 'ASSIGNMENT',
    message: 'You have been assigned to “Saturday Food Drive” on 2026-06-20.',
    timestamp: '2026-06-10T09:00:30.000Z',
    status: 'SENT',
  },
  {
    id: 'ntf_2',
    recipientName: 'Tom Whitfield',
    type: 'REMINDER',
    message: 'Reminder: “Saturday Food Drive” is in 3 days.',
    timestamp: '2026-06-17T08:00:00.000Z',
    status: 'PENDING',
  },
];

const users: ManagedUser[] = [
  { id: 'usr_1', name: 'Eva Cameron', email: 'eva.cameron@urbanconnect.org', role: 'ADMIN', active: true },
  { id: 'usr_2', name: 'Mark Rivers', email: 'mark.rivers@urbanconnect.org', role: 'COORDINATOR', active: true },
  { id: 'usr_3', name: 'Lena Frost', email: 'lena.frost@urbanconnect.org', role: 'VIEWER', active: true },
];

/**
 * The mutable store. Exported as a single object so mock resource functions in
 * server.ts share one source of truth for the session.
 */
export const db = {
  volunteers,
  programmes,
  events,
  assignments,
  notifications,
  users,
};
