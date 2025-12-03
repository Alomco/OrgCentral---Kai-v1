-- CreateEnum
CREATE TYPE "hr"."EmploymentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE', 'OFFBOARDING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "hr"."SalaryFrequency" AS ENUM ('HOURLY', 'MONTHLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "hr"."SalaryBasis" AS ENUM ('ANNUAL', 'HOURLY');

-- CreateEnum
CREATE TYPE "hr"."PaySchedule" AS ENUM ('MONTHLY', 'BI_WEEKLY');

-- DropIndex
DROP INDEX "hr"."employee_profiles_employeeNumber_key";

-- AlterTable
ALTER TABLE "hr"."employee_profiles" DROP COLUMN "status",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "auditSource" TEXT,
ADD COLUMN     "correlationId" TEXT,
ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "departmentId" UUID,
ADD COLUMN     "employmentStatus" "hr"."EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "erasureActorOrgId" UUID,
ADD COLUMN     "erasureActorUserId" UUID,
ADD COLUMN     "erasureCompletedAt" TIMESTAMP(3),
ADD COLUMN     "erasureReason" TEXT,
ADD COLUMN     "erasureRequestedAt" TIMESTAMP(3),
ADD COLUMN     "paySchedule" "hr"."PaySchedule",
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
ADD COLUMN     "retentionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "retentionPolicy" "compliance"."RetentionPolicy",
ADD COLUMN     "salaryAmount" DECIMAL(12,2),
ADD COLUMN     "salaryBasis" "hr"."SalaryBasis",
ADD COLUMN     "salaryCurrency" TEXT,
ADD COLUMN     "salaryFrequency" "hr"."SalaryFrequency",
ADD COLUMN     "schemaVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedBy" UUID,
ALTER COLUMN "email" SET DATA TYPE CITEXT,
ALTER COLUMN "personalEmail" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "hr"."employment_contracts" ADD COLUMN     "auditSource" TEXT,
ADD COLUMN     "correlationId" TEXT,
ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "erasureActorOrgId" UUID,
ADD COLUMN     "erasureActorUserId" UUID,
ADD COLUMN     "erasureCompletedAt" TIMESTAMP(3),
ADD COLUMN     "erasureReason" TEXT,
ADD COLUMN     "erasureRequestedAt" TIMESTAMP(3),
ADD COLUMN     "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
ADD COLUMN     "retentionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "retentionPolicy" "compliance"."RetentionPolicy",
ADD COLUMN     "schemaVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedBy" UUID;

-- CreateIndex
CREATE INDEX "employee_profiles_orgId_email_idx" ON "hr"."employee_profiles"("orgId", "email");

-- CreateIndex
CREATE INDEX "employee_profiles_orgId_employmentStatus_idx" ON "hr"."employee_profiles"("orgId", "employmentStatus");

-- CreateIndex
CREATE INDEX "employee_profiles_orgId_dataClassification_residencyTag_idx" ON "hr"."employee_profiles"("orgId", "dataClassification", "residencyTag");

-- CreateIndex
CREATE INDEX "employee_profiles_departmentId_idx" ON "hr"."employee_profiles"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_orgId_employeeNumber_key" ON "hr"."employee_profiles"("orgId", "employeeNumber");

-- CreateIndex
CREATE INDEX "employment_contracts_orgId_dataClassification_residencyTag_idx" ON "hr"."employment_contracts"("orgId", "dataClassification", "residencyTag");

-- AddForeignKey
ALTER TABLE "hr"."employee_profiles" ADD CONSTRAINT "employee_profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

