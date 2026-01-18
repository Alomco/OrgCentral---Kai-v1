# Gap: Absence management granularity parity

## Current wiring (orgcentral)
- Absence overview page and panels:
  - orgcentral/src/app/(app)/hr/absence/page.tsx
  - orgcentral/src/app/(app)/hr/absence/absence-manager-panels.ts
  - orgcentral/src/app/(app)/hr/absence/requests/page.tsx
- Employee reporting and list UI:
  - orgcentral/src/app/(app)/hr/absence/_components/report-absence-form.tsx
  - orgcentral/src/app/(app)/hr/absence/schema.ts
  - orgcentral/src/app/(app)/hr/absence/actions.ts
  - orgcentral/src/app/(app)/hr/absence/_components/absences-list-panel.tsx
  - orgcentral/src/app/(app)/hr/absence/_components/absence-row.tsx
  - orgcentral/src/app/(app)/hr/absence/_components/absence-detail-dialog.tsx
  - orgcentral/src/app/(app)/hr/absence/_components/cancel-absence-dialog.tsx
- Manager review and team views:
  - orgcentral/src/app/(app)/hr/absence/_components/absence-approval-panel.tsx
  - orgcentral/src/app/(app)/hr/absence/_components/absence-approval-dialog.tsx
  - orgcentral/src/app/(app)/hr/absence/_components/team-absence-panel.tsx
- Admin hub (acknowledgments):
  - orgcentral/src/app/(app)/hr/admin/_components/absence-management-hub.tsx
  - orgcentral/src/app/(app)/hr/admin/_components/absence-acknowledge-form.tsx
  - orgcentral/src/app/(app)/hr/admin/actions/absence.actions.ts
- Absence type configuration:
  - orgcentral/src/app/(app)/hr/settings/_components/absence-type-config-panel.tsx
  - orgcentral/src/app/(app)/hr/settings/_components/absence-type-config-form.tsx
  - orgcentral/src/app/(app)/hr/settings/absence-type-actions.ts
