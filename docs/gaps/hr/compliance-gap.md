# Gap: HR compliance workflow parity

## Current wiring (orgcentral)
- User view: orgcentral/src/app/(app)/hr/compliance/page.tsx
  - Items list: orgcentral/src/app/(app)/hr/compliance/_components/compliance-items-panel.tsx
  - Detail page (mock data): orgcentral/src/app/(app)/hr/compliance/[itemId]/page.tsx
  - Detail utils: orgcentral/src/app/(app)/hr/compliance/[itemId]/compliance-item-utils.ts
- Admin view:
  - Templates manager: orgcentral/src/app/(app)/hr/compliance/_components/compliance-templates-manager.tsx
  - Review queue: orgcentral/src/app/(app)/hr/compliance/_components/compliance-review-queue-panel.tsx
  - Bulk assign UI (not wired): orgcentral/src/app/(app)/hr/compliance/_components/bulk-assign-dialog.tsx
  - Expiry panel (unused): orgcentral/src/app/(app)/hr/compliance/_components/compliance-expiry-panel.tsx
- API/use-cases:
  - Update item API: orgcentral/src/app/api/hr/compliance/update/route.ts
  - Assign items API: orgcentral/src/app/api/hr/compliance/assign/route.ts
  - Update use-case: orgcentral/src/server/use-cases/hr/compliance/update-compliance-item.ts
  - Types: orgcentral/src/server/types/compliance-types.ts

## Legacy capabilities (old project)
- User compliance log with per-item update (document upload, completion date, yes/no, acknowledgement), status updates, and progress display.
  - old/src/app/(app)/hr/compliance/page.tsx
- Admin compliance hub with task library, template import, assignment dialog, and review workflow with notes/attachments.
  - old/src/app/(app)/hr/admin/ComplianceManagementHub.tsx

## Gaps (new project only)
1) No user-facing submission UI for compliance items (document upload, completion date, yes/no, acknowledgement, notes).
   - ComplianceItemsPanel is read-only and the detail page uses mock data.
2) Compliance item detail page status mapping is incompatible with current status codes (COMPLETED/OVERDUE vs COMPLETE/MISSING/PENDING_REVIEW).
3) Compliance items list does not resolve template metadata (name, type, guidance, mandatory, internal-only) and shows templateItemId only.
4) Bulk assign dialog is rendered with empty templates/employees and no onAssign handler, so it cannot assign packs.
5) Expiry management panel exists but is not connected to data or shown on the compliance page.
6) Category management UI is missing; templates use free-text categoryKey with no picker or upsert flow.

## Gap details (parity notes)

### Document management complexity
Old Project: Highly configurable compliance items (Document, CompletionDate, YesNo, Acknowledgement) with upload flows and rich status tracking (Complete, Pending, Missing, Pending Review, N/A, Expired, Expiring Soon) in old/src/app/(app)/hr/compliance/page.tsx.
New Project: Compliance types exist in orgcentral/src/server/types/compliance-types.ts, but the UI is read-only and the detail page uses mock data.
Gap: The old project supported fully interactive document workflows and status transitions; the new project does not surface those capabilities.

### Status granularity and expiry lifecycle
Old Project: Displayed Expiring Soon and Expired with date-based warnings and per-item status controls.
New Project: ComplianceItemStatus omits Expiring Soon and the detail page maps to non-existent status labels (orgcentral/src/app/(app)/hr/compliance/[itemId]/compliance-item-utils.ts).
Gap: Status presentation is inconsistent and expiry lifecycle states are not represented or computed in the UI.

### Template library and category tooling
Old Project: Admin task library with category/item builder UI, template import, and category metadata in old/src/app/(app)/hr/admin/ComplianceManagementHub.tsx.
New Project: Template creation is JSON-only via orgcentral/src/app/(app)/hr/compliance/_components/compliance-templates-manager.tsx with no category manager.
Gap: Missing visual template builder, category tooling, and structured task library management.

### Internal-only visibility and guidance text
Old Project: Items could be marked internal-only and were filtered from employee views; guidance text was shown alongside each item.
New Project: Compliance items are listed by templateItemId with no internal-only filtering or guidance surfaced (orgcentral/src/app/(app)/hr/compliance/_components/compliance-items-panel.tsx).
Gap: Employees see less context and may see items that should be internal-only.

### Review workflow evidence coverage
Old Project: Review dialog showed submitted evidence (files, yes/no values, completion dates) and required actionable feedback.
New Project: Review queue shows attachments as raw strings and only updates status/notes without capturing completedAt or evidence context (orgcentral/src/app/(app)/hr/compliance/actions/review-item.ts).
Gap: Reviewers lack the evidence context needed to validate submissions and expiry logic is not updated on approval.

### Assignment and visibility at scale
Old Project: Assignment dialog and employee logs provided visibility into who was pending and which items were assigned.
New Project: BulkAssignDialog is not wired (empty templates/employees) and there is no admin employee compliance log view.
Gap: No operational visibility or bulk assignment workflow for compliance at organization scale.

## TODOs
- [ ] Analyze and implement user submission UI that calls /api/hr/compliance/update with attachments, completion dates, acknowledgements, and notes.
- [ ] Analyze and wire compliance item detail page to real data and align status labels with ComplianceItemStatus.
- [ ] Analyze and join compliance items with template metadata to display item names, types, guidance, and internal-only visibility.
- [ ] Analyze and wire bulk assignment to templates/employees with an onAssign action backed by assign-compliance-items.
- [ ] Analyze and surface expiring items in the compliance page using dueDate/expiryDurationDays and the reminders pipeline.
- [ ] Analyze and add a category manager (list/upsert categories) to avoid free-text category keys.

## Actionable TODOs with targets
- [ ] Build interactive item submission UI in `orgcentral/src/app/(app)/hr/compliance/_components/compliance-items-panel.tsx` or a new client detail view, calling `orgcentral/src/app/api/hr/compliance/update/route.ts` with attachments, completedAt, and notes.
- [ ] Replace mock compliance detail page with real data loading in `orgcentral/src/app/(app)/hr/compliance/[itemId]/page.tsx`, and update `orgcentral/src/app/(app)/hr/compliance/[itemId]/compliance-item-utils.ts` to map `ComplianceItemStatus`.
- [ ] Add a server join of compliance items + template items (name/type/guidance/isInternalOnly) and use it to render in `orgcentral/src/app/(app)/hr/compliance/_components/compliance-items-panel.tsx`.
- [ ] Filter out internal-only items for employee views while keeping admin visibility (use template metadata, not just item status).
- [ ] Wire `orgcentral/src/app/(app)/hr/compliance/_components/bulk-assign-dialog.tsx` with templates and employees and add an onAssign action that calls `orgcentral/src/app/api/hr/compliance/assign/route.ts`.
- [ ] Surface expiry data in `orgcentral/src/app/(app)/hr/compliance/_components/compliance-expiry-panel.tsx` and mount it on `orgcentral/src/app/(app)/hr/compliance/page.tsx` with a real expiring-items query.
- [ ] Add compliance category manager UI that calls `orgcentral/src/app/api/hr/compliance/categories/route.ts` for list/upsert.
- [ ] Enhance review flow in `orgcentral/src/app/(app)/hr/compliance/_components/compliance-review-queue-panel.tsx` to show evidence context and update completedAt/attachments in `orgcentral/src/app/(app)/hr/compliance/actions/review-item.ts`.
