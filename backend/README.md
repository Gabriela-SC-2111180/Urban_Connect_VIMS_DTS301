# VIMS Backend

Node + Express + TypeScript REST API for VIMS. **Scaffold only** — domain
features are owned by the kanban cards (see `../Backend Kanban Breakdown.md`).
For stack rationale and run instructions see the [root README](../README.md).

## Folder structure

```
backend/
├── src/
│   ├── server.ts              # Entry point — starts the HTTP listener
│   ├── app.ts                 # Express bootstrap + middleware wiring (XC-1)
│   ├── config/
│   │   └── env.ts             # Validated env config (.env.example documents keys)
│   ├── routes/                # One router per domain; all WIRED, all return 501
│   │   ├── index.ts           # Mounts domains under /api/v1
│   │   ├── auth.routes.ts         # EP-04 / SEC-*
│   │   ├── volunteers.routes.ts   # EP-01 / VOL-*
│   │   ├── scheduling.routes.ts   # EP-02 / SCH-*
│   │   ├── impact.routes.ts       # EP-03 / IMP-*
│   │   └── notifications.routes.ts# EP-05 / NOT-*
│   ├── controllers/           # (placeholder) HTTP handlers — see README
│   ├── services/              # (placeholder) business logic + data access — see README
│   ├── validation/            # (placeholder) shared input validation (XC-2) — see README
│   ├── middleware/
│   │   ├── errorHandler.ts    # Standard JSON error shape + 404 (XC-1)
│   │   └── README.md          # auth/RBAC/validate/audit middleware to come
│   ├── errors/
│   │   └── AppError.ts        # Typed app error -> standard error shape
│   ├── db/
│   │   ├── index.ts           # Shared SQLite connection (no schema — DM-1)
│   │   └── migrations/        # (placeholder) DM-2 — empty until DM-1 sign-off
│   └── __tests__/
│       └── health.test.ts     # Scaffold smoke tests (health/404/501)
├── data/                      # SQLite file lives here at runtime (git-ignored)
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
└── .env.example
```

## How the layers fit together

```
HTTP request
  -> routes/        (URL -> handler; currently a 501 stub)
  -> controllers/   (parse validated input, call service, shape response)
  -> services/      (domain rules + parameterised DB access)
  -> db/            (shared SQLite connection)
errors anywhere -> middleware/errorHandler.ts -> standard JSON error shape
```

## What's intentionally missing

The data model (DM-1), migrations (DM-2/DM-3), validation library (XC-2), auth
(EP-04), and all domain logic are **not** built — that's the team's work. See
`../PROJECT-SETUP-STATUS.md`.
