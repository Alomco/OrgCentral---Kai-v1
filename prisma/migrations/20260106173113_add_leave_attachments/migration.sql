-- CreateTable
CREATE TABLE "hr"."leave_attachments" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "checksum" TEXT,
    "uploadedByUserId" UUID NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "auditBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leave_attachments_orgId_requestId_idx" ON "hr"."leave_attachments"("orgId", "requestId");

-- CreateIndex
CREATE INDEX "leave_attachments_orgId_dataClassification_residencyTag_idx" ON "hr"."leave_attachments"("orgId", "dataClassification", "residencyTag");

-- AddForeignKey
ALTER TABLE "hr"."leave_attachments" ADD CONSTRAINT "leave_attachments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "hr"."leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
