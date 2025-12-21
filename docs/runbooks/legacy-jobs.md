# Legacy Firebase Jobs Inventory

## Purpose
- Track every remaining Firebase callable, Firestore trigger, storage trigger, and scheduled job so we can migrate them to BullMQ/Next.js services without missing org/compliance behaviors.
- Capture compliance metadata (residency, classification, audit cadence) plus target replacements (service/repository, cache tags, worker name) per the backend replication roadmap.
- Provide a single source of truth for decommissioning Firebase once BullMQ workers and queue infrastructure ship.

## Legend
- **Trigger**: `callable`, `https`, `firestore.update`, `firestore.create`, `storage.finalize`, `scheduler`, etc.
- **Schedule/Path**: Cron text (`every day 01:00`) or Firestore/Storage path (`organizations/{orgId}/employees/{userId}/complianceLog/{categoryKey}`).
- **Residency**: `UK`, `EU`, `Global` (use dual tags when data crosses regions).
- **Classification**: `OFFICIAL`, `OFFICIAL-SENSITIVE`, `SECRET` (see `old/docs/requirements/02-security-and-compliance.md`).
- **Target Surface**: Name of the new BullMQ worker/service + cache tag(s) that must be invalidated.
- **Status**: `legacy-only`, `dual-run`, `replaced`, `decommissioned`.

## Inventory Overview
| Legacy Name | File | Trigger | Schedule/Path | Residency | Classification | Current Behavior Summary | Target Surface | Cache/Audit Notes | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| checkComplianceExpiries | `old/firebase/functions/src/functions/hr-compliance.ts` | `scheduler` | `every day 01:00 Europe/London` against `collectionGroup('complianceLog')` | UK | OFFICIAL-SENSITIVE | Scans every org’s compliance log, flips Expired/Expiring Soon flags, and relies on `onComplianceLogUpdated` for downstream RAG updates. | BullMQ `hr-compliance-reminder` queue + planned `compliance-expiry.worker` invoking `ComplianceStatusService` | Must invalidate `HR_COMPLIANCE` cache tags per org + classification and record audit events for each status change. | dual-run (BullMQ reminder live; expiry worker implementation pending) |
| onComplianceLogUpdated | `old/firebase/functions/src/functions/hr-compliance.ts` | `firestore.update` | `organizations/{orgId}/employees/{userId}/complianceLog/{categoryKey}` | UK | OFFICIAL-SENSITIVE | Firestore trigger that recalculates category + overall employee RAG state and writes back to the employee document when any log item mutates. | `ComplianceStatusService.projectLogStatus` inside cache components | Needs cache tag refresh for `HR_COMPLIANCE` and audit trail for verification state transitions. | legacy-only |
| analyzeAbsenceDocument | `old/firebase/functions/src/functions/hr-absences.ts` | `storage.object.finalize` | `organizations/{orgId}/unplannedAbsences/{absenceId}/attachments/*` | UK | OFFICIAL-SENSITIVE | Sends uploaded evidence to Vision/Gemini, stores AI validation output, and updates `aiValidation` metadata on the absence record. | BullMQ `hr.absences.ai_validation` worker + `AbsenceService` | Emits `hr.absences.ai_validation` audit events, invalidates absence cache tags (`HR_ABSENCES` + residency). | legacy-only |

### Domain-Level Inventory (Phase A Complete – 2025-12-07)

#### Branding Admin (Residency: UK • Classification: OFFICIAL)
- **updateOrganizationBranding** — Callable (HTTPS, europe-west2) that validates theme colors/logos and writes `branding` on `organizations/{orgId}` after enforcing `orgAdmin`/`entAdmin` access. *Target Surface*: `OrgBrandingService.updateOrgBranding` + `OrgBrandingRepository` with `CACHE_SCOPE_BRANDING` invalidation and Structured Logger audit. *Status*: legacy-only.
- **getOrganizationBranding** — Callable that merges `platformSettings/branding` defaults with org overrides for authenticated members or `globalAdmin` accounts. *Target Surface*: `OrgBrandingService.getBranding` feeding the cache-aware `BrandingPort`. *Status*: legacy-only.
- **resetOrganizationBranding** — Callable that deletes the org `branding` block to fall back to platform defaults. *Target Surface*: `OrgBrandingService.resetOrgBranding` ensuring cache bust + audit trail. *Status*: legacy-only.
- **updatePlatformBranding** — Callable limited to `globalAdmin` that updates `platformSettings/branding` (logo/colors/favicon). *Target Surface*: `PlatformBrandingService.updatePlatformBranding` with cross-tenant cache invalidation and residency-aware audit logging. *Status*: legacy-only.

