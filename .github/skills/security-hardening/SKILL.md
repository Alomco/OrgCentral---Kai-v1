---
name: security-hardening
description: Security hardening patterns for application code and APIs. Use for threat reduction, secure defaults, access control, input validation, secret handling, and audit-safe practices.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
---

# Security Hardening

## Purpose

Reduce attack surface and enforce secure-by-default implementation patterns.

## When To Use

- Reviewing or implementing authentication and authorization.
- Hardening API inputs, outputs, and data access paths.
- Enforcing tenant isolation and data classification rules.
- Adding controls for sensitive operations and audit events.

## Hardening Controls

1. Validate and normalize all untrusted input at boundaries.
2. Enforce explicit authorization checks before every protected action.
3. Use allowlists for scoped queries and resource selectors.
4. Avoid secret/PII leakage in logs, errors, and snapshots.
5. Prefer least-privilege service/repository operations.
6. Use safe defaults (`no-store` for sensitive/non-official data).
7. Include tamper-evident audit events for privileged flows.

## Review Checklist

- No trust in client-provided identifiers without server checks.
- No implicit broad query scopes (missing `orgId` filters).
- Error messages do not expose internals or secrets.
- Security-relevant events are logged with minimal disclosure.
- Sensitive mutations have rollback/failure-safe behavior.

## Verification

```bash
python .github/skills/vulnerability-scanner/scripts/security_scan.py .
npx tsc --noEmit
pnpm lint --fix
```
