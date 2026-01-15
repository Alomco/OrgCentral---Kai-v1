# Tenant Guard Coverage Plan

Purpose: ensure every tenant-scoped operation enforces organization access, propagates residency/classification, and preserves auditability.

## Guard primitives
- Core guard and ABAC wrapper live in [src/server/security/guards/core.ts](src/server/security/guards/core.ts).
- Service helpers (org/HR) already funnel through the ABAC guard in [src/server/services/org/abstract-org-service.ts](src/server/services/org/abstract-org-service.ts) and [src/server/services/hr/abstract-hr-service.ts](src/server/services/hr/abstract-hr-service.ts).
- Platform notifications inject the guard at the service boundary in [src/server/services/platform/notifications/notification-composer.service.ts](src/server/services/platform/notifications/notification-composer.service.ts).
- `withOrgContext` exists but is unused; prefer it for small handlers to prevent duplicate guard wiring.

## Coverage expectations
- Every service entrypoint that accepts `RepositoryAuthorizationContext` must call the guard before data access or cache registration.
- ABAC is required when the action depends on attributes such as `resourceAttributes.targetUserId`, department, or document ownership.
- Always propagate `dataResidency` and `dataClassification` from the guard context to downstream repository calls and cache tags.
- Use `expectedResidency` / `expectedClassification` when the caller knows the required level (e.g., exports, reporting jobs).
- Cache writes must be disabled for dataClassification values other than `OFFICIAL` per centralized caching rules.
- Audit events must include orgId, userId, correlationId, residency, classification, and auditSource.

## Audit steps (static)
- Enumerate service entrypoints under `src/server/services/**` that consume tenant data, including platform, org, HR, auth, billing, documents, and notifications.
- For each entrypoint, confirm a single guard call (prefer `assertOrgAccessWithAbac`) is executed before repository calls or cache registration.
- Verify expected ABAC attributes per action: notifications use target user/topic; HR features should pass person/department identifiers; documents should pass owner/team/visibility.
- Ensure `expectedResidency` and `expectedClassification` are set when crossing storage domains (exports, archives, backups).
- Confirm downstream repository helpers use `RepositoryAuthorizer.assertTenantRecord` for entity-scoped reads.
- Document any gaps and add targeted tasks: missing guard calls, missing ABAC attributes, missing residency/classification expectations, missing audit fields.

## Near-term remediation targets
- Wire guard usage across remaining services not built on `AbstractOrgService` / `AbstractHrService` (auth flows, billing, documents, search, integrations).
- Add a lightweight helper that wraps `withOrgContext` for handlers that only need context transformation.
- Create a lint/boundary check to forbid repository usage without prior guard invocation in tenant-facing modules.
- Expand tests to assert guard invocation for critical routes (notifications, HR mutations, document writes, billing ops).

## Completion criteria for this todo
- Coverage inventory produced for all tenant-facing services.
- Gaps tracked as follow-up tasks (missing guards, ABAC attributes, residency/classification expectations, audit propagation).
- Guard helper/utilities available for simple handlers to reduce bypass risk.