#### Enterprise Admin (Residency: UK • Classification: OFFICIAL)
- **onboardOrgByEnterpriseAdmin** — Callable that lets enterprise admins provision a tenant, seed default roles, and invite org owners. *Target Surface*: `PlatformTenantService.onboardEnterpriseTenant` + `OrgMembershipService` with `TENANT_DIRECTORY` cache invalidation. *Status*: legacy-only.

#### Auth & Identity (Residency: UK • Classification: OFFICIAL)
- **getInvitationDetails** — Callable that reads `invitations/{token}`, validates status, and reports whether the invite email already exists in Firebase Auth. *Target Surface*: `InvitationRepository` + a Next.js `/api/auth/invitations/[token]` route returning the same metadata from Postgres. *Status*: legacy-only.
- **acceptInvitation** — Callable transaction that accepts an invite, upserts `users/{uid}`, creates `organizations/{orgId}/employees/{uid}`, and updates memberships/roles. *Target Surface*: `MembershipService.acceptInvitation` (already implemented) exposed via Better Auth actions with `resolveIdentityCacheScopes` invalidation. *Status*: legacy-only.
- **addToWaitlist** — Callable that writes `{name,email,industry}` to the Firestore `waitlist` collection. *Target Surface*: `GrowthWaitlistService` (Next.js API backed by Postgres) with throttling. *Status*: legacy-only.
- **setInitialClaimsOnUserCreate** — Firestore `onCreate` trigger on `users/{userId}` that maps first membership info into Firebase custom claims. *Target Surface*: `IdentityClaimsProjector` worker fed by Better Auth events. *Status*: legacy-only.
- **syncUserRolesToCustomClaims** — Firestore `onUpdate` trigger on `users/{userId}` that syncs updated roles/memberOf metadata to custom claims. *Target Surface*: `AuthClaimsService.syncClaims` invoked via OTEL-enabled worker. *Status*: legacy-only.

#### HR Compliance (Residency: UK • Classification: OFFICIAL-SENSITIVE)
- **assignComplianceItems** — Callable letting HR admins clone template tasks into `employees/{userId}/complianceLog` collections. *Target Surface*: `ComplianceAssignmentService.assignItems` + `PrismaComplianceItemRepository`. *Status*: legacy-only.
- **updateUserComplianceItem** — Callable that updates uploaded evidence, expiry metadata, and status for a single log item. *Target Surface*: `ComplianceItemService.updateItem` with cache invalidation + audit logging. *Status*: legacy-only.
- **reviewComplianceItem** — Callable for reviewers to approve/reject submissions, set `Pending Review`/`Complete`, and emit notifications. *Target Surface*: `ComplianceItemService.reviewItem` + `HrNotificationService`. *Status*: legacy-only.
- **onComplianceLogUpdated** — Firestore trigger on `organizations/{orgId}/employees/{userId}/complianceLog/{categoryKey}` that recalculates per-category RAG plus overall employee status. *Target Surface*: `ComplianceStatusService.projectLogStatus` within cache-aware services. *Status*: legacy-only.
- **updateComplianceConfiguration** — Callable updating the org’s compliance task library stored within the org document. *Target Surface*: `ComplianceConfigService.updateTaskLibrary`. *Status*: legacy-only.
- **checkComplianceExpiries** — Scheduled job (daily 01:00 Europe/London) that flips Expired/Expiring Soon and expects the RAG projector to run afterward. *Target Surface*: BullMQ `hr.compliance.reminder` + upcoming `compliance-expiry.worker` that must also invoke `ComplianceStatusService` before persisting changes (per revised plan). *Status*: dual-run.
- **onEmployeeCreated** — Firestore `onCreate` trigger on `organizations/{orgId}/employees/{userId}` that seeds default compliance categories. *Target Surface*: `PeopleOnboardingService.seedComplianceLog` invoked directly during onboarding. *Status*: legacy-only.

