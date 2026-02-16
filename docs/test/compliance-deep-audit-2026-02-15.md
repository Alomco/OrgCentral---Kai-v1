# Deep Compliance & Related-Feature QA Audit

Date: 2026-02-15  
Scope: runtime + browser real-user flows + API error-path checks + auth/tenant boundary checks + test coverage gaps.

## Executive summary (pass/fail by area)

- Runtime discovery (routes/tools/logs): **PASS**
- Persona auth gates (ready, mfa-required, profile-required, suspended, no-membership): **PARTIAL FAIL**
- Compliance walkthrough (feature-by-feature): **PARTIAL FAIL**
- Related dependencies (policies/training/documents/reports/notifications/leave): **PARTIAL FAIL**
- API-level verification (compliance endpoints + negative paths): **PARTIAL FAIL**
- Security/compliance boundaries (least privilege/org scoping/auditability): **PARTIAL FAIL**
- Evidence completeness (screens + runtime errors + code-based specialist review): **PASS**

## Findings table

| Severity | Area | Repro | Expected | Actual | Evidence |
|---|---|---|---|---|---|
| High | Dynamic policy page runtime | Login as ready HR manager → open `/hr/policies/[policyId]` | Route renders without runtime errors | Next.js runtime error: synchronous access of promised params | Runtime stack points to `src/app/(app)/hr/policies/[policyId]/page.tsx:51`; Next.js MCP `get_errors` captured: `params.policyId` must be awaited |
| High | Auth model mismatch risk (UI vs API) | Compare page-level profiles vs API adapters for compliance routes | Equivalent least-privilege controls across UI and API | API adapters often use broader `organization/profile` permissions than page profiles | Specialist boundary review: compliance adapters under `src/server/api-adapters/hr/compliance/**` vs page profile usage in `src/app/(app)/hr/compliance/**` |
| High | ABAC/resource-key consistency risk | Inspect ABAC policy resource types vs adapter resourceType usage | Single canonical resource mapping | Mixed naming (`hr.compliance` vs more specific item/template/review resources) may cause allow/deny drift | `src/server/security/authorization/hr-permissions/resources.ts`, `src/server/security/authorization/hr-permissions/profiles.ts`, compliance adapters |
| Medium | Persona gate mismatch (profile setup) | Login with `org.alpha.member.profile.pending@agents.orgcentral.test` | Redirect to `/hr/profile` | Reached `/dashboard` in browser run | Browser flow evidence screenshot (see index) |
| Medium | Suspended-state UX/guard behavior ambiguity | Login with `org.beta.member.suspended@agents.orgcentral.test` | Explicit inactive/suspended guard outcome | Redirected to `/not-invited` (same UX as no-membership) | Browser flow evidence screenshot (see index) |
| Medium | Compliance list validation contract friction | GET `/api/hr/compliance/list` as authenticated HR user | Clear required query contract or safe default | 400 `VALIDATION_ERROR` (`userId` invalid UUID) without graceful default | API fetch evidence from browser session |
| Medium | Least-privilege verified denies (good but operationally impactful) | GET `/api/hr/documents`, `/api/hr/reports/export` as tested HR manager | Route-specific deny or allow per role model | 403 on both endpoints | API evidence: `AUTHORIZATION_ERROR` ABAC/RBAC deny responses |
| Low | Hydration mismatch noise on policy detail | Open `/hr/policies/[policyId]` in browser | No hydration warnings | Hydration mismatch appears alongside runtime errors | Browser console + Next.js MCP error output (also may be amplified by extension injection) |
| Low | Login/MFA setup UX friction | MFA-required persona to `/two-factor/setup` | Form semantics clean | Browser warns password field not contained in form | Browser console verbose message on `/two-factor/setup` |

## Screenshot list (with context)

