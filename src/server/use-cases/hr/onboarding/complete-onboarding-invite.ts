import { EntityNotFoundError, ValidationError } from '@/server/errors';
import { normalizeToken } from '@/server/use-cases/shared';
import { syncBetterAuthUserToPrisma } from '@/server/lib/auth-sync';
import {
    createEmployeeProfile,
} from '@/server/use-cases/hr/people/create-employee-profile';
import type {
    CompleteOnboardingInviteDependencies,
    CompleteOnboardingInviteInput,
    CompleteOnboardingInviteResult,
} from './complete-onboarding-invite.types';
import {
    buildAuthorizationForInvite,
    buildChecklistConfig,
    buildContractData,
    buildCreateProfileInput,
    buildProfileData,
    createProfileDependencies,
    extractOnboardingPayload,
    resolveEmployeeNumber,
    resolveRoles,
    validateInvitation,
} from './complete-onboarding-invite.helpers';
import {
    ensureMembership,
    handleExistingProfile,
    linkProfileIfNeeded,
    canLinkExistingProfile,
} from './complete-onboarding-invite.flow';
import { applyOnboardingAutomation } from './apply-onboarding-automation';
import { recordOnboardingInviteAcceptedAudit } from './complete-onboarding-invite.audit';

export type {
    CompleteOnboardingInviteDependencies,
    CompleteOnboardingInviteInput,
    CompleteOnboardingInviteResult,
} from './complete-onboarding-invite.types';


export async function completeOnboardingInvite(
    deps: CompleteOnboardingInviteDependencies,
    input: CompleteOnboardingInviteInput,
): Promise<CompleteOnboardingInviteResult> {
    const token = normalizeToken(input.inviteToken);
    const invitation = await deps.onboardingInvitationRepository.getInvitationByToken(token);
    if (!invitation) {
        throw new EntityNotFoundError(INVITATION_RESOURCE, { token });
    }

    validateInvitation(invitation, input.actorEmail, INVITATION_RESOURCE);

    const organization = await deps.organizationRepository.getOrganization(invitation.orgId);
    if (!organization) {
        throw new EntityNotFoundError('Organization', { orgId: invitation.orgId });
    }

    const authorization = buildAuthorizationForInvite(organization, input.userId);
    const payload = extractOnboardingPayload(invitation);
    const automationPayload = invitation.onboardingData;
    const employeeNumber = resolveEmployeeNumber(payload);

    await syncBetterAuthUserToPrisma({
        id: input.userId,
        email: payload.email ?? invitation.targetEmail,
        name: payload.displayName ?? null,
        status: 'active',
        lastSignInAt: new Date().toISOString(),
    });

    const profileData = buildProfileData({
        payload,
        userId: input.userId,
        employeeNumber,
        invitation,
    });

    const contractData = buildContractData(payload, input.userId);
    const onboardingChecklist = buildChecklistConfig(payload, invitation.token);

    const existingProfile = await deps.employeeProfileRepository.findByEmployeeNumber(
        organization.id,
        employeeNumber,
    );

    if (existingProfile && existingProfile.userId !== input.userId && !canLinkExistingProfile(existingProfile, invitation.targetEmail)) {
        throw new ValidationError('Employee number is already assigned to another profile.', {
            employeeNumber,
            profileId: existingProfile.id,
        });
    }

    const linkedProfile = existingProfile
        ? await linkProfileIfNeeded({
            repository: deps.employeeProfileRepository,
            orgId: organization.id,
            profile: existingProfile,
            userId: input.userId,
        })
        : null;

    const membershipResult = linkedProfile
        ? await ensureMembership({
            authorization,
            membershipRepository: deps.membershipRepository,
            billingService: deps.billingService,
            invitation,
            payload,
            profile: linkedProfile,
            userId: input.userId,
            employeeNumber,
        })
        : await ensureMembership({
            authorization,
            membershipRepository: deps.membershipRepository,
            billingService: deps.billingService,
            invitation,
            payload,
            profile: {
                jobTitle: profileData.jobTitle ?? null,
                employmentType: profileData.employmentType ?? 'FULL_TIME',
                startDate: profileData.startDate ?? null,
                metadata: profileData.metadata ?? null,
            },
            userId: input.userId,
            employeeNumber,
        });

    const creationResult = linkedProfile
        ? await handleExistingProfile({
            deps,
            authorization,
            employeeNumber,
            contractData,
            onboardingChecklist,
            existingProfile: linkedProfile,
        })
        : await createEmployeeProfile(
            createProfileDependencies(deps),
            buildCreateProfileInput({
                authorization,
                profileData,
                contractData,
                onboardingTemplateId: payload.onboardingTemplateId,
                onboardingChecklist,
            }),
        );

    const profile = linkedProfile ?? await deps.employeeProfileRepository.findByEmployeeNumber(organization.id, employeeNumber);
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { employeeNumber, orgId: organization.id });
    }

    await deps.onboardingInvitationRepository.markAccepted(organization.id, invitation.token, input.userId);

    const automationResult = await applyOnboardingAutomation(
        {
            employeeProfileRepository: deps.employeeProfileRepository,
            mentorAssignmentRepository: deps.mentorAssignmentRepository,
            provisioningTaskRepository: deps.provisioningTaskRepository,
            workflowTemplateRepository: deps.workflowTemplateRepository,
            workflowRunRepository: deps.workflowRunRepository,
            emailSequenceTemplateRepository: deps.emailSequenceTemplateRepository,
            emailSequenceEnrollmentRepository: deps.emailSequenceEnrollmentRepository,
            emailSequenceDeliveryRepository: deps.emailSequenceDeliveryRepository,
            documentTemplateAssignmentRepository: deps.documentTemplateAssignmentRepository,
            documentTemplateRepository: deps.documentTemplateRepository,
            onboardingMetricDefinitionRepository: deps.onboardingMetricDefinitionRepository,
            onboardingMetricResultRepository: deps.onboardingMetricResultRepository,
        },
        {
            authorization,
            employeeId: profile.id,
            invitationToken: invitation.token,
            targetEmail: payload.email ?? invitation.targetEmail,
            payload: automationPayload,
        },
    );

    await recordOnboardingInviteAcceptedAudit({
        authorization,
        organization: {
            id: organization.id,
            dataResidency: organization.dataResidency,
            dataClassification: organization.dataClassification,
        },
        request: input.request,
        membership: membershipResult,
        creation: creationResult,
        automation: automationResult,
    });

    return {
        success: true,
        organizationId: organization.id,
        organizationName: organization.name,
        employeeNumber,
        profileId: profile.id,
        roles: resolveRoles(payload.roles),
        alreadyMember: membershipResult.alreadyMember,
        contractCreated: creationResult.contractCreated,
        checklistInstanceId: creationResult.checklistInstanceId,
        workflowRunId: automationResult.workflowRunId,
        emailSequenceEnrollmentId: automationResult.emailSequenceEnrollmentId,
        provisioningTaskIds: automationResult.provisioningTaskIds,
        documentAssignmentIds: automationResult.documentAssignmentIds,
        metricsRecorded: automationResult.metricsRecorded,
    } satisfies CompleteOnboardingInviteResult;
}

const INVITATION_RESOURCE = 'Onboarding invitation';
