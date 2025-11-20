# Scaffolding a New Repository

Follow these steps to add a new repository feature.

1) Contracts
- Create a contract at `src/server/repositories/contracts/<domain>/<subdomain>/<name>-repository-contract.ts`.
- Use `export interface I<Name>Repository { ... }` and always use `import type` for type-only imports.

2) Mappers
- Create mapping functions under `src/server/repositories/mappers/<domain>/<subdomain>`.
- Keep these pure and testable. Export functions such as `mapPrismaXToDomain` and `mapDomainXToPrisma`.

3) Prisma Implementation
- Create a Prisma implementation under `src/server/repositories/prisma/<domain>/<subdomain>/prisma-<name>-repository.ts`.
- Extend `BasePrismaRepository` and implement the contract.
- Use `getModelDelegate(this.prisma, '<model>')` and `toPrismaInputJson()` for JSON fields.
- Register/invalidate cache tags in the contract-facing methods. Use `registerOrgCacheTag` and `invalidateOrgCache` when appropriate.

4) Barrel Exports
- Add `index.ts` in `contracts`, `mappers`, and `prisma` subfolders to re-export the modules.

5) Tests
- Add unit tests for mappers (`__tests__`) and contract-facing functions. Mock Prisma client or use a test DB as appropriate.
