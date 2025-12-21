--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY org.managed_organizations DROP CONSTRAINT IF EXISTS "managed_organizations_orgId_fkey";
ALTER TABLE IF EXISTS ONLY org.managed_organizations DROP CONSTRAINT IF EXISTS "managed_organizations_adminUserId_fkey";
ALTER TABLE IF EXISTS ONLY hr.unplanned_absences DROP CONSTRAINT IF EXISTS "unplanned_absences_typeId_fkey";
ALTER TABLE IF EXISTS ONLY hr.unplanned_absences DROP CONSTRAINT IF EXISTS "unplanned_absences_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.unplanned_absences DROP CONSTRAINT IF EXISTS "unplanned_absences_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.unplanned_absences DROP CONSTRAINT IF EXISTS "unplanned_absences_approverOrgId_approverUserId_fkey";
ALTER TABLE IF EXISTS ONLY hr.unplanned_absence_returns DROP CONSTRAINT IF EXISTS "unplanned_absence_returns_absenceId_fkey";
ALTER TABLE IF EXISTS ONLY hr.unplanned_absence_deletions DROP CONSTRAINT IF EXISTS "unplanned_absence_deletions_absenceId_fkey";
ALTER TABLE IF EXISTS ONLY hr.unplanned_absence_attachments DROP CONSTRAINT IF EXISTS "unplanned_absence_attachments_absenceId_fkey";
ALTER TABLE IF EXISTS ONLY hr.training_records DROP CONSTRAINT IF EXISTS "training_records_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.time_entries DROP CONSTRAINT IF EXISTS "time_entries_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.time_entries DROP CONSTRAINT IF EXISTS "time_entries_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.time_entries DROP CONSTRAINT IF EXISTS "time_entries_approvedByOrgId_approvedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY hr.roles DROP CONSTRAINT IF EXISTS "roles_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.policy_acknowledgments DROP CONSTRAINT IF EXISTS "policy_acknowledgments_policyId_fkey";
ALTER TABLE IF EXISTS ONLY hr.policy_acknowledgments DROP CONSTRAINT IF EXISTS "policy_acknowledgments_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.policies DROP CONSTRAINT IF EXISTS "policies_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.performance_reviews DROP CONSTRAINT IF EXISTS "performance_reviews_reviewerOrgId_reviewerUserId_fkey";
ALTER TABLE IF EXISTS ONLY hr.performance_reviews DROP CONSTRAINT IF EXISTS "performance_reviews_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.notifications DROP CONSTRAINT IF EXISTS "notifications_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.notifications DROP CONSTRAINT IF EXISTS "notifications_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.notification_preferences DROP CONSTRAINT IF EXISTS "notification_preferences_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.notification_preferences DROP CONSTRAINT IF EXISTS "notification_preferences_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.memberships DROP CONSTRAINT IF EXISTS "memberships_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.memberships DROP CONSTRAINT IF EXISTS "memberships_roleId_fkey";
ALTER TABLE IF EXISTS ONLY hr.memberships DROP CONSTRAINT IF EXISTS "memberships_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.memberships DROP CONSTRAINT IF EXISTS "memberships_departmentId_fkey";
ALTER TABLE IF EXISTS ONLY hr.leave_requests DROP CONSTRAINT IF EXISTS "leave_requests_policyId_fkey";
ALTER TABLE IF EXISTS ONLY hr.leave_requests DROP CONSTRAINT IF EXISTS "leave_requests_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.leave_requests DROP CONSTRAINT IF EXISTS "leave_requests_approverOrgId_approverUserId_fkey";
ALTER TABLE IF EXISTS ONLY hr.leave_policy_accruals DROP CONSTRAINT IF EXISTS "leave_policy_accruals_policyId_fkey";
ALTER TABLE IF EXISTS ONLY hr.leave_policies DROP CONSTRAINT IF EXISTS "leave_policies_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.leave_policies DROP CONSTRAINT IF EXISTS "leave_policies_departmentId_fkey";
ALTER TABLE IF EXISTS ONLY hr.leave_balances DROP CONSTRAINT IF EXISTS "leave_balances_policyId_fkey";
ALTER TABLE IF EXISTS ONLY hr.leave_balances DROP CONSTRAINT IF EXISTS leave_balance_profile_fk;
ALTER TABLE IF EXISTS ONLY hr.leave_balances DROP CONSTRAINT IF EXISTS leave_balance_membership_fk;
ALTER TABLE IF EXISTS ONLY hr.integration_configs DROP CONSTRAINT IF EXISTS "integration_configs_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.hr_settings DROP CONSTRAINT IF EXISTS "hr_settings_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.employment_contracts DROP CONSTRAINT IF EXISTS "employment_contracts_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.employment_contracts DROP CONSTRAINT IF EXISTS "employment_contracts_departmentId_fkey";
ALTER TABLE IF EXISTS ONLY hr.employee_profiles DROP CONSTRAINT IF EXISTS "employee_profiles_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.employee_profiles DROP CONSTRAINT IF EXISTS "employee_profiles_managerOrgId_managerUserId_fkey";
ALTER TABLE IF EXISTS ONLY hr.employee_profiles DROP CONSTRAINT IF EXISTS "employee_profiles_departmentId_fkey";
ALTER TABLE IF EXISTS ONLY hr.departments DROP CONSTRAINT IF EXISTS "departments_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.departments DROP CONSTRAINT IF EXISTS "departments_leaderOrgId_leaderUserId_fkey";
ALTER TABLE IF EXISTS ONLY hr.compliance_templates DROP CONSTRAINT IF EXISTS "compliance_templates_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.compliance_log_items DROP CONSTRAINT IF EXISTS "compliance_log_items_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY hr.compliance_log_items DROP CONSTRAINT IF EXISTS "compliance_log_items_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.checklist_templates DROP CONSTRAINT IF EXISTS "checklist_templates_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.checklist_instances DROP CONSTRAINT IF EXISTS "checklist_instances_templateId_fkey";
ALTER TABLE IF EXISTS ONLY hr.checklist_instances DROP CONSTRAINT IF EXISTS "checklist_instances_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.checklist_instances DROP CONSTRAINT IF EXISTS "checklist_instances_employeeId_fkey";
ALTER TABLE IF EXISTS ONLY hr.absence_type_configs DROP CONSTRAINT IF EXISTS "absence_type_configs_orgId_fkey";
ALTER TABLE IF EXISTS ONLY hr.absence_settings DROP CONSTRAINT IF EXISTS "absence_settings_orgId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.statutory_reports DROP CONSTRAINT IF EXISTS "statutory_reports_submittedByOrgId_submittedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.statutory_reports DROP CONSTRAINT IF EXISTS "statutory_reports_orgId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.records DROP CONSTRAINT IF EXISTS "records_submittedByOrgId_submittedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.records DROP CONSTRAINT IF EXISTS "records_orgId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.records DROP CONSTRAINT IF EXISTS "records_assignedToOrgId_assignedToUserId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.event_outbox DROP CONSTRAINT IF EXISTS "event_outbox_orgId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.document_vault DROP CONSTRAINT IF EXISTS "document_vault_ownerOrgId_ownerUserId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.document_vault DROP CONSTRAINT IF EXISTS "document_vault_orgId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.data_subject_rights DROP CONSTRAINT IF EXISTS "data_subject_rights_userId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.data_subject_rights DROP CONSTRAINT IF EXISTS "data_subject_rights_responseFrom_fkey";
ALTER TABLE IF EXISTS ONLY compliance.data_subject_rights DROP CONSTRAINT IF EXISTS "data_subject_rights_orgId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.audit_logs DROP CONSTRAINT IF EXISTS "audit_logs_orgId_userId_fkey";
ALTER TABLE IF EXISTS ONLY compliance.audit_logs DROP CONSTRAINT IF EXISTS "audit_logs_orgId_fkey";
ALTER TABLE IF EXISTS ONLY auth.user_sessions DROP CONSTRAINT IF EXISTS "user_sessions_userId_fkey";
ALTER TABLE IF EXISTS ONLY auth.security_events DROP CONSTRAINT IF EXISTS "security_events_userId_fkey";
ALTER TABLE IF EXISTS ONLY auth.security_events DROP CONSTRAINT IF EXISTS "security_events_resolvedBy_fkey";
ALTER TABLE IF EXISTS ONLY auth.security_events DROP CONSTRAINT IF EXISTS "security_events_orgId_fkey";
ALTER TABLE IF EXISTS ONLY auth.invitations DROP CONSTRAINT IF EXISTS "invitations_revokedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY auth.invitations DROP CONSTRAINT IF EXISTS "invitations_orgId_fkey";
ALTER TABLE IF EXISTS ONLY auth.invitations DROP CONSTRAINT IF EXISTS "invitations_invitedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY auth.invitations DROP CONSTRAINT IF EXISTS "invitations_acceptedByUserId_fkey";
DROP INDEX IF EXISTS platform.app_permissions_category_idx;
DROP INDEX IF EXISTS org."managed_organizations_orgId_idx";
DROP INDEX IF EXISTS org."managed_organizations_adminUserId_idx";
DROP INDEX IF EXISTS hr."unplanned_absences_orgId_userId_idx";
DROP INDEX IF EXISTS hr."unplanned_absences_orgId_status_idx";
DROP INDEX IF EXISTS hr."unplanned_absence_returns_orgId_idx";
DROP INDEX IF EXISTS hr."unplanned_absence_returns_absenceId_key";
DROP INDEX IF EXISTS hr."unplanned_absence_deletions_orgId_idx";
DROP INDEX IF EXISTS hr."unplanned_absence_deletions_absenceId_key";
DROP INDEX IF EXISTS hr."unplanned_absence_attachments_orgId_absenceId_idx";
DROP INDEX IF EXISTS hr."training_records_orgId_userId_idx";
DROP INDEX IF EXISTS hr."time_entries_orgId_userId_idx";
DROP INDEX IF EXISTS hr."time_entries_orgId_status_idx";
DROP INDEX IF EXISTS hr."roles_orgId_name_key";
DROP INDEX IF EXISTS hr."policy_acknowledgments_policyId_orgId_userId_version_key";
DROP INDEX IF EXISTS hr."policies_orgId_status_idx";
DROP INDEX IF EXISTS hr."performance_reviews_reviewPeriod_idx";
DROP INDEX IF EXISTS hr."performance_reviews_orgId_userId_idx";
DROP INDEX IF EXISTS hr."organizations_tenantId_idx";
DROP INDEX IF EXISTS hr.organizations_slug_key;
DROP INDEX IF EXISTS hr."notifications_orgId_userId_type_idx";
DROP INDEX IF EXISTS hr."notifications_orgId_userId_isRead_idx";
DROP INDEX IF EXISTS hr."notifications_orgId_scheduledFor_idx";
DROP INDEX IF EXISTS hr."notifications_orgId_priority_createdAt_idx";
DROP INDEX IF EXISTS hr."notification_preferences_orgId_userId_channel_key";
DROP INDEX IF EXISTS hr."memberships_userId_idx";
DROP INDEX IF EXISTS hr."memberships_orgId_status_idx";
DROP INDEX IF EXISTS hr."leave_requests_policyId_idx";
DROP INDEX IF EXISTS hr."leave_requests_orgId_status_idx";
DROP INDEX IF EXISTS hr."leave_policy_accruals_policyId_tenureMonths_key";
DROP INDEX IF EXISTS hr."leave_policies_orgId_name_key";
DROP INDEX IF EXISTS hr."leave_balances_policyId_idx";
DROP INDEX IF EXISTS hr."leave_balances_orgId_userId_policyId_periodStart_key";
DROP INDEX IF EXISTS hr."integration_configs_orgId_provider_key";
DROP INDEX IF EXISTS hr."employment_contracts_orgId_userId_idx";
DROP INDEX IF EXISTS hr."employment_contracts_orgId_dataClassification_residencyTag_idx";
DROP INDEX IF EXISTS hr."employee_profiles_orgId_userId_key";
DROP INDEX IF EXISTS hr."employee_profiles_orgId_employmentStatus_idx";
DROP INDEX IF EXISTS hr."employee_profiles_orgId_employeeNumber_key";
DROP INDEX IF EXISTS hr."employee_profiles_orgId_email_idx";
DROP INDEX IF EXISTS hr."employee_profiles_orgId_dataClassification_residencyTag_idx";
DROP INDEX IF EXISTS hr."employee_profiles_managerOrgId_managerUserId_idx";
DROP INDEX IF EXISTS hr."employee_profiles_departmentId_idx";
DROP INDEX IF EXISTS hr."departments_orgId_name_key";
DROP INDEX IF EXISTS hr."compliance_templates_orgId_categoryKey_idx";
DROP INDEX IF EXISTS hr."compliance_log_items_status_dueDate_idx";
DROP INDEX IF EXISTS hr."compliance_log_items_orgId_userId_idx";
DROP INDEX IF EXISTS hr."checklist_templates_orgId_type_idx";
DROP INDEX IF EXISTS hr."checklist_instances_templateId_idx";
DROP INDEX IF EXISTS hr."checklist_instances_orgId_employeeId_idx";
DROP INDEX IF EXISTS hr."absence_type_configs_orgId_key_key";
DROP INDEX IF EXISTS hr."User_email_key";
DROP INDEX IF EXISTS hr."User_email_idx";
DROP INDEX IF EXISTS compliance."statutory_reports_orgId_reportType_period_idx";
DROP INDEX IF EXISTS compliance."statutory_reports_dueDate_idx";
DROP INDEX IF EXISTS compliance."records_orgId_status_idx";
DROP INDEX IF EXISTS compliance."records_orgId_referenceNumber_key";
DROP INDEX IF EXISTS compliance."event_outbox_status_availableAt_idx";
DROP INDEX IF EXISTS compliance."event_outbox_orgId_eventType_idx";
DROP INDEX IF EXISTS compliance."document_vault_retentionPolicy_retentionExpires_idx";
DROP INDEX IF EXISTS compliance."document_vault_orgId_idx";
DROP INDEX IF EXISTS compliance.document_vault_classification_idx;
DROP INDEX IF EXISTS compliance.data_subject_rights_status_idx;
DROP INDEX IF EXISTS compliance."data_subject_rights_orgId_rightType_idx";
DROP INDEX IF EXISTS compliance."audit_logs_orgId_eventType_idx";
DROP INDEX IF EXISTS compliance."audit_logs_orgId_createdAt_idx";
DROP INDEX IF EXISTS compliance."audit_logs_dataSubjectId_idx";
DROP INDEX IF EXISTS auth.waitlist_entries_email_idx;
DROP INDEX IF EXISTS auth."user_sessions_userId_idx";
DROP INDEX IF EXISTS auth.user_sessions_status_idx;
DROP INDEX IF EXISTS auth."user_sessions_expiresAt_idx";
DROP INDEX IF EXISTS auth.security_events_severity_idx;
DROP INDEX IF EXISTS auth.security_events_resolved_idx;
DROP INDEX IF EXISTS auth."security_events_eventType_idx";
DROP INDEX IF EXISTS auth."invitations_targetEmail_idx";
DROP INDEX IF EXISTS auth."invitations_orgId_status_idx";
DROP INDEX IF EXISTS auth."invitations_expiresAt_idx";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY platform.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY platform.app_permissions DROP CONSTRAINT IF EXISTS app_permissions_pkey;
ALTER TABLE IF EXISTS ONLY org.managed_organizations DROP CONSTRAINT IF EXISTS managed_organizations_pkey;
ALTER TABLE IF EXISTS ONLY hr.unplanned_absences DROP CONSTRAINT IF EXISTS unplanned_absences_pkey;
ALTER TABLE IF EXISTS ONLY hr.unplanned_absence_returns DROP CONSTRAINT IF EXISTS unplanned_absence_returns_pkey;
ALTER TABLE IF EXISTS ONLY hr.unplanned_absence_deletions DROP CONSTRAINT IF EXISTS unplanned_absence_deletions_pkey;
ALTER TABLE IF EXISTS ONLY hr.unplanned_absence_attachments DROP CONSTRAINT IF EXISTS unplanned_absence_attachments_pkey;
ALTER TABLE IF EXISTS ONLY hr.training_records DROP CONSTRAINT IF EXISTS training_records_pkey;
ALTER TABLE IF EXISTS ONLY hr.time_entries DROP CONSTRAINT IF EXISTS time_entries_pkey;
ALTER TABLE IF EXISTS ONLY hr.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY hr.policy_acknowledgments DROP CONSTRAINT IF EXISTS policy_acknowledgments_pkey;
ALTER TABLE IF EXISTS ONLY hr.policies DROP CONSTRAINT IF EXISTS policies_pkey;
ALTER TABLE IF EXISTS ONLY hr.performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_pkey;
ALTER TABLE IF EXISTS ONLY hr.organizations DROP CONSTRAINT IF EXISTS organizations_pkey;
ALTER TABLE IF EXISTS ONLY hr.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY hr.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_pkey;
ALTER TABLE IF EXISTS ONLY hr.memberships DROP CONSTRAINT IF EXISTS memberships_pkey;
ALTER TABLE IF EXISTS ONLY hr.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_pkey;
ALTER TABLE IF EXISTS ONLY hr.leave_policy_accruals DROP CONSTRAINT IF EXISTS leave_policy_accruals_pkey;
ALTER TABLE IF EXISTS ONLY hr.leave_policies DROP CONSTRAINT IF EXISTS leave_policies_pkey;
ALTER TABLE IF EXISTS ONLY hr.leave_balances DROP CONSTRAINT IF EXISTS leave_balances_pkey;
ALTER TABLE IF EXISTS ONLY hr.integration_configs DROP CONSTRAINT IF EXISTS integration_configs_pkey;
ALTER TABLE IF EXISTS ONLY hr.hr_settings DROP CONSTRAINT IF EXISTS hr_settings_pkey;
ALTER TABLE IF EXISTS ONLY hr.employment_contracts DROP CONSTRAINT IF EXISTS employment_contracts_pkey;
ALTER TABLE IF EXISTS ONLY hr.employee_profiles DROP CONSTRAINT IF EXISTS employee_profiles_pkey;
ALTER TABLE IF EXISTS ONLY hr.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY hr.compliance_templates DROP CONSTRAINT IF EXISTS compliance_templates_pkey;
ALTER TABLE IF EXISTS ONLY hr.compliance_log_items DROP CONSTRAINT IF EXISTS compliance_log_items_pkey;
ALTER TABLE IF EXISTS ONLY hr.checklist_templates DROP CONSTRAINT IF EXISTS checklist_templates_pkey;
ALTER TABLE IF EXISTS ONLY hr.checklist_instances DROP CONSTRAINT IF EXISTS checklist_instances_pkey;
ALTER TABLE IF EXISTS ONLY hr.absence_type_configs DROP CONSTRAINT IF EXISTS absence_type_configs_pkey;
ALTER TABLE IF EXISTS ONLY hr.absence_settings DROP CONSTRAINT IF EXISTS absence_settings_pkey;
ALTER TABLE IF EXISTS ONLY hr."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY compliance.statutory_reports DROP CONSTRAINT IF EXISTS statutory_reports_pkey;
ALTER TABLE IF EXISTS ONLY compliance.records DROP CONSTRAINT IF EXISTS records_pkey;
ALTER TABLE IF EXISTS ONLY compliance.event_outbox DROP CONSTRAINT IF EXISTS event_outbox_pkey;
ALTER TABLE IF EXISTS ONLY compliance.document_vault DROP CONSTRAINT IF EXISTS document_vault_pkey;
ALTER TABLE IF EXISTS ONLY compliance.data_subject_rights DROP CONSTRAINT IF EXISTS data_subject_rights_pkey;
ALTER TABLE IF EXISTS ONLY compliance.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY auth.waitlist_entries DROP CONSTRAINT IF EXISTS waitlist_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.security_events DROP CONSTRAINT IF EXISTS security_events_pkey;
ALTER TABLE IF EXISTS ONLY auth.invitations DROP CONSTRAINT IF EXISTS invitations_pkey;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS platform.settings;
DROP TABLE IF EXISTS platform.app_permissions;
DROP TABLE IF EXISTS org.managed_organizations;
DROP TABLE IF EXISTS hr.unplanned_absences;
DROP TABLE IF EXISTS hr.unplanned_absence_returns;
DROP TABLE IF EXISTS hr.unplanned_absence_deletions;
DROP TABLE IF EXISTS hr.unplanned_absence_attachments;
DROP TABLE IF EXISTS hr.training_records;
DROP TABLE IF EXISTS hr.time_entries;
DROP TABLE IF EXISTS hr.roles;
DROP TABLE IF EXISTS hr.policy_acknowledgments;
DROP TABLE IF EXISTS hr.policies;
DROP TABLE IF EXISTS hr.performance_reviews;
DROP TABLE IF EXISTS hr.organizations;
DROP TABLE IF EXISTS hr.notifications;
DROP TABLE IF EXISTS hr.notification_preferences;
DROP TABLE IF EXISTS hr.memberships;
DROP TABLE IF EXISTS hr.leave_requests;
DROP TABLE IF EXISTS hr.leave_policy_accruals;
DROP TABLE IF EXISTS hr.leave_policies;
DROP TABLE IF EXISTS hr.leave_balances;
DROP TABLE IF EXISTS hr.integration_configs;
DROP TABLE IF EXISTS hr.hr_settings;
DROP TABLE IF EXISTS hr.employment_contracts;
DROP TABLE IF EXISTS hr.employee_profiles;
DROP TABLE IF EXISTS hr.departments;
DROP TABLE IF EXISTS hr.compliance_templates;
DROP TABLE IF EXISTS hr.compliance_log_items;
DROP TABLE IF EXISTS hr.checklist_templates;
DROP TABLE IF EXISTS hr.checklist_instances;
DROP TABLE IF EXISTS hr.absence_type_configs;
DROP TABLE IF EXISTS hr.absence_settings;
DROP TABLE IF EXISTS hr."User";
DROP TABLE IF EXISTS compliance.statutory_reports;
DROP TABLE IF EXISTS compliance.records;
DROP TABLE IF EXISTS compliance.event_outbox;
DROP TABLE IF EXISTS compliance.document_vault;
DROP TABLE IF EXISTS compliance.data_subject_rights;
DROP TABLE IF EXISTS compliance.audit_logs;
DROP TABLE IF EXISTS auth.waitlist_entries;
DROP TABLE IF EXISTS auth.user_sessions;
DROP TABLE IF EXISTS auth.security_events;
DROP TABLE IF EXISTS auth.invitations;
DROP TYPE IF EXISTS hr."TimeEntryStatus";
DROP TYPE IF EXISTS hr."SalaryFrequency";
DROP TYPE IF EXISTS hr."SalaryBasis";
DROP TYPE IF EXISTS hr."RoleScope";
DROP TYPE IF EXISTS hr."PolicyCategory";
DROP TYPE IF EXISTS hr."PaySchedule";
DROP TYPE IF EXISTS hr."OrganizationStatus";
DROP TYPE IF EXISTS hr."NotificationPriority";
DROP TYPE IF EXISTS hr."NotificationChannel";
DROP TYPE IF EXISTS hr."MembershipStatus";
DROP TYPE IF EXISTS hr."LeaveRequestStatus";
DROP TYPE IF EXISTS hr."LeavePolicyType";
DROP TYPE IF EXISTS hr."LeaveAccrualFrequency";
DROP TYPE IF EXISTS hr."HealthStatus";
DROP TYPE IF EXISTS hr."HRNotificationType";
DROP TYPE IF EXISTS hr."EmploymentType";
DROP TYPE IF EXISTS hr."EmploymentStatus";
DROP TYPE IF EXISTS hr."DataResidencyZone";
DROP TYPE IF EXISTS hr."DataClassificationLevel";
DROP TYPE IF EXISTS hr."ContractType";
DROP TYPE IF EXISTS hr."ComplianceTier";
DROP TYPE IF EXISTS hr."ComplianceItemStatus";
DROP TYPE IF EXISTS hr."ChecklistTemplateType";
DROP TYPE IF EXISTS hr."ChecklistInstanceStatus";
DROP TYPE IF EXISTS hr."AbsenceStatus";
DROP TYPE IF EXISTS compliance."SecurityClassification";
DROP TYPE IF EXISTS compliance."RetentionPolicy";
DROP TYPE IF EXISTS compliance."DocumentType";
DROP TYPE IF EXISTS compliance."AuditEventType";
DROP TYPE IF EXISTS auth."SessionStatus";
DROP TYPE IF EXISTS auth."InvitationStatus";
DROP EXTENSION IF EXISTS citext;
-- *not* dropping schema, since initdb creates it
DROP SCHEMA IF EXISTS platform;
DROP SCHEMA IF EXISTS org;
DROP SCHEMA IF EXISTS hr;
DROP SCHEMA IF EXISTS compliance;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: compliance; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA compliance;


