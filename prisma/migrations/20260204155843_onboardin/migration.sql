-- CreateEnum
CREATE TYPE "hr"."MentorAssignmentStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "hr"."ProvisioningTaskType" AS ENUM ('ACCOUNT', 'EQUIPMENT', 'ACCESS', 'LICENSE', 'SOFTWARE');

-- CreateEnum
CREATE TYPE "hr"."ProvisioningTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "hr"."WorkflowTemplateType" AS ENUM ('ONBOARDING', 'OFFBOARDING');

-- CreateEnum
CREATE TYPE "hr"."WorkflowRunStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "hr"."EmailSequenceTrigger" AS ENUM ('ONBOARDING_INVITE', 'ONBOARDING_ACCEPTED', 'OFFBOARDING_STARTED');

-- CreateEnum
CREATE TYPE "hr"."EmailSequenceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "hr"."EmailSequenceDeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "hr"."OnboardingMetricSource" AS ENUM ('SYSTEM', 'SURVEY', 'MANUAL');

-- CreateEnum
CREATE TYPE "hr"."DocumentAssignmentStatus" AS ENUM ('PENDING', 'COMPLETED', 'WAIVED');

-- CreateTable
CREATE TABLE "hr"."mentor_assignments" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "mentorOrgId" UUID NOT NULL,
    "mentorUserId" UUID NOT NULL,
    "status" "hr"."MentorAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "reason" TEXT,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."provisioning_tasks" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "requestedByUserId" UUID NOT NULL,
    "offboardingId" UUID,
    "taskType" "hr"."ProvisioningTaskType" NOT NULL,
    "status" "hr"."ProvisioningTaskStatus" NOT NULL DEFAULT 'PENDING',
    "systemKey" TEXT,
    "accountIdentifier" TEXT,
    "assetTag" TEXT,
    "accessLevel" TEXT,
    "instructions" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provisioning_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."onboarding_workflow_templates" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateType" "hr"."WorkflowTemplateType" NOT NULL DEFAULT 'ONBOARDING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "definition" JSONB NOT NULL,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_workflow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."onboarding_workflow_runs" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "offboardingId" UUID,
    "status" "hr"."WorkflowRunStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentStepKey" TEXT,
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

    CONSTRAINT "onboarding_workflow_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."email_sequence_templates" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" "hr"."EmailSequenceTrigger" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "steps" JSONB NOT NULL,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_sequence_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."email_sequence_enrollments" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "employeeId" UUID,
    "invitationToken" TEXT,
    "targetEmail" CITEXT NOT NULL,
    "status" "hr"."EmailSequenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pausedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_sequence_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."email_sequence_deliveries" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "stepKey" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "hr"."EmailSequenceDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "provider" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_sequence_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."onboarding_metric_definitions" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT,
    "targetValue" DECIMAL(12,2),
    "thresholds" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_metric_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."onboarding_metric_results" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "metricId" UUID NOT NULL,
    "value" DECIMAL(12,2),
    "valueText" TEXT,
    "source" "hr"."OnboardingMetricSource" NOT NULL DEFAULT 'SYSTEM',
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_metric_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."onboarding_feedback" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "summary" TEXT,
    "comments" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."document_template_assignments" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "documentId" UUID,
    "status" "hr"."DocumentAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "signatureProvider" TEXT,
    "externalEnvelopeId" TEXT,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "auditSource" TEXT,
    "correlationId" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_template_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance"."document_templates" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "compliance"."DocumentType" NOT NULL DEFAULT 'OTHER',
    "templateBody" TEXT NOT NULL,
    "templateSchema" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mentor_assignments_orgId_employeeId_idx" ON "hr"."mentor_assignments"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "mentor_assignments_mentorOrgId_mentorUserId_idx" ON "hr"."mentor_assignments"("mentorOrgId", "mentorUserId");

-- CreateIndex
CREATE INDEX "provisioning_tasks_orgId_employeeId_idx" ON "hr"."provisioning_tasks"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "provisioning_tasks_orgId_status_idx" ON "hr"."provisioning_tasks"("orgId", "status");

-- CreateIndex
CREATE INDEX "provisioning_tasks_offboardingId_idx" ON "hr"."provisioning_tasks"("offboardingId");

-- CreateIndex
CREATE INDEX "onboarding_workflow_templates_orgId_templateType_isActive_idx" ON "hr"."onboarding_workflow_templates"("orgId", "templateType", "isActive");

-- CreateIndex
CREATE INDEX "onboarding_workflow_runs_orgId_employeeId_idx" ON "hr"."onboarding_workflow_runs"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "onboarding_workflow_runs_templateId_idx" ON "hr"."onboarding_workflow_runs"("templateId");

-- CreateIndex
CREATE INDEX "onboarding_workflow_runs_offboardingId_idx" ON "hr"."onboarding_workflow_runs"("offboardingId");

