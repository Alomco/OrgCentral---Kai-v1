# ISO27001 Compliance Report

**Generated:** 2026-02-11T09:51:40.768972

## Scope and Evidence Basis

This report is limited to evidence found in this repository (code and repo-hosted documentation). Controls are marked as implemented only when there is direct, verifiable evidence in-repo. If a control is implemented outside the repo (cloud configuration, CI/CD platform settings, SaaS policies, physical controls), it will be shown as not implemented or partial here until evidence is added to the repo.

## Summary (Repo-Only Evidence Audit)

| Metric | Value |
|--------|-------|
| Assessed Controls | 5 |
| Implemented | 0 |
| Partial | 5 |
| Not Implemented | 0 |
| **Evidence Rating** | **Moderate (partial coverage only)** |

## Evidence Coverage by Domain

| Domain | Assessed Controls | Status |
|--------|-------------------|--------|
| Organizational Controls | 0 | Not assessed |
| People Controls | 0 | Not assessed |
| Physical Controls | 0 | Not assessed |
| Technological Controls | 5 | Partial |

## Priority Findings

| Control | Name | Priority | Status |
|---------|------|----------|--------|
| A.6.5 | Responsibilities after termination | High | Not implemented |
| A.7.1 | Physical security perimeters | High | Not implemented |
| A.8.24 | Use of cryptography | Critical | Not implemented |
| A.8.25 | Secure development lifecycle | High | Not implemented |
| A.8.28 | Secure coding | High | Not implemented |

## Gap Analysis & Remediation

### A.8.24: Use of cryptography

- **Priority:** Critical
- **Current Status:** Not implemented
- **Remediation:** Enforce TLS 1.3 for transit, AES-256 for data at rest
- **Timeline:** 30 days

### A.6.5: Responsibilities after termination

- **Priority:** High
- **Current Status:** Not implemented
- **Remediation:** Implement control per ISO 27001 requirements
- **Timeline:** 90 days

### A.7.1: Physical security perimeters

- **Priority:** High
- **Current Status:** Not implemented
- **Remediation:** Implement control per ISO 27001 requirements
- **Timeline:** 90 days

### A.8.25: Secure development lifecycle

- **Priority:** High
- **Current Status:** Not implemented
- **Remediation:** Implement control per ISO 27001 requirements
- **Timeline:** 90 days

### A.8.28: Secure coding

- **Priority:** High
- **Current Status:** Not implemented
- **Remediation:** Implement control per ISO 27001 requirements
- **Timeline:** 90 days

## Codebase Analysis (Evidence and Gaps)

### Cryptography (A.8.24)

**Evidence**
- HSTS header enforced at the app config edge layer: [next.config.ts](next.config.ts#L29-L58)
- Field-level encryption middleware for sensitive data writes: [src/server/security/data-protection/encryption-middleware.ts](src/server/security/data-protection/encryption-middleware.ts#L51-L93)
- Security defaults require PII encryption: [src/server/security/security-configuration-provider.defaults.ts](src/server/security/security-configuration-provider.defaults.ts#L29-L32)
- Auth token encryption enabled in configuration: [src/server/lib/auth-config.ts](src/server/lib/auth-config.ts#L41-L44)
- Backup runbook calls for encrypted backups at rest: [docs/runbooks/database-backups.md](docs/runbooks/database-backups.md#L33-L36)

**Gaps**
- Cryptography control explicitly marked as missing with outstanding TLS 1.3 and AES-256 enforcement requirements: [docs/gaps/critical/iso27001/a-8-24-use-of-cryptography.md](docs/gaps/critical/iso27001/a-8-24-use-of-cryptography.md#L5-L35)
- Key rotation and approved crypto standards are not documented: [docs/gaps/27janAudit/detailed-findings.md](docs/gaps/27janAudit/detailed-findings.md#L45-L58)
- Gap remediation milestone still lists TLS 1.3 and AES-256 enforcement as pending: [docs/iso27001/gap-remediation-milestones.md](docs/iso27001/gap-remediation-milestones.md#L5-L11)

### Secure Development Lifecycle and Secure Coding (A.8.25, A.8.28)

**Evidence**
- Linting and typecheck commands are defined in scripts: [package.json](package.json#L5-L25)
- Secure SDLC ownership and required checks are documented: [docs/iso27001/maintenance-plan.md](docs/iso27001/maintenance-plan.md#L7-L33)
- CI/CD control mapping expects typecheck and lint evidence: [docs/iso27001/cicd-control-mapping.md](docs/iso27001/cicd-control-mapping.md#L3-L11)
- Secure coding boundary rules are documented for engineering: [.github/copilot-instructions.md](.github/copilot-instructions.md#L19-L33)
- Security review checklist exists for code reviews: [.github/skills/code-review-checklist/SKILL.md](.github/skills/code-review-checklist/SKILL.md#L10-L26)

**Gaps**
- A.8.25 and A.8.28 are still marked as not implemented in this report (see Priority Findings section above).
- Secure SDLC and secure coding procedures are explicitly called out as missing: [docs/iso-27001-compliance-audit.md](docs/iso-27001-compliance-audit.md#L51-L125)
- CI/CD mapping expects dependency audit and SAST, but no scripts are defined: [docs/iso27001/cicd-control-mapping.md](docs/iso27001/cicd-control-mapping.md#L6-L9), [package.json](package.json#L5-L25)

### Logging and Monitoring (A.8.15, A.8.16)

**Evidence**
- Structured logging with tenant and correlation IDs: [src/server/logging/structured-logger.ts](src/server/logging/structured-logger.ts#L11-L123)
- Audit logging with residency and classification metadata: [src/server/logging/audit-logger.ts](src/server/logging/audit-logger.ts#L7-L94)
- Audit log repository enforces tenant scoping and retention deletes: [src/server/repositories/prisma/records/audit/prisma-audit-log-repository.ts](src/server/repositories/prisma/records/audit/prisma-audit-log-repository.ts#L79-L137)
- OpenTelemetry tracing configuration present: [src/server/telemetry/otel-config.ts](src/server/telemetry/otel-config.ts#L3-L70)
- Logging and telemetry setup documented: [docs/structured-logging-setup.md](docs/structured-logging-setup.md#L1-L134)

**Gaps**
- Audit retention use cases are stubs without implementation: [src/server/use-cases/records/audit/delete-audit-by-retention.ts](src/server/use-cases/records/audit/delete-audit-by-retention.ts#L1), [src/server/use-cases/records/audit/delete-audit-log.ts](src/server/use-cases/records/audit/delete-audit-log.ts#L1), [src/server/use-cases/records/audit/record-audit-event.ts](src/server/use-cases/records/audit/record-audit-event.ts#L1)
- Logger configuration does not define sinks/retention/rotation in code: [src/server/logging/structured-logger.ts](src/server/logging/structured-logger.ts#L11-L16)
- Telemetry wiring is tracing-only with no metrics/log exporter shown here: [src/server/telemetry/otel-config.ts](src/server/telemetry/otel-config.ts#L61-L69)
- Documentation lacks retention periods and monitoring cadence: [docs/structured-logging-setup.md](docs/structured-logging-setup.md#L1-L134)
