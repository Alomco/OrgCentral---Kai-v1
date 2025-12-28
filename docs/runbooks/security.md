# Security Runbook — Server Layer Review (Updated 2025-12-18)

## Scope
- Reviewed `src/server` subfolders (`lib`, `logging`, `repositories`, `services`, `telemetry`, `types`).
- Cross-referenced requirements in `old/docs/requirements/02-security-and-compliance.md`, `04-delivery-guardrails.md`, and the Security Expert brief.

## Key Findings
| # | Area | Risk | Evidence | Required Action |
|---|------|------|----------|-----------------|
| 1 | Guard Helpers | **Resolved** — `src/server/security/guards.ts` exists and is used by `getSessionContext`/`authAction`/`withRepositoryAuthorization` to enforce zero-trust tenant checks (orgId/residency/classification) and ABAC via `assertOrgAccessWithAbac`. HR adapters/actions use centralized `HR_RESOURCE`/`HR_ACTION` constants so ABAC receives resource attributes. | `src/server/security/guards.ts`, `src/server/security/authorization/hr-resource-registry.ts`, HR adapters wired to registry constants. | Keep new endpoints/actions behind guard utilities; add regression tests for new modules to prevent raw Prisma access. |
| 2 | Permission Enforcement | **Resolved** — ABAC evaluation runs through `AbacService` (normalized policies, priority-first evaluation with first matching policy deciding, bootstrap policies). Policy CRUD use-cases are implemented; HR adapters supply action/resource/attributes into ABAC. | `src/server/security/abac.ts`, `src/server/security/abac-policy-normalizer.ts`, `src/server/use-cases/org/abac/*.ts`, HR adapters wired to registry constants. | Continue migrating any remaining modules (e.g., contracts/people controllers) to registry constants and ensure `assertOrgAccessWithAbac` precedes repository calls. |
| 3 | Residency & Classification Metadata | **High** — Repositories and domain types only track `orgId`; no `dataResidency`, `classification`, or `auditBatchId` fields despite mandate. | `src/server/types/leave-types.ts`, `repositories/contracts/*`. | Extend contracts/entities to require `{ orgId, residency, classification, auditSource }`, update Prisma schema/mappers, and backfill data with CSFLE annotations. |
| 4 | Cache Policy | **High** — `lib/cache-tags.ts` builds tags as `org:${orgId}:${scope}` with no sensitivity tier or TTL override, so sensitive tag invalidations can leak across tenancy tiers. | `src/server/lib/cache-tags.ts`. | Adopt format like ``org:${orgId}:${classification}:${residency}:${scope}``, pair with `cacheLife('seconds', 30)` for private scopes, and document cache tag helpers next to guard usage. |
| 5 | Audit Spine Coverage | **Medium** — `recordAuditEvent` writes minimal fields and omits correlation IDs, residency markers, and immutability flags; Prisma model still allows deletes/updates. | `src/server/logging/audit-logger.ts`. | Update audit schema + helper to include correlationId, residencyZone, classification, and `deletedAt` guard; back all writes with OTEL span ids. |
| 6 | Direct Prisma Access in Services | **Medium** — Auth modules call `prisma` directly without guard helpers or tenancy assertions; risk of cross-org data writes. | `services/auth/modules/accept-invitation.ts` uses `prisma.user` and `prisma.membership` without verifying `orgId` from guard context. | Refactor services to inject repositories that enforce tenant filters and require guard context before hitting Prisma. |
| 7 | MCP Diagnostics | **Info** — Unable to annotate MCP diagnostics because dev server with `_next/mcp` endpoint is not running in this workspace session. | Attempted to locate runtime tooling; none available. | Start Next.js dev server and capture `_next/mcp` diagnostics next pass to attach telemetry evidence. |

## Immediate Remediation Checklist (include tenant guard + cache tag guidance)
1. **Reinstate Tenant Guards**
   - Ensure all entry points use `assertOrgAccessWithAbac` via `getSessionContext` / `authAction` / `withRepositoryAuthorization`.
   - Require every service/action to call the guard before hitting repositories; fail if guard context is missing.
2. **Enhance Cache Tags**
   - Replace `buildOrgCacheTag(orgId, scope)` with ``buildCacheTag({ orgId, scope, classification, residency })`` and emit tags such as ``org:${orgId}:pii:uk-south:leave-requests``.
   - For sensitive data, wrap server actions with `cacheLife('seconds', 30)` and `cacheTag(cacheTagValue)` while marking responses `cache: 'no-store'` on mutation endpoints.
3. **Propagate Metadata**
   - Update all repository contracts and Prisma entities to persist `orgId`, `dataResidency`, `classification`, `auditSource`, and `correlationId`.
   - Ensure `recordAuditEvent` and OTEL spans include the same identifiers for traceability.
4. **Permission Logic**
   - Implement Better Auth-backed RBAC lookups where raw Prisma access remains; cache short-lived entitlements per tenant.
   - Add unit tests that simulate users lacking roles to prevent regressions.
5. **MCP Follow-Up**
   - Once the dev server is running, capture `_next/mcp` + `next:diagnostics` output and attach excerpts here for historical trace.

## Notes
- Cache tag + guard requirements are flagged; merges should show usage snippets.
- Authorization decisions must rely on RBAC roles and ABAC policies stored in the database, not on membership metadata flags.
- No MCP diagnostics available in this session; annotate once server runtime is active.
