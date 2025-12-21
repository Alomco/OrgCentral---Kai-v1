import { z } from 'zod';
import { DATA_CLASSIFICATION_LEVELS, DATA_RESIDENCY_ZONES } from '@/server/types/tenant';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgPermissionMap } from '@/server/security/access-control';
import {
    contractMutationPayloadSchema,
    profileMutationPayloadSchema,
} from '@/server/types/hr-people-schemas';
import type { EmployeeProfile, EmploymentContract } from '@/server/types/hr-types';
import type { LeaveBalance, LeaveRequest } from '@/server/types/leave-types';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import type { ComplianceStatusSnapshot } from '@/server/repositories/contracts/hr/compliance/compliance-status-repository-contract';

const permissionsSchema: z.ZodType<OrgPermissionMap> = z
    .record(z.string().min(1), z.array(z.string().min(1)))
    .default({})
    .transform((value) => value as OrgPermissionMap);

const authorizationSchema = z.object({
    orgId: z.uuid(),
    userId: z.uuid(),
    roleKey: z.string(),
    permissions: permissionsSchema,
    dataResidency: z.enum(DATA_RESIDENCY_ZONES),
    dataClassification: z.enum(DATA_CLASSIFICATION_LEVELS),
    auditSource: z.string(),
    correlationId: z.uuid().optional(),
    tenantScope: z.object({
        orgId: z.uuid(),
        dataResidency: z.enum(DATA_RESIDENCY_ZONES),
        dataClassification: z.enum(DATA_CLASSIFICATION_LEVELS),
        auditSource: z.string(),
        auditBatchId: z.string().optional(),
    }),
});

export const onboardEmployeeInputSchema = z.object({
    authorization: authorizationSchema,
    profileDraft: profileMutationPayloadSchema.shape.changes.extend({
        userId: z.uuid(),
        employeeNumber: z.string().min(1),
    }),
    contractDraft: contractMutationPayloadSchema.shape.changes.optional(),
    eligibleLeaveTypes: z.array(z.string().min(1)).optional(),
    onboardingTemplateId: z.uuid().nullable().optional(),
    invite: z.object({ email: z.email() }).optional(),
});

export const getEmployeeSummaryInputSchema = z.object({
    authorization: authorizationSchema,
    userId: z.uuid().optional(),
    profileId: z.uuid().optional(),
    year: z.number().int().min(2000).max(2100).optional(),
});

export const updateEligibilityInputSchema = z.object({
    authorization: authorizationSchema,
    profileId: z.uuid(),
    eligibleLeaveTypes: z.array(z.string().min(1)),
    year: z.number().int().min(2000).max(2100),
});

export const terminateEmployeeInputSchema = z.object({
    authorization: authorizationSchema,
    profileId: z.uuid(),
    contractId: z.uuid().optional(),
    termination: z.object({
        reason: z.string().min(1),
        date: z.coerce.date(),
    }),
    cancelPendingLeave: z.boolean().optional(),
    closeAbsences: z.boolean().optional(),
});

export const assignCompliancePackInputSchema = z.object({
    authorization: authorizationSchema,
    userIds: z.array(z.uuid()).min(1),
    templateId: z.uuid(),
    templateItemIds: z.array(z.string().min(1)).min(1),
});

export type OrchestrationAuthorization = z.infer<typeof authorizationSchema> & RepositoryAuthorizationContext;
export type OnboardEmployeeInput = z.infer<typeof onboardEmployeeInputSchema>;
export interface OnboardEmployeeResult {
    profileId: string;
    contractId?: string;
    invitationToken?: string;
}

export type GetEmployeeSummaryInput = z.infer<typeof getEmployeeSummaryInputSchema>;
export interface GetEmployeeSummaryResult {
    profile: EmployeeProfile | null;
    contract: EmploymentContract | null;
    leaveBalances: LeaveBalance[];
    leaveRequestsOpen: LeaveRequest[];
    absencesOpen: UnplannedAbsence[];
    complianceStatus: ComplianceStatusSnapshot | null;
}

export type UpdateEligibilityInput = z.infer<typeof updateEligibilityInputSchema>;
export type TerminateEmployeeInput = z.infer<typeof terminateEmployeeInputSchema>;
export type AssignCompliancePackInput = z.infer<typeof assignCompliancePackInputSchema>;