- `AppData\\Local\\Temp\\playwright-mcp-output\\1771117006008\\page-2026-02-15T02-03-30-237Z.png` — Ready persona post-login dashboard.
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771117006008\\page-2026-02-15T02-05-22-662Z.png` — Compliance page baseline.
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771117006008\\page-2026-02-15T02-06-33-145Z.png` — Compliance interaction state (bulk/template actions).
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771117006008\\page-2026-02-15T05-59-47-152Z.png` — Policy detail route with runtime issue context.
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771135276645\\page-2026-02-15T06-03-10-408Z.png` — MFA-required persona redirected to setup.
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771135276645\\page-2026-02-15T06-03-52-690Z.png` — Profile-required persona landed on dashboard (mismatch).
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771135276645\\page-2026-02-15T06-04-40-184Z.png` — Suspended persona landed on not-invited.
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771135276645\\page-2026-02-15T06-05-17-330Z.png` — No-membership persona not-invited (expected).
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771135276645\\page-2026-02-15T06-23-46-840Z.png` — Documents route resulting in access denied.
- `AppData\\Local\\Temp\\playwright-mcp-output\\1771135276645\\page-2026-02-15T06-24-13-887Z.png` — Reports route resulting in access denied.

## Coverage gaps (tests missing)

Priority gaps from specialist analysis:

1. Missing compliance API route tests for assign/update/categories/review-queue negative and auth-paths:
   - `src/app/api/hr/compliance/assign/route.ts`
   - `src/app/api/hr/compliance/update/route.ts`
   - `src/app/api/hr/compliance/categories/route.ts`
   - `src/app/api/hr/compliance/review-queue/route.ts`
2. Missing use-case tests:
   - `src/server/use-cases/hr/compliance/update-compliance-item.ts`
   - `src/server/use-cases/hr/compliance/assign-compliance-items.ts`
   - `src/server/use-cases/hr/compliance/send-compliance-reminders.ts`
3. Existing integration TODOs still open in:
   - `test/integration/time-tracking-authorization.test.ts`
   - `test/integration/time-tracking-database-state.test.ts`
   - `test/integration/time-tracking-structured-logging.test.ts`
4. No active Playwright suite found for compliance E2E regression.

## Fix first (top 10)

1. Fix promised params usage in `src/app/(app)/hr/policies/[policyId]/page.tsx` (await params before property access).
2. Align compliance API authorization with same least-privilege profiles used by compliance UI pages.
3. Normalize ABAC resource identifiers for compliance across policies, resources, and adapters.
4. Verify and enforce profile-gate redirect logic for `profile_setup_required` persona state.
5. Differentiate suspended-membership UX from no-membership UX (distinct reason + support guidance).
6. Add explicit API contract docs/validation behavior for `/api/hr/compliance/list` required query inputs.
7. Add negative tests for compliance assign/update (invalid UUIDs, cross-user update without proper permission).
8. Add boundary tests for org-scoped endpoints with fake/foreign org IDs and ensure consistent 401/403/404 semantics.
9. Reduce hydration mismatch surface in shared layout/sidebar primitives and confirm deterministic IDs.
10. Add end-to-end compliance flow tests (login state gates, item review, policy details, docs/report access control).

## Ready-to-run command list (rerun)

```powershell
# 1) Seed realistic personas + foundational data
pnpm seed:test-accounts:realistic:reset
pnpm seed:test-accounts

# 2) Verify persona readiness
pnpm test-accounts:verify

# 3) Start app runtime
pnpm dev

# 4) Baseline static checks after fixes
npx tsc --noEmit
pnpm lint --fix

# 5) Existing targeted regression example
pnpm vitest run src/test/hr/time-tracking
```

## Notes on evidence quality

- Findings are based on observed runtime/browser/API behavior and code inspection only.
- No assumptions were used for pass/fail judgments.
- One console hydration warning may be partially influenced by browser extension instrumentation; the policy params runtime error is still independently confirmed by Next.js MCP stack trace.

## Final deliverable update (2026-02-16)

### summary

- Completed end-to-end revalidation for policy and compliance APIs using real authenticated browser runtime on `http://localhost:3000`.
- Confirmed no Prisma `[object Object]` error leakage in policy/compliance negative-path responses.
- Applied minimal focused hardening: explicit `no-store` behavior on sensitive GET endpoints and route-level regression tests.

### verified findings

- `GET /api/hr/policies/not-a-uuid` returns `400` with typed `VALIDATION_ERROR` envelope; no runtime crash.
- `GET /api/hr/policies/{validId}` returns `200` and policy payload; no runtime crash.
- `GET /api/hr/compliance/list?userId=not-a-uuid` returns `400` with typed `VALIDATION_ERROR` envelope.
- `PATCH /api/hr/compliance/update` invalid payload returns `400`; valid payload returns `200`.
- `POST /api/hr/compliance/assign` invalid payload returns `400`; valid payload returns `201`.
- Low-privilege/profile-pending persona receives controlled `401 AUTHORIZATION_ERROR` on compliance and policy API access.
- Next.js MCP runtime diagnostics report no active browser/runtime exceptions during final verification pass.

