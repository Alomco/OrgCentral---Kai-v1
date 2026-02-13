# Gap: A.8.24 Use of cryptography

Source: iso27001-gap-analysis.md (Generated 2026-02-11)

## Status
- Priority: Critical
- Current status: Not implemented
- Target date: 2026-03-13

## Risk
- Weak or inconsistent cryptography can expose sensitive data in transit or at rest.

## Remediation plan
- Enforce TLS 1.3 for external services and internal service-to-service traffic.
- Enforce AES-256 for data at rest with managed key rotation.
- Document approved algorithms and key management procedures.
- Add periodic crypto configuration reviews.

## Owner
- Security Lead (role owner), Platform Engineering (implementation)

## Fix locations
- Ensure encryption is applied to sensitive fields via middleware wiring in [src/server/security/data-protection/encryption-middleware.ts](src/server/security/data-protection/encryption-middleware.ts#L51-L93)
- Centralize encryption requirement flags and defaults in [src/server/security/security-configuration-provider.defaults.ts](src/server/security/security-configuration-provider.defaults.ts#L29-L32)
- Review TLS/HSTS related headers and deployment requirements in [next.config.ts](next.config.ts#L29-L58)

## Evidence
- 2026-02-11: Encryption middleware implementation for sensitive data at rest in [src/server/security/data-protection/encryption-middleware.ts](src/server/security/data-protection/encryption-middleware.ts#L51-L93)
- 2026-02-11: Default security configuration requires PII encryption, indicating intent but not enforcement details. See [src/server/security/security-configuration-provider.defaults.ts](src/server/security/security-configuration-provider.defaults.ts#L29-L32)
- 2026-02-11: HSTS header configured at app level (HTTPS enforcement), but TLS version enforcement is not specified in code. See [next.config.ts](next.config.ts#L29-L58)
- 2026-02-11: ISO 27001 CI/CD control mapping documents planned TLS config scan evidence in [docs/iso27001/cicd-control-mapping.md](docs/iso27001/cicd-control-mapping.md)
- 2026-02-11: ISO 27001 audit report notes encryption middleware for data at rest in [docs/audit-report.md](docs/audit-report.md)
- Pending (2026-02-11): TLS configuration scan report showing TLS 1.3 enforcement. Store at evidence/iso27001/a-8-24/tls-config-scan-2026-02-11.md
- Pending (2026-02-11): KMS policy export and key rotation logs demonstrating AES-256 at rest. Store at evidence/iso27001/a-8-24/kms-policy-rotation-2026-02-11.md
- Pending (2026-02-11): Approved cryptography standards document listing allowed algorithms and key management. Store at evidence/iso27001/a-8-24/approved-crypto-standards-2026-02-11.md

## Verification
- Run: python .github/skills/information-security-manager-iso27001/scripts/compliance_checker.py --standard iso27001 --output evidence/iso27001/a-8-24-compliance.md
