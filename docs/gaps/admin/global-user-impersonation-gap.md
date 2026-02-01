# Gap: Global user impersonation

## Legacy reference (old project)
- old/src/app/(app)/admin/global/page.tsx (User Impersonation card)

## New project status (orgcentral)
- No impersonation UI or guardrail flow under orgcentral/src/app

## Scope notes
- Platform/global support tool (not org admin).
- Requires audited, time-boxed access with approvals and MFA checks.

## Status (as of 2026-02-01)
- ❌ Not started — no impersonation UI or session tooling in orgcentral.

## Impact
- Support teams cannot troubleshoot user sessions safely.

## TODO
- [ ] Define impersonation policy (roles, approvals, duration, logging).
- [ ] Implement impersonation session issuance with time-boxed tokens and audit logging.
- [ ] Build impersonation UI with reason capture, approvals, and stop controls.
- [ ] Add guardrails (MFA checks, IP allowlists, break-glass alerts).
- [ ] Add tests for access control and revocation.