#### HR Leave (Residency: UK • Classification: OFFICIAL-SENSITIVE)
- **rejectLeaveRequest** — Callable that records HR/manager rejection metadata on `leaveRequests/{requestId}` and triggers notifications. *Target Surface*: `LeaveService.rejectRequest` + `HrNotificationService`. *Status*: legacy-only.
- **getLeaveEntitlements** — Callable returning per-employee leave entitlement snapshots assembled from Firestore balances. *Target Surface*: `LeaveService.getEntitlements` (Postgres) cached per tenant. *Status*: legacy-only.
- **getOrgAvailablePermissions** — Callable listing which leave actions each role can perform. *Target Surface*: `LeaveService.getPermissionMatrix` backed by CASL role definitions. *Status*: legacy-only.
- **addCustomLeaveType** — Callable appending custom leave types to org settings documents. *Target Surface*: `LeaveSettingsService.upsertLeaveType`. *Status*: legacy-only.
- **submitLeaveRequestV2** — Callable that validates overlaps, writes new `leaveRequests` entries, and deducts provisional balances. *Target Surface*: `LeaveService.submitRequest` with transactional Prisma writes and `HR_LEAVE` cache invalidation. *Status*: legacy-only.
- **approveLeaveRequest** — Callable updating status, finalizing balances, and notifying requesters. *Target Surface*: `LeaveService.approveRequest`. *Status*: legacy-only.
- **adminCancelLeaveRequest** — Callable allowing HR to cancel requests and restore balances. *Target Surface*: `LeaveService.cancelRequest`. *Status*: legacy-only.
- **getOrCreateEmployeeLeaveBalances** — Callable ensuring leave balance docs exist for employees and returning them to callers. *Target Surface*: `LeaveBalanceService.ensureBalance`. *Status*: legacy-only.

#### HR Absences (Residency: UK • Classification: OFFICIAL-SENSITIVE)
- **reportAbsence** — Callable capturing day-one absence details, attachments, and manager routing inside `unplannedAbsences/{absenceId}`. *Target Surface*: `AbsenceService.reportAbsence` + `AbsenceIncidentRepository`. *Status*: legacy-only.
- **submitReturnToWork** — Callable storing return-to-work forms and manager notes. *Target Surface*: `AbsenceService.submitReturnToWork`. *Status*: legacy-only.
- **analyzeAbsenceDocument** — Storage finalize trigger on `organizations/{orgId}/unplannedAbsences/{absenceId}/attachments/*` sending evidence to AI validators. *Target Surface*: BullMQ `hr.absences.ai_validation` worker + `AbsenceService`. *Status*: legacy-only.
- **acknowledgeAbsence** — Callable that marks an absence as acknowledged by HR/manager and unlocks next workflow steps. *Target Surface*: `AbsenceService.acknowledgeAbsence`. *Status*: legacy-only.
- **adminCancelAbsence** — Callable canceling an absence entry and notifying stakeholders. *Target Surface*: `AbsenceService.cancelAbsence`. *Status*: legacy-only.
- **getAbsenceTypes** — Callable returning configured absence categories for an org. *Target Surface*: `AbsenceSettingsService.getTypes`. *Status*: legacy-only.
- **updateAbsenceSettings** — Callable updating absence policies (notifications, auto-escalations). *Target Surface*: `AbsenceSettingsService.updateSettings`. *Status*: legacy-only.
- **addAbsenceType** — Callable adding custom absence type definitions. *Target Surface*: `AbsenceSettingsService.addType`. *Status*: legacy-only.
- **removeAbsenceType** — Callable soft-deleting absence types from org settings. *Target Surface*: `AbsenceSettingsService.removeType`. *Status*: legacy-only.

#### HR Onboarding (Residency: UK • Classification: OFFICIAL-SENSITIVE)
- **checkExistingEmployee** — Callable verifying whether a candidate already exists in `employees` before onboarding. *Target Surface*: `OnboardingService.lookupEmployee`. *Status*: legacy-only.
- **onboardEmployee** — Callable that creates employee records, invites the user, and assigns onboarding checklist templates. *Target Surface*: `OnboardingService.onboard` + `ChecklistInstanceService` with `HR_PEOPLE` cache invalidation. *Status*: legacy-only.

