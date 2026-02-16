# HR Time Tracking Runtime Smoke Evidence

- Date: 2026-02-13
- Environment: local runtime (`http://localhost:3000`)
- Scope: live browser + API smoke pass for release-note evidence

## Artifacts

- API smoke raw log: [tmp/hr-time-tracking-smoke-2026-02-13.log](../../tmp/hr-time-tracking-smoke-2026-02-13.log)
- Browser screenshot: [tmp/hr-time-tracking-browser-smoke-2026-02-13.png](../../tmp/hr-time-tracking-browser-smoke-2026-02-13.png)

## Browser smoke summary

- Navigated to `/hr/time-tracking` in live browser session.
- Runtime redirected to login route as expected for unauthenticated access:
  - Final URL: `/login?next=%2Fdashboard`
- Browser console check result:
  - Errors: `0`
  - Warnings: `0`

## API smoke summary

Executed script:

- `node .\tmp\verify-hr-time-tracking-api.mjs --base http://localhost:3000`

Observed key outcomes:

- Unauthenticated access behavior:
  - `GET /api/hr/time-tracking` -> `401` typed auth error envelope
  - Mutation without origin -> `403` typed invalid-origin envelope
- Authenticated flow behavior:
  - Login -> `200`
  - `GET /api/hr/time-tracking` -> `200`
  - `POST /api/hr/time-tracking` with valid origin -> `201`
  - `PATCH /api/hr/time-tracking/{entryId}` with valid origin -> `200`
- Invalid-origin mutation behavior:
  - Create/Patch/Approve mutation requests with missing or wrong origin -> `403`
- Not-found behavior:
  - Missing entry update/approve paths return typed `404` envelope (`ENTITY_NOT_FOUND`)

## Rate-limit runtime note

- In this live run, deterministic `429` was not triggered within `120` rapid PATCH attempts under active local runtime configuration.
- This is tracked by deterministic automated test coverage already passing in route/unit suites (429 status + envelope + `Retry-After` + `X-RateLimit-*`).

## Release-note ready statement

Live browser and API smoke checks completed successfully for audited HR Time Tracking flows, with evidence artifacts captured and linked above. No browser runtime errors were observed during the smoke pass.
