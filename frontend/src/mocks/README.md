# `src/mocks/` — scoped mock service layer

**Author:** Eva (Frontend Delivery Lead) · **Status:** dev-only scaffolding

## What this is

A small in-memory layer that **mimics the backend and the external systems VIMS
depends on**, so every frontend flow (Areas A1, A3–A6) runs end-to-end *before*
those parts exist. It is the frontend twin of the backend's `501 NOT_IMPLEMENTED`
stubs: real shapes, real flows, fake data.

It mimics:

- **The VIMS REST backend** — volunteers, scheduling, notifications (EP-01/02/05,
  which we own) — `store.ts` + `server.ts`.
- **EP-04 auth/RBAC** (owned by Cybersecurity) — login + "who am I?" + admin user
  CRUD, so the login → role-gated app flow works. `server.ts` (auth section).
- **EP-03 impact dashboard** (owned by Data Analyst) — chart numbers. `server.ts`.
- **The DBS check service** (external Disclosure & Barring Service, FR-1.4/1.5) —
  `dbs.ts`. This is a genuinely third-party system; the mock lets the volunteer
  DBS flow be demonstrated without a real integration.

## How it stays scoped (important)

- **One toggle.** Everything routes through `env.useMocks` (see `src/config/env.ts`).
  Mocks are **ON in dev, OFF in production builds**. Force with
  `VITE_USE_MOCKS=true|false`.
- **One seam.** Only the API resource modules (`src/api/{volunteers,scheduling,
  notifications,dashboard,auth}.ts`) import from here. Pages never import mocks
  directly — they call the resource modules, which branch on `env.useMocks`.
  Deleting this folder + the mock branches is the entire removal job.
- **No real logic leaks in.** Business rules that belong to the backend (real
  auth, real DBS verification, real persistence) are deliberately faked and
  labelled. This is not where features get implemented.

## Swapping in the real API

When a real endpoint lands, set its resource module's `useMocks` branch aside
(or flip `VITE_USE_MOCKS=false`) and point the `real*` path at the backend. The
mock data shapes are aligned to `docs/cross-pathway-api-contracts.md`; reconcile
any field-name differences there first.
