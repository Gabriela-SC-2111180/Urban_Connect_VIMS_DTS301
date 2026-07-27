# services/

Business logic + data access. Services own the domain rules and talk to the
database (via prepared statements from `../db/`). Controllers call services;
services never touch `req`/`res`.

Expected files (created by their cards — currently empty):

- `auth.service.ts` — EP-04 / SEC-1..6 (hashing, sessions, RBAC, user mgmt)
- `volunteers.service.ts` — EP-01 / VOL-1..8
- `scheduling.service.ts` — EP-02 / SCH-1..7
- `impact.service.ts` — EP-03 / IMP-1..6 (aggregation in SQL, not app loops — see IMP-2)
- `notifications.service.ts` — EP-05 / NOT-1..6
- `audit.service.ts` — XC-3 (append-only audit log; Cybersecurity-led)

Keep all SQL parameterised (XC-2 / NFR-6). Never build SQL by string concat.