-- CreateIndex
CREATE INDEX "email_sequence_templates_orgId_trigger_isActive_idx" ON "hr"."email_sequence_templates"("orgId", "trigger", "isActive");

-- CreateIndex
CREATE INDEX "email_sequence_enrollments_orgId_employeeId_idx" ON "hr"."email_sequence_enrollments"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "email_sequence_enrollments_templateId_idx" ON "hr"."email_sequence_enrollments"("templateId");

-- CreateIndex
CREATE INDEX "email_sequence_enrollments_orgId_status_idx" ON "hr"."email_sequence_enrollments"("orgId", "status");

-- CreateIndex
CREATE INDEX "email_sequence_deliveries_orgId_status_scheduledAt_idx" ON "hr"."email_sequence_deliveries"("orgId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "email_sequence_deliveries_enrollmentId_idx" ON "hr"."email_sequence_deliveries"("enrollmentId");

-- CreateIndex
CREATE INDEX "onboarding_metric_definitions_orgId_isActive_idx" ON "hr"."onboarding_metric_definitions"("orgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_metric_definitions_orgId_key_key" ON "hr"."onboarding_metric_definitions"("orgId", "key");

-- CreateIndex
CREATE INDEX "onboarding_metric_results_orgId_employeeId_idx" ON "hr"."onboarding_metric_results"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "onboarding_metric_results_metricId_idx" ON "hr"."onboarding_metric_results"("metricId");

-- CreateIndex
CREATE INDEX "onboarding_feedback_orgId_employeeId_idx" ON "hr"."onboarding_feedback"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "document_template_assignments_orgId_employeeId_idx" ON "hr"."document_template_assignments"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "document_template_assignments_templateId_idx" ON "hr"."document_template_assignments"("templateId");

-- CreateIndex
CREATE INDEX "document_template_assignments_documentId_idx" ON "hr"."document_template_assignments"("documentId");

-- CreateIndex
CREATE INDEX "document_templates_orgId_type_isActive_idx" ON "compliance"."document_templates"("orgId", "type", "isActive");

-- AddForeignKey
ALTER TABLE "hr"."mentor_assignments" ADD CONSTRAINT "mentor_assignments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."mentor_assignments" ADD CONSTRAINT "mentor_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."mentor_assignments" ADD CONSTRAINT "mentor_assignments_mentorOrgId_mentorUserId_fkey" FOREIGN KEY ("mentorOrgId", "mentorUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."provisioning_tasks" ADD CONSTRAINT "provisioning_tasks_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."provisioning_tasks" ADD CONSTRAINT "provisioning_tasks_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."provisioning_tasks" ADD CONSTRAINT "provisioning_tasks_orgId_requestedByUserId_fkey" FOREIGN KEY ("orgId", "requestedByUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."provisioning_tasks" ADD CONSTRAINT "provisioning_tasks_offboardingId_fkey" FOREIGN KEY ("offboardingId") REFERENCES "hr"."offboarding_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_workflow_templates" ADD CONSTRAINT "onboarding_workflow_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_workflow_runs" ADD CONSTRAINT "onboarding_workflow_runs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_workflow_runs" ADD CONSTRAINT "onboarding_workflow_runs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_workflow_runs" ADD CONSTRAINT "onboarding_workflow_runs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "hr"."onboarding_workflow_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_workflow_runs" ADD CONSTRAINT "onboarding_workflow_runs_offboardingId_fkey" FOREIGN KEY ("offboardingId") REFERENCES "hr"."offboarding_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."email_sequence_templates" ADD CONSTRAINT "email_sequence_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."email_sequence_enrollments" ADD CONSTRAINT "email_sequence_enrollments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."email_sequence_enrollments" ADD CONSTRAINT "email_sequence_enrollments_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "hr"."email_sequence_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."email_sequence_enrollments" ADD CONSTRAINT "email_sequence_enrollments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."email_sequence_deliveries" ADD CONSTRAINT "email_sequence_deliveries_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."email_sequence_deliveries" ADD CONSTRAINT "email_sequence_deliveries_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "hr"."email_sequence_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_metric_definitions" ADD CONSTRAINT "onboarding_metric_definitions_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_metric_results" ADD CONSTRAINT "onboarding_metric_results_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_metric_results" ADD CONSTRAINT "onboarding_metric_results_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_metric_results" ADD CONSTRAINT "onboarding_metric_results_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "hr"."onboarding_metric_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_feedback" ADD CONSTRAINT "onboarding_feedback_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."onboarding_feedback" ADD CONSTRAINT "onboarding_feedback_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."document_template_assignments" ADD CONSTRAINT "document_template_assignments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."document_template_assignments" ADD CONSTRAINT "document_template_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."document_template_assignments" ADD CONSTRAINT "document_template_assignments_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "compliance"."document_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."document_template_assignments" ADD CONSTRAINT "document_template_assignments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "compliance"."document_vault"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."document_templates" ADD CONSTRAINT "document_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