#### Notifications Test Utilities (Residency: UK • Classification: OFFICIAL)
- **createTestNotification** — Callable allowing admins to push a single notification into Firestore inboxes for QA purposes. *Target Surface*: `NotificationComposerService.previewNotification` leveraging Postgres templates. *Status*: legacy-only.
- **createMultipleTestNotifications** — Callable that batches multiple preview notifications for QA load tests. *Target Surface*: same as above plus BullMQ `notifications/dispatcher-worker` for eventual fan-out. *Status*: legacy-only.
- **sendOrganizationAnnouncement** — Callable broadcasting a templated announcement to every org member. *Target Surface*: `NotificationComposerService.sendAnnouncement` + dispatcher worker. *Status*: legacy-only.

#### Org Admin (Residency: UK • Classification: OFFICIAL-SENSITIVE)
- **updateUserRoles** — Callable overwriting a member’s role set inside `organizations/{orgId}`. *Target Surface*: `OrgMembershipService.updateUserRoles` with CASL cache refresh. *Status*: legacy-only.
- **createOrganizationCustomRole** — Callable writing bespoke role definitions with permission arrays. *Target Surface*: `OrgRoleService.createCustomRole`. *Status*: legacy-only.
- **getOrganizationCustomRoles** — Callable listing custom roles for an org. *Target Surface*: `OrgRoleService.listCustomRoles`. *Status*: legacy-only.
- **updateOrganizationCustomRole** — Callable updating permissions on an existing role. *Target Surface*: `OrgRoleService.updateCustomRole`. *Status*: legacy-only.
- **deleteOrganizationCustomRole** — Callable deleting a custom role definition and removing references. *Target Surface*: `OrgRoleService.deleteCustomRole`. *Status*: legacy-only.
- **renameCustomLeaveType** — Callable renaming leave types stored under the org document. *Target Surface*: `LeaveSettingsService.renameType`. *Status*: legacy-only.
- **removeLeaveType** — Callable removing leave types organization-wide. *Target Surface*: `LeaveSettingsService.removeType`. *Status*: legacy-only.
- **updateOrganizationLeaveSettings** — Callable updating org-level leave policies. *Target Surface*: `LeaveSettingsService.updateOrgSettings`. *Status*: legacy-only.
- **getOrganizationUsers** — Callable returning paged member + role lists. *Target Surface*: `OrgDirectoryService.listMembers`. *Status*: legacy-only.
- **getOrganizationAvailablePermissions** — Callable enumerating permissions available to assign. *Target Surface*: `OrgRoleService.getAvailablePermissions`. *Status*: legacy-only.
- **updateMultipleUserRoles** — Callable applying role changes to many users simultaneously. *Target Surface*: `OrgMembershipService.bulkUpdateRoles`. *Status*: legacy-only.
- **removeUserFromOrganization** — Callable removing user memberships and dependent docs. *Target Surface*: `OrgMembershipService.removeMember`. *Status*: legacy-only.
- **cancelInvitation** — Callable marking `invitations/{token}` as canceled. *Target Surface*: `InvitationService.cancelInvitation`. *Status*: legacy-only.
- **resendInvitationEmail** — Callable resending pending invites via the email adapter. *Target Surface*: `InvitationService.resend` + Resend provider. *Status*: legacy-only.
- **reactivateEmployee** — Callable reactivating archived employee profiles and restoring roles. *Target Surface*: `PeopleService.reactivateEmployee`. *Status*: legacy-only.
- **getUsersForTenant** — Callable fetching aggregated user lists across a tenant. *Target Surface*: `TenantDirectoryService.listUsers`. *Status*: legacy-only.
- **getRolesForTenant** — Callable returning tenant-level role definitions. *Target Surface*: `TenantDirectoryService.listRoles`. *Status*: legacy-only.
- **getTemplatesForTenant** — Callable listing tenant templates (roles/permissions). *Target Surface*: `TenantTemplateService.listTemplates`. *Status*: legacy-only.
- **updateOrganizationDetails** — Callable updating org profile metadata (name, industry, location). *Target Surface*: `OrganizationService.updateDetails`. *Status*: legacy-only.

