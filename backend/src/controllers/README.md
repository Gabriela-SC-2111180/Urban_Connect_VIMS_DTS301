# controllers/

HTTP request/response handlers. A controller's only job: read validated input
from the request, call the matching **service**, and shape the HTTP response in
the standard contract (XC-1). No business logic and no SQL here.

Expected files (created by their cards — currently empty):

- `auth.controller.ts` — EP-04 / SEC-2, SEC-4
- `volunteers.controller.ts` — EP-01 / VOL-*
- `scheduling.controller.ts` — EP-02 / SCH-*
- `impact.controller.ts` — EP-03 / IMP-*
- `notifications.controller.ts` — EP-05 / NOT-*

Until then, routers in `../routes/` return 501 directly via the stub helper.
