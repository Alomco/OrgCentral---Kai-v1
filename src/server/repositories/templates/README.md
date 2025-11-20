# Repository Templates

This folder includes copy/paste templates to help implement new repositories consistently with project standards.

Templates:
- `contract.template.ts` — a contract (interface) template that uses `import type` where appropriate and describes typical method signatures.
- `mapper.template.ts` — a mapper template to convert between Prisma and domain models.
- `prisma-repository.template.ts` — a Prisma repository implementation template that extends `BasePrismaRepository`, uses `getModelDelegate`, and maps data using mappers.

Usage:
1. Copy the appropriate template into a new file under the target domain/subdomain, and rename it.
2. Replace `example` names and `SomeDomainType` placeholder types with real domain types.
3. Add the contract to `contracts/` and the repository implementation under `prisma/`.
4. Add an `index.ts` barrel for the new subfolder and export from the relevant top-level barrel.
