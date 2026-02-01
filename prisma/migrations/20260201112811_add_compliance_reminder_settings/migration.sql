-- CreateTable
CREATE TABLE "hr"."compliance_reminder_settings" (
    "orgId" UUID NOT NULL,
    "windowDays" INTEGER NOT NULL DEFAULT 30,
    "escalationDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "notifyOnComplete" BOOLEAN NOT NULL DEFAULT false,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_reminder_settings_pkey" PRIMARY KEY ("orgId")
);

-- AddForeignKey
ALTER TABLE "hr"."compliance_reminder_settings" ADD CONSTRAINT "compliance_reminder_settings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