--
-- Name: hr; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA hr;


--
-- Name: org; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA org;


--
-- Name: platform; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA platform;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: InvitationStatus; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth."InvitationStatus" AS ENUM (
    'pending',
    'accepted',
    'expired',
    'declined',
    'revoked'
);


--
-- Name: SessionStatus; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth."SessionStatus" AS ENUM (
    'active',
    'inactive',
    'expired',
    'revoked'
);


--
-- Name: AuditEventType; Type: TYPE; Schema: compliance; Owner: -
--

CREATE TYPE compliance."AuditEventType" AS ENUM (
    'ACCESS',
    'DATA_CHANGE',
    'POLICY_CHANGE',
    'AUTH',
    'SYSTEM',
    'COMPLIANCE',
    'SECURITY',
    'DOCUMENT',
    'LEAVE_REQUEST',
    'PAYROLL'
);


--
-- Name: DocumentType; Type: TYPE; Schema: compliance; Owner: -
--

CREATE TYPE compliance."DocumentType" AS ENUM (
    'ONBOARDING',
    'POLICY',
    'CONTRACT',
    'EVIDENCE',
    'TRAINING',
    'PERFORMANCE',
    'COMPLIANCE',
    'MEDICAL',
    'FINANCIAL',
    'SECURITY',
    'OTHER'
);