- API/use-cases for absence lifecycle:
  - orgcentral/src/app/api/hr/absences/route.ts
  - orgcentral/src/app/api/hr/absences/[absenceId]/route.ts
  - orgcentral/src/app/api/hr/absences/[absenceId]/approve/route.ts
  - orgcentral/src/app/api/hr/absences/[absenceId]/return-to-work/route.ts
  - orgcentral/src/app/api/hr/absences/[absenceId]/attachments/route.ts
  - orgcentral/src/app/api/hr/absences/[absenceId]/ai/route.ts
  - orgcentral/src/server/use-cases/hr/absences/*
  - orgcentral/src/server/types/hr-absence-schemas.ts
  - orgcentral/src/server/types/hr-ops-types.ts

## Legacy capabilities (old project)
- Absence reporting with day vs hour duration selection, start/end time capture, automatic duration calculation, and required reason:
  - old/src/app/(app)/hr/absences/page.tsx
- Evidence upload and attachment viewing for absences:
  - old/src/app/(app)/hr/absences/page.tsx
- AI validation status shown for absence evidence:
  - old/src/app/(app)/hr/absences/page.tsx
- Return-to-work workflow for ongoing absences:
  - old/src/app/(app)/hr/absences/page.tsx
- Segmented ongoing vs history views, plus cancellation reason display:
  - old/src/app/(app)/hr/absences/page.tsx
- Admin absence hub with pending acknowledgments, ongoing list, history list, cancel actions, and global absence settings:
  - old/src/app/(app)/hr/admin/AbsenceManagementHub.tsx
- Absence balance cards tied to absence types (tracked vs entitlement):
  - old/src/app/(app)/hr/absences/page.tsx

## Gaps (new project only)
1) Partial-day granularity is reduced: the report form captures only hours + dates with no duration type or time range, and approvals show day counts rather than hours.
   - New: orgcentral/src/app/(app)/hr/absence/_components/report-absence-form.tsx
   - New: orgcentral/src/app/(app)/hr/absence/_components/absence-approval-dialog.tsx
   - Old: old/src/app/(app)/hr/absences/page.tsx
2) Evidence attachment workflows are missing: no UI to upload, view, or manage absence attachments despite API support.
   - New: orgcentral/src/app/api/hr/absences/[absenceId]/attachments/route.ts
   - New: orgcentral/src/server/use-cases/hr/absences/add-absence-attachments.ts
   - Old: old/src/app/(app)/hr/absences/page.tsx
3) AI validation is not surfaced: no UI to trigger or display AI validation status for absence evidence.
   - New: orgcentral/src/app/api/hr/absences/[absenceId]/ai/route.ts
   - New: orgcentral/src/server/use-cases/hr/absences/process-ai-validation.ts
   - Old: old/src/app/(app)/hr/absences/page.tsx
4) Return-to-work workflow is not exposed: there is no UI to record return-to-work and close absences.
   - New: orgcentral/src/app/api/hr/absences/[absenceId]/return-to-work/route.ts
   - Old: old/src/app/(app)/hr/absences/page.tsx
5) Absence lifecycle visibility is thinner: no ongoing vs history segmentation, no cancellation reasons, no return-to-work notes, and no acknowledgment notes in list/detail views.
   - New: orgcentral/src/app/(app)/hr/absence/_components/absences-list-panel.tsx
   - New: orgcentral/src/app/(app)/hr/absence/_components/absence-detail-dialog.tsx
   - New: orgcentral/src/app/(app)/hr/admin/_components/absence-management-hub.tsx
   - Old: old/src/app/(app)/hr/absences/page.tsx
   - Old: old/src/app/(app)/hr/admin/AbsenceManagementHub.tsx
6) Absence type labeling is not joined to configuration: UI shows static labels or raw type IDs instead of configured absence types.
   - New: orgcentral/src/app/(app)/hr/absence/_components/absence-row.tsx
   - New: orgcentral/src/app/(app)/hr/absence/_components/absence-detail-dialog.tsx
   - New: orgcentral/src/app/(app)/hr/admin/_components/absence-management-hub.tsx
   - Old: old/src/app/(app)/hr/absences/page.tsx
7) Absence balance context is missing: no tracked vs entitlement balance cards tied to absence types.
   - New: orgcentral/src/app/(app)/hr/absence/page.tsx
   - Old: old/src/app/(app)/hr/absences/page.tsx
8) Absence settings are not configurable in UI: hoursInWorkDay/roundingRule exist in backend but are not surfaced, and HR settings use a separate table.
   - New: orgcentral/src/server/use-cases/hr/absences/update-absence-settings.ts
   - New: orgcentral/src/server/types/hr-absence-schemas.ts
   - New: orgcentral/src/app/(app)/hr/settings/_components/hr-settings-form.tsx
   - Old: old/src/app/(app)/hr/admin/AbsenceManagementHub.tsx
9) Admin absence management is oversimplified: no ongoing/history views, filters, cancel actions, or employee/type labels in the pending table.
   - New: orgcentral/src/app/(app)/hr/admin/_components/absence-management-hub.tsx
   - Old: old/src/app/(app)/hr/admin/AbsenceManagementHub.tsx

## TODOs
- [ ] Analyze and redesign absence reporting to capture duration type (days vs hours), start/end times, and computed duration logic; align approvals to show hours vs days.
- [ ] Analyze and implement absence attachment upload/view UI wired to the attachments routes and metadata.
- [ ] Analyze and surface AI validation triggers and status in absence detail views.
- [ ] Analyze and build return-to-work actions that update status to closed and capture comments.
- [ ] Analyze and expand lifecycle views (ongoing vs history segmentation, cancellation reasons, return-to-work notes, acknowledgment notes).
- [ ] Analyze and join absence items to absence type config for labels, tracksBalance flags, and active/inactive state.
- [ ] Analyze and add absence balance summaries using tracked absence types and leave balances.
- [ ] Analyze and expose absence settings (hoursInWorkDay, roundingRule) in HR settings backed by AbsenceSettings.
- [ ] Analyze and expand admin absence management to include ongoing/history, filters, cancellation, and richer metadata.

## Actionable TODOs with targets
- [ ] Extend `orgcentral/src/app/(app)/hr/absence/_components/report-absence-form.tsx` and `orgcentral/src/app/(app)/hr/absence/schema.ts` to support duration type (days vs hours) with start/end time fields and computed duration display.
- [ ] Update `orgcentral/src/app/(app)/hr/absence/actions.ts` to map partial-day inputs into `report-unplanned-absence` payload and preserve hours overrides.
- [ ] Add absence attachment UI and wire to `orgcentral/src/app/api/hr/absences/[absenceId]/attachments/route.ts` with metadata matching `orgcentral/src/server/types/hr-absence-schemas.ts`.
- [ ] Expose AI validation controls and status in `orgcentral/src/app/(app)/hr/absence/_components/absence-detail-dialog.tsx`, using `orgcentral/src/app/api/hr/absences/[absenceId]/ai/route.ts`.
- [ ] Add return-to-work dialog to `orgcentral/src/app/(app)/hr/absence/_components/absence-row.tsx` and submit to `orgcentral/src/app/api/hr/absences/[absenceId]/return-to-work/route.ts`.
- [ ] Split absence list views into ongoing vs history sections in `orgcentral/src/app/(app)/hr/absence/_components/absences-list-panel.tsx` with cancellation reasons and return-to-work notes.
- [ ] Join absence rows with type config labels by passing `absenceTypes` to `orgcentral/src/app/(app)/hr/absence/_components/absences-list-panel.tsx` and `orgcentral/src/app/(app)/hr/absence/_components/absence-detail-dialog.tsx`.
- [ ] Add absence balance summary cards to `orgcentral/src/app/(app)/hr/absence/page.tsx` using tracked absence types and leave balance data.
- [ ] Add AbsenceSettings controls (hoursInWorkDay, roundingRule) to HR settings UI, backed by `orgcentral/src/server/use-cases/hr/absences/update-absence-settings.ts`.
- [ ] Expand admin absence hub `orgcentral/src/app/(app)/hr/admin/_components/absence-management-hub.tsx` to include ongoing/history views with type labels and cancellation actions.

## Related gaps
- orgcentral/docs/gaps/documents/document-management-gap.md
