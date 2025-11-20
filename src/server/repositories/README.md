# Server-Side Repositories — OrgCentral

This folder houses the server-side Repository layer for OrgCentral. It follows a strict Repository Pattern that ensures separation of concerns, interface-based abstraction, testability, and multi-datasource support.

Structure & Purpose:

- `contracts/` — Repository interfaces (TypeScript) defining all repository method signatures and behaviors. These should use `import type` for type-only imports and remain implementation-agnostic.
- `mappers/` — DTOs and transformation logic for converting between Prisma models, database entities, and domain models.
- `prisma/` — Prisma-specific implementations that talk directly to the database, use `BasePrismaRepository` and handle prisma delegates, transactions, and DB errors.

Templates are provided under `src/server/repositories/templates/` to help you scaffold new contracts, mappers and Prisma repositories consistently.

Important principles:

- Follow SOLID principles: services depend on interfaces in `contracts`, not concrete implementations.
- Keep files short — prefer single responsibility and keep files under ~250 LOC when possible.
- Use `import type { ... }` only for type-only imports in contracts.
- Provide barrel `index.ts` files to make imports simpler across the codebase.
- Repositories should register/invalidate cache tags when appropriate using `registerOrgCacheTag`, `invalidateOrgCache` helpers.

Examples and existing patterns are available under `prisma/org/*` and `contracts/org/*`.

Refer to `docs/backend-migration-plan.md` and `docs/structured-logging-setup.md` for telemetry, logging, and migration guidance.
