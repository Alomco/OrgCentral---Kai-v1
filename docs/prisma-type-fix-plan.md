# Prisma & TypeScript Fix Plan (Repository: orgcentral)

This document lays out a step-by-step plan for fixing the major TypeScript/Prisma type issues discovered in the `prisma` repository implementation files. The goal is to fix errors one-by-one in a safe, incremental manner, validate each change, and keep PRs small and reviewable.

## Goals
- Eliminate TypeScript compilation errors related to Prisma types.
- Keep domain, contract, and implementation types clearly separated.
- Add verification steps and automation for future enforcement.

---

## Recommended order (priority)
1. Fix enum type mismatches (NotificationChannel, AuditEventType, LeavePolicyType, DocumentType etc.).
2. Fix JSON nullable types, e.g. InputJsonValue vs NullableJsonNullValueInput, JsonNull/DbNull usage.
3. Fix composite unique vs findUnique vs findFirst usage (WhereUnique inputs and schema validations).
4. Field name mismatches between code and Prisma schema.
5. Duplicate imports and linting issues.
6. Decimal & Date type handling and correct imports.
7. 'Spread types may only be created from object types' issues (whereClause initializations).
8. Re-run TypeScript and test, iterate until clean.

---

## 1) Fix Enum Type Mismatches (Highest Impact)
Symptoms:
- "Type 'string' is not assignable to type 'NotificationChannel'."
- "Namespace 'Prisma' has no exported member 'X'"

Steps:
- Confirm enum names in `prisma/schema.prisma` for the relevant models.
- Use the enum types directly from `@prisma/client` by importing them at file top, e.g.:
  ```ts
  import type { NotificationChannel } from '@prisma/client';
  ```
- Replace `Prisma.NotificationChannel` with `NotificationChannel` (or another appropriate import).
- If the code expects a loosely-typed string, add a runtime guard and map it to the enum before calling Prisma.

Why this helps:
- Many code paths assume enum types; fixing them removes many downstream compile issues.

Validation:
- After changes run: `npx tsc --noEmit` and `pnpm lint`.

---

## 2) Fix JSON/Nullable JSON Types
Symptoms:
- Type mismatch errors for `metadata` or `payload` fields (Record vs Prisma-specific JSON union types).

Steps:
- Prefer `Prisma.InputJsonValue` or `JsonValue` in `.types.ts` files for JSON fields.
- When writing `null` explicitly to DB, use `Prisma.DbNull` or `Prisma.JsonNull` depending on schema.
  Example:
  ```ts
  data: { metadata: someValue == null ? Prisma.JsonNull : (someValue as Prisma.InputJsonValue) }
  ```
- For arbitrary JS objects, cast using `as unknown as Prisma.InputJsonValue` as a temporary bridge while cleaning mappers.

Validation:
- `npx tsc --noEmit`
- Run a small integration test or dev environment for JSON roundtrips.

---

## 3) Fix WhereUnique / findUnique vs findFirst
Symptoms:
- Using `findUnique({ where: { blobPointer } })` when `blobPointer` isn't declared unique.
- Using composite unique queries that aren't declared in schema (e.g., `orgId_userId_channel`).

Steps:
- If a column is truly unique, add the unique constraint in `schema.prisma` and run a migration: `npx prisma migrate dev` then `npx prisma generate`.
- Otherwise, use `findFirst({ where: { ... } })` or `findMany`.
- For composite keys: either add an `@@unique([orgId, userId, channel])` or change to `findFirst`.

Validation:
- After changing schema run `npx prisma generate` and `npx tsc --noEmit`.

---

## 4) Fix Property Name Mismatches
Symptoms:
- Properties like `submittedByOrgId` vs `submittedBy` or `employeeId` not existing in `WhereInput`.

Steps:
- Inspect `prisma/schema.prisma` or the generated `@prisma/client` types to confirm property names.
- Update repository fields to match schema or add adapter mappings in the repo mappers.
- Prefer small, consistent DTOs in `src/server/types` and convert using mappers.

Validation:
- `npx tsc --noEmit`
- Run targeted integration tests on operations that hit those fields.

---

## 5) Fix Duplicate Imports & Lint Issues
Symptoms:
- Duplicate import lines or unused imports triggered by the refactor.

Steps:
- Remove duplicate import lines (top of file).
- Run `pnpm lint --fix` or `eslint` to auto-fix formatting and lint issues.

Validation:
- `pnpm lint` should be clean.

---

## 6) Fix Decimal & Date Handling
Symptoms:
- `@prisma/client/runtime` import missing, decimal errors, or improper Date usage.

Steps:
- For `Decimal`, prefer `Prisma.Decimal` if available or `import { Decimal } from 'decimal.js'` with `prisma`'s helper if necessary.
- Convert string timestamps to `new Date()` before passing to Prisma. Return ISO strings from mappers.

Validation:
- `npx tsc --noEmit`
- Integration checks when writing decimals or date-time fields.

---

## 7) Fix Spread & WhereInput Initialization
Symptoms:
- 'Spread types may only be created from object types' when merging whereClause.createdAt.

Steps:
- Always initialize as object:
  ```ts
  if (!whereClause.createdAt) whereClause.createdAt = {} as Prisma.SomeWhereInput;
  whereClause.createdAt = { ...whereClause.createdAt, lte: filters.dateTo };
  ```
- Or use explicit assignment instead of spread for safety.

Validation:
- `npx tsc --noEmit`

---

## 8) Verify, PR, and iterate
- After each category of changes, run:
  ```ps1
  cd orgcentral
  npx tsc --noEmit
  pnpm lint
  pnpm test # or pnpm test:unit
  ```
- Keep PRs small and focused, tag them as `prisma:types` or similar.

---

## Automation & Policy
1. Add an ESLint rule (custom or script) to prevent `export interface` declarations in implementation files under `src/server/repositories/prisma/**`.
2. Add a pre-commit hook to run `npx tsc --noEmit` and `pnpm lint` in changed files.
3. Add a codemod to help extract inline interfaces automatically (optional).

---

## Sample workflow for a single change (Enums example)
- Branch: `fix/prisma-enum-types`.
- Make changes in repository files to import enums directly from `@prisma/client`.
- Run type checks: `npx tsc --noEmit`.
- Run lint: `pnpm lint`.
- Run tests for relevant modules.
- Open PR with a short description, list of files updated, and run `pnpm test` in CI.

---

## Where to start next
- The best starting point is to fix enums — they have the most impact and are easiest to verify.
- Next fix JSON types, then the composite unique concerns. Each change will lower the number of TypeScript errors and make subsequent fixes easier.

---

## Helpful Commands & Tips
- TypeScript (quick check): `npx tsc --noEmit`
- Lint: `pnpm lint` or `pnpm lint --fix`
- Tests: `pnpm test` or specific `pnpm test --some` if you have specific test suites.
- Update Prisma types: `npx prisma generate` after altering the schema, and run `npx prisma migrate dev` if changing DB.

---

If you'd like, I can produce a PR for category #1 (enum fixes) for a set of files (e.g., `org/notifications`, `records/audit`, `hr/leave`). Reply with: `PR for enums` and I will prepare a draft patch and run the checks.
