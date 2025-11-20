# OrgCentral Migration Task Breakdown

This document translates the high-level backend/frontend playbooks into assignable CLI-agent work packages. Each task references the legacy source inside `old/` and the destination inside `orgcentral/`, and stays under the ~250 LOC guideline.

## 1. Inventory Snapshot
- **Legacy backend**: Firebase functions under `old/firebase/functions/src/functions/**`, shared helpers in `old/firebase/functions/src/lib/**`, and Firestore-centric `types.ts`.
- **Legacy frontend**: Complete `(app)` + `(auth)` route trees, contexts, hooks, and UI primitives under `old/src/**`.
- **OrgCentral state**: Minimal Next 16 shell (root layout + landing page), no server/service layer, no contexts, no domain routes yet, Prisma schemas present but incomplete, Better Auth dependency installed.

## 2. Migration Tasks by Track

### 2.1 Backend Lift (Firebase ➜ Next 16 + Prisma/Mongo)
1. **Function Manifesting**
   - Source: `old/firebase/functions/src/functions/*.ts`
   - Output: `orgcentral/docs/backend-function-manifest.json`
   - Steps: enumerate exports, triggers, Firestore paths, auth requirements; tag `tenant-aware`, `queue`, `gov-controls` flags.
2. **Repository Contracts**
   - Source: `old/firebase/functions/src/types.ts`
   - Output: Interfaces in `orgcentral/src/server/repositories/contracts/**`
   - Steps: derive per-domain model contracts, inject `orgId`, `classification`, `schemaVersion` fields.
3. **Service Refactors**
   - Source: domain functions (e.g., `hr-leave.ts`)
   - Output: `orgcentral/src/server/services/hr/LeaveRequestService.ts` etc.
   - Steps: split into abstract base + concrete Prisma/Mongo implementations; add cache tags + audit logging.
4. **Route Handlers & Actions**
   - Source: Firebase HTTPS triggers
   - Output: `orgcentral/src/app/api/**/route.ts` + server actions
   - Steps: wrap service calls, enforce `TenantScopedService`, register cache invalidation.
5. **Queues & Workers**
   - Source: scheduled/background logic inside Firebase functions
   - Output: `orgcentral/src/server/queues/**`
   - Steps: model BullMQ queues, cron schedules, shared worker base class.

### 2.2 Frontend Rebuild
1. **Global Shell & Providers**
   - Source: `old/src/app/layout.tsx`, `globals.css`, `providers.tsx`
   - Output: `orgcentral/src/app/layout.tsx`, `globals.css`, `providers.tsx`
   - Steps: copy, split styles, convert contexts to cache-aware server wrappers.
2. **UI Primitives & Layout**
   - Source: `old/src/components/ui`, `old/src/components/layout`
   - Output: `orgcentral/src/components/ui/**`, `.../layout/**`
   - Steps: audit `use client`, refactor variants, ensure components stay <250 LOC.
3. **Domain Islands**
   - Source: `old/src/app/(app)/**`
   - Output: mirrored structure under `orgcentral/src/app/(app)/**`
   - Steps: scaffold route segments, add Cache Components, Suspense, server actions.
4. **Auth Surfaces**
   - Source: `old/src/app/(auth)/**`
   - Output: `orgcentral/src/app/(auth)/**`
   - Steps: wire Better Auth flows, tenant-aware redirects, form schemas.

## 3. Sub-Task Template (for CLI Agents)
For every numbered task, provide agents with:
- Source path(s) in `old/`
- Destination path(s) in `orgcentral/`
- Dependencies (Prisma modules, cache tags, compliance checklist items)
- Acceptance criteria (tests, lint, cache invalidation hooks)

## 4. Missing Implementations / Gaps
- **Server infrastructure**: No `src/server/**` contracts, services, repositories, queues, or security guards exist yet.
- **API surface**: No Route Handlers or server actions beyond the root page.
- **Contexts & providers**: Branding, notification, and user contexts absent in `orgcentral/src/context`.
- **Domain routes**: `(app)` and `(auth)` folders are empty compared to the legacy app.
- **Docs/artifacts**: Function manifest, compliance checklist per domain, and ADRs still missing.
- **Caching strategy**: Cache tags/life definitions only documented, not implemented.

## 5. Next Steps
1. Finalize manifest + compliance checklist.
2. Scaffold server directories (`contracts`, `services`, `repositories`, `mappers`, `queues`).
3. Begin domain-by-domain porting following Phase order.
4. Keep UX-first mindset: flows must remain intuitive even if visual polish comes later.