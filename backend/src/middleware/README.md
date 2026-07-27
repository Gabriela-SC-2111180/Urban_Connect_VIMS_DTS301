# middleware/

Cross-cutting Express middleware.

Present now (scaffold):

- `errorHandler.ts` — centralised error handler + 404 fallback + the single
  standard JSON error shape. **Maps to XC-1.**

Expected later (created by their cards):

- `authenticate.ts` — verify session/token, attach the current user. **EP-04 / SEC-2.**
- `authorize.ts` — RBAC role gate; deny-by-default. **EP-04 / SEC-3.**
- `validate.ts` — request validation wrapper (pairs with `../validation/`). **XC-2.**
- `auditLog.ts` — record security-relevant actions. **XC-3.**

The auth/RBAC middleware contract (role names, 401 shape) is blocked on the
EP-04 agreement — see PROJECT-SETUP-STATUS.md.
