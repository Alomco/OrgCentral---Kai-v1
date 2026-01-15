# Prisma ISO27001 Tenant Scope Audit

## TL;DR
- Centralized tenant-scoped Prisma model config now covers every `orgId`-backed model and applies compliance defaults consistently.
- Strict tenant scope enforcement remains for HR absence + HR notifications; repositories were updated so org-scoped writes are safe.
- Added a schema-vs-config audit script to keep tenant scoping SSOT aligned with Prisma schema evolution.

## Scope
- Prisma middleware scoping (`src/server/lib/prisma.ts`)
- Tenant scope config (`src/server/lib/prisma-tenant-scope.ts`)
- HR absence + HR notification repositories
- Prisma schema coverage audit

## Findings
1. Tenant scoping coverage was partial (only a handful of models), leaving most `orgId` models unenforced at middleware.
2. Some strict-scoped models performed updates/deletes without org scoping in the Prisma `where` clause, risking cross-tenant writes.
3. No automated guard existed to detect new schema models missing tenant scoping configuration.

## Remediation Summary
- Added centralized tenant scope config with explicit scoping policy and compliance fields for all `orgId` models.
- Updated strict-scoped repositories to scope write operations by `orgId`.
- Added a tenant-scope audit script to validate config against schema.

## TODOs (completed)
- [x] Add tenant scope config for Invitation (orgId required, create-only).
- [x] Add tenant scope config for SecurityEvent (orgId optional, no middleware enforcement).
- [x] Add tenant scope config for OrganizationSubscription (classification + residency).
- [x] Add tenant scope config for PaymentMethod (classification + residency).
- [x] Add tenant scope config for BillingInvoice (classification + residency).
- [x] Add tenant scope config for HRNotification (strict + compliance fields).
- [x] Add tenant scope config for EmployeeProfile (classification + residency).
- [x] Add tenant scope config for EmploymentContract (classification + residency).
- [x] Add tenant scope config for LeavePolicy (classification + residency).
- [x] Add tenant scope config for LeaveBalance (classification + residency).
- [x] Add tenant scope config for LeaveRequest (classification + residency).
- [x] Add tenant scope config for LeaveAttachment (classification + residency).
- [x] Add tenant scope config for PerformanceReview.
- [x] Add tenant scope config for PerformanceGoal.
- [x] Add tenant scope config for TrainingRecord.
- [x] Add tenant scope config for AbsenceTypeConfig (strict).
- [x] Add tenant scope config for AbsenceSettings (strict).
- [x] Add tenant scope config for HRSettings (classification + residency).
- [x] Add tenant scope config for UnplannedAbsence (strict + compliance fields).
- [x] Add tenant scope config for AbsenceAttachment (strict + compliance fields).
- [x] Add tenant scope config for AbsenceReturnRecord (strict + compliance fields).
- [x] Add tenant scope config for AbsenceDeletionAudit (strict + compliance fields).
- [x] Add tenant scope config for TimeEntry (classification + residency).
- [x] Add tenant scope config for HRPolicy (classification + residency).
- [x] Add tenant scope config for PolicyAcknowledgment.
- [x] Add tenant scope config for ChecklistTemplate.
- [x] Add tenant scope config for ChecklistInstance.
- [x] Add tenant scope config for ComplianceTemplate.
- [x] Add tenant scope config for ComplianceCategory.
- [x] Add tenant scope config for ComplianceLogItem.
- [x] Add tenant scope config for NotificationMessage (classification + residency).
- [x] Add tenant scope config for ManagedOrganization.
- [x] Add tenant scope config for DocumentVault.
- [x] Add tenant scope config for AuditLog.
- [x] Add tenant scope config for EventOutbox.
- [x] Add tenant scope config for ComplianceRecord.
- [x] Add tenant scope config for StatutoryReport.
- [x] Add tenant scope config for DataSubjectRight.
- [x] Add tenant scope config for Location.
- [x] Add tenant scope config for Role.
- [x] Add tenant scope config for PermissionResource.
- [x] Add tenant scope config for Department.
- [x] Add tenant scope config for Membership.
- [x] Add tenant scope config for NotificationPreference.
- [x] Add tenant scope config for IntegrationConfig.
- [x] Update HR notification write paths to enforce org-scoped update/delete.
- [x] Update absence type config updates to enforce org-scoped writes.
- [x] Update unplanned absence write paths to enforce org-scoped update/delete.
- [x] Add tenant scope audit script for schema/config drift detection.

## Actions / Notifications / Workers / Error Handling Check
- Actions: server actions and use-cases exist with Zod boundaries and authorization context passed through services.
- Notifications: platform + HR notification repositories/services are present with cache invalidation and audit metadata.
- Workers: background workers exist under `src/server/workers` for HR, compliance, and auth sync.
- Error handling: structured error types and security event logging are in place for audit trails and incident response.

## Residual Risk Notes
- Create-only scoping is enforced for most `orgId` models; read/update scoping remains repository-driven until those paths are tightened.
- Tenant scoping for optional-org models (e.g., security events) relies on repository contracts and service validation.

## Verification
- Run `tsx scripts/audit-prisma-tenant-scope.ts` to ensure schema/config alignment.
