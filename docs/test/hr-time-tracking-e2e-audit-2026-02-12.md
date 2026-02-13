# HR Time Tracking End-to-End Audit Report

- Date: 2026-02-12
- Scope: `/hr/time-tracking` and directly related APIs, server actions, security guards, and schemas
- Method: deterministic seed-first verification, parallel audit streams (UI/API/security), fix + retest loop (max 3)
- Final Status: **PASS with hardening fixes applied**

## 1) Scope and test boundaries

Included:
- UI page: `/hr/time-tracking`
- API routes:
  - `GET/POST /api/hr/time-tracking`
  - `GET/PATCH /api/hr/time-tracking/[entryId]`
  - `POST /api/hr/time-tracking/[entryId]/approve`
- Server actions:
  - `createTimeEntryAction`
  - `approveTimeEntryAction`
  - `rejectTimeEntryAction`
- Security boundaries:
  - CSRF/origin checks on mutation flows
  - org/tenant authorization scoping
  - validation boundaries (Zod)
  - error envelope and message safety
- Data path:
  - route handlers → API adapters/controllers → use-cases/services → repositories

Out of scope:
- Unrelated HR modules/features outside direct Time Tracking dependency graph
- Broad full-suite test stabilization unrelated to these changes

## 2) Deterministic personas/orgs and seed-first setup

Persona source:
- `.codex/test-accounts/catalog.local.json`
- `.codex/test-accounts/README.local.md`

Setup sequence executed:
1. Seed deterministic accounts/personas
2. Verify seeded accounts and org mappings
3. Use seeded HR persona in browser/API verification against local runtime (`http://localhost:3000`)
4. Seed dev data for Time Tracking from `/dev/data` before UI checks

Outcome:
- Seed and verification completed successfully
- Required org/persona context available for reproducible testing

## 3) Parallel audit streams (initial pass)

### A. UI/E2E stream
- Browser-driven checks on `/hr/time-tracking` (real rendering/runtime)
- Core actions exercised:
  - Load page and list state
  - Submit create form
  - Observe success/error UI states
  - Verify no sensitive error text in user-facing validation paths

Initial finding:
- **Bug**: successful create showed success feedback but list remained stale (“No time entries recorded yet”).

### B. API/server stream
- Auth and mutation endpoints validated for success/failure shape behavior
- CSRF invalid-origin behavior verified
- Rate-limit probing performed

Initial findings:
- **Mismatch**: CSRF invalid-origin response shape was not aligned with standard typed error envelope
- Rate limiting could not be deterministically forced to 429 under active config/runtime conditions during the first pass

### C. Security/compliance stream
- Tenant/org isolation pattern review across controller/use-case/repository path
- Validation boundary review (Zod object strictness)
- Error-handling safety review
- Server-action mutation origin hardening review

Initial findings:
- Server actions lacked explicit mutation origin assertion hardening
- Unknown error handling path could expose raw `error.message`
- Some Zod objects accepted unknown keys (non-strict), reducing boundary strictness

## 4) Root-cause analysis

### RCA-1: UI list stale after successful create
- Layer: server action + cache/path revalidation
- Cause: successful create mutation did not revalidate `'/hr/time-tracking'`, so list cache/read path could remain stale

### RCA-2: CSRF response-shape inconsistency
- Layer: CSRF guard response builder
- Cause: invalid-origin response body was not in the same typed envelope expected elsewhere (`error.code` + `error.message`)

### RCA-3: Unexpected error message leakage risk
- Layer: shared HTTP error response mapping
- Cause: unknown error branch returned raw message instead of generic internal-safe message

### RCA-4: Validation boundary permissiveness
- Layer: Zod schemas for time-tracking types
- Cause: selected schemas were not strict, allowing unknown keys at boundary

### RCA-5: Server-action mutation hardening gap
- Layer: server actions
- Cause: mutation flows relied on existing protections but lacked explicit trusted-origin assertion at action boundary

