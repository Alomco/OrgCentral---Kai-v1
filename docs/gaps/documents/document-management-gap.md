# Gap: Document management workflows

## Current wiring (orgcentral)
- Document vault types and repositories exist but have no app routes:
  - orgcentral/src/server/types/records/document-vault.ts
  - orgcentral/src/server/repositories/prisma/records/documents/prisma-document-vault-repository.ts
  - orgcentral/src/server/use-cases/records/documents/*
  - orgcentral/src/server/api-adapters/records/documents/*
  - No app routes found under orgcentral/src/app/api/** for document vault.
- Compliance attachments use raw string arrays and do not integrate the vault:
  - orgcentral/src/server/types/hr-compliance-schemas.ts
  - orgcentral/src/server/use-cases/hr/compliance/update-compliance-item.ts
  - orgcentral/src/app/(app)/hr/compliance/_components/compliance-items-panel.tsx (read-only)
  - orgcentral/src/app/(app)/hr/compliance/[itemId]/page.tsx (mock data)
- Document expiry worker exists but is scoped to work permits in employee profiles:
  - orgcentral/src/server/use-cases/hr/compliance/process-document-expiry.ts

## Legacy behavior (old project)
- Document compliance supported upload flows, allowed file types, and per-item statuses including Expired/Expiring Soon:
  - old/src/app/(app)/hr/compliance/page.tsx
  - old/src/lib/hr/types.ts
- Employee profiles included a Documents tab with an admin compliance log, assignment, review, and per-item document controls:
  - old/src/app/(app)/hr/employees/[id]/page.tsx
  - old/src/app/(app)/hr/employees/[id]/AdminComplianceManager.tsx
- HR dashboards surfaced documents-expiring KPIs and quick actions for document upload/review:
  - old/src/app/(app)/hr/dashboard/page.tsx

## Gaps (document management complexity)
1) No document vault UI or routes to store/retrieve documents with classification/retention/versioning.
2) Compliance evidence is stored as raw attachment URLs/strings without document metadata or version history.
3) No file upload UX for compliance items, despite template-level allowedFileTypes support.
4) No document classification/retention fields exposed in UI to match DocumentVaultRecord requirements.
5) Document expiry workflows are not tied to compliance items (expiring soon/expired states not computed or surfaced).
6) Review queue shows attachments as raw strings without metadata or preview context.
7) HR dashboards lack document-expiring KPIs and quick actions for document upload/review.
8) Employee detail view lacks the admin compliance log experience (progress, assignment, review, per-item document controls).

## TODOs
- [ ] Analyze and expose document vault routes and UI to list/store documents with classification, retention, and version metadata.
- [ ] Analyze and link compliance attachments to document vault records (store pointer + metadata, not raw strings).
- [ ] Analyze and implement compliance evidence upload UI with allowedFileTypes enforcement and audit logging.
- [ ] Analyze and surface document classification/retention inputs where documents are created or updated.
- [ ] Analyze and connect compliance expiry states to item statuses and UI warnings.
- [ ] Analyze and enhance review queue evidence display with document metadata and previews.
- [ ] Analyze and add document-expiring KPIs plus quick actions for document upload/review on the HR dashboard.
- [ ] Analyze and build an employee-level compliance log admin view with assignment and review controls.

## Related gaps
- orgcentral/docs/gaps/hr/compliance-gap.md
- orgcentral/docs/gaps/hr/absence-management-granularity-gap.md
