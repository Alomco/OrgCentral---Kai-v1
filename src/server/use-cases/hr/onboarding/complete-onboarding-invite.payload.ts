import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { normalizeRoles } from '@/server/use-cases/shared';
import type {
    EmploymentContractCreateInput,
    OnboardingChecklistConfig,
} from '@/server/types/hr/onboarding-workflows';
import type { ProfileMutationPayload } from '@/server/types/hr/people';
import type { JsonValue } from '@/server/types/hr/people';
import type { OnboardingInvitation } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import { ValidationError } from '@/server/errors';
import type { CreateEmployeeProfileInput } from '@/server/use-cases/hr/people/create-employee-profile';
import {
    coerceNumber,
    coerceString,
    extractStringArray,
    isJsonValue,
    isRecord,
    normalizeSalaryBasis,
    normalizePaySchedule,
    resolveContractType,
    resolveEmploymentType,
} from './complete-onboarding-invite.normalizers';

export interface OnboardingPayload {
    email?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    employeeId?: string;
    employeeNumber?: string;
    employmentType?: string;
    jobTitle?: string;
    departmentId?: string;
    startDate?: string;
    managerEmployeeNumber?: string;
    annualSalary?: number;
    hourlyRate?: number;
    salaryCurrency?: string;
    salaryBasis?: string;
    paySchedule?: string;
    eligibleLeaveTypes?: string[];
    onboardingTemplateId?: string;
    roles?: string[];
    contractType?: string;
    location?: string;
    workingPattern?: JsonValue;
    benefits?: JsonValue;
}

export function extractOnboardingPayload(invitation: OnboardingInvitation): OnboardingPayload {
    const data = invitation.onboardingData;
    if (!isRecord(data)) {
        return {};
    }
    return {
        email: coerceString(data.email),
        displayName: coerceString(data.displayName),
        firstName: coerceString(data.firstName),
        lastName: coerceString(data.lastName),
        employeeId: coerceString(data.employeeId),
        employeeNumber: coerceString(data.employeeNumber),
        employmentType: coerceString(data.employmentType),
        jobTitle: coerceString(data.jobTitle ?? data.position),
        departmentId: coerceString(data.departmentId),
        startDate: coerceString(data.startDate),
        managerEmployeeNumber: coerceString(data.managerEmployeeNumber),
        annualSalary: coerceNumber(data.annualSalary ?? data.salary),
        hourlyRate: coerceNumber(data.hourlyRate),
        salaryCurrency: coerceString(data.salaryCurrency ?? data.currency),
        salaryBasis: coerceString(data.salaryBasis),
        paySchedule: coerceString(data.paySchedule),
        eligibleLeaveTypes: extractStringArray(data.eligibleLeaveTypes),
        onboardingTemplateId: coerceString(data.onboardingTemplateId),
        roles: extractStringArray(data.roles),
        contractType: coerceString(data.contractType),
        location: coerceString(data.location),
        workingPattern: isJsonValue(data.workingPattern) ? data.workingPattern : undefined,
        benefits: isJsonValue(data.benefits) ? data.benefits : undefined,
    } satisfies OnboardingPayload;
}

export function resolveEmployeeNumber(payload: OnboardingPayload): string {
    const candidate = payload.employeeId ?? payload.employeeNumber;
    if (candidate) {
        return candidate;
    }
    throw new ValidationError('Invitation is missing the employee identifier.');
}

export function resolveRoles(roles: string[] | undefined): string[] {
    return normalizeRoles(roles ?? []);
}

export function buildProfileData(params: {
    payload: OnboardingPayload;
    userId: string;
    employeeNumber: string;
    invitation: OnboardingInvitation;
}): ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string } {
    const employmentType = resolveEmploymentType(params.payload.employmentType);
    const profileMetadata = buildProfileMetadata(params.invitation);
    const metadata = params.payload.managerEmployeeNumber
        ? { ...(profileMetadata as Record<string, JsonValue | undefined>), managerEmployeeNumber: params.payload.managerEmployeeNumber }
        : profileMetadata;
    return {
        userId: params.userId,
        employeeNumber: params.employeeNumber,
        employmentType,
        jobTitle: params.payload.jobTitle,
        departmentId: params.payload.departmentId,
        startDate: params.payload.startDate,
        annualSalary: params.payload.annualSalary,
        hourlyRate: params.payload.hourlyRate,
        salaryCurrency: params.payload.salaryCurrency,
        salaryBasis: normalizeSalaryBasis(params.payload.salaryBasis),
        paySchedule: normalizePaySchedule(params.payload.paySchedule),
        email: params.payload.email ?? params.invitation.targetEmail,
        displayName: params.payload.displayName,
        firstName: params.payload.firstName,
        lastName: params.payload.lastName,
        eligibleLeaveTypes: params.payload.eligibleLeaveTypes ?? [],
        metadata,
    } satisfies ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string };
}

export function buildContractData(
    payload: OnboardingPayload,
    userId: string,
): EmploymentContractCreateInput | null {
    const jobTitle = payload.jobTitle;
    if (!jobTitle) {
        return null;
    }

    const contractType = resolveContractType(payload.contractType, payload.employmentType);
    if (!contractType) {
        return null;
    }

    return {
        userId,
        contractType,
        jobTitle,
        startDate: payload.startDate ?? new Date().toISOString(),
        departmentId: payload.departmentId,
        location: payload.location,
        workingPattern: payload.workingPattern,
        benefits: payload.benefits,
    } satisfies EmploymentContractCreateInput;
}

export function buildChecklistConfig(
    payload: OnboardingPayload,
    token: string,
): OnboardingChecklistConfig | null {
    if (!payload.onboardingTemplateId) {
        return null;
    }

    return {
        templateId: payload.onboardingTemplateId,
        metadata: {
            source: 'complete-onboarding-invite',
            invitationToken: token,
        },
    } satisfies OnboardingChecklistConfig;
}

export function buildCreateProfileInput(params: {
    authorization: RepositoryAuthorizationContext;
    profileData: ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string };
    contractData: EmploymentContractCreateInput | null;
    onboardingTemplateId?: string;
    onboardingChecklist: OnboardingChecklistConfig | null;
}): CreateEmployeeProfileInput {
    const createInput: CreateEmployeeProfileInput = {
        authorization: params.authorization,
        profileData: params.profileData,
        onboardingTemplateId: params.onboardingTemplateId,
        onboardingChecklist: params.onboardingChecklist ?? undefined,
    };

    if (params.contractData) {
        createInput.contractData = params.contractData;
    }

    return createInput;
}

function buildProfileMetadata(invitation: OnboardingInvitation): JsonValue {
    return {
        source: 'onboarding-invitation',
        token: invitation.token,
        issuedAt: invitation.createdAt instanceof Date
            ? invitation.createdAt.toISOString()
            : new Date(invitation.createdAt).toISOString(),
        organizationName: invitation.organizationName,
    } satisfies JsonValue;
}
