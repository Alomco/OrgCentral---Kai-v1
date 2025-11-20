# Repository Contracts

This folder contains interface definitions for the repository layer. Contracts abstract data access behavior and are used by services to interact with repositories without depending on a concrete ORM or store implementation.

Best practices:
- Use `import type` for importing types only.
- Keep method signatures narrow and expressive: return domain models or Prisma model types depending on the intended use case.
- Avoid implementation logic in contract files — they are purely shape and signature.
- Add `index.ts` barrels under each subfolder for easier imports when needed.

Subfolders correspond to domains (`auth`, `hr`, `org`, `records`, `user`).