### unresolved gaps

- Profile-gate behavior mismatch remains (`profile_setup_required` persona reaches dashboard instead of enforced `/hr/profile` path).
- Suspended and no-membership states still converge to similar UX (`/not-invited`) rather than explicit suspended messaging.
- ABAC resource-key naming consistency across compliance adapters/policies remains a structural follow-up item.
- Dedicated E2E automation suite for compliance remains incomplete.

### top fixes applied

- Added no-store response hardening for sensitive GET routes:
   - `src/app/api/hr/compliance/list/route.ts`
   - `src/app/api/hr/policies/[policyId]/route.ts`
- Added/expanded regression tests:
   - `src/app/api/hr/policies/[policyId]/__tests__/route.test.ts`
   - `src/server/api-adapters/hr/compliance/__tests__/update-compliance-item.authz.test.ts`

### screenshot/runtime evidence index

- Browser screenshot (low-privilege boundary validation run):
   - `AppData\\Local\\Temp\\playwright-mcp-output\\1771177834112\\page-2026-02-15T17-53-51-464Z.png`
- Browser console/error evidence logs:
   - `AppData\\Local\\Temp\\playwright-mcp-output\\1771177834112\\console-2026-02-15T17-50-40-137Z.log`
   - `AppData\\Local\\Temp\\playwright-mcp-output\\1771177005424\\console-2026-02-15T17-39-04-636Z.log`
- Runtime diagnostic checks:
   - Next.js MCP `get_errors` returned `No errors detected in 1 browser session(s).`

### exact rerun commands

```powershell
# seed + verify personas
pnpm seed:test-accounts:realistic:reset
pnpm test-accounts:verify

# run app
pnpm dev

# real-user runtime checks (manual + MCP browser)
# open: http://localhost:3000/login
# use seeded personas from .codex/test-accounts/catalog.local.json

# required static gates (when re-enabled)
npx tsc --noEmit
pnpm lint --fix --cache
```

### production-readiness verdict (pass/fail with reasons)

- **Verdict: FAIL (conditional hold)**
- Reasons:
   1. Identity-gate UX/flow mismatch for profile-required persona is unresolved.
   2. Suspended-user handling lacks distinct, supportable outcome semantics.
   3. ABAC naming consistency follow-up is pending and can create policy drift risk.
- Conditional release note:
   - API boundary hardening and runtime stability for the tested policy/compliance routes are in acceptable shape after this pass, but overall production readiness remains blocked by the unresolved identity/access-state gaps above.

### latest runtime verification delta (2026-02-16)

- Observed issue during live run:
   - Better Auth session revoke path emitted noisy Prisma not-found delete error (`authSession.delete`) during session-expired redirect handling.
- Applied minimal fix:
   - Updated `src/server/use-cases/auth/sessions/get-session.ts` to expire auth sessions using a non-throwing `updateMany` token-expiration path during best-effort session-expiry cleanup, avoiding delete-not-found noise while preserving session-expired behavior.
- Post-fix evidence:
   - `GET /dashboard` returns `200` with normal render.
   - Next.js MCP runtime diagnostics: `No errors detected in 1 browser session(s).`
   - Next.js dev log (`.next/dev/logs/next-development.log`) no longer shows the prior `prisma.error` `authSession.delete` not-found event in the post-fix run window.

### centralization + scalability update (2026-02-16)

- Reusability / centralization delivered:
   - Added shared helper `src/server/api-adapters/http/no-store-response.ts` (`buildNoStoreJsonResponse`) as single source for no-store JSON responses.
   - Applied this helper to all compliance/policies sensitive GET routes in scope:
      - `src/app/api/hr/compliance/list/route.ts`
      - `src/app/api/hr/compliance/review-queue/route.ts`
      - `src/app/api/hr/compliance/templates/route.ts`
      - `src/app/api/hr/compliance/list-grouped/route.ts`
      - `src/app/api/hr/compliance/categories/route.ts`
      - `src/app/api/hr/policies/route.ts`
      - `src/app/api/hr/policies/[policyId]/route.ts`
      - `src/app/api/hr/policies/[policyId]/acknowledgment/route.ts`
      - `src/app/api/hr/policies/[policyId]/acknowledgments/route.ts`

