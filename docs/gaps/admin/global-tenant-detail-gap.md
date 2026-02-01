# Gap: Global tenant management (detail)

## Legacy reference (old project)
- old/src/app/(app)/admin/global/tenant-management/[tenantId]/page.tsx

## New project status (orgcentral)
- No /admin/global/tenant-management/[tenantId] route under orgcentral/src/app

## Scope notes
- Platform/global admin surface (not org admin).
- Detail view for a single tenant; list view is tracked in `global-tenant-management-gap.md`.

## Status (as of 2026-02-01)
- ❌ Not started — no tenant detail route in orgcentral.

## Impact
- No tenant detail view for status, billing, or audit review.

## TODO
- [ ] Define tenant detail data contract (status, plan, usage, billing, security flags).
- [ ] Implement tenant detail + actions controllers (suspend, archive, restore) with audit logging.
- [ ] Build tenant detail UI with audit history and guarded actions.
- [ ] Add permission guardrails and residency/classification checks.
- [ ] Add tests for access control and action effects.
