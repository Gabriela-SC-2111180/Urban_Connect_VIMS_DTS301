# VIMS Frontend — Setup Notes (framework scaffold)

**Author:** Dylan (Fullstack Engineer) · **Date:** 2026-06-16
**Scope of this pass:** stand up the frontend **framework/skeleton only** — no visual
design, no feature UI. Per Eva's instruction ("throw up the framework"). Visual
design is owned by the design team and is deliberately out of scope here.

> The repo root, git, root README/.gitignore, and `backend/` are owned by
> Dylan (delivery lead). Everything below lives entirely under `frontend/`.

---

## Stack (as decided by the team — not re-litigated)

- **React 18 + TypeScript**, built with **Vite 5** (SPA — NFR-S1).
- **React Router v6** (`react-router-dom`) — client-side routing.
- **TanStack Query v5** (React Query) — data fetching/caching (A8-2).
- **Vitest + Testing Library** — testing (one smoke test only at this stage).
- **ESLint 8** with classic `.eslintrc.cjs` — intentionally matches the backend
  scaffold's tooling (ESLint 8 + `.eslintrc.json`) so the team has one mental model.
- TS strictness mirrors the backend (`strict`, `noUncheckedIndexedAccess`).

## Scripts (`frontend/package.json`)

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on **5173** (matches backend `CORS_ORIGIN` default) |
| `npm run build` | `tsc -b && vite build` (type-checked production build) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the project |
| `npm run typecheck` | `tsc --noEmit` (no build output) |
| `npm run test` | Vitest run (the single smoke test) |

## Verification result (run on 2026-06-16, Node v22.14.0, npm 10.9.2)

All commands run from `frontend/`:

- `npm install` — **OK** (311 packages; only expected deprecation warnings, same
  as backend: eslint@8, glob@7. `npm audit` reports 5 vulns from the dev
  toolchain — see "Known notes" below).
- `npm run typecheck` — **OK** (no errors).
- `npm run build` — **OK** (built in ~6s; `dist/` produced, ~240 kB JS / 77 kB gzip).
- `npm run lint` — **OK** (clean, no warnings).
- `npm run test` — **OK** (1 test passed).

---

## What was scaffolded (with paths)

```
frontend/
  index.html                      App entry (no favicon/fonts — design owns those)
  package.json                    Scripts + deps
  tsconfig*.json                  Project-references TS config (app + node)
  vite.config.ts                  Dev server on 5173; no proxy (client reads base URL)
  vitest.config.ts                jsdom env + setup file
  .eslintrc.cjs                   ESLint 8 classic config
  .gitignore                      Frontend-only ignores
  .env.example                    VITE_API_BASE_URL (default http://localhost:4000)
  src/
    main.tsx                      React root (no global stylesheet — by design)
    vite-env.d.ts                 Typed import.meta.env
    config/env.ts                 Typed env access (API base URL, isDev)
    api/
      client.ts                   THE typed API client (NFR-S3 / A8-1)
      types.ts                    Cross-pathway type contracts (placeholders)
    auth/
      AuthContext.tsx             PLACEHOLDER auth provider (A1-2 skeleton)
      guards.tsx                  RequireAuth / RequireRole guards (A1-3 skeleton)
    app/
      App.tsx                     Providers (ErrorBoundary + Query + Auth + Router)
      AppShell.tsx                Header + nav + outlet (A2-2, unstyled)
      router.tsx                  Public/protected route split (A2-1)
      ErrorBoundary.tsx           Global error boundary skeleton (A8-3)
    pages/                        One near-empty placeholder per frontend area:
      LoginPage.tsx               A1 / EP-04 UI
      VolunteersPage.tsx          A3 / EP-01 (owned)
      SchedulingPage.tsx          A4 / EP-02 (owned)
      NotificationsPage.tsx       A5 / EP-05 (owned)
      DashboardPage.tsx           A6 / EP-03 (integrate)
      AdminUsersPage.tsx          A1 / FR-4.6 (admin, role-gated)
      ForbiddenPage.tsx           403 (A2-4)
      NotFoundPage.tsx            404 (A2-4)
    test/
      setup.ts                    jest-dom matchers
      smoke.test.tsx              Single smoke test
```

