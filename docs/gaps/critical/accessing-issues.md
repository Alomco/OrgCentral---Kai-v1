# Page Access Issues Report

Generated: 2026-01-31T02:50:00+06:00

## Summary

This document tracks issues encountered while testing page accessibility across the OrgCentral application.

**Status Update**: Public pages load, but authenticated flows now fail with a server-side 500 from `/api/auth/post-login`. Internal pages attempt to resolve org context and hit the failing post-login request.

---

## Current Status: Post-login API 500

**Auth-related routes and internal pages** are blocked by a failing `/api/auth/post-login` call. In headed Chrome, pages redirect or attempt to load with an RSC request that hits the failing route and results in `HTTP ERROR 500`.

**Observed server error (from dev logs):**

```
Invalid `this.prisma.role.findUnique()` invocation
The column `(not available)` does not exist in the current database.
```

This indicates a schema mismatch between Prisma and the database (likely missing columns on the `hr.roles` table).

---

## Test Results by Page (RECHECK 3 - 2026-01-31T02:50:00+06:00)

### Public Pages

| Page URL | Status | Notes |
|----------|--------|-------|
| `/` (Home) | ✅ OK | Fully functional landing page |
| `/login` | ⚠️ PARTIAL | Page loads, but `/api/auth/post-login` returns 500 shortly after |
| `/admin-signup` | ✅ OK | Bootstrap form works |
| `/admin-signup/complete` | ⚠️ BLOCKED | Missing bootstrap secret error shown |

### Internal Pages (Auth/Context Required)

| Page | Status | Error |
|------|--------|-------|
| `/dashboard` | ❌ BLOCKED | 500 during `/api/auth/post-login` | 
| `/admin/dashboard` | ❌ BLOCKED | 500 during `/api/auth/post-login` |
| `/hr` | ❌ BLOCKED | 500 during `/api/auth/post-login` |
| `/hr/employees` | ❌ BLOCKED | 500 during `/api/auth/post-login` |
| `/org/profile` | ❌ BLOCKED | 500 during `/api/auth/post-login` |
| `/settings` | ❌ BLOCKED | 500 during `/api/auth/post-login` |
| `/dev` | ❌ BLOCKED | 500 during `/api/auth/post-login` |

---

## Progress Timeline

1. **Initial Check**: Global build error in `hr/absence` module blocked everything.
   - **Fix**: Resolved compilation errors.
2. **First Recheck**: 500 Internal Server Errors due to chunk loading failures.
   - **Fix**: Cleared `.next` cache and restarted server.
3. **Current State**: Application runs, public pages work, but auth context bootstrap fails due to a Prisma/database schema mismatch in `role.findUnique`.

---

## Next Steps

1. **Fix Prisma schema mismatch**: Ensure the database schema matches [prisma/schema.prisma](prisma/schema.prisma). Run the correct migration or `prisma db push` for dev.
2. **Re-test `/api/auth/post-login`**: Confirm the endpoint returns 200 and sets `activeOrganizationId`.
3. **Re-check internal pages**: Validate `/dashboard`, `/hr`, and `/admin/dashboard` once the API is healthy.
