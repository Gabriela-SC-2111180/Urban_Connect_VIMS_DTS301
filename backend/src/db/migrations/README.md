# db/migrations/

Database migrations — the repeatable, version-controlled way to build and
update the schema from scripts (**DM-2**).

**Empty on purpose.** There is no schema yet: the entity/data model is **DM-1**,
owned by the whole team, and must be signed off by every pathway lead before
tables are created (see PROJECT-SETUP-STATUS.md → Questions for the design team).

When DM-1 is agreed:

1. Add the baseline migration here (tables, keys, constraints, enums).
2. Add the indexing baseline (DM-3): volunteer name, DBS status/expiry, event
   dates, and FK join columns.
3. Add the seed data (DM-2): the three roles (ADMIN / COORDINATOR / VIEWER —
   names pending EP-04 sign-off) and the predefined skill list.
4. Wire a migration runner and a `migrate` script in package.json.

Design principles already agreed (Backend Kanban §0): soft-delete not
hard-delete (FR-1.8/FR-2.7); the assignment row carries attendance so it
doubles as assignment history (FR-1.6).

A migration *runner library* was deliberately not chosen yet — better-sqlite3
has no built-in migrations, so DM-2 picks one (e.g. a tiny custom runner, or a
library). Recorded as an open decision in the status doc.
