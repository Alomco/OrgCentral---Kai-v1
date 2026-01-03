---
trigger: always_on
---

must maintain:
<=250 LOC cap (split early)
single source of truth
Server Components first
Minimal "use client" islands
Cache Components + cacheLife + cacheTag
PPR + nested Suspense
Strict TS (no any, no unknown)
Zod at boundaries (forms/API)
Typed Server Actions (useActionState)
Tailwind v4 tokens + class-variance-authority
Tenant theme SSR (x-org-id)
CSS-first motion + motion tokens + reduced-motion
SOLID + DI (SRP/ISP/DIP)
Open/Closed extension points
Liskov-safe interfaces
Zero-trust + tenant scoping (orgId/residency/classification)
after compleating all the tasks run npx tsc and make it green. than run pnpm lint --fix and make it green also
than must check the side effects in the project and any file left for modification
Maintain: single source of truth, solid, generic, modular, highly scalablility
also check if the related actions, notificationb, worker, error ghandleing system is implemented