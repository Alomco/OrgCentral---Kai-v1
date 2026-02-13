# ISO 27001:2022 Annex A Code-Only Findings (Non-MD Evidence)

**Generated:** 2026-02-11

## Scope

This report is based only on non-markdown files in this repository (code/config/scripts). It excludes any evidence from docs/** and *.md. Controls are marked as evidence/gap only when supported by code-level artifacts.

## Critical Gaps (Code-Only)

### A.8.14 Logging / A.8.15 Monitoring / A.8.16 Security Monitoring

- Audit retention and audit event use-cases are empty stubs, so retention enforcement and centralized audit orchestration are not implemented at the application layer.
  - [src/server/use-cases/records/audit/delete-audit-by-retention.ts](src/server/use-cases/records/audit/delete-audit-by-retention.ts#L1)
  - [src/server/use-cases/records/audit/delete-audit-log.ts](src/server/use-cases/records/audit/delete-audit-log.ts#L1)
  - [src/server/use-cases/records/audit/record-audit-event.ts](src/server/use-cases/records/audit/record-audit-event.ts#L1)

### A.5.26-A.5.30 Incident Management (Event Reporting, Response, Evidence)

- Incident response logic relies on mock incident objects without persistence, which undermines evidence collection and lifecycle integrity.
  - [src/server/security/incident-response/incident-response-service.ts](src/server/security/incident-response/incident-response-service.ts#L68-L179)
  - [src/server/security/incident-response/incident-response.helpers.ts](src/server/security/incident-response/incident-response.helpers.ts#L77-L100)

## High Gaps (Code-Only)

### A.5.3 Segregation of Duties

- The leave permission statement allows `create` and `approve` in the same role, enabling self-approval.
  - [src/server/security/role-permission-statements.ts](src/server/security/role-permission-statements.ts#L20-L25)
  - [src/server/security/role-templates.admins.ts](src/server/security/role-templates.admins.ts#L14-L23)

### A.8.13 Information Backup

- Backup scripts exist but do not show encryption, retention rotation, or offsite replication in code.
  - [scripts/db-backup.sh](scripts/db-backup.sh#L1-L20)
  - [scripts/db-backup.ps1](scripts/db-backup.ps1#L1-L31)

### A.8.12 Data Leakage Prevention (DLP)

- DLP scanning exists as a service, but no code-level integration points were found for uploads/exports.
  - [src/server/services/security/dlp-scanning-service.ts](src/server/services/security/dlp-scanning-service.ts#L41-L243)

## Medium Gaps (Code-Only)

### A.7 Physical Security Controls (A.7.1-A.7.14)

- No code-level evidence for physical perimeters, entry controls, secure areas, or equipment handling. These are likely out-of-repo.

### A.5 Supplier and Outsourcing Controls (A.5.19-A.5.25)

- Integrations exist, but no supplier risk assessment, monitoring, or outsourcing controls appear in code.

### A.8.7 Protection Against Malware

- No malware scanning/quarantine integrations found in code.

## Evidence Highlights (Code-Only)

### A.8.5 Secure Authentication

- MFA enforcement and session security checks are implemented.
  - [src/server/lib/auth-config.ts](src/server/lib/auth-config.ts#L48-L112)
  - [src/server/use-cases/auth/sessions/session-security.ts](src/server/use-cases/auth/sessions/session-security.ts#L29-L85)

### A.8.3 Information Access Restriction

- Tenant scoping and RBAC/ABAC guards are enforced in core authorization flow.
  - [src/server/security/guards/core.ts](src/server/security/guards/core.ts#L68-L105)

### A.5.34 Privacy/PII Protection

- PII access is validated and security events capture classification/residency metadata.
  - [src/server/repositories/prisma/records/audit/prisma-audit-log-repository.ts](src/server/repositories/prisma/records/audit/prisma-audit-log-repository.ts#L20-L83)
  - [src/server/repositories/prisma/security/prisma-enhanced-security-event-repository.ts](src/server/repositories/prisma/security/prisma-enhanced-security-event-repository.ts#L52-L155)

## Notes

- This report does not evaluate controls implemented outside the repo (CI/CD, cloud/IaC, physical security, SaaS policies).