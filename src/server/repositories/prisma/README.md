# Prisma Repositories

This folder contains Prisma-backed implementations of repository contracts. Each repository typically:

- Extends `BasePrismaRepository` and accepts `PrismaClient` via constructor injection.
- Uses the `getModelDelegate` helper for strongly typed model access.
- Defines DB-specific find/create/update/delete helpers and 'contract-facing' methods that the services call.
- Registers and invalidates cache tags on read/write for tenant-specific cache consistency.
- Uses `prisma-utils` helpers to convert JSON inputs and handles transactions where needed.

When adding a new repository:
1. Define the contract under `contracts/`.
2. Add domain mappers under `mappers/`.
3. Implement the Prisma repository under `prisma/` following existing patterns.
