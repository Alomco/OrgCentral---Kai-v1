-- Migration: Add composite submitter (orgId + userId) for compliance records and statutory reports
-- 1) Add new columns submittedByOrgId & submittedByUserId
-- 2) Copy existing submittedBy (user id) to submittedByUserId and set submittedByOrgId = orgId where submittedBy is not null
-- 3) Add foreign keys to hr.memberships
-- 4) Drop old fk and column submittedBy

BEGIN;

-- Add columns to compliance.records
ALTER TABLE "compliance"."records"
  ADD COLUMN "submittedByOrgId" UUID,
  ADD COLUMN "submittedByUserId" UUID;

-- Populate new columns from existing submittedBy
UPDATE "compliance"."records"
SET "submittedByUserId" = "submittedBy",
    "submittedByOrgId" = "orgId"
WHERE "submittedBy" IS NOT NULL;

-- Add FK to memberships (orgId, userId)
ALTER TABLE "compliance"."records"
  ADD CONSTRAINT "compliance.records_submittedBy_membership_fkey" FOREIGN KEY ("submittedByOrgId", "submittedByUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove old FK (if present)
ALTER TABLE IF EXISTS "compliance"."records" DROP CONSTRAINT IF EXISTS "compliance.records_submittedBy_fkey";

-- Add columns to compliance.statutory_reports
ALTER TABLE "compliance"."statutory_reports"
  ADD COLUMN "submittedByOrgId" UUID,
  ADD COLUMN "submittedByUserId" UUID;

-- Populate new columns from existing submittedBy
UPDATE "compliance"."statutory_reports"
SET "submittedByUserId" = "submittedBy",
    "submittedByOrgId" = "orgId"
WHERE "submittedBy" IS NOT NULL;

-- Add FK to memberships (orgId,userId)
ALTER TABLE "compliance"."statutory_reports"
  ADD CONSTRAINT "compliance.statutory_reports_submittedBy_membership_fkey" FOREIGN KEY ("submittedByOrgId", "submittedByUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove old FK (if present)
ALTER TABLE IF EXISTS "compliance"."statutory_reports" DROP CONSTRAINT IF EXISTS "compliance.statutory_reports_submittedBy_fkey";

-- Optionally drop old columns; comment out to keep a copy during verification
-- ALTER TABLE "compliance.records" DROP COLUMN IF EXISTS "submittedBy";
-- ALTER TABLE "compliance.statutory_reports" DROP COLUMN IF EXISTS "submittedBy";

COMMIT;
