# Server Architecture (Generic)

This document describes the *standard* server-side flow and folder responsibilities for any module (HR, org, user, etc.). Keep it as the default mental model when adding features.

## Layering (top → bottom)

1. **Route handlers / server actions**
   - Next.js entry points.
   - Should be thin: delegate to a route-controller/controller, return response.

   Common locations:
   - REST: `src/app/api/**/route.ts`
   - Actions: `src/server/actions/**`

2. **API adapters (controllers)** (`src/server/api-adapters/**`)
   - Boundary layer: auth/session, Zod validation, audit metadata.
   - Calls services only (no Prisma).
   - May include “route-controllers” that adapt Next.js `Request`/params to controllers.

   Notes:
   - If a Zod schema is shared across multiple controllers (or shared with the UI), it can live alongside the owning service/module (for example `src/server/services/<domain>/**/<feature>-schemas.ts`) and be imported here.

3. **Services** (`src/server/services/**`)
   - Orchestration + cross-cutting concerns: tenant enforcement, structured logging, telemetry spans.
   - Public methods should run inside `executeInServiceContext`.

4. **Use-cases** (`src/server/use-cases/**`)
   - Small, composable business operations.
   - Called by services; depend on repository contracts.

5. **Repositories**
   - **Contracts**: `src/server/repositories/contracts/**` (interfaces only, use `import type`).
   - **Implementations**: `src/server/repositories/prisma/**` (Prisma queries, transactions, DB errors).

6. **Mappers** (`src/server/repositories/mappers/**`)
   - Convert between database records/DTOs and domain types.

7. **Domain types & helpers** (`src/server/domain/**` and `src/server/types/**`)
   - Pure types, enums, calculations, normalization helpers.

## Two common request flows

### A) UI → Server Action

UI component → `src/server/actions/**` → controller (`api-adapters`) → service → use-case(s) → repository → mapper → return.

### B) External client → REST API

`src/app/api/**/route.ts` → route-controller/controller (`api-adapters`) → service → use-case(s) → repository → mapper → `NextResponse`.

## Cross-cutting rules (apply everywhere)

- **Multi-tenancy**: every read/write must be scoped by `orgId` (and any residency/classification constraints).
- **Guards**: enforce RBAC/ABAC before touching repositories (use the shared guard/session helpers).
- **Cache Components**: register cache tags on reads; invalidate relevant tags/scopes after writes.
- **No `any`**: validate external inputs (JSON bodies, query params) as `unknown` + Zod.
- **Dependency direction**: high layers depend on contracts, never concrete implementations.
- **File size**: keep each file ≤ ~250 LOC; split helpers into focused modules.

## Where to add new functionality

- Need new persistence operation → add it to a repository **contract**, then implement it in Prisma repo.
- Need new business operation → add a **use-case** and call it from the **service**.
- Need a new public entry point → add a **controller** (api-adapter), then wire it from route/actions.

## Notes

- If you’re working in HR, also see `src/server/use-cases/hr/architecture.md` for domain-specific guidance.