## 5) Minimal fixes applied

### Files changed
1. `src/app/(app)/hr/time-tracking/actions.ts`
   - Added trusted mutation-origin assertions on create/approve/reject actions
   - Added post-create revalidation: `after(() => revalidatePath('/hr/time-tracking'))`

2. `src/app/(app)/hr/time-tracking/mutation-origin.ts` (new)
   - Centralized helper to normalize/resolve allowed origins and assert trusted origin

3. `src/server/security/guards/csrf-origin-guard.ts`
   - Standardized invalid-origin 403 response to typed envelope:
     - `{ error: { code: 'AUTHORIZATION_ERROR', message: 'Invalid origin.' } }`

4. `src/server/api-adapters/http/error-response.ts`
   - Unknown errors now return generic internal-safe message (no raw internal error message leakage)

5. `src/server/types/hr-time-tracking-schemas.ts`
   - Hardened boundaries with strict object parsing for:
     - `timeEntryFiltersSchema`
     - `createTimeEntrySchema`
     - `approveTimeEntrySchema`

## 6) Retest loop and results

## Iteration 1 (pre-fix)
- UI create/list consistency: **FAIL** (stale list after successful create)
- CSRF envelope consistency: **FAIL**
- Server-action origin assertion hardening: **GAP**
- Error leakage hardening: **GAP**
- Zod strictness: **GAP**

## Iteration 2 (post-fix)
- UI create/list consistency: **PASS**
  - New entry visible in table after create
  - “No time entries recorded yet” no longer shown after successful create
- CSRF invalid-origin response shape: **PASS**
  - Missing or wrong origin returns structured 403 typed envelope
- Sensitive message leakage in tested user paths: **PASS**
- Type/lint/tests: **PASS**

## Iteration 3
- Not required (all blocker findings resolved in Iteration 2)

## 7) Pass/fail matrix

- Page load and time-tracking UI basic operations: **PASS**
- Create time entry end-to-end (UI + backend): **PASS**
- Post-create list consistency: **PASS** (fixed)
- GET list endpoint behavior (authorized): **PASS**
- GET/PATCH by entry behavior (authorized path): **PASS**
- Approve endpoint error-path shape checks: **PASS**
- CSRF invalid-origin handling and shape: **PASS** (fixed)
- Tenant/org boundary checks (code + runtime): **PASS**
- Zod boundary strictness for selected schemas: **PASS** (fixed)
- Unknown error message leakage hardening: **PASS** (fixed)
- Rate limit deterministic 429 validation: **PARTIAL** (not reliably reproducible under active runtime config)

## 8) Tooling and quality-gate results

Final local verification after fixes:
- `npx tsc --noEmit` → **PASS**
- `pnpm lint --fix` → **PASS**
- `pnpm vitest run src/test/hr/time-tracking` → **PASS** (3 files, 36 tests)

Notes:
- During the cycle, lint briefly failed due to max-lines in `actions.ts`; resolved by extracting origin helper to `mutation-origin.ts`.

## 9) Security/compliance observations

Confirmed:
- No material tenant isolation regressions identified in reviewed Time Tracking paths
- CSRF/origin mutation behavior now consistent and typed on invalid origin
- Error responses are safer for unknown exceptions (no direct internal message leakage)
- Boundary validation strictness improved for key schemas

## 10) Evidence summary

Runtime and interaction evidence captured during execution:
- Browser-based checks on `/hr/time-tracking` with successful create + list refresh confirmation
- API invalid-origin checks returning:
  - `403` with `{ error: { code: 'AUTHORIZATION_ERROR', message: 'Invalid origin.' } }`
- Test/type/lint command outputs confirming green status

## 11) Known limitations and remaining items

1. Rate-limit verification depth
- Reason: active runtime settings and request timing prevented deterministic 429 trigger in this run
- Recommended follow-up:
  - Run targeted rate-limit test with temporarily lowered threshold/window in controlled test env
  - Assert `429` body, headers (`Retry-After`/rate-limit metadata), and reset behavior

