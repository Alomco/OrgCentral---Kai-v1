# HR Leave E2E Audit - 2026-02-13

## Scope
- Leave UI routes/pages: request, approvals, balances, policies, history/calendar/manager coverage review.
- Leave API routes, adapters/controllers, use-cases, schemas, and guards.
- Security boundaries: org isolation, CSRF/origin, authz + validation, error envelope behavior.
- Data integrity: status transitions and leave-balance adjustments.

## Severity-ranked Findings

### High
1. Missing CSRF/origin guard on leave mutation routes.
   - Impact: Cross-origin mutation attempts were not blocked at route boundary for leave POST endpoints.
   - Fixed in:
     - `src/app/api/hr/leave/route.ts`
     - `src/app/api/hr/leave/request/route.ts`
     - `src/app/api/hr/leave/approve/route.ts`
     - `src/app/api/hr/leave/balances/route.ts`
     - `src/app/api/hr/leave/balances/ensure/route.ts`
     - `src/app/api/hr/leave/[requestId]/approve/route.ts`
     - `src/app/api/hr/leave/[requestId]/reject/route.ts`
     - `src/app/api/hr/leave/[requestId]/cancel/route.ts`
     - `src/app/api/hr/leave/attachments/presign/route.ts`

2. Client-supplied actor IDs accepted for approve/reject/cancel audit fields.
   - Impact: Caller could attempt to spoof `approverId` / `rejectedBy` / `cancelledBy` in payload.
   - Fixed by enforcing authenticated session user as actor in:
     - `src/server/api-adapters/hr/leave/approve-leave-request.ts`
     - `src/server/api-adapters/hr/leave/reject-leave-request.ts`
     - `src/server/api-adapters/hr/leave/cancel-leave-request.ts`

### Medium
1. No dedicated standalone leave history route (`/hr/leave/history`) and no dedicated leave calendar route (`/hr/leave/calendar`); coverage is composed through existing requests and summary/calendar components.
   - Impact: Feature discoverability parity gap, not a production break.

### Low
1. Browser automation smoke (Playwright MCP) blocked by persistent local browser profile lock in this environment; API/runtime smoke succeeded.

## What Changed
- Added `enforceCsrfOriginGuard` at all leave POST route boundaries.
- Enforced session-derived actor identity for approve/reject/cancel controllers.
- Added deterministic tests:
  - `src/test/hr/leave/leave-controller-security.test.ts`
  - `src/test/hr/leave/leave-cancel-transition-and-error-envelope.test.ts`
  - `src/test/hr/leave/leave-route-csrf-guard.test.ts`

## Verification Results
- Typecheck: `npx tsc --noEmit` ✅
- Lint: `pnpm lint --fix` ✅
- Leave suite: `pnpm vitest run src/test/hr/leave` ✅ (16 passed)

## Live Smoke Evidence
- Runtime route inventory (Next.js MCP): `/api/hr/leave`, `/api/hr/leave/[requestId]/approve`, `/api/hr/leave/balances/ensure`, `/hr/leave` present.
- API smoke:
  - `GET http://localhost:3000/api/hr/leave` => `401` (unauthenticated expected)
  - `POST http://localhost:3000/api/hr/leave/approve` with `Origin: https://evil.example` => `403`
  - `POST http://localhost:3000/api/hr/leave/balances/ensure` with `Origin: https://evil.example` => `403`
  - `GET http://localhost:3000/hr/leave` => `200`
- Browser automation note:
  - Playwright MCP navigation was blocked by profile lock (`mcp-chrome`) in this environment; `open_simple_browser` launched `http://localhost:3000/hr/leave` successfully.

## Residual Risks / Next Steps
- Add a dedicated authenticated browser smoke in CI (seeded test account + Playwright) to verify leave UI render + mutation UX end-to-end with console/runtime capture.
- If product requires explicit history/calendar routes, add `/hr/leave/history` and `/hr/leave/calendar` with the existing leave subnav and manager filters.
