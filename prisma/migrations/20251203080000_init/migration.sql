-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "compliance";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "hr";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "org";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "platform";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "auth"."InvitationStatus" AS ENUM ('pending', 'accepted', 'expired', 'declined', 'revoked');

-- CreateEnum
CREATE TYPE "auth"."SessionStatus" AS ENUM ('active', 'inactive', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "hr"."HRNotificationType" AS ENUM ('leave-approval', 'leave-rejection', 'document-expiry', 'policy-update', 'performance-review', 'system-announcement', 'compliance-reminder', 'other');

-- CreateEnum
CREATE TYPE "hr"."NotificationPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "hr"."EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN', 'APPRENTICE', 'FIXED_TERM', 'CASUAL');

-- CreateEnum
CREATE TYPE "hr"."LeavePolicyType" AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'ADOPTION', 'UNPAID', 'SPECIAL', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "hr"."LeaveAccrualFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'NONE');

-- CreateEnum
CREATE TYPE "hr"."LeaveRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'PENDING_APPROVAL', 'AWAITING_MANAGER');

-- CreateEnum
CREATE TYPE "hr"."HealthStatus" AS ENUM ('UNDEFINED', 'FIT_FOR_WORK', 'PARTIALLY_FIT', 'UNFIT_FOR_WORK', 'RECOVERY_PLAN');

-- CreateEnum
CREATE TYPE "hr"."ContractType" AS ENUM ('PERMANENT', 'FIXED_TERM', 'AGENCY', 'CONSULTANT', 'INTERNSHIP', 'APPRENTICESHIP');

-- CreateEnum
CREATE TYPE "hr"."AbsenceStatus" AS ENUM ('REPORTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "hr"."TimeEntryStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "hr"."PolicyCategory" AS ENUM ('HR_POLICIES', 'CODE_OF_CONDUCT', 'HEALTH_SAFETY', 'IT_SECURITY', 'BENEFITS', 'PROCEDURES', 'COMPLIANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "hr"."ChecklistTemplateType" AS ENUM ('onboarding', 'offboarding', 'custom');

-- CreateEnum
CREATE TYPE "hr"."ChecklistInstanceStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "hr"."ComplianceItemStatus" AS ENUM ('PENDING', 'COMPLETE', 'MISSING', 'PENDING_REVIEW', 'NOT_APPLICABLE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "compliance"."DocumentType" AS ENUM ('ONBOARDING', 'POLICY', 'CONTRACT', 'EVIDENCE', 'TRAINING', 'PERFORMANCE', 'COMPLIANCE', 'MEDICAL', 'FINANCIAL', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "compliance"."AuditEventType" AS ENUM ('ACCESS', 'DATA_CHANGE', 'POLICY_CHANGE', 'AUTH', 'SYSTEM', 'COMPLIANCE', 'SECURITY', 'DOCUMENT', 'LEAVE_REQUEST', 'PAYROLL');

-- CreateEnum
CREATE TYPE "compliance"."RetentionPolicy" AS ENUM ('IMMEDIATE', 'ONE_YEAR', 'THREE_YEARS', 'SEVEN_YEARS', 'PERMANENT', 'LEGAL_HOLD');

-- CreateEnum
CREATE TYPE "compliance"."SecurityClassification" AS ENUM ('UNCLASSIFIED', 'OFFICIAL', 'OFFICIAL_SENSITIVE', 'SECRET', 'TOP_SECRET');

-- CreateEnum
CREATE TYPE "hr"."OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "hr"."ComplianceTier" AS ENUM ('STANDARD', 'REGULATED', 'GOV_SECURE');

-- CreateEnum
CREATE TYPE "hr"."DataResidencyZone" AS ENUM ('UK_ONLY', 'UK_AND_EEA', 'GLOBAL_RESTRICTED');

-- CreateEnum
CREATE TYPE "hr"."DataClassificationLevel" AS ENUM ('OFFICIAL', 'OFFICIAL_SENSITIVE', 'SECRET', 'TOP_SECRET');

-- CreateEnum
CREATE TYPE "hr"."RoleScope" AS ENUM ('ORG', 'DEPARTMENT', 'GLOBAL');

-- CreateEnum
CREATE TYPE "hr"."MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "hr"."NotificationChannel" AS ENUM ('EMAIL', 'IN_APP', 'SMS');

-- CreateTable
CREATE TABLE "auth"."invitations" (
    "token" TEXT NOT NULL,
    "orgId" UUID NOT NULL,
    "organizationName" TEXT NOT NULL,
    "targetEmail" CITEXT NOT NULL,
    "status" "auth"."InvitationStatus" NOT NULL DEFAULT 'pending',
    "invitedByUserId" UUID,
    "onboardingData" JSONB NOT NULL,
    "metadata" JSONB,
    "securityContext" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" UUID,
    "revokedAt" TIMESTAMP(3),
    "revokedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "auth"."waitlist_entries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "organizationSize" JSONB,
    "region" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."security_events" (
    "id" UUID NOT NULL,
    "orgId" UUID,
    "userId" UUID,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "additionalInfo" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."user_sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "auth"."SessionStatus" NOT NULL DEFAULT 'active',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccess" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."notifications" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "hr"."HRNotificationType" NOT NULL DEFAULT 'other',
    "priority" "hr"."NotificationPriority" NOT NULL DEFAULT 'medium',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "correlationId" TEXT,
    "createdByUserId" UUID,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."employee_profiles" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "email" TEXT,
    "personalEmail" TEXT,
    "employeeNumber" TEXT NOT NULL,
    "jobTitle" TEXT,
    "employmentType" "hr"."EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "managerOrgId" UUID,
    "managerUserId" UUID,
    "phone" JSONB,
    "address" JSONB,
    "status" TEXT,
    "annualSalary" INTEGER,
    "hourlyRate" DECIMAL(8,2),
    "costCenter" TEXT,
    "location" JSONB,
    "roles" TEXT[],
    "eligibleLeaveTypes" TEXT[],
    "employmentPeriods" JSONB,
    "salaryDetails" JSONB,
    "skills" TEXT[],
    "certifications" JSONB,
    "niNumber" TEXT,
    "emergencyContact" JSONB,
    "nextOfKin" JSONB,
    "healthStatus" "hr"."HealthStatus" NOT NULL DEFAULT 'UNDEFINED',
    "workPermit" JSONB,
    "bankDetails" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."employment_contracts" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "contractType" "hr"."ContractType" NOT NULL DEFAULT 'PERMANENT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "jobTitle" TEXT NOT NULL,
    "departmentId" UUID,
    "location" TEXT,
    "probationEndDate" TIMESTAMP(3),
    "furloughStartDate" TIMESTAMP(3),
    "furloughEndDate" TIMESTAMP(3),
    "workingPattern" JSONB,
    "benefits" JSONB,
    "terminationReason" TEXT,
    "terminationNotes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employment_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."leave_policies" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "departmentId" UUID,
    "name" TEXT NOT NULL,
    "policyType" "hr"."LeavePolicyType" NOT NULL,
    "accrualFrequency" "hr"."LeaveAccrualFrequency" NOT NULL DEFAULT 'NONE',
    "accrualAmount" DECIMAL(5,2),
    "carryOverLimit" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "activeFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeTo" TIMESTAMP(3),
    "statutoryCompliance" BOOLEAN NOT NULL DEFAULT false,
    "maxConsecutiveDays" INTEGER,
    "allowNegativeBalance" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."leave_policy_accruals" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "tenureMonths" INTEGER NOT NULL DEFAULT 0,
    "accrualPerPeriod" DECIMAL(5,2) NOT NULL,
    "carryOverLimit" INTEGER,

    CONSTRAINT "leave_policy_accruals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."leave_balances" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "accruedHours" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "usedHours" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "carriedHours" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" UUID,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."leave_requests" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "status" "hr"."LeaveRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "reason" TEXT,
    "approverOrgId" UUID,
    "approverUserId" UUID,
    "submittedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "approvedByLineManager" BOOLEAN NOT NULL DEFAULT false,
    "sickNoteRequired" BOOLEAN NOT NULL DEFAULT false,
    "sickNoteReceived" BOOLEAN NOT NULL DEFAULT false,
    "returnToWorkDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."performance_reviews" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "reviewerOrgId" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "overallRating" INTEGER,
    "goalsMet" JSONB,
    "developmentPlan" JSONB,
    "reviewerNotes" TEXT,
    "employeeResponse" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."training_records" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "certificate" TEXT,
    "competency" JSONB,
    "cost" DECIMAL(10,2),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."absence_type_configs" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tracksBalance" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absence_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."absence_settings" (
    "orgId" UUID NOT NULL,
    "hoursInWorkDay" DECIMAL(5,2) NOT NULL DEFAULT 8,
    "roundingRule" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absence_settings_pkey" PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "hr"."hr_settings" (
    "orgId" UUID NOT NULL,
    "leaveTypes" JSONB,
    "workingHours" JSONB,
    "approvalWorkflows" JSONB,
    "overtimePolicy" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_settings_pkey" PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "hr"."unplanned_absences" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "typeId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "reason" TEXT,
    "status" "hr"."AbsenceStatus" NOT NULL DEFAULT 'REPORTED',
    "healthStatus" "hr"."HealthStatus",
    "approverOrgId" UUID,
    "approverUserId" UUID,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "metadata" JSONB,
    "deletionReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unplanned_absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."unplanned_absence_attachments" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "absenceId" UUID NOT NULL,
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

    CONSTRAINT "unplanned_absence_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."unplanned_absence_returns" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "absenceId" UUID NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "comments" TEXT,
    "submittedByUserId" UUID NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',

    CONSTRAINT "unplanned_absence_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."unplanned_absence_deletions" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "absenceId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "deletedByUserId" UUID NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',

    CONSTRAINT "unplanned_absence_deletions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."time_entries" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),
    "totalHours" DECIMAL(6,2),
    "breakDuration" DECIMAL(5,2),
    "project" TEXT,
    "tasks" JSONB,
    "notes" TEXT,
    "status" "hr"."TimeEntryStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedByOrgId" UUID,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."policies" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "hr"."PolicyCategory" NOT NULL DEFAULT 'HR_POLICIES',
    "version" TEXT NOT NULL DEFAULT 'v1',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "applicableRoles" JSONB,
    "applicableDepartments" JSONB,
    "requiresAcknowledgment" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."policy_acknowledgments" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "metadata" JSONB,

    CONSTRAINT "policy_acknowledgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."checklist_templates" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "hr"."ChecklistTemplateType" NOT NULL DEFAULT 'onboarding',
    "items" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."checklist_instances" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "templateName" TEXT,
    "status" "hr"."ChecklistInstanceStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "items" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."compliance_templates" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "categoryKey" TEXT,
    "version" TEXT,
    "items" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."compliance_log_items" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "templateItemId" TEXT NOT NULL,
    "categoryKey" TEXT,
    "status" "hr"."ComplianceItemStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "attachments" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_log_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance"."document_vault" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "ownerOrgId" UUID,
    "ownerUserId" UUID,
    "type" "compliance"."DocumentType" NOT NULL DEFAULT 'OTHER',
    "classification" "compliance"."SecurityClassification" NOT NULL DEFAULT 'UNCLASSIFIED',
    "retentionPolicy" "compliance"."RetentionPolicy" NOT NULL DEFAULT 'THREE_YEARS',
    "retentionExpires" TIMESTAMP(3),
    "blobPointer" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "fileName" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "latestVersionId" UUID,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "encryptedKeyRef" TEXT,
    "sensitivityLevel" INTEGER NOT NULL DEFAULT 0,
    "dataCategory" TEXT,
    "lawfulBasis" TEXT,
    "dataSubject" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance"."audit_logs" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID,
    "eventType" "compliance"."AuditEventType" NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionTokenHash" TEXT,
    "securityLevel" INTEGER,
    "dataSubjectId" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance"."event_outbox" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" JSONB,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance"."records" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "complianceType" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assignedToOrgId" UUID,
    "assignedToUserId" UUID,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "submittedByOrgId" UUID,
    "submittedByUserId" UUID,
    "submittedAt" TIMESTAMP(3),
    "responseDate" TIMESTAMP(3),
    "escalationDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance"."statutory_reports" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "reportType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "submittedByOrgId" UUID,
    "submittedByUserId" UUID,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fileName" TEXT,
    "fileSize" INTEGER,
    "checksum" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statutory_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance"."data_subject_rights" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID,
    "rightType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "responseDate" TIMESTAMP(3),
    "dataSubjectInfo" JSONB,
    "response" TEXT,
    "responseFrom" UUID,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_subject_rights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."organizations" (
    "id" UUID NOT NULL,
    "slug" CITEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "hr"."OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "complianceTier" "hr"."ComplianceTier" NOT NULL DEFAULT 'STANDARD',
    "dataResidency" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "regionCode" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "governanceTags" JSONB,
    "securityControls" JSONB,
    "encryptionKey" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."User" (
    "id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "displayName" TEXT,
    "status" "hr"."MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "authProvider" TEXT NOT NULL DEFAULT 'better-auth',
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastPasswordChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."roles" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "hr"."RoleScope" NOT NULL DEFAULT 'ORG',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."departments" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "leaderOrgId" UUID,
    "leaderUserId" UUID,
    "businessUnit" TEXT,
    "costCenter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."memberships" (
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID,
    "departmentId" UUID,
    "status" "hr"."MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "invitedBy" UUID,
    "invitedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("orgId","userId")
);

-- CreateTable
CREATE TABLE "hr"."notification_preferences" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "channel" "hr"."NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHours" JSONB,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."integration_configs" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "credentials" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "compliance" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."settings" (
    "id" TEXT NOT NULL,
    "branding" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."app_permissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."managed_organizations" (
    "id" UUID NOT NULL,
    "adminUserId" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "orgName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "moduleAccess" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "managed_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invitations_orgId_status_idx" ON "auth"."invitations"("orgId", "status");

-- CreateIndex
CREATE INDEX "invitations_targetEmail_idx" ON "auth"."invitations"("targetEmail");

-- CreateIndex
CREATE INDEX "invitations_expiresAt_idx" ON "auth"."invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "waitlist_entries_email_idx" ON "auth"."waitlist_entries"("email");

-- CreateIndex
CREATE INDEX "security_events_eventType_idx" ON "auth"."security_events"("eventType");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "auth"."security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_resolved_idx" ON "auth"."security_events"("resolved");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "auth"."user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_status_idx" ON "auth"."user_sessions"("status");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "auth"."user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "notifications_orgId_userId_isRead_idx" ON "hr"."notifications"("orgId", "userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_orgId_userId_type_idx" ON "hr"."notifications"("orgId", "userId", "type");

-- CreateIndex
CREATE INDEX "notifications_orgId_scheduledFor_idx" ON "hr"."notifications"("orgId", "scheduledFor");

-- CreateIndex
CREATE INDEX "notifications_orgId_priority_createdAt_idx" ON "hr"."notifications"("orgId", "priority", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_employeeNumber_key" ON "hr"."employee_profiles"("employeeNumber");

-- CreateIndex
CREATE INDEX "employee_profiles_managerOrgId_managerUserId_idx" ON "hr"."employee_profiles"("managerOrgId", "managerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_orgId_userId_key" ON "hr"."employee_profiles"("orgId", "userId");

-- CreateIndex
CREATE INDEX "employment_contracts_orgId_userId_idx" ON "hr"."employment_contracts"("orgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_policies_orgId_name_key" ON "hr"."leave_policies"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "leave_policy_accruals_policyId_tenureMonths_key" ON "hr"."leave_policy_accruals"("policyId", "tenureMonths");

-- CreateIndex
CREATE INDEX "leave_balances_policyId_idx" ON "hr"."leave_balances"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_orgId_userId_policyId_periodStart_key" ON "hr"."leave_balances"("orgId", "userId", "policyId", "periodStart");

-- CreateIndex
CREATE INDEX "leave_requests_orgId_status_idx" ON "hr"."leave_requests"("orgId", "status");

-- CreateIndex
CREATE INDEX "leave_requests_policyId_idx" ON "hr"."leave_requests"("policyId");

-- CreateIndex
CREATE INDEX "performance_reviews_orgId_userId_idx" ON "hr"."performance_reviews"("orgId", "userId");

-- CreateIndex
CREATE INDEX "performance_reviews_reviewPeriod_idx" ON "hr"."performance_reviews"("reviewPeriod");

-- CreateIndex
CREATE INDEX "training_records_orgId_userId_idx" ON "hr"."training_records"("orgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "absence_type_configs_orgId_key_key" ON "hr"."absence_type_configs"("orgId", "key");

-- CreateIndex
CREATE INDEX "unplanned_absences_orgId_userId_idx" ON "hr"."unplanned_absences"("orgId", "userId");

-- CreateIndex
CREATE INDEX "unplanned_absences_orgId_status_idx" ON "hr"."unplanned_absences"("orgId", "status");

-- CreateIndex
CREATE INDEX "unplanned_absence_attachments_orgId_absenceId_idx" ON "hr"."unplanned_absence_attachments"("orgId", "absenceId");

-- CreateIndex
CREATE UNIQUE INDEX "unplanned_absence_returns_absenceId_key" ON "hr"."unplanned_absence_returns"("absenceId");

-- CreateIndex
CREATE INDEX "unplanned_absence_returns_orgId_idx" ON "hr"."unplanned_absence_returns"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "unplanned_absence_deletions_absenceId_key" ON "hr"."unplanned_absence_deletions"("absenceId");

-- CreateIndex
CREATE INDEX "unplanned_absence_deletions_orgId_idx" ON "hr"."unplanned_absence_deletions"("orgId");

-- CreateIndex
CREATE INDEX "time_entries_orgId_userId_idx" ON "hr"."time_entries"("orgId", "userId");

-- CreateIndex
CREATE INDEX "time_entries_orgId_status_idx" ON "hr"."time_entries"("orgId", "status");

-- CreateIndex
CREATE INDEX "policies_orgId_status_idx" ON "hr"."policies"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "policy_acknowledgments_policyId_orgId_userId_version_key" ON "hr"."policy_acknowledgments"("policyId", "orgId", "userId", "version");

-- CreateIndex
CREATE INDEX "checklist_templates_orgId_type_idx" ON "hr"."checklist_templates"("orgId", "type");

-- CreateIndex
CREATE INDEX "checklist_instances_orgId_employeeId_idx" ON "hr"."checklist_instances"("orgId", "employeeId");

-- CreateIndex
CREATE INDEX "checklist_instances_templateId_idx" ON "hr"."checklist_instances"("templateId");

-- CreateIndex
CREATE INDEX "compliance_templates_orgId_categoryKey_idx" ON "hr"."compliance_templates"("orgId", "categoryKey");

-- CreateIndex
CREATE INDEX "compliance_log_items_orgId_userId_idx" ON "hr"."compliance_log_items"("orgId", "userId");

-- CreateIndex
CREATE INDEX "compliance_log_items_status_dueDate_idx" ON "hr"."compliance_log_items"("status", "dueDate");

-- CreateIndex
CREATE INDEX "document_vault_orgId_idx" ON "compliance"."document_vault"("orgId");

-- CreateIndex
CREATE INDEX "document_vault_classification_idx" ON "compliance"."document_vault"("classification");

-- CreateIndex
CREATE INDEX "document_vault_retentionPolicy_retentionExpires_idx" ON "compliance"."document_vault"("retentionPolicy", "retentionExpires");

-- CreateIndex
CREATE INDEX "audit_logs_orgId_createdAt_idx" ON "compliance"."audit_logs"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_orgId_eventType_idx" ON "compliance"."audit_logs"("orgId", "eventType");

-- CreateIndex
CREATE INDEX "audit_logs_dataSubjectId_idx" ON "compliance"."audit_logs"("dataSubjectId");

-- CreateIndex
CREATE INDEX "event_outbox_status_availableAt_idx" ON "compliance"."event_outbox"("status", "availableAt");

-- CreateIndex
CREATE INDEX "event_outbox_orgId_eventType_idx" ON "compliance"."event_outbox"("orgId", "eventType");

-- CreateIndex
CREATE INDEX "records_orgId_status_idx" ON "compliance"."records"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "records_orgId_referenceNumber_key" ON "compliance"."records"("orgId", "referenceNumber");

-- CreateIndex
CREATE INDEX "statutory_reports_orgId_reportType_period_idx" ON "compliance"."statutory_reports"("orgId", "reportType", "period");

-- CreateIndex
CREATE INDEX "statutory_reports_dueDate_idx" ON "compliance"."statutory_reports"("dueDate");

-- CreateIndex
CREATE INDEX "data_subject_rights_orgId_rightType_idx" ON "compliance"."data_subject_rights"("orgId", "rightType");

-- CreateIndex
CREATE INDEX "data_subject_rights_status_idx" ON "compliance"."data_subject_rights"("status");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "hr"."organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_tenantId_idx" ON "hr"."organizations"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "hr"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "hr"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_orgId_name_key" ON "hr"."roles"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_orgId_name_key" ON "hr"."departments"("orgId", "name");

-- CreateIndex
CREATE INDEX "memberships_userId_idx" ON "hr"."memberships"("userId");

-- CreateIndex
CREATE INDEX "memberships_orgId_status_idx" ON "hr"."memberships"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_orgId_userId_channel_key" ON "hr"."notification_preferences"("orgId", "userId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "integration_configs_orgId_provider_key" ON "hr"."integration_configs"("orgId", "provider");

-- CreateIndex
CREATE INDEX "app_permissions_category_idx" ON "platform"."app_permissions"("category");

-- CreateIndex
CREATE INDEX "managed_organizations_adminUserId_idx" ON "org"."managed_organizations"("adminUserId");

-- CreateIndex
CREATE INDEX "managed_organizations_orgId_idx" ON "org"."managed_organizations"("orgId");

-- AddForeignKey
ALTER TABLE "auth"."invitations" ADD CONSTRAINT "invitations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."invitations" ADD CONSTRAINT "invitations_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "hr"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."invitations" ADD CONSTRAINT "invitations_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "hr"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."invitations" ADD CONSTRAINT "invitations_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "hr"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."security_events" ADD CONSTRAINT "security_events_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."security_events" ADD CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hr"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."security_events" ADD CONSTRAINT "security_events_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "hr"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hr"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."notifications" ADD CONSTRAINT "notifications_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."notifications" ADD CONSTRAINT "notifications_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."employee_profiles" ADD CONSTRAINT "employee_profiles_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."employee_profiles" ADD CONSTRAINT "employee_profiles_managerOrgId_managerUserId_fkey" FOREIGN KEY ("managerOrgId", "managerUserId") REFERENCES "hr"."employee_profiles"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."employment_contracts" ADD CONSTRAINT "employment_contracts_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."employment_contracts" ADD CONSTRAINT "employment_contracts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_policies" ADD CONSTRAINT "leave_policies_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_policies" ADD CONSTRAINT "leave_policies_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_policy_accruals" ADD CONSTRAINT "leave_policy_accruals_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "hr"."leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_balances" ADD CONSTRAINT "leave_balance_membership_fk" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_balances" ADD CONSTRAINT "leave_balance_profile_fk" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."employee_profiles"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_balances" ADD CONSTRAINT "leave_balances_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "hr"."leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_requests" ADD CONSTRAINT "leave_requests_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_requests" ADD CONSTRAINT "leave_requests_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "hr"."leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."leave_requests" ADD CONSTRAINT "leave_requests_approverOrgId_approverUserId_fkey" FOREIGN KEY ("approverOrgId", "approverUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."performance_reviews" ADD CONSTRAINT "performance_reviews_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."performance_reviews" ADD CONSTRAINT "performance_reviews_reviewerOrgId_reviewerUserId_fkey" FOREIGN KEY ("reviewerOrgId", "reviewerUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."training_records" ADD CONSTRAINT "training_records_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."absence_type_configs" ADD CONSTRAINT "absence_type_configs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."absence_settings" ADD CONSTRAINT "absence_settings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."hr_settings" ADD CONSTRAINT "hr_settings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."unplanned_absences" ADD CONSTRAINT "unplanned_absences_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."unplanned_absences" ADD CONSTRAINT "unplanned_absences_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."unplanned_absences" ADD CONSTRAINT "unplanned_absences_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "hr"."absence_type_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."unplanned_absences" ADD CONSTRAINT "unplanned_absences_approverOrgId_approverUserId_fkey" FOREIGN KEY ("approverOrgId", "approverUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."unplanned_absence_attachments" ADD CONSTRAINT "unplanned_absence_attachments_absenceId_fkey" FOREIGN KEY ("absenceId") REFERENCES "hr"."unplanned_absences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."unplanned_absence_returns" ADD CONSTRAINT "unplanned_absence_returns_absenceId_fkey" FOREIGN KEY ("absenceId") REFERENCES "hr"."unplanned_absences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."unplanned_absence_deletions" ADD CONSTRAINT "unplanned_absence_deletions_absenceId_fkey" FOREIGN KEY ("absenceId") REFERENCES "hr"."unplanned_absences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."time_entries" ADD CONSTRAINT "time_entries_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."time_entries" ADD CONSTRAINT "time_entries_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."time_entries" ADD CONSTRAINT "time_entries_approvedByOrgId_approvedByUserId_fkey" FOREIGN KEY ("approvedByOrgId", "approvedByUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."policies" ADD CONSTRAINT "policies_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."policy_acknowledgments" ADD CONSTRAINT "policy_acknowledgments_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "hr"."policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."policy_acknowledgments" ADD CONSTRAINT "policy_acknowledgments_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."checklist_templates" ADD CONSTRAINT "checklist_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."checklist_instances" ADD CONSTRAINT "checklist_instances_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."checklist_instances" ADD CONSTRAINT "checklist_instances_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "hr"."checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."checklist_instances" ADD CONSTRAINT "checklist_instances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr"."employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."compliance_templates" ADD CONSTRAINT "compliance_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."compliance_log_items" ADD CONSTRAINT "compliance_log_items_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."compliance_log_items" ADD CONSTRAINT "compliance_log_items_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."document_vault" ADD CONSTRAINT "document_vault_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."document_vault" ADD CONSTRAINT "document_vault_ownerOrgId_ownerUserId_fkey" FOREIGN KEY ("ownerOrgId", "ownerUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."audit_logs" ADD CONSTRAINT "audit_logs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."audit_logs" ADD CONSTRAINT "audit_logs_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."event_outbox" ADD CONSTRAINT "event_outbox_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."records" ADD CONSTRAINT "records_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."records" ADD CONSTRAINT "records_assignedToOrgId_assignedToUserId_fkey" FOREIGN KEY ("assignedToOrgId", "assignedToUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."records" ADD CONSTRAINT "records_submittedByOrgId_submittedByUserId_fkey" FOREIGN KEY ("submittedByOrgId", "submittedByUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."statutory_reports" ADD CONSTRAINT "statutory_reports_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."statutory_reports" ADD CONSTRAINT "statutory_reports_submittedByOrgId_submittedByUserId_fkey" FOREIGN KEY ("submittedByOrgId", "submittedByUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."data_subject_rights" ADD CONSTRAINT "data_subject_rights_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."data_subject_rights" ADD CONSTRAINT "data_subject_rights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hr"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance"."data_subject_rights" ADD CONSTRAINT "data_subject_rights_responseFrom_fkey" FOREIGN KEY ("responseFrom") REFERENCES "hr"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."roles" ADD CONSTRAINT "roles_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."departments" ADD CONSTRAINT "departments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."departments" ADD CONSTRAINT "departments_leaderOrgId_leaderUserId_fkey" FOREIGN KEY ("leaderOrgId", "leaderUserId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."memberships" ADD CONSTRAINT "memberships_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hr"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."memberships" ADD CONSTRAINT "memberships_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "hr"."roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."memberships" ADD CONSTRAINT "memberships_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."notification_preferences" ADD CONSTRAINT "notification_preferences_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."notification_preferences" ADD CONSTRAINT "notification_preferences_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."integration_configs" ADD CONSTRAINT "integration_configs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."managed_organizations" ADD CONSTRAINT "managed_organizations_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "hr"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."managed_organizations" ADD CONSTRAINT "managed_organizations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

