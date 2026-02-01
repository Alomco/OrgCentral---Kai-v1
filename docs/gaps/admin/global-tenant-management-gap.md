# Gap: Global tenant management (list)

## Legacy reference (old project)
- old/src/app/(app)/admin/global/tenant-management/page.tsx

## New project status (orgcentral)
- No /admin/global/tenant-management route under orgcentral/src/app

## Scope notes
- Platform/global admin surface (not org admin).
- List view only; tenant detail/actions are tracked in `global-tenant-detail-gap.md`.

## Status (as of 2026-02-01)
- ❌ Not started — no global tenant list route in orgcentral.

## Impact
- No UI to browse, approve, or archive tenants.

## TODO
- [ ] Define tenant list query/filter requirements with explicit allowlists.
- [ ] Implement list/search/approve/archive controllers with audit logging and pagination.
- [ ] Build tenant list UI with filters, bulk actions, and status chips.
- [ ] Add safe defaults (rate limits, export controls, activity logs).
- [ ] Add tests for scoping and action permissions.