--
-- Name: RetentionPolicy; Type: TYPE; Schema: compliance; Owner: -
--

CREATE TYPE compliance."RetentionPolicy" AS ENUM (
    'IMMEDIATE',
    'ONE_YEAR',
    'THREE_YEARS',
    'SEVEN_YEARS',
    'PERMANENT',
    'LEGAL_HOLD'
);


--
-- Name: SecurityClassification; Type: TYPE; Schema: compliance; Owner: -
--

CREATE TYPE compliance."SecurityClassification" AS ENUM (
    'UNCLASSIFIED',
    'OFFICIAL',
    'OFFICIAL_SENSITIVE',
    'SECRET',
    'TOP_SECRET'
);


--
-- Name: AbsenceStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."AbsenceStatus" AS ENUM (
    'REPORTED',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'CLOSED'
);


--
-- Name: ChecklistInstanceStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."ChecklistInstanceStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: ChecklistTemplateType; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."ChecklistTemplateType" AS ENUM (
    'onboarding',
    'offboarding',
    'custom'
);


--
-- Name: ComplianceItemStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."ComplianceItemStatus" AS ENUM (
    'PENDING',
    'COMPLETE',
    'MISSING',
    'PENDING_REVIEW',
    'NOT_APPLICABLE',
    'EXPIRED'
);


--
-- Name: ComplianceTier; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."ComplianceTier" AS ENUM (
    'STANDARD',
    'REGULATED',
    'GOV_SECURE'
);


--
-- Name: ContractType; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."ContractType" AS ENUM (
    'PERMANENT',
    'FIXED_TERM',
    'AGENCY',
    'CONSULTANT',
    'INTERNSHIP',
    'APPRENTICESHIP'
);


--
-- Name: DataClassificationLevel; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."DataClassificationLevel" AS ENUM (
    'OFFICIAL',
    'OFFICIAL_SENSITIVE',
    'SECRET',
    'TOP_SECRET'
);


--
-- Name: DataResidencyZone; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."DataResidencyZone" AS ENUM (
    'UK_ONLY',
    'UK_AND_EEA',
    'GLOBAL_RESTRICTED'
);


--
-- Name: EmploymentStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."EmploymentStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'TERMINATED',
    'ON_LEAVE',
    'OFFBOARDING',
    'ARCHIVED'
);


--
-- Name: EmploymentType; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."EmploymentType" AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACTOR',
    'INTERN',
    'APPRENTICE',
    'FIXED_TERM',
    'CASUAL'
);


--
-- Name: HRNotificationType; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."HRNotificationType" AS ENUM (
    'leave-approval',
    'leave-rejection',
    'document-expiry',
    'policy-update',
    'performance-review',
    'system-announcement',
    'compliance-reminder',
    'other'
);


--
-- Name: HealthStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."HealthStatus" AS ENUM (
    'UNDEFINED',
    'FIT_FOR_WORK',
    'PARTIALLY_FIT',
    'UNFIT_FOR_WORK',
    'RECOVERY_PLAN'
);


--
-- Name: LeaveAccrualFrequency; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."LeaveAccrualFrequency" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'YEARLY',
    'NONE'
);


--
-- Name: LeavePolicyType; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."LeavePolicyType" AS ENUM (
    'ANNUAL',
    'SICK',
    'MATERNITY',
    'PATERNITY',
    'ADOPTION',
    'UNPAID',
    'SPECIAL',
    'EMERGENCY'
);


--
-- Name: LeaveRequestStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."LeaveRequestStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'PENDING_APPROVAL',
    'AWAITING_MANAGER'
);


--
-- Name: MembershipStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."MembershipStatus" AS ENUM (
    'INVITED',
    'ACTIVE',
    'SUSPENDED',
    'DEACTIVATED'
);


--
-- Name: NotificationChannel; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."NotificationChannel" AS ENUM (
    'EMAIL',
    'IN_APP',
    'SMS'
);


--
-- Name: NotificationPriority; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."NotificationPriority" AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


--
-- Name: OrganizationStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."OrganizationStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'DECOMMISSIONED'
);


--
-- Name: PaySchedule; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."PaySchedule" AS ENUM (
    'MONTHLY',
    'BI_WEEKLY'
);


--
-- Name: PolicyCategory; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."PolicyCategory" AS ENUM (
    'HR_POLICIES',
    'CODE_OF_CONDUCT',
    'HEALTH_SAFETY',
    'IT_SECURITY',
    'BENEFITS',
    'PROCEDURES',
    'COMPLIANCE',
    'OTHER'
);


--
-- Name: RoleScope; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."RoleScope" AS ENUM (
    'ORG',
    'DEPARTMENT',
    'GLOBAL'
);


--
-- Name: SalaryBasis; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."SalaryBasis" AS ENUM (
    'ANNUAL',
    'HOURLY'
);


--
-- Name: SalaryFrequency; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."SalaryFrequency" AS ENUM (
    'HOURLY',
    'MONTHLY',
    'ANNUALLY'
);


--
-- Name: TimeEntryStatus; Type: TYPE; Schema: hr; Owner: -
--

CREATE TYPE hr."TimeEntryStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'APPROVED',
    'REJECTED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: invitations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.invitations (
    token text NOT NULL,
    "orgId" uuid NOT NULL,
    "organizationName" text NOT NULL,
    "targetEmail" public.citext NOT NULL,
    status auth."InvitationStatus" DEFAULT 'pending'::auth."InvitationStatus" NOT NULL,
    "invitedByUserId" uuid,
    "onboardingData" jsonb NOT NULL,
    metadata jsonb,
    "securityContext" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "expiresAt" timestamp(3) without time zone,
    "acceptedAt" timestamp(3) without time zone,
    "acceptedByUserId" uuid,
    "revokedAt" timestamp(3) without time zone,
    "revokedByUserId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: security_events; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.security_events (
    id uuid NOT NULL,
    "orgId" uuid,
    "userId" uuid,
    "eventType" text NOT NULL,
    severity text NOT NULL,
    description text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "additionalInfo" jsonb,
    resolved boolean DEFAULT false NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "resolvedBy" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.user_sessions (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "sessionId" text NOT NULL,
    status auth."SessionStatus" DEFAULT 'active'::auth."SessionStatus" NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "lastAccess" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    metadata jsonb
);


