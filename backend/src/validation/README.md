# validation/

One shared place that validates and sanitises everything entering the system
**before** it is saved (XC-2). Catches bad email/phone, missing required
fields, out-of-range/negative numbers, and returns clear per-field messages in
the standard error shape (`error.details`).

Expected files (created by XC-2 and consumed by domain cards — currently empty):

- `schemas/` — one schema per resource (volunteer, programme, event, impact, user).
- A validation runner used as middleware (see `../middleware/validate.ts`).

Pick a schema library as part of XC-2 (e.g. zod). It was intentionally NOT
added to the scaffold so the team can choose. **Maps to XC-2, NFR-6, NFR-S6,
FR-1.9, FR-3.7.**
