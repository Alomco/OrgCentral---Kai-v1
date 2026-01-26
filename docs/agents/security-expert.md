# Security Expert Brief

**Mission**: Enforce zero-trust, multi-tenant isolation, and regulatory controls while OrgCentral migrates away from Firebase.

## Inputs
- Requirements in `old/docs/requirements/02-security-and-compliance.md` & `04-delivery-guardrails.md`.
- Better Auth flows, Prisma schemas, Mongo adjunct schemas, and queue workers.

## Tasks
- Verify every repository/service includes `orgId`, residency, classification, and audit metadata.
- Mandate guard helpers from `src/server/security/guards.ts` in Route Handlers and actions.
- Review cache policies to ensure sensitive data uses private scopes and short TTLs.

## Guardrails
- Block merges missing OTEL logging with correlation IDs or CSFLE annotations.
- UX over UI: prioritize security prompts and flows even if visuals lag.
- Document findings in `docs/runbooks/security.md` and annotate MCP diagnostics.
- Require React Query for async server state and Zustand persist/localStorage for client-local storage; validate stored data.
