# Global Admin Provisioning

This runbook explains how to seed a platform-level global administrator who can invite new organizations and org admins. It provisions:

- The platform organization record (`OrgCentral Platform` with slug `orgcentral-platform`).
- A `globalAdmin` role scoped to `GLOBAL` with the full owner permission set.
- The Better Auth user record (status `ACTIVE`).
- An `hr.memberships` row linking the user to the platform org with the global admin role.

## Prerequisites
- Local Postgres instance reachable via `DATABASE_URL`.
- Prisma schema composed/migrated (`pnpm db:compose && pnpm prisma migrate deploy`).
- PNPM dependencies installed (`pnpm install`).

## Provisioning steps
1. Export or inline the connection string (PowerShell example):
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:<password>@localhost:5433/orgcentral?schema=public"
   ```
2. Run the helper script with the desired email and optional display name:
   ```powershell
   cd "e:/Web Development/studio/orgcentral"
   pnpm tsx scripts/create-global-admin.ts admin@example.gov "Admin Display Name"
   ```
3. The script outputs the organization, role, user, and membership IDs that were upserted. Rerunning the command for the same email refreshes the display name and metadata without duplicating data.

## Post-provisioning checks
- Inspect the user via Prisma Studio or `pnpm prisma studio` → `User` / `Membership` tables.
- If the global admin should manage specific customer tenants, insert rows into `org.managed_organizations` referencing their `adminUserId` and the tenant `orgId`.
- When onboarding a new tenant, run the enterprise onboarding flow (or insert into `managed_organizations`) and send invitations from that tenant so org admins can invite their employees.

## Troubleshooting
- `P1001` errors indicate Prisma cannot reach the database; confirm the `DATABASE_URL` and Postgres port.
- Unique constraint conflicts (`orgId_name`, `slug`, or `email`) mean the target already exists; rerun the script to update instead of inserting manually.
- If cache-coupled services rely on fresh identity data, invalidate identity cache tags (`src/server/lib/cache-tags/identity.ts`) after manual changes before running production workloads.
