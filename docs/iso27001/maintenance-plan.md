# ISO 27001 Maintenance Plan

## Scope
- ISMS scope: OrgCentral application, infrastructure, and supporting operational processes.
- Out of scope: third-party systems not owned or managed by OrgCentral.

## Roles
| Role | Responsibilities |
| --- | --- |
| Security Lead | ISMS owner, control oversight, audit coordination |
| Platform Engineering | Technical controls, patching, infra hardening |
| Engineering Managers | Secure SDLC, code review enforcement |
| IT Ops | Endpoint protection, access provisioning |
| HR | Training records, onboarding/offboarding |

## Cadence
| Activity | Frequency |
| --- | --- |
| Compliance check | Monthly |
| Gap analysis | Quarterly |
| Risk assessment update | Quarterly or on major change |
| Internal audit | Semi-annual |
| Management review | Annual |

## Evidence
- Store evidence in a centralized location (planned: docs/evidence/iso27001).
- Retain for minimum 3 years or per contractual requirements.

## Tooling
- Compliance check: python .github/skills/information-security-manager-iso27001/scripts/compliance_checker.py --standard iso27001
- Risk assessment: python .github/skills/information-security-manager-iso27001/scripts/risk_assessment.py --scope "orgcentral"
- CI checks: npx tsc --noEmit, pnpm lint --fix

## Metrics
- Compliance score per domain
- Patch SLA adherence
- Training completion rate
- Audit finding closure rate
