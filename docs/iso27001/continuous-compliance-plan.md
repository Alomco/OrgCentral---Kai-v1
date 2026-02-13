# ISO 27001 Continuous Compliance Plan

## Monthly checks
- Run compliance checker and archive report.
- Verify endpoint protection coverage.
- Review open vulnerability findings and SLA adherence.

## Quarterly checks
- Run gap analysis and update SoA status.
- Update risk register for new assets or changes.
- Review access logs and privileged access list.

## Audit preparation
- Stage 1: ensure policy, scope, risk assessment, and SoA are current.
- Stage 2: ensure controls are operational with evidence of effectiveness.

## Evidence storage
- Primary location: docs/evidence/iso27001 (planned).
- Evidence types: reports, screenshots, tickets, meeting minutes.

## Tooling
- python .github/skills/information-security-manager-iso27001/scripts/compliance_checker.py --standard iso27001
- python .github/skills/information-security-manager-iso27001/scripts/risk_assessment.py --scope "orgcentral"