- Scalable test architecture added:
   - Introduced shared test helper `src/app/api/hr/compliance/__tests__/route-test-helpers.ts` to avoid repeated request/error-envelope assertions.
   - Added route regression tests:
      - `src/app/api/hr/compliance/assign/__tests__/route.test.ts`
      - `src/app/api/hr/compliance/update/__tests__/route.test.ts`
      - `src/app/api/hr/compliance/categories/__tests__/route.test.ts`
      - `src/app/api/hr/compliance/review-queue/__tests__/route.test.ts`

- Broader HR API cache-hardening scan (outside immediate compliance/policies scope):
   - Remaining GET routes without explicit `unstable_noStore` were identified in modules such as absences, documents, leave, onboarding, people, performance, settings, time-tracking, and training.
   - These are now queued for phased hardening to avoid broad-risk churn in a single patch.

- Better approach recommendation adopted:
   - **Phased sensitivity-based rollout** instead of blanket patching all GET routes at once.
   - Phase 1 (completed): compliance + policy APIs (highly sensitive, security/audit-critical).
   - Phase 2 (completed): broader HR high-sensitivity GET endpoints.
   - Phase 3: residual GET endpoint classification rubric (`sensitive`, `semi-sensitive`, `public-internal`) and consistency cleanup for non-JSON responses.

### phase-2 completion delta (2026-02-16)

#### completed hardening scope (hr modules outside compliance/policies)

- Applied centralized `buildNoStoreJsonResponse` + `noStore()` hardening to sensitive JSON `GET` handlers in:
   - `src/app/api/hr/absences/route.ts`
   - `src/app/api/hr/documents/route.ts`
   - `src/app/api/hr/documents/[documentId]/download/route.ts`
   - `src/app/api/hr/leave/route.ts`
   - `src/app/api/hr/leave/[requestId]/route.ts`
   - `src/app/api/hr/leave/[requestId]/attachments/route.ts`
   - `src/app/api/hr/leave/balances/route.ts`
   - `src/app/api/hr/leave-policies/route.ts`
   - `src/app/api/hr/onboarding/templates/route.ts`
   - `src/app/api/hr/onboarding/instances/route.ts`
   - `src/app/api/hr/onboarding/invitations/[token]/route.ts`
   - `src/app/api/hr/people/profiles/route.ts`
   - `src/app/api/hr/people/profiles/[id]/route.ts`
   - `src/app/api/hr/people/contracts/route.ts`
   - `src/app/api/hr/people/contracts/[id]/route.ts`
   - `src/app/api/hr/performance/review/route.ts`
   - `src/app/api/hr/performance/review/[reviewId]/route.ts`
   - `src/app/api/hr/performance/review/[reviewId]/goals/route.ts`
   - `src/app/api/hr/time-tracking/route.ts`
   - `src/app/api/hr/time-tracking/[entryId]/route.ts`
   - `src/app/api/hr/training/route.ts`
   - `src/app/api/hr/training/[recordId]/route.ts`
   - `src/app/api/hr/settings/route.ts`

#### scalable shared test helpers + targeted tests

- Added cross-module shared helper:
   - `src/app/api/hr/__tests__/route-test-helpers.ts`
- Reused helper from compliance helper shim:
   - `src/app/api/hr/compliance/__tests__/route-test-helpers.ts`
- Added targeted module route tests (`GET` no-store assertions):
   - `src/app/api/hr/absences/__tests__/route.test.ts`
   - `src/app/api/hr/documents/__tests__/route.test.ts`
   - `src/app/api/hr/leave/__tests__/route.test.ts`
   - `src/app/api/hr/onboarding/templates/__tests__/route.test.ts`
   - `src/app/api/hr/people/profiles/__tests__/route.test.ts`
   - `src/app/api/hr/performance/review/__tests__/route.test.ts`
   - `src/app/api/hr/time-tracking/__tests__/route-cache.test.ts`
   - `src/app/api/hr/training/__tests__/route.test.ts`

#### evidence index (this pass)