Each page is an unstyled placeholder with a heading and a `{/* TODO */}` note
naming the area, the kanban cards, and the FR IDs it will eventually hold.

### Routing skeleton
- Public: `/login`, `/403`.
- Protected (`RequireAuth` → `AppShell`): `/volunteers`, `/scheduling`,
  `/notifications`, `/dashboard`; `/admin/users` additionally wrapped in
  `RequireRole allowed={['ADMIN']}` to demonstrate the role-guard seam.
- `/` redirects to `/volunteers` (placeholder landing).
- `*` → 404.

### Typed API client (`src/api/client.ts`, NFR-S3 / A8-1)
- Base URL from env; typed `get/post/put/patch/del` JSON helpers.
- **Single error normalisation point**: maps responses into one `ApiError`.
  The shape is reconciled against the backend's standard error body
  (`backend/src/middleware/errorHandler.ts`, XC-1):
  `{ error: { code, message, details? } }`. This is the **one cross-pathway
  contract that is already confirmed** (it exists in backend code).
- **Single 401 → logout hook point** (`registerUnauthorizedHandler`) — the auth
  provider registers into it, so the client never imports auth state.
- **No real endpoint paths are hardcoded** — typed resource modules per feature
  are left as TODOs.

---

## What is deliberately stubbed / out of scope

- **Authentication (EP-04)** — `src/auth/AuthContext.tsx` is a PLACEHOLDER. No
  credential check, no token, no persistence; `login()` sets a fake in-memory
  user. Real auth/RBAC is owned by the **Cybersecurity** pathway.
- **All feature UI** — every page is an empty placeholder. Forms, lists, tables,
  charts, validation, etc. are owned by their respective kanban cards (A1, A3–A6).
- **Design system / styling / visual language** — **none exists, by design.** No
  CSS, no tokens, no component library, no layout polish. Owned by the design team.
- **Tests** — only one smoke test. Real unit/integration/e2e/axe suites are owned
  by the feature and A8 foundation cards.
- **Real API endpoints** — none wired; the client is the plumbing only.
- **HTTPS/TLS** — local dev is plain HTTP. HTTPS is a deployment NFR (NFR-2),
  matching the backend scaffold's stance.

---

## Questions for the design team / cross-pathway leads

1. **No design system exists yet — confirm this is expected for now.** This
   scaffold has zero styling, tokens, or visual language on purpose (design owns
   that, Area 7). When do you want the design system stood up so feature cards
   (A1/A3–A6) aren't blocked on it? Everything currently renders as plain HTML.

2. **Confirm the React + TypeScript + Vite stack is accepted.** The team docs
   assume "React + TS SPA over a documented REST API"; this scaffold commits to
   Vite + React Router + TanStack Query + Vitest + ESLint 8. Please confirm, or
   flag any substitution, before feature work starts.

3. **EP-04 (auth) contract is NOT yet locked (Cybersecurity).** We need, as fixed:
   - **token vs httpOnly cookie** (cookie is the documented preference);
   - the **exact role name strings** — our placeholder is `ADMIN | COORDINATOR |
     VIEWER` in `src/api/types.ts`; FR-4.5 gating must match these *exactly*;
   - the **current-user payload shape** (`id, name, email, roles`?);
   - **user-management (CRUD) endpoints** for the admin screen (A1-4).
   See `docs/cross-pathway-api-contracts.md` §EP-04.

4. **EP-03 (dashboard) data contract is NOT yet locked (Data Analyst).** We need:
   - which **charts** exist and **each data point's shape** (placeholder in
     `src/api/types.ts`: `DashboardData`);
   - the **filter params** (at least date range + programme, FR-3.4);
   - the **export** endpoint (PDF/CSV, FR-3.6) and what we pass it;
   - what **empty / error** results look like.
   See `docs/cross-pathway-api-contracts.md` §EP-03.

5. **Backend standard error shape — confirmed, please keep it fixed.** The API
   client is coded against `{ error: { code, message, details? } }` (backend
   XC-1). If the backend changes this shape, tell us — it's the one contract the
   client depends on today.
```