#### Platform Admin (Residency: UK • Classification: OFFICIAL)
- **getGlobalAppPermissions** — Callable returning the platform-wide permission catalog used by admin tooling. *Target Surface*: `PlatformPermissionService.getGlobalPermissions`. *Status*: legacy-only.
- **listAllOrganizations** — Callable enumerating every organization for platform admins. *Target Surface*: `PlatformTenantService.listOrganizations` (Postgres). *Status*: legacy-only.
- **createOrganizationGlobal** — Callable creating an org record (plan metadata + owner). *Target Surface*: `PlatformTenantService.createOrganization`. *Status*: legacy-only.
- **setOrgAvailablePermissions** — Callable updating which permissions an org can assign. *Target Surface*: `PlatformPermissionService.setOrgPermissions`. *Status*: legacy-only.
- **createAppPermission** — Callable adding new permission definitions. *Target Surface*: `PlatformPermissionService.createPermission`. *Status*: legacy-only.
- **runConnectionTest** — Callable used by platform admins to perform a quick connectivity test (healthcheck). *Target Surface*: `/api/platform/health` route. *Status*: legacy-only.
- **getTenants** — Callable listing tenants with plan/module information. *Target Surface*: `PlatformTenantService.listTenants`. *Status*: legacy-only.
- **updateOrganizationUserCount** — Firestore `onUpdate` trigger adjusting tenant user counts when org documents change membership totals. *Target Surface*: `TenantMetricsProjector` consuming Postgres events. *Status*: legacy-only.
- **updatePlan** — Callable updating plan assignments for a tenant. *Target Surface*: `PlatformTenantService.updatePlan`. *Status*: legacy-only.
- **updateTenantSubscription** — Callable modifying subscription metadata (billing cycle, seats). *Target Surface*: `PlatformTenantService.updateSubscription`. *Status*: legacy-only.
- **updateTenantStatus** — Callable toggling tenant activation/suspension. *Target Surface*: `PlatformTenantService.updateStatus`. *Status*: legacy-only.
- **getTenantDetails** — Callable returning full tenant metadata including modules and billing. *Target Surface*: `PlatformTenantService.getTenant`. *Status*: legacy-only.
- **reassignOrganizationOwner** — Callable reassigning ownership to a different member. *Target Surface*: `OrgOwnershipService.reassignOwner`. *Status*: legacy-only.
- **updateTenantDetailsByAdmin** — Callable permitting platform admins to edit tenant metadata. *Target Surface*: `PlatformTenantService.updateDetails`. *Status*: legacy-only.
- **updateTenantModuleAccess** — Callable toggling module availability for a tenant. *Target Surface*: `PlatformModuleService.setAccess`. *Status*: legacy-only.
- **generateImpersonationToken** — Callable producing Firebase custom tokens so platform admins can impersonate org users. *Target Surface*: `PlatformImpersonationService.generateToken` using Better Auth session signing. *Status*: legacy-only.
- **onboardTenant** — Callable orchestrating full tenant onboarding (org docs, permissions, invites). *Target Surface*: `PlatformTenantService.onboardTenant`. *Status*: legacy-only.
- **getPlatformModules** — Callable listing modules/features available platform-wide. *Target Surface*: `PlatformModuleService.listModules`. *Status*: legacy-only.
- **getSubscriptionPlans** — Callable returning plan definitions and pricing. *Target Surface*: `PlatformPlanService.listPlans`. *Status*: legacy-only.
- **manageEnterpriseAdmin** — Callable adding/removing enterprise administrators. *Target Surface*: `PlatformTenantService.manageEnterpriseAdmins`. *Status*: legacy-only.
- **backfillUserRolesByOrg** — Callable used for migrations to backfill role mappings per org. *Target Surface*: `OrgMembershipService.backfillRoles`. *Status*: legacy-only.
- **refreshAuthClaims** — Callable reapplying auth claims for all members of a tenant. *Target Surface*: `AuthClaimsService.refreshClaims`. *Status*: legacy-only.
- **searchAllUsers** — Callable performing cross-tenant user search. *Target Surface*: `TenantDirectoryService.searchUsers`. *Status*: legacy-only.
- **syncClaimsForSelectedUsers** — Callable targeting a subset of users for custom-claim refresh. *Target Surface*: `AuthClaimsService.syncSelectedUsers`. *Status*: legacy-only.

