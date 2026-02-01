# Gap: Enterprise admin dashboard

## Legacy reference (old project)
- old/src/app/(app)/admin/enterprise/page.tsx

## New project status (orgcentral)
- No /admin/enterprise route under orgcentral/src/app

## Scope notes
- Platform/enterprise admin surface (multi-org view).
- Should compose global tenant list/detail views rather than duplicating them.

## Status (as of 2026-02-01)
- ❌ Not started — no enterprise admin route in orgcentral.

## Impact
- No multi-org enterprise admin UI or onboarding in the new app.

## TODO
- [ ] Define enterprise admin personas, metrics, and org onboarding workflow.
- [ ] Implement admin APIs/controllers for org discovery, onboarding state, and metrics with audit logging.
- [ ] Build `/admin/enterprise` dashboard UI with onboarding actions and tenant-scoped widgets.
- [ ] Add permission guardrails (role allowlists, tenant scoping, rate limits).
- [ ] Add tests for access control and onboarding flows.