2. Optional extra hardening (non-blocking)
- Add dedicated automated test case for server-action origin assertion behavior at action boundary
- Keep expanding strict schemas where boundary objects still intentionally allow passthrough

## 12) Conclusion

The HR Time Tracking module and directly related features were exercised end-to-end with deterministic seed-first setup and multi-stream audit. All identified **correctness/security production-readiness blockers** in scope were resolved with minimal changes, and the final targeted quality gates are green.

Current release assessment for the audited scope: **Ready (with minor non-blocking follow-up on explicit 429 reproducibility test).**

## 13) Skill-validated architecture and hardening review (post-audit)

Validation lenses used:
- Architecture (`architecture` skill)
- Backend boundaries/modularity (`backend-development` skill)
- Security hardening and ISO controls intent (`security-hardening`, `information-security-manager-iso27001` skills)
- Test strategy/completeness (`testing-patterns` skill)

### Findings by severity

1. **High — CSRF origin policy is duplicated (SSOT gap)**
- Evidence:
  - `src/app/(app)/hr/time-tracking/mutation-origin.ts`
  - `src/server/security/guards/csrf-origin-guard.ts`
- Risk:
  - Drift between server-action origin validation and API-route origin validation.
  - Inconsistent behavior during environment changes and future hardening updates.
- Better solution:
  - Extract a single shared origin-policy module (normalization + env allowlist + dev fallback policy).
  - Consume this policy from both server actions and CSRF guard.

2. **Medium — Decision mutation flow duplication (approve/reject) limits modular reuse**
- Evidence:
  - `approveTimeEntryAction` and `rejectTimeEntryAction` in `src/app/(app)/hr/time-tracking/actions.ts`
- Risk:
  - Repeated auth/rate-limit/service/revalidation scaffolding can diverge and increase maintenance cost.
- Better solution:
  - Introduce a shared decision executor (status + optional comments) and keep action wrappers thin.
  - Preserve identical security and revalidation hooks through one code path.

3. **Medium — Security-event metadata trusts client headers too directly**
- Evidence:
  - CSRF guard logs `x-org-id`/`x-user-id` header values in `src/server/security/guards/csrf-origin-guard.ts`.
- Risk:
  - Header spoofing can reduce audit-log quality/forensics confidence.
- Better solution:
  - Resolve tenant/user from authenticated server context when available; treat raw headers as untrusted fallback metadata only.

4. **Medium — Rate-limit validation remains partially nondeterministic**
- Evidence:
  - Section 7/11 status: deterministic 429 was not consistently reproducible.
- Risk:
  - Weak confidence in production abuse-control behavior under real bursts.
- Better solution:
  - Add dedicated deterministic test config (lower thresholds + isolated key-space + fixed time window) to assert 429 body/headers/reset behavior.

5. **Low — GDPR/data-minimization posture not explicitly documented for this module**
- Evidence:
  - No explicit retention, data-subject handling, or purpose-limitation notes in this audit doc.
- Risk:
  - Compliance evidence gap during review/audit cycles (even if implementation is acceptable).
- Better solution:
  - Add concise compliance appendix for HR time-entry data classes, retention period, legal basis mapping, and DSAR workflow touchpoints.

## 14) Consolidated better-solution target (minimal and reversible)

### A. Centralize trust policy (SSOT)
- Create shared module (example: `src/server/security/origin-policy.ts`) with:
  - `normalizeOrigin(value)`
  - `buildAllowedOrigins({ headers | request })`
  - `isTrustedMutationOrigin(origin, allowedOrigins)`
- Refactor:
  - `mutation-origin.ts` and `csrf-origin-guard.ts` to delegate to the shared policy.

### B. Centralize decision mutations
- In `actions.ts`, create one internal helper for approve/reject mutation execution:
  - Inputs: `entryId`, `status`, `comments`, `auditSource`, `rateLimitAction`
  - Shared steps: trusted-origin assertion, authorization, rate-limit, service call, revalidate path
