# Gap: A.8.8 Management of technical vulnerabilities

Source: iso27001-gap-analysis.md (Generated 2026-02-11)

## Status
- Priority: Critical
- Current status: Not implemented
- Target date: 2026-03-13

## Risk
- Unpatched vulnerabilities increase breach risk and downtime exposure.

## Remediation plan
- Implement authenticated vulnerability scanning for servers and critical services.
- Define a 30-day remediation SLA for critical and high findings.
- Track exceptions with owner and compensating controls.
- Report closure rate monthly.

## Owner
- Security Lead (role owner), Platform Engineering (implementation)

## Fix locations
- Add vulnerability scanning and dependency audit scripts in [package.json](package.json#L5-L25)
- Add vulnerability management configuration (scan cadence, SLA thresholds) in [src/server/security/security-configuration-provider.ts](src/server/security/security-configuration-provider.ts#L1-L80)
- Define defaults for vulnerability management settings in [src/server/security/security-configuration-provider.defaults.ts](src/server/security/security-configuration-provider.defaults.ts#L14-L62)

## Evidence
- 2026-02-11 - Package scripts include linting and checks but no vulnerability scan or dependency audit commands, indicating no automated vulnerability management in repo configuration. See [package.json](package.json#L5-L25)
- 2026-02-11 - Security configuration defaults do not include vulnerability management controls or scan scheduling settings. See [src/server/security/security-configuration-provider.defaults.ts](src/server/security/security-configuration-provider.defaults.ts#L14-L62)
- 2026-02-11 - Control mapping references dependency audit and SAST scan coverage for A.8.8: [docs/iso27001/cicd-control-mapping.md](docs/iso27001/cicd-control-mapping.md)
- 2026-02-11 - Maintenance expectations include scan results and patch SLA metrics for A.8 controls: [docs/iso27001/a5-a8-control-maintenance.md](docs/iso27001/a5-a8-control-maintenance.md)
- 2026-02-11 - Continuous compliance cadence includes vulnerability finding review: [docs/iso27001/continuous-compliance-plan.md](docs/iso27001/continuous-compliance-plan.md)
- 2026-02-11 - Pending: Authenticated vulnerability scan report for servers and critical services; store at evidence/iso27001/a-8-8/vuln-scan-report-YYYY-MM-DD.md
- 2026-02-11 - Pending: Remediation tickets with timestamps and SLA tracking; store at evidence/iso27001/a-8-8/remediation-tickets-YYYY-MM-DD.md
- 2026-02-11 - Pending: Exception register with owners and compensating controls; store at evidence/iso27001/a-8-8/exception-register-YYYY-MM-DD.md

## Verification
- Run: python .github/skills/information-security-manager-iso27001/scripts/compliance_checker.py --standard iso27001 --output evidence/iso27001/a-8-8-compliance.md
