import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type {
    IChecklistInstanceRepository,
} from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type {
    IChecklistTemplateRepository,
} from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type {
    IOnboardingInvitationRepository,
    OnboardingInvitation,
} from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { organizationToTenantScope } from '@/server/security/guards';
import {
    buildAuthorizationContext,
    normalizeRoles,
    normalizeToken,
    assertEmailMatch,
    assertNotExpired,
    assertStatus,
} from '@/server/use-cases/shared';
import {
    createEmployeeProfile,
    type CreateEmployeeProfileDependencies,
    type CreateEmployeeProfileInput,
    type CreateEmployeeProfileTransactionRunner,
} from '@/server/use-cases/hr/people/create-employee-profile';
import type {
    EmploymentContractCreateInput,
    OnboardingChecklistConfig,
} from '@/server/types/hr/onboarding-workflows';
import type { ProfileMutationPayload, EmploymentTypeCode, ContractTypeCode } from '@/server/types/hr/people';
import { EMPLOYMENT_TYPE_VALUES, CONTRACT_TYPE_VALUES } from '@/server/types/hr/people';
import type { OrganizationData } from '@/server/types/leave-types';
import type { JsonValue } from '@/server/types/hr/people';

export interface CompleteOnboardingInviteInput {
    inviteToken: string;
    userId: string;
    actorEmail: string;
}

export interface CompleteOnboardingInviteDependencies {
    onboardingInvitationRepository: IOnboardingInvitationRepository;
    organizationRepository: IOrganizationRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
    employmentContractRepository?: IEmploymentContractRepository;
    checklistTemplateRepository?: IChecklistTemplateRepository;
    checklistInstanceRepository?: IChecklistInstanceRepository;
    transactionRunner?: CreateEmployeeProfileTransactionRunner;
}

export interface CompleteOnboardingInviteResult {
    success: true;
    organizationId: string;
    organizationName: string;
    employeeNumber: string;
    profileId: string;
    roles: string[];
    alreadyMember: false;
    contractCreated?: boolean;
    checklistInstanceId?: string;
}

export async function completeOnboardingInvite(
    deps: CompleteOnboardingInviteDependencies,
    input: CompleteOnboardingInviteInput,
): Promise<CompleteOnboardingInviteResult> {
    const token = normalizeToken(input.inviteToken);
    const invitation = await deps.onboardingInvitationRepository.getInvitationByToken(token);
    if (!invitation) {
        throw new EntityNotFoundError(INVITATION_RESOURCE, { token });
    }

    validateInvitation(invitation, input.actorEmail);

    const organization = await deps.organizationRepository.getOrganization(invitation.orgId);
    if (!organization) {
        throw new EntityNotFoundError('Organization', { orgId: invitation.orgId });
    }

    const authorization = buildAuthorizationForInvite(organization, input.userId);
    const payload = extractOnboardingPayload(invitation);
    const employeeNumber = resolveEmployeeNumber(payload);

    const profileData = buildProfileData({
        payload,
        userId: input.userId,
        employeeNumber,
        invitation,
    });

    const contractData = buildContractData(payload, input.userId);
    const onboardingChecklist = buildChecklistConfig(payload, invitation.token);

    const creationResult = await createEmployeeProfile(
        createProfileDependencies(deps),
        buildCreateProfileInput({
            authorization,
            profileData,
            contractData,
            onboardingTemplateId: payload.onboardingTemplateId,
            onboardingChecklist,
        }),
    );

    const profile = await deps.employeeProfileRepository.findByEmployeeNumber(organization.id, employeeNumber);
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { employeeNumber, orgId: organization.id });
    }

    await deps.employeeProfileRepository.linkProfileToUser(organization.id, employeeNumber, input.userId);
    await deps.onboardingInvitationRepository.markAccepted(organization.id, invitation.token, input.userId);

    return {
        success: true,
        organizationId: organization.id,
        organizationName: organization.name,
        employeeNumber,
        profileId: profile.id,
        roles: resolveRoles(payload.roles),
        alreadyMember: false,
        contractCreated: creationResult.contractCreated,
        checklistInstanceId: creationResult.checklistInstanceId,
    } satisfies CompleteOnboardingInviteResult;
}

function createProfileDependencies(
    deps: CompleteOnboardingInviteDependencies,
): CreateEmployeeProfileDependencies {
    return {
        employeeProfileRepository: deps.employeeProfileRepository,
        employmentContractRepository: deps.employmentContractRepository,
        checklistTemplateRepository: deps.checklistTemplateRepository,
        checklistInstanceRepository: deps.checklistInstanceRepository,
        transactionRunner: deps.transactionRunner,
    } satisfies CreateEmployeeProfileDependencies;
}

const INVITATION_RESOURCE = 'Onboarding invitation';