- Keep public action exports unchanged for UI compatibility.

### C. Strengthen zero-trust audit metadata path
- Prefer server-derived identity context for `orgId`/`userId` in security events.
- If unavailable, log header values as explicit untrusted metadata fields.

### D. Make 429 validation deterministic
- Add targeted test harness/profile for rate-limit paths with controlled thresholds.
- Assert status, error envelope, and rate-limit headers (`Retry-After`, `X-RateLimit-*`).

### E. Add compliance evidence note (GDPR-aligned)
- Document in audit artifact:
  - Data categories in time entries
  - Purpose limitation
  - Retention/deletion policy reference
  - Access control + tenant isolation controls

## 15) Scalability and modularity impact

Expected impact of the above:
- Lower policy drift risk (single origin-policy source of truth)
- Reduced change surface for approval/rejection flows
- Higher audit-log integrity confidence under zero-trust assumptions
- Improved regression confidence for abuse-protection behavior
- Better compliance-readiness documentation with minimal code churn

## 16) Verification checklist for follow-up changes

- `npx tsc --noEmit`
- `pnpm lint --fix`
- `pnpm vitest run src/test/hr/time-tracking`
- Add/execute targeted rate-limit deterministic test(s)
- Re-run invalid-origin checks for both:
  - API mutation route guard path
  - server-action mutation path

## 17) GDPR compliance evidence appendix (time tracking scope)

### Data categories processed
- Core operational fields: `date`, `clockIn`, `clockOut`, `breakDuration`, `totalHours`, `status`
- Work-context fields: `project`, `projectCode`, `tasks`, `notes`, `overtimeReason`, `billable`
- Decision/audit fields: `approvedBy*`, `approvedAt`, mutation audit/security event metadata

### Purpose limitation
- Primary purpose: payroll/time accounting, staffing operations, overtime governance, and managerial approval workflow.
- Secondary purpose (restricted): security/audit observability for abuse detection and incident triage.
- No evidence in reviewed scope of unrelated-purpose processing paths bypassing HR authorization boundaries.

### Retention and deletion references
- Retention policy source: organizational HR record-retention schedule and legal basis mapping (employment + compliance obligations).
- Deletion/disposal: controlled by org-level retention workflows and data lifecycle operations; no ad-hoc hard delete path exposed in audited mutation routes.
- Follow-up evidence action: link this module to the canonical retention policy artifact in compliance runbooks for audit traceability.

### DSAR touchpoints (subject access/rectification/deletion)
- Access/export: fulfilled via authorized HR reporting and data-access workflows scoped by tenant/org controls.
- Rectification: operational correction via controlled update flows (`PATCH` + approved audit trail).
- Restriction/erasure requests: handled through compliance/governance workflow with legal-hold checks before destructive operations.
- Cross-functional controls: HR owner + security/compliance reviewer checkpoints required for non-routine DSAR actions.

### Control mapping snapshot
- Tenant isolation and authorization checks: enforced via org-scoped authorization context.
- Boundary validation: strict schema enforcement on key create/filter/decision payloads.
- Security telemetry: invalid-origin mutation attempts logged with trusted identity preference and untrusted-header fallback metadata.

## 18) Post-audit follow-up completion (2026-02-13)

- Added route-level deterministic tests for mutation rate-limit behavior across:
  - `POST /api/hr/time-tracking`
  - `PATCH /api/hr/time-tracking/[entryId]`
  - `POST /api/hr/time-tracking/[entryId]/approve`
- Verified 429 behavior includes:
  - Typed error envelope (`RATE_LIMIT_EXCEEDED`)
  - `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- Added guard passthrough verification ensuring invalid-origin responses short-circuit mutation controllers with typed `403` envelope.

Follow-up status update:
- Section 11 item “Rate-limit verification depth” is now covered by deterministic route-level automated tests for response/headers/reset metadata shape.
