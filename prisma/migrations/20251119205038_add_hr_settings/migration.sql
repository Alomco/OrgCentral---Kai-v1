-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('REPORTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TimeEntryStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PolicyCategory" AS ENUM ('HR_POLICIES', 'CODE_OF_CONDUCT', 'HEALTH_SAFETY', 'IT_SECURITY', 'BENEFITS', 'PROCEDURES', 'COMPLIANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "HRNotificationType" AS ENUM ('LEAVE_APPROVAL', 'LEAVE_REJECTION', 'DOCUMENT_EXPIRY', 'POLICY_UPDATE', 'PERFORMANCE_REVIEW', 'SYSTEM_ANNOUNCEMENT', 'COMPLIANCE_REMINDER', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "auth.invitations" (
    "token" TEXT NOT NULL,
    "orgId" UUID NOT NULL,
    "organizationName" TEXT NOT NULL,
    "targetEmail" CITEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
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

    CONSTRAINT "auth.invitations_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "auth.waitlist_entries" (
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

    CONSTRAINT "auth.waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth.security_events" (
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

    CONSTRAINT "auth.security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth.user_sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'active',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccess" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "auth.user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.employee_profiles" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "jobTitle" TEXT,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "managerOrgId" UUID,
    "managerUserId" UUID,
    "annualSalary" INTEGER,
    "hourlyRate" DECIMAL(8,2),
    "costCenter" TEXT,
    "location" JSONB,
    "niNumber" TEXT,
    "emergencyContact" JSONB,
    "nextOfKin" JSONB,
    "healthStatus" "HealthStatus" NOT NULL DEFAULT 'UNDEFINED',
    "workPermit" JSONB,
    "bankDetails" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.employment_contracts" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "contractType" "ContractType" NOT NULL DEFAULT 'PERMANENT',
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

    CONSTRAINT "hr.employment_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.leave_policies" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "departmentId" UUID,
    "name" TEXT NOT NULL,
    "policyType" "LeavePolicyType" NOT NULL,
    "accrualFrequency" "LeaveAccrualFrequency" NOT NULL DEFAULT 'NONE',
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

    CONSTRAINT "hr.leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.leave_policy_accruals" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "tenureMonths" INTEGER NOT NULL DEFAULT 0,
    "accrualPerPeriod" DECIMAL(5,2) NOT NULL,
    "carryOverLimit" INTEGER,

    CONSTRAINT "hr.leave_policy_accruals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.leave_balances" (
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

    CONSTRAINT "hr.leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.leave_requests" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "status" "LeaveRequestStatus" NOT NULL DEFAULT 'DRAFT',
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

    CONSTRAINT "hr.leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.performance_reviews" (
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

    CONSTRAINT "hr.performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.training_records" (
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

    CONSTRAINT "hr.training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.absence_type_configs" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tracksBalance" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.absence_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.absence_settings" (
    "orgId" UUID NOT NULL,
    "hoursInWorkDay" DECIMAL(5,2) NOT NULL DEFAULT 8,
    "roundingRule" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.absence_settings_pkey" PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "hr.hr_settings" (
    "orgId" UUID NOT NULL,
    "leaveTypes" JSONB,
    "workingHours" JSONB,
    "approvalWorkflows" JSONB,
    "overtimePolicy" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.hr_settings_pkey" PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "hr.unplanned_absences" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "typeId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "reason" TEXT,
    "status" "AbsenceStatus" NOT NULL DEFAULT 'REPORTED',
    "healthStatus" "HealthStatus",
    "approverOrgId" UUID,
    "approverUserId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.unplanned_absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.time_entries" (
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
    "status" "TimeEntryStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedByOrgId" UUID,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.policies" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "PolicyCategory" NOT NULL DEFAULT 'HR_POLICIES',
    "version" TEXT NOT NULL DEFAULT 'v1',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "applicableRoles" JSONB,
    "applicableDepartments" JSONB,
    "requiresAcknowledgment" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.policy_acknowledgments" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "metadata" JSONB,

    CONSTRAINT "hr.policy_acknowledgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.notifications" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "HRNotificationType" NOT NULL DEFAULT 'OTHER',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr.notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance.document_vault" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "ownerOrgId" UUID,
    "ownerUserId" UUID,
    "type" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "classification" "SecurityClassification" NOT NULL DEFAULT 'UNCLASSIFIED',
    "retentionPolicy" "RetentionPolicy" NOT NULL DEFAULT 'THREE_YEARS',
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

    CONSTRAINT "compliance.document_vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance.audit_logs" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID,
    "eventType" "AuditEventType" NOT NULL,
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

    CONSTRAINT "compliance.audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance.event_outbox" (
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

    CONSTRAINT "compliance.event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance.records" (
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

    CONSTRAINT "compliance.records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance.statutory_reports" (
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

    CONSTRAINT "compliance.statutory_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance.data_subject_rights" (
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

    CONSTRAINT "compliance.data_subject_rights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.organizations" (
    "id" UUID NOT NULL,
    "slug" CITEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "complianceTier" "ComplianceTier" NOT NULL DEFAULT 'STANDARD',
    "dataResidency" "DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "dataClassification" "DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "regionCode" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "governanceTags" JSONB,
    "securityControls" JSONB,
    "encryptionKey" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.roles" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "RoleScope" NOT NULL DEFAULT 'ORG',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.departments" (
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

    CONSTRAINT "hr.departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.memberships" (
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID,
    "departmentId" UUID,
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "invitedBy" UUID,
    "invitedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "hr.memberships_pkey" PRIMARY KEY ("orgId","userId")
);

-- CreateTable
CREATE TABLE "hr.notification_preferences" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHours" JSONB,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr.integration_configs" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "credentials" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "compliance" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr.integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth.invitations_orgId_status_idx" ON "auth.invitations"("orgId", "status");

-- CreateIndex
CREATE INDEX "auth.invitations_targetEmail_idx" ON "auth.invitations"("targetEmail");

-- CreateIndex
CREATE INDEX "auth.invitations_expiresAt_idx" ON "auth.invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "auth.waitlist_entries_email_idx" ON "auth.waitlist_entries"("email");

-- CreateIndex
CREATE INDEX "auth.security_events_eventType_idx" ON "auth.security_events"("eventType");

-- CreateIndex
CREATE INDEX "auth.security_events_severity_idx" ON "auth.security_events"("severity");

-- CreateIndex
CREATE INDEX "auth.security_events_resolved_idx" ON "auth.security_events"("resolved");

-- CreateIndex
CREATE INDEX "auth.user_sessions_userId_idx" ON "auth.user_sessions"("userId");

-- CreateIndex
CREATE INDEX "auth.user_sessions_status_idx" ON "auth.user_sessions"("status");

-- CreateIndex
CREATE INDEX "auth.user_sessions_expiresAt_idx" ON "auth.user_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "hr.employee_profiles_employeeNumber_key" ON "hr.employee_profiles"("employeeNumber");

-- CreateIndex
CREATE INDEX "hr.employee_profiles_managerOrgId_managerUserId_idx" ON "hr.employee_profiles"("managerOrgId", "managerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "hr.employee_profiles_orgId_userId_key" ON "hr.employee_profiles"("orgId", "userId");

-- CreateIndex
CREATE INDEX "hr.employment_contracts_orgId_userId_idx" ON "hr.employment_contracts"("orgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "hr.leave_policies_orgId_name_key" ON "hr.leave_policies"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "hr.leave_policy_accruals_policyId_tenureMonths_key" ON "hr.leave_policy_accruals"("policyId", "tenureMonths");

-- CreateIndex
CREATE INDEX "hr.leave_balances_policyId_idx" ON "hr.leave_balances"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "hr.leave_balances_orgId_userId_policyId_periodStart_key" ON "hr.leave_balances"("orgId", "userId", "policyId", "periodStart");

-- CreateIndex
CREATE INDEX "hr.leave_requests_orgId_status_idx" ON "hr.leave_requests"("orgId", "status");

-- CreateIndex
CREATE INDEX "hr.leave_requests_policyId_idx" ON "hr.leave_requests"("policyId");

-- CreateIndex
CREATE INDEX "hr.performance_reviews_orgId_userId_idx" ON "hr.performance_reviews"("orgId", "userId");

-- CreateIndex
CREATE INDEX "hr.performance_reviews_reviewPeriod_idx" ON "hr.performance_reviews"("reviewPeriod");

-- CreateIndex
CREATE INDEX "hr.training_records_orgId_userId_idx" ON "hr.training_records"("orgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "hr.absence_type_configs_orgId_key_key" ON "hr.absence_type_configs"("orgId", "key");

-- CreateIndex
CREATE INDEX "hr.unplanned_absences_orgId_userId_idx" ON "hr.unplanned_absences"("orgId", "userId");

-- CreateIndex
CREATE INDEX "hr.unplanned_absences_orgId_status_idx" ON "hr.unplanned_absences"("orgId", "status");

-- CreateIndex
CREATE INDEX "hr.time_entries_orgId_userId_idx" ON "hr.time_entries"("orgId", "userId");

-- CreateIndex
CREATE INDEX "hr.time_entries_orgId_status_idx" ON "hr.time_entries"("orgId", "status");

-- CreateIndex
CREATE INDEX "hr.policies_orgId_status_idx" ON "hr.policies"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "hr.policy_acknowledgments_policyId_orgId_userId_version_key" ON "hr.policy_acknowledgments"("policyId", "orgId", "userId", "version");

-- CreateIndex
CREATE INDEX "hr.notifications_orgId_userId_isRead_idx" ON "hr.notifications"("orgId", "userId", "isRead");

-- CreateIndex
CREATE INDEX "hr.notifications_orgId_scheduledFor_idx" ON "hr.notifications"("orgId", "scheduledFor");

-- CreateIndex
CREATE INDEX "compliance.document_vault_orgId_idx" ON "compliance.document_vault"("orgId");

-- CreateIndex
CREATE INDEX "compliance.document_vault_classification_idx" ON "compliance.document_vault"("classification");

-- CreateIndex
CREATE INDEX "compliance.document_vault_retentionPolicy_retentionExpires_idx" ON "compliance.document_vault"("retentionPolicy", "retentionExpires");

-- CreateIndex
CREATE INDEX "compliance.audit_logs_orgId_createdAt_idx" ON "compliance.audit_logs"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "compliance.audit_logs_orgId_eventType_idx" ON "compliance.audit_logs"("orgId", "eventType");

-- CreateIndex
CREATE INDEX "compliance.audit_logs_dataSubjectId_idx" ON "compliance.audit_logs"("dataSubjectId");

-- CreateIndex
CREATE INDEX "compliance.event_outbox_status_availableAt_idx" ON "compliance.event_outbox"("status", "availableAt");

-- CreateIndex
CREATE INDEX "compliance.event_outbox_orgId_eventType_idx" ON "compliance.event_outbox"("orgId", "eventType");

-- CreateIndex
CREATE INDEX "compliance.records_orgId_status_idx" ON "compliance.records"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "compliance.records_orgId_referenceNumber_key" ON "compliance.records"("orgId", "referenceNumber");

-- CreateIndex
CREATE INDEX "compliance.statutory_reports_orgId_reportType_period_idx" ON "compliance.statutory_reports"("orgId", "reportType", "period");

-- CreateIndex
CREATE INDEX "compliance.statutory_reports_dueDate_idx" ON "compliance.statutory_reports"("dueDate");

-- CreateIndex
CREATE INDEX "compliance.data_subject_rights_orgId_rightType_idx" ON "compliance.data_subject_rights"("orgId", "rightType");

-- CreateIndex
CREATE INDEX "compliance.data_subject_rights_status_idx" ON "compliance.data_subject_rights"("status");

-- CreateIndex
CREATE UNIQUE INDEX "hr.organizations_slug_key" ON "hr.organizations"("slug");

-- CreateIndex
CREATE INDEX "hr.organizations_tenantId_idx" ON "hr.organizations"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "hr.roles_orgId_name_key" ON "hr.roles"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "hr.departments_orgId_name_key" ON "hr.departments"("orgId", "name");

-- CreateIndex
CREATE INDEX "hr.memberships_userId_idx" ON "hr.memberships"("userId");

-- CreateIndex
CREATE INDEX "hr.memberships_orgId_status_idx" ON "hr.memberships"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "hr.notification_preferences_orgId_userId_channel_key" ON "hr.notification_preferences"("orgId", "userId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "hr.integration_configs_orgId_provider_key" ON "hr.integration_configs"("orgId", "provider");

-- AddForeignKey
ALTER TABLE "auth.invitations" ADD CONSTRAINT "auth.invitations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth.invitations" ADD CONSTRAINT "auth.invitations_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth.invitations" ADD CONSTRAINT "auth.invitations_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth.invitations" ADD CONSTRAINT "auth.invitations_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth.security_events" ADD CONSTRAINT "auth.security_events_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth.security_events" ADD CONSTRAINT "auth.security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth.security_events" ADD CONSTRAINT "auth.security_events_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth.user_sessions" ADD CONSTRAINT "auth.user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.employee_profiles" ADD CONSTRAINT "hr.employee_profiles_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.employee_profiles" ADD CONSTRAINT "hr.employee_profiles_managerOrgId_managerUserId_fkey" FOREIGN KEY ("managerOrgId", "managerUserId") REFERENCES "hr.employee_profiles"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.employment_contracts" ADD CONSTRAINT "hr.employment_contracts_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.employment_contracts" ADD CONSTRAINT "hr.employment_contracts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr.departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_policies" ADD CONSTRAINT "hr.leave_policies_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_policies" ADD CONSTRAINT "hr.leave_policies_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr.departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_policy_accruals" ADD CONSTRAINT "hr.leave_policy_accruals_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "hr.leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_balances" ADD CONSTRAINT "leave_balance_membership_fk" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_balances" ADD CONSTRAINT "leave_balance_profile_fk" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.employee_profiles"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_balances" ADD CONSTRAINT "hr.leave_balances_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "hr.leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_requests" ADD CONSTRAINT "hr.leave_requests_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_requests" ADD CONSTRAINT "hr.leave_requests_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "hr.leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.leave_requests" ADD CONSTRAINT "hr.leave_requests_approverOrgId_approverUserId_fkey" FOREIGN KEY ("approverOrgId", "approverUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.performance_reviews" ADD CONSTRAINT "hr.performance_reviews_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.performance_reviews" ADD CONSTRAINT "hr.performance_reviews_reviewerOrgId_reviewerUserId_fkey" FOREIGN KEY ("reviewerOrgId", "reviewerUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.training_records" ADD CONSTRAINT "hr.training_records_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.absence_type_configs" ADD CONSTRAINT "hr.absence_type_configs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.absence_settings" ADD CONSTRAINT "hr.absence_settings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.hr_settings" ADD CONSTRAINT "hr.hr_settings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.unplanned_absences" ADD CONSTRAINT "hr.unplanned_absences_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.unplanned_absences" ADD CONSTRAINT "hr.unplanned_absences_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.unplanned_absences" ADD CONSTRAINT "hr.unplanned_absences_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "hr.absence_type_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.unplanned_absences" ADD CONSTRAINT "hr.unplanned_absences_approverOrgId_approverUserId_fkey" FOREIGN KEY ("approverOrgId", "approverUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.time_entries" ADD CONSTRAINT "hr.time_entries_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.time_entries" ADD CONSTRAINT "hr.time_entries_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.time_entries" ADD CONSTRAINT "hr.time_entries_approvedByOrgId_approvedByUserId_fkey" FOREIGN KEY ("approvedByOrgId", "approvedByUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.policies" ADD CONSTRAINT "hr.policies_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.policy_acknowledgments" ADD CONSTRAINT "hr.policy_acknowledgments_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "hr.policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.policy_acknowledgments" ADD CONSTRAINT "hr.policy_acknowledgments_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.notifications" ADD CONSTRAINT "hr.notifications_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.notifications" ADD CONSTRAINT "hr.notifications_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.document_vault" ADD CONSTRAINT "compliance.document_vault_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.document_vault" ADD CONSTRAINT "compliance.document_vault_ownerOrgId_ownerUserId_fkey" FOREIGN KEY ("ownerOrgId", "ownerUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.audit_logs" ADD CONSTRAINT "compliance.audit_logs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.audit_logs" ADD CONSTRAINT "compliance.audit_logs_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.event_outbox" ADD CONSTRAINT "compliance.event_outbox_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.records" ADD CONSTRAINT "compliance.records_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.records" ADD CONSTRAINT "compliance.records_assignedToOrgId_assignedToUserId_fkey" FOREIGN KEY ("assignedToOrgId", "assignedToUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.records" ADD CONSTRAINT "compliance.records_submittedByOrgId_submittedByUserId_fkey" FOREIGN KEY ("submittedByOrgId", "submittedByUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.statutory_reports" ADD CONSTRAINT "compliance.statutory_reports_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.statutory_reports" ADD CONSTRAINT "compliance.statutory_reports_submittedByOrgId_submittedByU_fkey" FOREIGN KEY ("submittedByOrgId", "submittedByUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.data_subject_rights" ADD CONSTRAINT "compliance.data_subject_rights_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.data_subject_rights" ADD CONSTRAINT "compliance.data_subject_rights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance.data_subject_rights" ADD CONSTRAINT "compliance.data_subject_rights_responseFrom_fkey" FOREIGN KEY ("responseFrom") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.roles" ADD CONSTRAINT "hr.roles_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.departments" ADD CONSTRAINT "hr.departments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.departments" ADD CONSTRAINT "hr.departments_leaderOrgId_leaderUserId_fkey" FOREIGN KEY ("leaderOrgId", "leaderUserId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.memberships" ADD CONSTRAINT "hr.memberships_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.memberships" ADD CONSTRAINT "hr.memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.memberships" ADD CONSTRAINT "hr.memberships_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "hr.roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.memberships" ADD CONSTRAINT "hr.memberships_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr.departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.notification_preferences" ADD CONSTRAINT "hr.notification_preferences_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.notification_preferences" ADD CONSTRAINT "hr.notification_preferences_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr.memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr.integration_configs" ADD CONSTRAINT "hr.integration_configs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr.organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
