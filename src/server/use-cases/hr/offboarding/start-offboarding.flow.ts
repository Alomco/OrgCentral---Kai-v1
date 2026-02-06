import type { EmployeeProfile } from '@/server/types/hr-types';
import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import { applyOffboardingAutomation } from './apply-offboarding-automation';
import { revokeOffboardingAccess } from './offboarding-access';
import {
    mapTemplateItemsToProgress,
    recordOffboardingCompletedAudit,
} from './start-offboarding.helpers';
import type { StartOffboardingDependencies, StartOffboardingInput, StartOffboardingResult } from './start-offboarding';

export async function handleChecklistMode(params: {
    deps: StartOffboardingDependencies;
    input: StartOffboardingInput;
    profile: EmployeeProfile;
    offboarding: OffboardingRecord;
}): Promise<string | null> {
    const { deps, input, profile, offboarding } = params;

    if (!input.templateId) {
        throw new Error('Checklist template is required for checklist-based offboarding.');
    }
    if (!deps.checklistTemplateRepository || !deps.checklistInstanceRepository) {
        throw new Error('Checklist repositories are required for checklist-based offboarding.');
    }

    const template = await deps.checklistTemplateRepository.getTemplate(
        input.authorization.orgId,
        input.templateId,
    );
    if (template?.type !== 'offboarding') {
        throw new Error('Offboarding checklist template not found.');
    }

    const items = mapTemplateItemsToProgress(template.items);
    const instance = await deps.checklistInstanceRepository.createInstance({
        orgId: input.authorization.orgId,
        employeeId: profile.id,
        templateId: template.id,
        templateName: template.name,
        items,
        metadata: {
            source: 'offboarding',
            issuedAt: new Date().toISOString(),
            ...input.metadata,
        },
    });

    await deps.offboardingRepository.updateOffboarding(
        input.authorization.orgId,
        offboarding.id,
        {
            checklistInstanceId: instance.id,
            updatedBy: input.authorization.userId,
        },
    );

    return instance.id;
}

export async function handleDirectOffboarding(params: {
    deps: StartOffboardingDependencies;
    input: StartOffboardingInput;
    profile: EmployeeProfile;
    offboarding: OffboardingRecord;
    checklistInstanceId: string | null;
}): Promise<StartOffboardingResult> {
    const { deps, input, profile, offboarding, checklistInstanceId } = params;

    if (!deps.userSessionRepository) {
        throw new Error('User session repository is required to complete direct offboarding.');
    }

    await deps.employeeProfileRepository.updateEmployeeProfile(
        input.authorization.orgId,
        profile.id,
        {
            employmentStatus: 'ARCHIVED',
            archivedAt: new Date(),
        },
    );

    const completed = await deps.offboardingRepository.updateOffboarding(
        input.authorization.orgId,
        offboarding.id,
        {
            status: 'COMPLETED',
            completedAt: new Date(),
            updatedBy: input.authorization.userId,
        },
    );

    const accessResult = await revokeOffboardingAccess({
        authorization: input.authorization,
        userId: profile.userId,
        userSessionRepository: deps.userSessionRepository,
        membershipService: deps.membershipService,
    });

    await recordOffboardingCompletedAudit({
        authorization: input.authorization,
        offboardingId: completed.id,
        profileId: profile.id,
        mode: input.mode,
        reason: input.reason,
        revokedSessions: accessResult.revokedSessions,
        membershipSuspended: accessResult.membershipSuspended,
    });

    return {
        offboarding: completed,
        checklistInstanceId,
    };
}

export async function applyOffboardingAutomationIfConfigured(params: {
    deps: StartOffboardingDependencies;
    input: StartOffboardingInput;
    profile: EmployeeProfile;
    offboardingId: string;
}): Promise<void> {
    const { deps, input, profile, offboardingId } = params;

    if (
        deps.provisioningTaskRepository &&
        deps.workflowTemplateRepository &&
        deps.workflowRunRepository &&
        deps.emailSequenceTemplateRepository &&
        deps.emailSequenceEnrollmentRepository &&
        deps.emailSequenceDeliveryRepository &&
        deps.onboardingMetricDefinitionRepository &&
        deps.onboardingMetricResultRepository
    ) {
        await applyOffboardingAutomation(
            {
                provisioningTaskRepository: deps.provisioningTaskRepository,
                workflowTemplateRepository: deps.workflowTemplateRepository,
                workflowRunRepository: deps.workflowRunRepository,
                emailSequenceTemplateRepository: deps.emailSequenceTemplateRepository,
                emailSequenceEnrollmentRepository: deps.emailSequenceEnrollmentRepository,
                emailSequenceDeliveryRepository: deps.emailSequenceDeliveryRepository,
                onboardingMetricDefinitionRepository: deps.onboardingMetricDefinitionRepository,
                onboardingMetricResultRepository: deps.onboardingMetricResultRepository,
            },
            {
                authorization: input.authorization,
                employeeId: profile.id,
                offboardingId,
                targetEmail: profile.email ?? profile.personalEmail ?? undefined,
                workflowTemplateId: input.workflowTemplateId ?? undefined,
                emailSequenceTemplateId: input.emailSequenceTemplateId ?? undefined,
                provisioningTaskTypes: input.provisioningTaskTypes ?? undefined,
            },
        );
    }
}