--
-- Name: waitlist_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.waitlist_entries (
    id text NOT NULL,
    name text NOT NULL,
    email public.citext NOT NULL,
    industry text NOT NULL,
    "organizationSize" jsonb,
    region text,
    "ipAddress" text,
    "userAgent" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: compliance; Owner: -
--

CREATE TABLE compliance.audit_logs (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid,
    "eventType" compliance."AuditEventType" NOT NULL,
    action text NOT NULL,
    resource text NOT NULL,
    "resourceId" text,
    "ipAddress" text,
    "userAgent" text,
    "sessionTokenHash" text,
    "securityLevel" integer,
    "dataSubjectId" text,
    payload jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: data_subject_rights; Type: TABLE; Schema: compliance; Owner: -
--

CREATE TABLE compliance.data_subject_rights (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid,
    "rightType" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "requestDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "responseDate" timestamp(3) without time zone,
    "dataSubjectInfo" jsonb,
    response text,
    "responseFrom" uuid,
    notes text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: document_vault; Type: TABLE; Schema: compliance; Owner: -
--

CREATE TABLE compliance.document_vault (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "ownerOrgId" uuid,
    "ownerUserId" uuid,
    type compliance."DocumentType" DEFAULT 'OTHER'::compliance."DocumentType" NOT NULL,
    classification compliance."SecurityClassification" DEFAULT 'UNCLASSIFIED'::compliance."SecurityClassification" NOT NULL,
    "retentionPolicy" compliance."RetentionPolicy" DEFAULT 'THREE_YEARS'::compliance."RetentionPolicy" NOT NULL,
    "retentionExpires" timestamp(3) without time zone,
    "blobPointer" text NOT NULL,
    checksum text NOT NULL,
    "mimeType" text,
    "sizeBytes" integer,
    "fileName" text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "latestVersionId" uuid,
    encrypted boolean DEFAULT false NOT NULL,
    "encryptedKeyRef" text,
    "sensitivityLevel" integer DEFAULT 0 NOT NULL,
    "dataCategory" text,
    "lawfulBasis" text,
    "dataSubject" jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: event_outbox; Type: TABLE; Schema: compliance; Owner: -
--

CREATE TABLE compliance.event_outbox (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "eventType" text NOT NULL,
    payload jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    error jsonb,
    "availableAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "maxRetries" integer DEFAULT 3 NOT NULL,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: records; Type: TABLE; Schema: compliance; Owner: -
--

CREATE TABLE compliance.records (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "complianceType" text NOT NULL,
    "referenceNumber" text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "assignedToOrgId" uuid,
    "assignedToUserId" uuid,
    priority integer DEFAULT 2 NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "submittedByOrgId" uuid,
    "submittedByUserId" uuid,
    "submittedAt" timestamp(3) without time zone,
    "responseDate" timestamp(3) without time zone,
    "escalationDate" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: statutory_reports; Type: TABLE; Schema: compliance; Owner: -
--

CREATE TABLE compliance.statutory_reports (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "reportType" text NOT NULL,
    period text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "submittedByOrgId" uuid,
    "submittedByUserId" uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    "fileName" text,
    "fileSize" integer,
    checksum text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr."User" (
    id uuid NOT NULL,
    email public.citext NOT NULL,
    "displayName" text,
    status hr."MembershipStatus" DEFAULT 'INVITED'::hr."MembershipStatus" NOT NULL,
    "authProvider" text DEFAULT 'better-auth'::text NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "failedLoginCount" integer DEFAULT 0 NOT NULL,
    "lockedUntil" timestamp(3) without time zone,
    "lastPasswordChange" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: absence_settings; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.absence_settings (
    "orgId" uuid NOT NULL,
    "hoursInWorkDay" numeric(5,2) DEFAULT 8 NOT NULL,
    "roundingRule" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: absence_type_configs; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.absence_type_configs (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    "tracksBalance" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: checklist_instances; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.checklist_instances (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    "templateId" uuid NOT NULL,
    "templateName" text,
    status hr."ChecklistInstanceStatus" DEFAULT 'IN_PROGRESS'::hr."ChecklistInstanceStatus" NOT NULL,
    items jsonb NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: checklist_templates; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.checklist_templates (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    name text NOT NULL,
    type hr."ChecklistTemplateType" DEFAULT 'onboarding'::hr."ChecklistTemplateType" NOT NULL,
    items jsonb NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: compliance_log_items; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.compliance_log_items (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "templateItemId" text NOT NULL,
    "categoryKey" text,
    status hr."ComplianceItemStatus" DEFAULT 'PENDING'::hr."ComplianceItemStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    notes text,
    attachments jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: compliance_templates; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.compliance_templates (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    name text NOT NULL,
    "categoryKey" text,
    version text,
    items jsonb NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.departments (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    name text NOT NULL,
    path text,
    "leaderOrgId" uuid,
    "leaderUserId" uuid,
    "businessUnit" text,
    "costCenter" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: employee_profiles; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.employee_profiles (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "firstName" text,
    "lastName" text,
    "displayName" text,
    email public.citext,
    "personalEmail" public.citext,
    "employeeNumber" text NOT NULL,
    "jobTitle" text,
    "employmentType" hr."EmploymentType" DEFAULT 'FULL_TIME'::hr."EmploymentType" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "managerOrgId" uuid,
    "managerUserId" uuid,
    phone jsonb,
    address jsonb,
    "annualSalary" integer,
    "hourlyRate" numeric(8,2),
    "costCenter" text,
    location jsonb,
    roles text[],
    "eligibleLeaveTypes" text[],
    "employmentPeriods" jsonb,
    "salaryDetails" jsonb,
    skills text[],
    certifications jsonb,
    "niNumber" text,
    "emergencyContact" jsonb,
    "nextOfKin" jsonb,
    "healthStatus" hr."HealthStatus" DEFAULT 'UNDEFINED'::hr."HealthStatus" NOT NULL,
    "workPermit" jsonb,
    "bankDetails" jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "auditSource" text,
    "correlationId" text,
    "createdBy" uuid,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "departmentId" uuid,
    "employmentStatus" hr."EmploymentStatus" DEFAULT 'ACTIVE'::hr."EmploymentStatus" NOT NULL,
    "erasureActorOrgId" uuid,
    "erasureActorUserId" uuid,
    "erasureCompletedAt" timestamp(3) without time zone,
    "erasureReason" text,
    "erasureRequestedAt" timestamp(3) without time zone,
    "paySchedule" hr."PaySchedule",
    "photoUrl" text,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL,
    "retentionExpiresAt" timestamp(3) without time zone,
    "retentionPolicy" compliance."RetentionPolicy",
    "salaryAmount" numeric(12,2),
    "salaryBasis" hr."SalaryBasis",
    "salaryCurrency" text,
    "salaryFrequency" hr."SalaryFrequency",
    "schemaVersion" integer DEFAULT 1 NOT NULL,
    "updatedBy" uuid
);


--
-- Name: employment_contracts; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.employment_contracts (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "contractType" hr."ContractType" DEFAULT 'PERMANENT'::hr."ContractType" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "jobTitle" text NOT NULL,
    "departmentId" uuid,
    location text,
    "probationEndDate" timestamp(3) without time zone,
    "furloughStartDate" timestamp(3) without time zone,
    "furloughEndDate" timestamp(3) without time zone,
    "workingPattern" jsonb,
    benefits jsonb,
    "terminationReason" text,
    "terminationNotes" text,
    "archivedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "auditSource" text,
    "correlationId" text,
    "createdBy" uuid,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "erasureActorOrgId" uuid,
    "erasureActorUserId" uuid,
    "erasureCompletedAt" timestamp(3) without time zone,
    "erasureReason" text,
    "erasureRequestedAt" timestamp(3) without time zone,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL,
    "retentionExpiresAt" timestamp(3) without time zone,
    "retentionPolicy" compliance."RetentionPolicy",
    "schemaVersion" integer DEFAULT 1 NOT NULL,
    "updatedBy" uuid
);


--
-- Name: hr_settings; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.hr_settings (
    "orgId" uuid NOT NULL,
    "leaveTypes" jsonb,
    "workingHours" jsonb,
    "approvalWorkflows" jsonb,
    "overtimePolicy" jsonb,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: integration_configs; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.integration_configs (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    provider text NOT NULL,
    credentials jsonb NOT NULL,
    settings jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL,
    compliance jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: leave_balances; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.leave_balances (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "policyId" uuid NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "accruedHours" numeric(6,2) DEFAULT 0 NOT NULL,
    "usedHours" numeric(6,2) DEFAULT 0 NOT NULL,
    "carriedHours" numeric(6,2) DEFAULT 0 NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" uuid,
    metadata jsonb,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: leave_policies; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.leave_policies (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "departmentId" uuid,
    name text NOT NULL,
    "policyType" hr."LeavePolicyType" NOT NULL,
    "accrualFrequency" hr."LeaveAccrualFrequency" DEFAULT 'NONE'::hr."LeaveAccrualFrequency" NOT NULL,
    "accrualAmount" numeric(5,2),
    "carryOverLimit" integer,
    "requiresApproval" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "activeFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "activeTo" timestamp(3) without time zone,
    "statutoryCompliance" boolean DEFAULT false NOT NULL,
    "maxConsecutiveDays" integer,
    "allowNegativeBalance" boolean DEFAULT false NOT NULL,
    metadata jsonb
);


--
-- Name: leave_policy_accruals; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.leave_policy_accruals (
    id uuid NOT NULL,
    "policyId" uuid NOT NULL,
    "tenureMonths" integer DEFAULT 0 NOT NULL,
    "accrualPerPeriod" numeric(5,2) NOT NULL,
    "carryOverLimit" integer
);


--
-- Name: leave_requests; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.leave_requests (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "policyId" uuid NOT NULL,
    status hr."LeaveRequestStatus" DEFAULT 'DRAFT'::hr."LeaveRequestStatus" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    hours numeric(6,2) NOT NULL,
    reason text,
    "approverOrgId" uuid,
    "approverUserId" uuid,
    "submittedAt" timestamp(3) without time zone,
    "decidedAt" timestamp(3) without time zone,
    "approvedByLineManager" boolean DEFAULT false NOT NULL,
    "sickNoteRequired" boolean DEFAULT false NOT NULL,
    "sickNoteReceived" boolean DEFAULT false NOT NULL,
    "returnToWorkDate" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: memberships; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.memberships (
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "roleId" uuid,
    "departmentId" uuid,
    status hr."MembershipStatus" DEFAULT 'INVITED'::hr."MembershipStatus" NOT NULL,
    "invitedBy" uuid,
    "invitedAt" timestamp(3) without time zone,
    "activatedAt" timestamp(3) without time zone,
    "deactivatedAt" timestamp(3) without time zone,
    "lastAccessedAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdBy" uuid NOT NULL,
    "updatedBy" uuid
);


--
-- Name: notification_preferences; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.notification_preferences (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    channel hr."NotificationChannel" NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "quietHours" jsonb,
    metadata jsonb,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.notifications (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type hr."HRNotificationType" DEFAULT 'other'::hr."HRNotificationType" NOT NULL,
    priority hr."NotificationPriority" DEFAULT 'medium'::hr."NotificationPriority" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "actionUrl" text,
    "actionLabel" text,
    "scheduledFor" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "correlationId" text,
    "createdByUserId" uuid,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.organizations (
    id uuid NOT NULL,
    slug public.citext NOT NULL,
    name text NOT NULL,
    status hr."OrganizationStatus" DEFAULT 'ACTIVE'::hr."OrganizationStatus" NOT NULL,
    "complianceTier" hr."ComplianceTier" DEFAULT 'STANDARD'::hr."ComplianceTier" NOT NULL,
    "dataResidency" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "regionCode" text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    "governanceTags" jsonb,
    "securityControls" jsonb,
    "encryptionKey" text,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: performance_reviews; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.performance_reviews (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "reviewerOrgId" uuid NOT NULL,
    "reviewerUserId" uuid NOT NULL,
    "reviewPeriod" text NOT NULL,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "completedDate" timestamp(3) without time zone,
    status text DEFAULT 'scheduled'::text NOT NULL,
    "overallRating" integer,
    "goalsMet" jsonb,
    "developmentPlan" jsonb,
    "reviewerNotes" text,
    "employeeResponse" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: policies; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.policies (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category hr."PolicyCategory" DEFAULT 'HR_POLICIES'::hr."PolicyCategory" NOT NULL,
    version text DEFAULT 'v1'::text NOT NULL,
    "effectiveDate" timestamp(3) without time zone NOT NULL,
    "expiryDate" timestamp(3) without time zone,
    "applicableRoles" jsonb,
    "applicableDepartments" jsonb,
    "requiresAcknowledgment" boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: policy_acknowledgments; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.policy_acknowledgments (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "policyId" uuid NOT NULL,
    version text NOT NULL,
    "acknowledgedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ipAddress" text,
    metadata jsonb
);


--
-- Name: roles; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.roles (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    name text NOT NULL,
    description text,
    scope hr."RoleScope" DEFAULT 'ORG'::hr."RoleScope" NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: time_entries; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.time_entries (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "clockIn" timestamp(3) without time zone NOT NULL,
    "clockOut" timestamp(3) without time zone,
    "totalHours" numeric(6,2),
    "breakDuration" numeric(5,2),
    project text,
    tasks jsonb,
    notes text,
    status hr."TimeEntryStatus" DEFAULT 'ACTIVE'::hr."TimeEntryStatus" NOT NULL,
    "approvedByOrgId" uuid,
    "approvedByUserId" uuid,
    "approvedAt" timestamp(3) without time zone,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: training_records; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.training_records (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "courseName" text NOT NULL,
    provider text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    status text DEFAULT 'in_progress'::text NOT NULL,
    certificate text,
    competency jsonb,
    cost numeric(10,2),
    approved boolean DEFAULT false NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" uuid,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: unplanned_absence_attachments; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.unplanned_absence_attachments (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "absenceId" uuid NOT NULL,
    "fileName" text NOT NULL,
    "storageKey" text NOT NULL,
    "contentType" text NOT NULL,
    "fileSize" integer NOT NULL,
    checksum text,
    "uploadedByUserId" uuid NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL
);


--
-- Name: unplanned_absence_deletions; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.unplanned_absence_deletions (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "absenceId" uuid NOT NULL,
    reason text NOT NULL,
    "deletedByUserId" uuid NOT NULL,
    "deletedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL
);


--
-- Name: unplanned_absence_returns; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.unplanned_absence_returns (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "absenceId" uuid NOT NULL,
    "returnDate" timestamp(3) without time zone NOT NULL,
    comments text,
    "submittedByUserId" uuid NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL
);


--
-- Name: unplanned_absences; Type: TABLE; Schema: hr; Owner: -
--

CREATE TABLE hr.unplanned_absences (
    id uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "typeId" uuid NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    hours numeric(6,2) NOT NULL,
    reason text,
    status hr."AbsenceStatus" DEFAULT 'REPORTED'::hr."AbsenceStatus" NOT NULL,
    "healthStatus" hr."HealthStatus",
    "approverOrgId" uuid,
    "approverUserId" uuid,
    "dataClassification" hr."DataClassificationLevel" DEFAULT 'OFFICIAL'::hr."DataClassificationLevel" NOT NULL,
    "residencyTag" hr."DataResidencyZone" DEFAULT 'UK_ONLY'::hr."DataResidencyZone" NOT NULL,
    metadata jsonb,
    "deletionReason" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedByUserId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: managed_organizations; Type: TABLE; Schema: org; Owner: -
--

CREATE TABLE org.managed_organizations (
    id uuid NOT NULL,
    "adminUserId" uuid NOT NULL,
    "orgId" uuid NOT NULL,
    "orgName" text NOT NULL,
    "ownerEmail" text NOT NULL,
    "planId" text NOT NULL,
    "moduleAccess" jsonb NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: app_permissions; Type: TABLE; Schema: platform; Owner: -
--

CREATE TABLE platform.app_permissions (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    "isGlobal" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: platform; Owner: -
--

CREATE TABLE platform.settings (
    id text NOT NULL,
    branding jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: invitations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.invitations (token, "orgId", "organizationName", "targetEmail", status, "invitedByUserId", "onboardingData", metadata, "securityContext", "ipAddress", "userAgent", "expiresAt", "acceptedAt", "acceptedByUserId", "revokedAt", "revokedByUserId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: security_events; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.security_events (id, "orgId", "userId", "eventType", severity, description, "ipAddress", "userAgent", "additionalInfo", resolved, "resolvedAt", "resolvedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.user_sessions (id, "userId", "sessionId", status, "ipAddress", "userAgent", "startedAt", "expiresAt", "lastAccess", "revokedAt", metadata) FROM stdin;
\.


--
-- Data for Name: waitlist_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.waitlist_entries (id, name, email, industry, "organizationSize", region, "ipAddress", "userAgent", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: compliance; Owner: -
--

COPY compliance.audit_logs (id, "orgId", "userId", "eventType", action, resource, "resourceId", "ipAddress", "userAgent", "sessionTokenHash", "securityLevel", "dataSubjectId", payload, "createdAt") FROM stdin;
\.


--
-- Data for Name: data_subject_rights; Type: TABLE DATA; Schema: compliance; Owner: -
--

COPY compliance.data_subject_rights (id, "orgId", "userId", "rightType", status, "requestDate", "dueDate", "completedAt", "responseDate", "dataSubjectInfo", response, "responseFrom", notes, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: document_vault; Type: TABLE DATA; Schema: compliance; Owner: -
--

COPY compliance.document_vault (id, "orgId", "ownerOrgId", "ownerUserId", type, classification, "retentionPolicy", "retentionExpires", "blobPointer", checksum, "mimeType", "sizeBytes", "fileName", version, "latestVersionId", encrypted, "encryptedKeyRef", "sensitivityLevel", "dataCategory", "lawfulBasis", "dataSubject", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: event_outbox; Type: TABLE DATA; Schema: compliance; Owner: -
--

COPY compliance.event_outbox (id, "orgId", "eventType", payload, status, error, "availableAt", "processedAt", "maxRetries", "retryCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: records; Type: TABLE DATA; Schema: compliance; Owner: -
--

COPY compliance.records (id, "orgId", "complianceType", "referenceNumber", status, title, description, "assignedToOrgId", "assignedToUserId", priority, "dueDate", "completedAt", "submittedByOrgId", "submittedByUserId", "submittedAt", "responseDate", "escalationDate", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: statutory_reports; Type: TABLE DATA; Schema: compliance; Owner: -
--

COPY compliance.statutory_reports (id, "orgId", "reportType", period, "dueDate", "submittedAt", "submittedByOrgId", "submittedByUserId", status, "fileName", "fileSize", checksum, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr."User" (id, email, "displayName", status, "authProvider", "lastLoginAt", "failedLoginCount", "lockedUntil", "lastPasswordChange", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: absence_settings; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.absence_settings ("orgId", "hoursInWorkDay", "roundingRule", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: absence_type_configs; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.absence_type_configs (id, "orgId", key, label, "tracksBalance", "isActive", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: checklist_instances; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.checklist_instances (id, "orgId", "employeeId", "templateId", "templateName", status, items, "startedAt", "completedAt", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: checklist_templates; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.checklist_templates (id, "orgId", name, type, items, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: compliance_log_items; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.compliance_log_items (id, "orgId", "userId", "templateItemId", "categoryKey", status, "dueDate", "completedAt", "reviewedBy", "reviewedAt", notes, attachments, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: compliance_templates; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.compliance_templates (id, "orgId", name, "categoryKey", version, items, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.departments (id, "orgId", name, path, "leaderOrgId", "leaderUserId", "businessUnit", "costCenter", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: employee_profiles; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.employee_profiles (id, "orgId", "userId", "firstName", "lastName", "displayName", email, "personalEmail", "employeeNumber", "jobTitle", "employmentType", "startDate", "endDate", "managerOrgId", "managerUserId", phone, address, "annualSalary", "hourlyRate", "costCenter", location, roles, "eligibleLeaveTypes", "employmentPeriods", "salaryDetails", skills, certifications, "niNumber", "emergencyContact", "nextOfKin", "healthStatus", "workPermit", "bankDetails", metadata, "createdAt", "updatedAt", "archivedAt", "auditSource", "correlationId", "createdBy", "dataClassification", "deletedAt", "departmentId", "employmentStatus", "erasureActorOrgId", "erasureActorUserId", "erasureCompletedAt", "erasureReason", "erasureRequestedAt", "paySchedule", "photoUrl", "residencyTag", "retentionExpiresAt", "retentionPolicy", "salaryAmount", "salaryBasis", "salaryCurrency", "salaryFrequency", "schemaVersion", "updatedBy") FROM stdin;
\.


--
-- Data for Name: employment_contracts; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.employment_contracts (id, "orgId", "userId", "contractType", "startDate", "endDate", "jobTitle", "departmentId", location, "probationEndDate", "furloughStartDate", "furloughEndDate", "workingPattern", benefits, "terminationReason", "terminationNotes", "archivedAt", "createdAt", "updatedAt", "auditSource", "correlationId", "createdBy", "dataClassification", "deletedAt", "erasureActorOrgId", "erasureActorUserId", "erasureCompletedAt", "erasureReason", "erasureRequestedAt", "residencyTag", "retentionExpiresAt", "retentionPolicy", "schemaVersion", "updatedBy") FROM stdin;
\.


--
-- Data for Name: hr_settings; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.hr_settings ("orgId", "leaveTypes", "workingHours", "approvalWorkflows", "overtimePolicy", "dataClassification", "residencyTag", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: integration_configs; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.integration_configs (id, "orgId", provider, credentials, settings, active, compliance, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.leave_balances (id, "orgId", "userId", "policyId", "periodStart", "periodEnd", "accruedHours", "usedHours", "carriedHours", "approvedAt", "approvedBy", metadata, "updatedAt") FROM stdin;
\.


--
-- Data for Name: leave_policies; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.leave_policies (id, "orgId", "departmentId", name, "policyType", "accrualFrequency", "accrualAmount", "carryOverLimit", "requiresApproval", "isDefault", "activeFrom", "activeTo", "statutoryCompliance", "maxConsecutiveDays", "allowNegativeBalance", metadata) FROM stdin;
\.


--
-- Data for Name: leave_policy_accruals; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.leave_policy_accruals (id, "policyId", "tenureMonths", "accrualPerPeriod", "carryOverLimit") FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.leave_requests (id, "orgId", "userId", "policyId", status, "startDate", "endDate", hours, reason, "approverOrgId", "approverUserId", "submittedAt", "decidedAt", "approvedByLineManager", "sickNoteRequired", "sickNoteReceived", "returnToWorkDate", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: memberships; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.memberships ("orgId", "userId", "roleId", "departmentId", status, "invitedBy", "invitedAt", "activatedAt", "deactivatedAt", "lastAccessedAt", metadata, "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.notification_preferences (id, "orgId", "userId", channel, enabled, "quietHours", metadata, "updatedAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.notifications (id, "orgId", "userId", title, message, type, priority, "isRead", "readAt", "actionUrl", "actionLabel", "scheduledFor", "expiresAt", "correlationId", "createdByUserId", "dataClassification", "residencyTag", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.organizations (id, slug, name, status, "complianceTier", "dataResidency", "dataClassification", "regionCode", settings, "governanceTags", "securityControls", "encryptionKey", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: performance_reviews; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.performance_reviews (id, "orgId", "userId", "reviewerOrgId", "reviewerUserId", "reviewPeriod", "scheduledDate", "completedDate", status, "overallRating", "goalsMet", "developmentPlan", "reviewerNotes", "employeeResponse", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: policies; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.policies (id, "orgId", title, content, category, version, "effectiveDate", "expiryDate", "applicableRoles", "applicableDepartments", "requiresAcknowledgment", status, "dataClassification", "residencyTag", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: policy_acknowledgments; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.policy_acknowledgments (id, "orgId", "userId", "policyId", version, "acknowledgedAt", "ipAddress", metadata) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.roles (id, "orgId", name, description, scope, permissions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.time_entries (id, "orgId", "userId", date, "clockIn", "clockOut", "totalHours", "breakDuration", project, tasks, notes, status, "approvedByOrgId", "approvedByUserId", "approvedAt", "dataClassification", "residencyTag", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: training_records; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.training_records (id, "orgId", "userId", "courseName", provider, "startDate", "endDate", status, certificate, competency, cost, approved, "approvedAt", "approvedBy", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: unplanned_absence_attachments; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.unplanned_absence_attachments (id, "orgId", "absenceId", "fileName", "storageKey", "contentType", "fileSize", checksum, "uploadedByUserId", "uploadedAt", metadata, "dataClassification", "residencyTag") FROM stdin;
\.


--
-- Data for Name: unplanned_absence_deletions; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.unplanned_absence_deletions (id, "orgId", "absenceId", reason, "deletedByUserId", "deletedAt", metadata, "dataClassification", "residencyTag") FROM stdin;
\.


--
-- Data for Name: unplanned_absence_returns; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.unplanned_absence_returns (id, "orgId", "absenceId", "returnDate", comments, "submittedByUserId", "submittedAt", metadata, "dataClassification", "residencyTag") FROM stdin;
\.


--
-- Data for Name: unplanned_absences; Type: TABLE DATA; Schema: hr; Owner: -
--

COPY hr.unplanned_absences (id, "orgId", "userId", "typeId", "startDate", "endDate", hours, reason, status, "healthStatus", "approverOrgId", "approverUserId", "dataClassification", "residencyTag", metadata, "deletionReason", "deletedAt", "deletedByUserId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: managed_organizations; Type: TABLE DATA; Schema: org; Owner: -
--

COPY org.managed_organizations (id, "adminUserId", "orgId", "orgName", "ownerEmail", "planId", "moduleAccess", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: app_permissions; Type: TABLE DATA; Schema: platform; Owner: -
--

COPY platform.app_permissions (id, name, description, category, "isGlobal", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: platform; Owner: -
--

COPY platform.settings (id, branding, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c97deef4-69d8-4b7b-8c21-1ca24b650073	593a810b52c8a27ee15c8a1c7d54f3d18ddf15f10786b405da378b69b9352b7c	2025-12-03 06:27:44.119685+06	20251203120000_init	\N	\N	2025-12-03 06:27:43.5668+06	1
b904ee32-0c9b-435e-8969-541b9f65fcd0	429aca34934566a173333a9dc1ee7c7479f029a519f0952c554c78f451524105	\N	20251203093234_hr-people-compliance	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251203093234_hr-people-compliance\n\nDatabase error code: none\n\nDatabase error:\nerror encoding message to server: string contains embedded null\n\n	2025-12-03 09:33:23.3023+06	2025-12-03 09:32:45.830126+06	0
04fb98e6-dded-4a1b-a114-2095957ba1cf	a2df4e2004d8aedf24f019c4fdc348943bbc1cd28c0c325eb3a376e0ecb6b593	\N	20251203093234_hr-people-compliance	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251203093234_hr-people-compliance\n\nDatabase error code: 42601\n\nDatabase error:\nERROR: syntax error at or near "﻿"\n\nPosition:\n[1m  0[0m\n[1m  1[1;31m ﻿-- CreateEnum[0m\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42601), message: "syntax error at or near \\"\\u{feff}\\"", detail: None, hint: None, position: Some(Original(1)), where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("scan.l"), line: Some(1248), routine: Some("scanner_yyerror") }\n\n	2025-12-03 09:34:00.897728+06	2025-12-03 09:33:31.769567+06	0
f16590ec-8e4e-4b69-b476-f6d1ef68d971	0fb5302ac647e250c123a074d515cd2f34a999dd168c432bd4299d75b287b360	2025-12-03 09:34:09.612995+06	20251203093234_hr-people-compliance	\N	\N	2025-12-03 09:34:09.558441+06	1
\.


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (token);


--
-- Name: security_events security_events_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.security_events
    ADD CONSTRAINT security_events_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: waitlist_entries waitlist_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.waitlist_entries
    ADD CONSTRAINT waitlist_entries_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: data_subject_rights data_subject_rights_pkey; Type: CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.data_subject_rights
    ADD CONSTRAINT data_subject_rights_pkey PRIMARY KEY (id);


--
-- Name: document_vault document_vault_pkey; Type: CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.document_vault
    ADD CONSTRAINT document_vault_pkey PRIMARY KEY (id);


--
-- Name: event_outbox event_outbox_pkey; Type: CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.event_outbox
    ADD CONSTRAINT event_outbox_pkey PRIMARY KEY (id);


--
-- Name: records records_pkey; Type: CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.records
    ADD CONSTRAINT records_pkey PRIMARY KEY (id);


--
-- Name: statutory_reports statutory_reports_pkey; Type: CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.statutory_reports
    ADD CONSTRAINT statutory_reports_pkey PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: absence_settings absence_settings_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.absence_settings
    ADD CONSTRAINT absence_settings_pkey PRIMARY KEY ("orgId");


--
-- Name: absence_type_configs absence_type_configs_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.absence_type_configs
    ADD CONSTRAINT absence_type_configs_pkey PRIMARY KEY (id);


--
-- Name: checklist_instances checklist_instances_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.checklist_instances
    ADD CONSTRAINT checklist_instances_pkey PRIMARY KEY (id);


--
-- Name: checklist_templates checklist_templates_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.checklist_templates
    ADD CONSTRAINT checklist_templates_pkey PRIMARY KEY (id);


--
-- Name: compliance_log_items compliance_log_items_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.compliance_log_items
    ADD CONSTRAINT compliance_log_items_pkey PRIMARY KEY (id);


--
-- Name: compliance_templates compliance_templates_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.compliance_templates
    ADD CONSTRAINT compliance_templates_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employee_profiles employee_profiles_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.employee_profiles
    ADD CONSTRAINT employee_profiles_pkey PRIMARY KEY (id);


--
-- Name: employment_contracts employment_contracts_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.employment_contracts
    ADD CONSTRAINT employment_contracts_pkey PRIMARY KEY (id);


--
-- Name: hr_settings hr_settings_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.hr_settings
    ADD CONSTRAINT hr_settings_pkey PRIMARY KEY ("orgId");


--
-- Name: integration_configs integration_configs_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.integration_configs
    ADD CONSTRAINT integration_configs_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_policies leave_policies_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_policies
    ADD CONSTRAINT leave_policies_pkey PRIMARY KEY (id);


--
-- Name: leave_policy_accruals leave_policy_accruals_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_policy_accruals
    ADD CONSTRAINT leave_policy_accruals_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY ("orgId", "userId");


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: performance_reviews performance_reviews_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.performance_reviews
    ADD CONSTRAINT performance_reviews_pkey PRIMARY KEY (id);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- Name: policy_acknowledgments policy_acknowledgments_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.policy_acknowledgments
    ADD CONSTRAINT policy_acknowledgments_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: training_records training_records_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.training_records
    ADD CONSTRAINT training_records_pkey PRIMARY KEY (id);


--
-- Name: unplanned_absence_attachments unplanned_absence_attachments_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absence_attachments
    ADD CONSTRAINT unplanned_absence_attachments_pkey PRIMARY KEY (id);


--
-- Name: unplanned_absence_deletions unplanned_absence_deletions_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absence_deletions
    ADD CONSTRAINT unplanned_absence_deletions_pkey PRIMARY KEY (id);


--
-- Name: unplanned_absence_returns unplanned_absence_returns_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absence_returns
    ADD CONSTRAINT unplanned_absence_returns_pkey PRIMARY KEY (id);


--
-- Name: unplanned_absences unplanned_absences_pkey; Type: CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absences
    ADD CONSTRAINT unplanned_absences_pkey PRIMARY KEY (id);


--
-- Name: managed_organizations managed_organizations_pkey; Type: CONSTRAINT; Schema: org; Owner: -
--

ALTER TABLE ONLY org.managed_organizations
    ADD CONSTRAINT managed_organizations_pkey PRIMARY KEY (id);


--
-- Name: app_permissions app_permissions_pkey; Type: CONSTRAINT; Schema: platform; Owner: -
--

ALTER TABLE ONLY platform.app_permissions
    ADD CONSTRAINT app_permissions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: platform; Owner: -
--

ALTER TABLE ONLY platform.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: invitations_expiresAt_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "invitations_expiresAt_idx" ON auth.invitations USING btree ("expiresAt");


--
-- Name: invitations_orgId_status_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "invitations_orgId_status_idx" ON auth.invitations USING btree ("orgId", status);


--
-- Name: invitations_targetEmail_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "invitations_targetEmail_idx" ON auth.invitations USING btree ("targetEmail");


--
-- Name: security_events_eventType_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "security_events_eventType_idx" ON auth.security_events USING btree ("eventType");


--
-- Name: security_events_resolved_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX security_events_resolved_idx ON auth.security_events USING btree (resolved);


--
-- Name: security_events_severity_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX security_events_severity_idx ON auth.security_events USING btree (severity);


--
-- Name: user_sessions_expiresAt_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "user_sessions_expiresAt_idx" ON auth.user_sessions USING btree ("expiresAt");


--
-- Name: user_sessions_status_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_sessions_status_idx ON auth.user_sessions USING btree (status);


--
-- Name: user_sessions_userId_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "user_sessions_userId_idx" ON auth.user_sessions USING btree ("userId");


--
-- Name: waitlist_entries_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX waitlist_entries_email_idx ON auth.waitlist_entries USING btree (email);


--
-- Name: audit_logs_dataSubjectId_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "audit_logs_dataSubjectId_idx" ON compliance.audit_logs USING btree ("dataSubjectId");


--
-- Name: audit_logs_orgId_createdAt_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "audit_logs_orgId_createdAt_idx" ON compliance.audit_logs USING btree ("orgId", "createdAt");


--
-- Name: audit_logs_orgId_eventType_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "audit_logs_orgId_eventType_idx" ON compliance.audit_logs USING btree ("orgId", "eventType");


--
-- Name: data_subject_rights_orgId_rightType_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "data_subject_rights_orgId_rightType_idx" ON compliance.data_subject_rights USING btree ("orgId", "rightType");


--
-- Name: data_subject_rights_status_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX data_subject_rights_status_idx ON compliance.data_subject_rights USING btree (status);


--
-- Name: document_vault_classification_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX document_vault_classification_idx ON compliance.document_vault USING btree (classification);


--
-- Name: document_vault_orgId_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "document_vault_orgId_idx" ON compliance.document_vault USING btree ("orgId");


--
-- Name: document_vault_retentionPolicy_retentionExpires_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "document_vault_retentionPolicy_retentionExpires_idx" ON compliance.document_vault USING btree ("retentionPolicy", "retentionExpires");


--
-- Name: event_outbox_orgId_eventType_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "event_outbox_orgId_eventType_idx" ON compliance.event_outbox USING btree ("orgId", "eventType");


--
-- Name: event_outbox_status_availableAt_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "event_outbox_status_availableAt_idx" ON compliance.event_outbox USING btree (status, "availableAt");


--
-- Name: records_orgId_referenceNumber_key; Type: INDEX; Schema: compliance; Owner: -
--

CREATE UNIQUE INDEX "records_orgId_referenceNumber_key" ON compliance.records USING btree ("orgId", "referenceNumber");


--
-- Name: records_orgId_status_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "records_orgId_status_idx" ON compliance.records USING btree ("orgId", status);


--
-- Name: statutory_reports_dueDate_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "statutory_reports_dueDate_idx" ON compliance.statutory_reports USING btree ("dueDate");


--
-- Name: statutory_reports_orgId_reportType_period_idx; Type: INDEX; Schema: compliance; Owner: -
--

CREATE INDEX "statutory_reports_orgId_reportType_period_idx" ON compliance.statutory_reports USING btree ("orgId", "reportType", period);


--
-- Name: User_email_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "User_email_idx" ON hr."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON hr."User" USING btree (email);


--
-- Name: absence_type_configs_orgId_key_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "absence_type_configs_orgId_key_key" ON hr.absence_type_configs USING btree ("orgId", key);


--
-- Name: checklist_instances_orgId_employeeId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "checklist_instances_orgId_employeeId_idx" ON hr.checklist_instances USING btree ("orgId", "employeeId");


--
-- Name: checklist_instances_templateId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "checklist_instances_templateId_idx" ON hr.checklist_instances USING btree ("templateId");


--
-- Name: checklist_templates_orgId_type_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "checklist_templates_orgId_type_idx" ON hr.checklist_templates USING btree ("orgId", type);


--
-- Name: compliance_log_items_orgId_userId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "compliance_log_items_orgId_userId_idx" ON hr.compliance_log_items USING btree ("orgId", "userId");


--
-- Name: compliance_log_items_status_dueDate_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "compliance_log_items_status_dueDate_idx" ON hr.compliance_log_items USING btree (status, "dueDate");


--
-- Name: compliance_templates_orgId_categoryKey_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "compliance_templates_orgId_categoryKey_idx" ON hr.compliance_templates USING btree ("orgId", "categoryKey");


--
-- Name: departments_orgId_name_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "departments_orgId_name_key" ON hr.departments USING btree ("orgId", name);


--
-- Name: employee_profiles_departmentId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "employee_profiles_departmentId_idx" ON hr.employee_profiles USING btree ("departmentId");


--
-- Name: employee_profiles_managerOrgId_managerUserId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "employee_profiles_managerOrgId_managerUserId_idx" ON hr.employee_profiles USING btree ("managerOrgId", "managerUserId");


--
-- Name: employee_profiles_orgId_dataClassification_residencyTag_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "employee_profiles_orgId_dataClassification_residencyTag_idx" ON hr.employee_profiles USING btree ("orgId", "dataClassification", "residencyTag");


--
-- Name: employee_profiles_orgId_email_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "employee_profiles_orgId_email_idx" ON hr.employee_profiles USING btree ("orgId", email);


--
-- Name: employee_profiles_orgId_employeeNumber_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "employee_profiles_orgId_employeeNumber_key" ON hr.employee_profiles USING btree ("orgId", "employeeNumber");


--
-- Name: employee_profiles_orgId_employmentStatus_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "employee_profiles_orgId_employmentStatus_idx" ON hr.employee_profiles USING btree ("orgId", "employmentStatus");


--
-- Name: employee_profiles_orgId_userId_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "employee_profiles_orgId_userId_key" ON hr.employee_profiles USING btree ("orgId", "userId");


--
-- Name: employment_contracts_orgId_dataClassification_residencyTag_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "employment_contracts_orgId_dataClassification_residencyTag_idx" ON hr.employment_contracts USING btree ("orgId", "dataClassification", "residencyTag");


--
-- Name: employment_contracts_orgId_userId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "employment_contracts_orgId_userId_idx" ON hr.employment_contracts USING btree ("orgId", "userId");


--
-- Name: integration_configs_orgId_provider_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "integration_configs_orgId_provider_key" ON hr.integration_configs USING btree ("orgId", provider);


--
-- Name: leave_balances_orgId_userId_policyId_periodStart_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "leave_balances_orgId_userId_policyId_periodStart_key" ON hr.leave_balances USING btree ("orgId", "userId", "policyId", "periodStart");


--
-- Name: leave_balances_policyId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "leave_balances_policyId_idx" ON hr.leave_balances USING btree ("policyId");


--
-- Name: leave_policies_orgId_name_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "leave_policies_orgId_name_key" ON hr.leave_policies USING btree ("orgId", name);


--
-- Name: leave_policy_accruals_policyId_tenureMonths_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "leave_policy_accruals_policyId_tenureMonths_key" ON hr.leave_policy_accruals USING btree ("policyId", "tenureMonths");


--
-- Name: leave_requests_orgId_status_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "leave_requests_orgId_status_idx" ON hr.leave_requests USING btree ("orgId", status);


--
-- Name: leave_requests_policyId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "leave_requests_policyId_idx" ON hr.leave_requests USING btree ("policyId");


--
-- Name: memberships_orgId_status_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "memberships_orgId_status_idx" ON hr.memberships USING btree ("orgId", status);


--
-- Name: memberships_userId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "memberships_userId_idx" ON hr.memberships USING btree ("userId");


--
-- Name: notification_preferences_orgId_userId_channel_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "notification_preferences_orgId_userId_channel_key" ON hr.notification_preferences USING btree ("orgId", "userId", channel);


--
-- Name: notifications_orgId_priority_createdAt_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "notifications_orgId_priority_createdAt_idx" ON hr.notifications USING btree ("orgId", priority, "createdAt");


--
-- Name: notifications_orgId_scheduledFor_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "notifications_orgId_scheduledFor_idx" ON hr.notifications USING btree ("orgId", "scheduledFor");


--
-- Name: notifications_orgId_userId_isRead_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "notifications_orgId_userId_isRead_idx" ON hr.notifications USING btree ("orgId", "userId", "isRead");


--
-- Name: notifications_orgId_userId_type_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "notifications_orgId_userId_type_idx" ON hr.notifications USING btree ("orgId", "userId", type);


--
-- Name: organizations_slug_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX organizations_slug_key ON hr.organizations USING btree (slug);


--
-- Name: organizations_tenantId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "organizations_tenantId_idx" ON hr.organizations USING btree ("tenantId");


--
-- Name: performance_reviews_orgId_userId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "performance_reviews_orgId_userId_idx" ON hr.performance_reviews USING btree ("orgId", "userId");


--
-- Name: performance_reviews_reviewPeriod_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "performance_reviews_reviewPeriod_idx" ON hr.performance_reviews USING btree ("reviewPeriod");


--
-- Name: policies_orgId_status_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "policies_orgId_status_idx" ON hr.policies USING btree ("orgId", status);


--
-- Name: policy_acknowledgments_policyId_orgId_userId_version_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "policy_acknowledgments_policyId_orgId_userId_version_key" ON hr.policy_acknowledgments USING btree ("policyId", "orgId", "userId", version);


--
-- Name: roles_orgId_name_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "roles_orgId_name_key" ON hr.roles USING btree ("orgId", name);


--
-- Name: time_entries_orgId_status_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "time_entries_orgId_status_idx" ON hr.time_entries USING btree ("orgId", status);


--
-- Name: time_entries_orgId_userId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "time_entries_orgId_userId_idx" ON hr.time_entries USING btree ("orgId", "userId");


--
-- Name: training_records_orgId_userId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "training_records_orgId_userId_idx" ON hr.training_records USING btree ("orgId", "userId");


--
-- Name: unplanned_absence_attachments_orgId_absenceId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "unplanned_absence_attachments_orgId_absenceId_idx" ON hr.unplanned_absence_attachments USING btree ("orgId", "absenceId");


--
-- Name: unplanned_absence_deletions_absenceId_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "unplanned_absence_deletions_absenceId_key" ON hr.unplanned_absence_deletions USING btree ("absenceId");


--
-- Name: unplanned_absence_deletions_orgId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "unplanned_absence_deletions_orgId_idx" ON hr.unplanned_absence_deletions USING btree ("orgId");


--
-- Name: unplanned_absence_returns_absenceId_key; Type: INDEX; Schema: hr; Owner: -
--

CREATE UNIQUE INDEX "unplanned_absence_returns_absenceId_key" ON hr.unplanned_absence_returns USING btree ("absenceId");


--
-- Name: unplanned_absence_returns_orgId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "unplanned_absence_returns_orgId_idx" ON hr.unplanned_absence_returns USING btree ("orgId");


--
-- Name: unplanned_absences_orgId_status_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "unplanned_absences_orgId_status_idx" ON hr.unplanned_absences USING btree ("orgId", status);


--
-- Name: unplanned_absences_orgId_userId_idx; Type: INDEX; Schema: hr; Owner: -
--

CREATE INDEX "unplanned_absences_orgId_userId_idx" ON hr.unplanned_absences USING btree ("orgId", "userId");


--
-- Name: managed_organizations_adminUserId_idx; Type: INDEX; Schema: org; Owner: -
--

CREATE INDEX "managed_organizations_adminUserId_idx" ON org.managed_organizations USING btree ("adminUserId");


--
-- Name: managed_organizations_orgId_idx; Type: INDEX; Schema: org; Owner: -
--

CREATE INDEX "managed_organizations_orgId_idx" ON org.managed_organizations USING btree ("orgId");


--
-- Name: app_permissions_category_idx; Type: INDEX; Schema: platform; Owner: -
--

CREATE INDEX app_permissions_category_idx ON platform.app_permissions USING btree (category);


--
-- Name: invitations invitations_acceptedByUserId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.invitations
    ADD CONSTRAINT "invitations_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invitations invitations_invitedByUserId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.invitations
    ADD CONSTRAINT "invitations_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invitations invitations_orgId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.invitations
    ADD CONSTRAINT "invitations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invitations invitations_revokedByUserId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.invitations
    ADD CONSTRAINT "invitations_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: security_events security_events_orgId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.security_events
    ADD CONSTRAINT "security_events_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: security_events security_events_resolvedBy_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.security_events
    ADD CONSTRAINT "security_events_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: security_events security_events_userId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.security_events
    ADD CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_sessions user_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_sessions
    ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_orgId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.audit_logs
    ADD CONSTRAINT "audit_logs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.audit_logs
    ADD CONSTRAINT "audit_logs_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: data_subject_rights data_subject_rights_orgId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.data_subject_rights
    ADD CONSTRAINT "data_subject_rights_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: data_subject_rights data_subject_rights_responseFrom_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.data_subject_rights
    ADD CONSTRAINT "data_subject_rights_responseFrom_fkey" FOREIGN KEY ("responseFrom") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: data_subject_rights data_subject_rights_userId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.data_subject_rights
    ADD CONSTRAINT "data_subject_rights_userId_fkey" FOREIGN KEY ("userId") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: document_vault document_vault_orgId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.document_vault
    ADD CONSTRAINT "document_vault_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: document_vault document_vault_ownerOrgId_ownerUserId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.document_vault
    ADD CONSTRAINT "document_vault_ownerOrgId_ownerUserId_fkey" FOREIGN KEY ("ownerOrgId", "ownerUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: event_outbox event_outbox_orgId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.event_outbox
    ADD CONSTRAINT "event_outbox_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: records records_assignedToOrgId_assignedToUserId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.records
    ADD CONSTRAINT "records_assignedToOrgId_assignedToUserId_fkey" FOREIGN KEY ("assignedToOrgId", "assignedToUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: records records_orgId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.records
    ADD CONSTRAINT "records_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: records records_submittedByOrgId_submittedByUserId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.records
    ADD CONSTRAINT "records_submittedByOrgId_submittedByUserId_fkey" FOREIGN KEY ("submittedByOrgId", "submittedByUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: statutory_reports statutory_reports_orgId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.statutory_reports
    ADD CONSTRAINT "statutory_reports_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: statutory_reports statutory_reports_submittedByOrgId_submittedByUserId_fkey; Type: FK CONSTRAINT; Schema: compliance; Owner: -
--

ALTER TABLE ONLY compliance.statutory_reports
    ADD CONSTRAINT "statutory_reports_submittedByOrgId_submittedByUserId_fkey" FOREIGN KEY ("submittedByOrgId", "submittedByUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: absence_settings absence_settings_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.absence_settings
    ADD CONSTRAINT "absence_settings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: absence_type_configs absence_type_configs_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.absence_type_configs
    ADD CONSTRAINT "absence_type_configs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_instances checklist_instances_employeeId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.checklist_instances
    ADD CONSTRAINT "checklist_instances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES hr.employee_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_instances checklist_instances_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.checklist_instances
    ADD CONSTRAINT "checklist_instances_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_instances checklist_instances_templateId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.checklist_instances
    ADD CONSTRAINT "checklist_instances_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES hr.checklist_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_templates checklist_templates_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.checklist_templates
    ADD CONSTRAINT "checklist_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: compliance_log_items compliance_log_items_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.compliance_log_items
    ADD CONSTRAINT "compliance_log_items_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: compliance_log_items compliance_log_items_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.compliance_log_items
    ADD CONSTRAINT "compliance_log_items_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: compliance_templates compliance_templates_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.compliance_templates
    ADD CONSTRAINT "compliance_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: departments departments_leaderOrgId_leaderUserId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.departments
    ADD CONSTRAINT "departments_leaderOrgId_leaderUserId_fkey" FOREIGN KEY ("leaderOrgId", "leaderUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: departments departments_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.departments
    ADD CONSTRAINT "departments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employee_profiles employee_profiles_departmentId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.employee_profiles
    ADD CONSTRAINT "employee_profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES hr.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_profiles employee_profiles_managerOrgId_managerUserId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.employee_profiles
    ADD CONSTRAINT "employee_profiles_managerOrgId_managerUserId_fkey" FOREIGN KEY ("managerOrgId", "managerUserId") REFERENCES hr.employee_profiles("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_profiles employee_profiles_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.employee_profiles
    ADD CONSTRAINT "employee_profiles_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employment_contracts employment_contracts_departmentId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.employment_contracts
    ADD CONSTRAINT "employment_contracts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES hr.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employment_contracts employment_contracts_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.employment_contracts
    ADD CONSTRAINT "employment_contracts_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hr_settings hr_settings_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.hr_settings
    ADD CONSTRAINT "hr_settings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: integration_configs integration_configs_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.integration_configs
    ADD CONSTRAINT "integration_configs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_balances leave_balance_membership_fk; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_balances
    ADD CONSTRAINT leave_balance_membership_fk FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_balances leave_balance_profile_fk; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_balances
    ADD CONSTRAINT leave_balance_profile_fk FOREIGN KEY ("orgId", "userId") REFERENCES hr.employee_profiles("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_policyId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_balances
    ADD CONSTRAINT "leave_balances_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES hr.leave_policies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_policies leave_policies_departmentId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_policies
    ADD CONSTRAINT "leave_policies_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES hr.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_policies leave_policies_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_policies
    ADD CONSTRAINT "leave_policies_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_policy_accruals leave_policy_accruals_policyId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_policy_accruals
    ADD CONSTRAINT "leave_policy_accruals_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES hr.leave_policies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_approverOrgId_approverUserId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_requests
    ADD CONSTRAINT "leave_requests_approverOrgId_approverUserId_fkey" FOREIGN KEY ("approverOrgId", "approverUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_requests
    ADD CONSTRAINT "leave_requests_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_policyId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.leave_requests
    ADD CONSTRAINT "leave_requests_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES hr.leave_policies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberships memberships_departmentId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.memberships
    ADD CONSTRAINT "memberships_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES hr.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: memberships memberships_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.memberships
    ADD CONSTRAINT "memberships_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberships memberships_roleId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.memberships
    ADD CONSTRAINT "memberships_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES hr.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: memberships memberships_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.memberships
    ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.notification_preferences
    ADD CONSTRAINT "notification_preferences_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.notification_preferences
    ADD CONSTRAINT "notification_preferences_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.notifications
    ADD CONSTRAINT "notifications_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.notifications
    ADD CONSTRAINT "notifications_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: performance_reviews performance_reviews_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.performance_reviews
    ADD CONSTRAINT "performance_reviews_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: performance_reviews performance_reviews_reviewerOrgId_reviewerUserId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.performance_reviews
    ADD CONSTRAINT "performance_reviews_reviewerOrgId_reviewerUserId_fkey" FOREIGN KEY ("reviewerOrgId", "reviewerUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: policies policies_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.policies
    ADD CONSTRAINT "policies_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: policy_acknowledgments policy_acknowledgments_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.policy_acknowledgments
    ADD CONSTRAINT "policy_acknowledgments_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: policy_acknowledgments policy_acknowledgments_policyId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.policy_acknowledgments
    ADD CONSTRAINT "policy_acknowledgments_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES hr.policies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: roles roles_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.roles
    ADD CONSTRAINT "roles_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: time_entries time_entries_approvedByOrgId_approvedByUserId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.time_entries
    ADD CONSTRAINT "time_entries_approvedByOrgId_approvedByUserId_fkey" FOREIGN KEY ("approvedByOrgId", "approvedByUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: time_entries time_entries_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.time_entries
    ADD CONSTRAINT "time_entries_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: time_entries time_entries_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.time_entries
    ADD CONSTRAINT "time_entries_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_records training_records_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.training_records
    ADD CONSTRAINT "training_records_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: unplanned_absence_attachments unplanned_absence_attachments_absenceId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absence_attachments
    ADD CONSTRAINT "unplanned_absence_attachments_absenceId_fkey" FOREIGN KEY ("absenceId") REFERENCES hr.unplanned_absences(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: unplanned_absence_deletions unplanned_absence_deletions_absenceId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absence_deletions
    ADD CONSTRAINT "unplanned_absence_deletions_absenceId_fkey" FOREIGN KEY ("absenceId") REFERENCES hr.unplanned_absences(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: unplanned_absence_returns unplanned_absence_returns_absenceId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absence_returns
    ADD CONSTRAINT "unplanned_absence_returns_absenceId_fkey" FOREIGN KEY ("absenceId") REFERENCES hr.unplanned_absences(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: unplanned_absences unplanned_absences_approverOrgId_approverUserId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absences
    ADD CONSTRAINT "unplanned_absences_approverOrgId_approverUserId_fkey" FOREIGN KEY ("approverOrgId", "approverUserId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: unplanned_absences unplanned_absences_orgId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absences
    ADD CONSTRAINT "unplanned_absences_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: unplanned_absences unplanned_absences_orgId_userId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absences
    ADD CONSTRAINT "unplanned_absences_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES hr.memberships("orgId", "userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: unplanned_absences unplanned_absences_typeId_fkey; Type: FK CONSTRAINT; Schema: hr; Owner: -
--

ALTER TABLE ONLY hr.unplanned_absences
    ADD CONSTRAINT "unplanned_absences_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES hr.absence_type_configs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: managed_organizations managed_organizations_adminUserId_fkey; Type: FK CONSTRAINT; Schema: org; Owner: -
--

ALTER TABLE ONLY org.managed_organizations
    ADD CONSTRAINT "managed_organizations_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES hr."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: managed_organizations managed_organizations_orgId_fkey; Type: FK CONSTRAINT; Schema: org; Owner: -
--

ALTER TABLE ONLY org.managed_organizations
    ADD CONSTRAINT "managed_organizations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES hr.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

