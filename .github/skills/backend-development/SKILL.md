---
name: backend-development
description: Backend implementation and service design for API routes, controllers, use-cases, and repositories. Use for server-side features, API behaviors, validation boundaries, and error handling.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
---

# Backend Development

## Purpose

Implement and refactor backend logic with clear boundaries, strict validation, and predictable behavior.

## When To Use

- Building or updating API endpoints.
- Implementing controller/use-case/service/repository flows.
- Adding input validation, error mapping, and audit-safe logging.
- Enforcing tenant-scoped access checks before data access.

## Do Not Use For

- Pure UI styling or component work.
- Mobile-only view layer concerns.
- High-level product planning without implementation.

## Core Workflow

1. Define boundary contract (request/response, params, schema).
2. Validate all external inputs at the boundary.
3. Keep route handlers thin; delegate behavior to adapters/controllers.
4. Implement use-case logic with explicit domain types.
5. Use repository contracts for data access and isolate mapping logic.
6. Add explicit error translation (domain -> HTTP/adapter response).
7. Verify cache invalidation/side-effects for mutations.

## Quality Checklist

- Tenant guards enforced (`orgId`, residency, classification).
- No `any`/`unknown` leakage in public interfaces.
- No direct service calls from route files when adapter pattern is required.
- Mutation paths include notifications/audit hooks when applicable.
- Tests cover success, validation failure, auth failure, and conflict paths.

## Verification

```bash
npx tsc --noEmit
pnpm lint --fix
```