#### Workflow Admin (Residency: UK • Classification: OFFICIAL-SENSITIVE)
- **createChecklistTemplate** — Callable creating onboarding/offboarding checklist templates. *Target Surface*: `ChecklistTemplateService.createTemplate`. *Status*: legacy-only.
- **getChecklistTemplates** — Callable listing templates for an org/tenant. *Target Surface*: `ChecklistTemplateService.listTemplates`. *Status*: legacy-only.
- **updateChecklistTemplate** — Callable editing checklist template metadata/items. *Target Surface*: `ChecklistTemplateService.updateTemplate`. *Status*: legacy-only.
- **deleteChecklistTemplate** — Callable deleting template definitions. *Target Surface*: `ChecklistTemplateService.deleteTemplate`. *Status*: legacy-only.
- **initiateOffboarding** — Callable starting an offboarding workflow for an employee, cloning a template into a live checklist. *Target Surface*: `ChecklistInstanceService.initiateOffboarding`. *Status*: legacy-only.
- **getEmployeeActiveChecklist** — Callable fetching the active checklist assigned to an employee. *Target Surface*: `ChecklistInstanceService.getActiveChecklist`. *Status*: legacy-only.
- **updateChecklistItems** — Callable updating multiple checklist items (complete, comment, upload). *Target Surface*: `ChecklistInstanceService.updateItems`. *Status*: legacy-only.
- **completeOffboarding** — Callable marking an offboarding checklist complete and triggering downstream actions. *Target Surface*: `ChecklistInstanceService.completeOffboarding`. *Status*: legacy-only.
- **completeOnboardingChecklist** — Callable closing onboarding checklists once all tasks are complete. *Target Surface*: `ChecklistInstanceService.completeOnboarding`. *Status*: legacy-only.

## Methodology
1. Use `rg "exports\." old/firebase/functions/src/functions` to enumerate every callable/trigger, then classify trigger type (`onCall`, `onDocumentUpdated`, `onSchedule`, `onObjectFinalized`, etc.).
2. Read each function to capture Firestore/Storage paths, background schedules, and implicit tenancy/residency handling (e.g., `organizationId` args, collection scoping).
3. Map each job to new services/repositories outlined in `docs/backend-replication-roadmap.md`, `docs/backend-migration-plan.md`, and `docs/migration-task-breakdown.md`.
4. Tag compliance attributes from `old/docs/requirements/02-security-and-compliance.md`; where unknown, flag `TBD` and note required SME input.
5. Track validation requirements: lint/test target, cache invalidation proof, audit log expectations, and documentation updates (runbooks/ADRs).
6. Cross-check the inventory periodically (last pass: 2025-12-07 via `rg exports` + manual review) so Phase A remains authoritative.

> Phase A deliverable status: **Complete (2025-12-07)** — all Firebase callables, Firestore triggers, storage triggers, and scheduled jobs are cataloged above with target surfaces.

### Phase A Implementation Snapshot (2025-12-07)
- Queue foundation (`src/server/workers/config/queue-registry.ts`) and abstract worker base are live with shared Redis pooling and service-context wiring.
- Compliance reminder worker stack (schema, queue client, processor, worker, scheduler helper, tests, runbook) replaces the Firebase `checkComplianceExpiries` reminder path.
- Scheduler entrypoint/API wiring is deferred; the new helper can be invoked once cron orchestration moves over in Phase B.
- Training reminder worker stack (schema, queue client, processor, worker, scheduler helper, runbook) is available with `/api/cron/training-reminders` for prod cron wiring.

## Open Questions
- [x] Are there additional cron sources outside `old/firebase/functions/src/functions` (historically `src/cron`)? — Reviewed repo history on 2025-12-07; no extra cron directories remain beyond the Firebase functions listed here.
- [x] Do any callable functions still rely on Pub/Sub topics that must be replicated before shutdown? — No active Pub/Sub topics remain (only a commented stub inside `hr-compliance.ts`).
- [ ] Which notification templates referenced by legacy jobs already exist in Postgres versus Firebase Storage JSON?