- Targeted test execution (no full lint/tsc):
   - Command: `pnpm vitest run src/app/api/hr/absences/__tests__/route.test.ts src/app/api/hr/documents/__tests__/route.test.ts src/app/api/hr/leave/__tests__/route.test.ts src/app/api/hr/onboarding/templates/__tests__/route.test.ts src/app/api/hr/people/profiles/__tests__/route.test.ts src/app/api/hr/performance/review/__tests__/route.test.ts src/app/api/hr/time-tracking/__tests__/route-cache.test.ts src/app/api/hr/training/__tests__/route.test.ts src/app/api/hr/compliance/list/__tests__/route.test.ts src/app/api/hr/compliance/review-queue/__tests__/route.test.ts src/app/api/hr/compliance/categories/__tests__/route.test.ts src/app/api/hr/compliance/assign/__tests__/route.test.ts src/app/api/hr/compliance/update/__tests__/route.test.ts src/app/api/hr/policies/[policyId]/__tests__/route.test.ts src/app/api/hr/time-tracking/__tests__/rate-limit-route.test.ts`
   - Result: `15` test files passed, `26` tests passed.
- Browser runtime verification on port `3000` (Chrome via MCP browser automation):
   - Sample navigation: `http://127.0.0.1:3000/api/hr/leave` returned typed `401 AUTHORIZATION_ERROR` envelope (no crash).
   - Multi-endpoint boundary probe returned `401` for all unauthenticated sensitive routes in this scope:
      - `/api/hr/absences`
      - `/api/hr/documents`
      - `/api/hr/leave`
      - `/api/hr/onboarding/templates`
      - `/api/hr/people/profiles`
      - `/api/hr/performance/review`
      - `/api/hr/time-tracking`
      - `/api/hr/training`
   - Console log reference:
      - `AppData\\Local\\Temp\\playwright-mcp-output\\1771221795278\\console-2026-02-16T06-41-58-373Z.log`

#### unresolved gaps after this pass

- Runtime verification was blocked in a later session because `localhost:3000` was unreachable (`ERR_CONNECTION_REFUSED`), so Next.js MCP tool availability could not be evaluated in that blocked run.
- Live authenticated success-header verification for all hardened routes was not executed in this pass; no-store success headers are currently covered by targeted route tests.
- Existing prior audit blockers outside cache-hardening remain open (profile-gate mismatch, suspended UX semantics, ABAC naming consistency).

#### updated production verdict

- **API hardening verdict (this scope): PASS**
   - Centralized no-store hardening completed for remaining high-sensitivity HR JSON `GET` routes in scope.
   - Targeted regression coverage added and green.
   - Runtime unauthenticated authz boundaries remain enforced with typed error envelopes and no observed route crashes.
- **Overall production verdict (full audit): CONDITIONAL FAIL (unchanged)**
   - Non-cache-hardening blockers from earlier audit remain unresolved and still gate full production sign-off.

### validation reconciliation (2026-02-16)

Validated corrections from follow-up review:

- Confirmed true in current code:
   - Fail-open download URL fallback exists in `src/server/api-adapters/records/documents/presign-document-download.ts`.
   - Document list returns full `DocumentVaultRecord` (including `blobPointer` and metadata fields) in `src/server/api-adapters/records/documents/list-documents.ts` and `src/server/types/records/document-vault.ts`.
   - Malformed JSON currently falls back to `{}` in `src/server/api-adapters/http/request-utils.ts`.
   - Compliance seed uses check-then-create pattern in `src/server/use-cases/hr/compliance/seed-default-templates.ts`.
   - CSRF guard usage is uneven (present in leave/time-tracking routes; absent in compliance/policies routes).
   - React Query keys for policies/templates are not org-scoped in `src/app/(app)/hr/policies/_components/policies.api.ts` and `src/app/(app)/hr/compliance/compliance-templates.api.ts`.
   - Route-test coverage gaps remain for compliance list-grouped/templates/templates-seed and policies module breadth.

- Retracted/unsupported in current code:
   - No supported evidence of wildcard ABAC action in current `hr-permissions` profiles.
   - `src/server/security/abac-policies/compliance.ts` is not present in this repository; previous references to that exact file are superseded by the evidence listed above.

- Runtime/MCP interpretation correction:
   - In blocked sessions where `localhost:3000` is down, the correct conclusion is `server unreachable`; Next.js MCP endpoint/tool availability cannot be inferred from that state.