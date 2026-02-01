-- CreateEnum
CREATE TYPE "hr"."OffboardingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "hr"."offboarding_records" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "initiatedByUserId" UUID NOT NULL,
    "checklistInstanceId" UUID,
    "reason" TEXT NOT NULL,
    "status" "hr"."OffboardingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offboarding_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offboarding_records_checklistInstanceId_key" ON "hr"."offboarding_records"("checklistInstanceId");

-- CreateIndex
CREATE INDEX "offboarding_records_orgId_employeeId_idx" ON "hr"."offboarding_records"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "offboarding_records_orgId_status_idx" ON "hr"."offboarding_records"("orgId", "status");

-- AddForeignKey
ALTER TABLE "hr"."offboarding_records" ADD CONSTRAINT "offboarding_records_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."offboarding_records" ADD CONSTRAINT "offboarding_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."offboarding_records" ADD CONSTRAINT "offboarding_records_checklistInstanceId_fkey" FOREIGN KEY ("checklistInstanceId") REFERENCES "hr"."checklist_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