function validateInvitation(invitation: OnboardingInvitation, actorEmail: string): void {
    assertEmailMatch(actorEmail, invitation.targetEmail, 'Invitation was issued to a different email.');
    assertStatus(invitation.status, 'pending', INVITATION_RESOURCE, { token: invitation.token });
    assertNotExpired(invitation.expiresAt ?? undefined, INVITATION_RESOURCE, { token: invitation.token });
}

function buildAuthorizationForInvite(
    organization: OrganizationData,
    userId: string,
): RepositoryAuthorizationContext {
    const tenantScope = organizationToTenantScope(organization);
    return buildAuthorizationContext({
        orgId: organization.id,
        userId,
        dataResidency: tenantScope.dataResidency,
        dataClassification: tenantScope.dataClassification,
        auditSource: 'hr.complete-onboarding-invite',
        tenantScope,
    });
}

interface OnboardingPayload {
    email?: string;
    displayName?: string;
    employeeId?: string;
    employeeNumber?: string;
    employmentType?: string;
    jobTitle?: string;
    eligibleLeaveTypes?: string[];
    onboardingTemplateId?: string;
    roles?: string[];
    contractType?: string;
    startDate?: string;
    departmentId?: string;
    location?: string;
    workingPattern?: JsonValue;
    benefits?: JsonValue;
}

function extractOnboardingPayload(invitation: OnboardingInvitation): OnboardingPayload {
    const data = invitation.onboardingData;
    if (!isRecord(data)) {
        return {};
    }
    return {
        email: coerceString(data.email),
        displayName: coerceString(data.displayName),
        employeeId: coerceString(data.employeeId),
        employeeNumber: coerceString(data.employeeNumber),
        employmentType: coerceString(data.employmentType),
        jobTitle: coerceString(data.jobTitle ?? data.position),
        eligibleLeaveTypes: extractStringArray(data.eligibleLeaveTypes),
        onboardingTemplateId: coerceString(data.onboardingTemplateId),
        roles: extractStringArray(data.roles),
        contractType: coerceString(data.contractType),
        startDate: coerceString(data.startDate),
        departmentId: coerceString(data.departmentId),
        location: coerceString(data.location),
        workingPattern: isJsonValue(data.workingPattern) ? data.workingPattern : undefined,
        benefits: isJsonValue(data.benefits) ? data.benefits : undefined,
    } satisfies OnboardingPayload;
}

function resolveEmployeeNumber(payload: OnboardingPayload): string {
    const candidate = payload.employeeId ?? payload.employeeNumber;
    if (candidate) {
        return candidate;
    }
    throw new ValidationError('Invitation is missing the employee identifier.');
}

function resolveRoles(roles: string[] | undefined): string[] {
    return normalizeRoles(roles ?? []);
}

function buildProfileData(params: {
    payload: OnboardingPayload;
    userId: string;
    employeeNumber: string;
    invitation: OnboardingInvitation;
}): ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string } {
    const employmentType = resolveEmploymentType(params.payload.employmentType);
    return {
        userId: params.userId,
        employeeNumber: params.employeeNumber,
        employmentType,
        jobTitle: params.payload.jobTitle,
        email: params.payload.email ?? params.invitation.targetEmail,
        displayName: params.payload.displayName,
        eligibleLeaveTypes: params.payload.eligibleLeaveTypes ?? [],
        metadata: buildProfileMetadata(params.invitation),
    } satisfies ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string };
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

function buildContractData(
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

function buildChecklistConfig(
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

function buildCreateProfileInput(params: {
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

function resolveEmploymentType(value?: string): EmploymentTypeCode {
    if (!value) {
        return 'FULL_TIME';
    }
    const normalized = value.replace(/[-\s]/g, '_').toUpperCase();
    return (EMPLOYMENT_TYPE_VALUES.includes(normalized as EmploymentTypeCode)
        ? normalized
        : 'FULL_TIME') as EmploymentTypeCode;
}

function resolveContractType(
    value: string | undefined,
    employmentType: string | undefined,
): ContractTypeCode | null {
    if (value) {
        const normalized = value.replace(/[-\s]/g, '_').toUpperCase();
        if (CONTRACT_TYPE_VALUES.includes(normalized as ContractTypeCode)) {
            return normalized as ContractTypeCode;
        }
    }
    const fallback = employmentType?.replace(/[-\s]/g, '_').toUpperCase();
    if (fallback === 'CONTRACTOR') {
        return 'AGENCY';
    }
    if (fallback === 'INTERN' || fallback === 'APPRENTICE') {
        return 'APPRENTICESHIP';
    }
    return 'PERMANENT';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    const next = value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    return next.length > 0 ? next : undefined;
}

function coerceString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function isJsonValue(value: unknown): value is JsonValue {
    if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every(isJsonValue);
    }
    if (isRecord(value)) {
        return Object.values(value).every(isJsonValue);
    }
    return false;
}
