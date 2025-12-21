# Caching Architecture (TL;DR)

## The rule
- Caching is **use-case owned**.
- UI/components **never import** `next/cache` and never touch cache tags directly.
- Repositories focus on data access; they do **not** own caching policy.
- Sensitive data must be **no-store** (never cached).

## The entry points
- **Tag + invalidate API (stable surface):** `src/server/lib/cache-tags.ts`
  - `registerCacheTag(payload)` (read paths)
  - `invalidateCache(payload)` / `invalidateOrgCache(orgId, scope, classification, residency)` (write paths)
- **Pluggable cache engine (single swap point):** `src/server/lib/cache-engine/index.ts`
  - Default engine is **Next.js** (`CACHE_ENGINE=next`)
  - Other engines can be added without changing use-cases.

## How to use it (in use-cases)
### Reads
- After you validate auth/tenant context, register tags for what you are returning:
  - `registerCacheTag({ orgId, scope, classification, residency })`
- Prefer small per-domain helpers so use-cases stay clean (example pattern exists in notifications).

**Sensitive data**
- If `classification !== 'OFFICIAL'`, the Next.js cache engine will call `unstable_noStore()` and **skip tag registration**, so the data is not cached and server restarts never affect correctness.

### Writes
- After a successful mutation, invalidate the scopes that are now stale:
  - `await invalidateOrgCache(orgId, scope, classification, residency)`

## What NOT to do
- Do not call `cacheTag`, `cacheLife`, or `revalidateTag` outside the cache engine.
- Do not “default” classification/residency when tagging or invalidating; always use the tenant context.
- Do not put caching policy inside Prisma repositories.

## Why this is modular
- Use-cases depend on the **stable API** (`cache-tags.ts`).
- `cache-tags.ts` delegates to a **CacheEngine** chosen in one place.
- Swapping caching technology is an **entry-point change** (engine selection), not a codebase-wide rewrite.

## Config
- `CACHE_ENGINE=next` (recommended/default)
- `CACHE_ENGINE=noop` (tests, scripts, workers)
- `CACHE_ENGINE=redis` (tag-versioning engine for app-level caching; does not replace Next’s internal Data Cache)

## Files to know
- `src/server/lib/cache-tags.ts`
- `src/server/lib/cache-engine/types.ts`
- `src/server/lib/cache-engine/index.ts`
- `src/server/lib/cache-engine/backends/next-cache-engine.ts`

