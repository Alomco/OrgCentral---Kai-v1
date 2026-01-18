# Gap: UI/UX approach parity

## Current UI/UX approach (orgcentral)
- Next.js App Router + Server Components with Suspense, server actions, and security-first session routing.
  - orgcentral/src/app/(app)/_components/app-layout-shell.tsx
  - orgcentral/src/app/(app)/layout.tsx
- Tenant theming and branding handled server-side with theme registry and UI style providers.
  - orgcentral/src/app/layout.tsx
  - orgcentral/src/app/(app)/_components/app-layout-shell.tsx
  - orgcentral/src/app/(app)/org/branding/_components/org-branding-form.tsx

## Legacy UI/UX approach (old project)
- Client-side React with Firebase contexts for user, branding, and notifications; UI gating via ProtectedHRComponent.
  - old/src/context/UserContext.tsx
  - old/src/context/BrandingContext.tsx
  - old/src/components/hr/ProtectedHRComponent.tsx

## UI/UX gaps (new project only)

### Multi-organization switching UX
Old Project: OrgSwitcher provided multi-organization selection with a forced selection dialog and enterprise shortcuts.
  - old/src/components/layout/OrgSwitcher.tsx
New Project: App sidebar only shows the current organization with links to org profile/admin; no org switcher UI.
  - orgcentral/src/components/layout/app-sidebar.tsx
Gap: Users with multiple org memberships have no UI to switch organizations or resolve organization context.

### Branding configuration depth
Old Project: Branding UI included color pickers, sidebar theme color, and file uploads with previews (logo/favicon).
  - old/src/app/(app)/admin/organization/branding/page.tsx
  - old/src/app/(app)/admin/organization/branding/_components/ColorInput.tsx
  - old/src/app/(app)/admin/organization/branding/_components/ImageUploader.tsx
New Project: Branding UI uses plain text inputs for URLs/colors with no file upload or sidebar theme color controls.
  - orgcentral/src/app/(app)/org/branding/_components/org-branding-form.tsx
Gap: Detailed branding controls and asset upload UX from the old project are missing.

### Compliance submission UX
Old Project: Compliance log allowed per-item submissions (documents, completion dates, yes/no, acknowledgements) with inline status changes.
  - old/src/app/(app)/hr/compliance/page.tsx
New Project: Compliance list is read-only and the detail view is mock data.
  - orgcentral/src/app/(app)/hr/compliance/_components/compliance-items-panel.tsx
  - orgcentral/src/app/(app)/hr/compliance/[itemId]/page.tsx
Gap: End-to-end compliance submission UX is not implemented.

### Absence reporting granularity
Old Project: Absence form supported days vs hours, time ranges, attachments, AI validation status, and return-to-work flows.
  - old/src/app/(app)/hr/absences/page.tsx
New Project: Absence form captures dates + hours only; no attachments, AI validation UI, or return-to-work controls.
  - orgcentral/src/app/(app)/hr/absence/_components/report-absence-form.tsx
Gap: Detailed absence reporting UX has been simplified.

### Employee compliance log UX
Old Project: Employee profile Documents tab exposed admin compliance log with progress, assignment, and review controls.
  - old/src/app/(app)/hr/employees/[id]/page.tsx
  - old/src/app/(app)/hr/employees/[id]/AdminComplianceManager.tsx
New Project: Employee Compliance tab reuses read-only compliance items panel without admin management UI.
  - orgcentral/src/app/(app)/hr/employees/[id]/_components/employee-compliance-tab.tsx
Gap: Employee-level compliance management UI is missing.

## TODOs
- [ ] Analyze and design a multi-organization switcher UX that mirrors old selection/enterprise shortcuts.
- [ ] Analyze and restore branding controls (color pickers, sidebar theme color, asset uploads) with previews.
- [ ] Analyze and rebuild compliance submission UI with per-item inputs and status updates.
- [ ] Analyze and restore granular absence reporting UX (time ranges, attachments, AI validation, return-to-work).
- [ ] Analyze and rebuild employee compliance log/admin management UI.

## Related gaps
- orgcentral/docs/gaps/hr/compliance-gap.md
- orgcentral/docs/gaps/hr/absence-management-granularity-gap.md
- orgcentral/docs/gaps/documents/document-management-gap.md
