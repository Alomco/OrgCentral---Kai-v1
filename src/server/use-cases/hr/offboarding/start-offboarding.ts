import { EntityNotFoundError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { IProvisioningTaskRepository } from '@/server/repositories/contracts/hr/onboarding/provisioning-task-repository-contract';
import type { IOnboardingWorkflowTemplateRepository, IOnboardingWorkflowRunRepository } from '@/server/repositories/contracts/hr/onboarding/workflow-template-repository-contract';
import type {
    IEmailSequenceTemplateRepository,
    IEmailSequenceEnrollmentRepository,
    IEmailSequenceDeliveryRepository,
} from '@/server/repositories/contracts/hr/onboarding/email-sequence-repository-contract';
import type { IOnboardingMetricDefinitionRepository, IOnboardingMetricResultRepository } from '@/server/repositories/contracts/hr/onboarding/onboarding-metric-repository-contract';
import type { IOffboardingRepository } from '@/server/repositories/contracts/hr/offboarding';
import type { IUserSessionRepository } from '@/server/repositories/contracts/auth/sessions/user-session-repository-contract';
import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import type { MembershipServiceContract } from '@/server/services/org/membership/membership-service.provider';
import type { JsonRecord } from '@/server/types/json';
import { assertOffboardingStarter } from '@/server/security/authorization/hr-guards/offboarding';
import {
    applyOffboardingAutomationIfConfigured,
    handleChecklistMode,
    handleDirectOffboarding,
} from './start-offboarding.flow';
import {
    recordOffboardingStartedAudit,
} from './start-offboarding.helpers';

export type OffboardingMode = 'DIRECT' | 'CHECKLIST';

export interface StartOffboardingInput {
    authorization: RepositoryAuthorizationContext;
    profileId: string;
    mode: OffboardingMode;
    templateId?: string;
    reason: string;
    metadata?: JsonRecord | null;
    workflowTemplateId?: string | null;
    emailSequenceTemplateId?: string | null;
    provisioningTaskTypes?: string[] | null;
}

export interface StartOffboardingDependencies {
    offboardingRepository: IOffboardingRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
    checklistTemplateRepository?: IChecklistTemplateRepository;
    checklistInstanceRepository?: IChecklistInstanceRepository;
    userSessionRepository?: IUserSessionRepository;
    membershipService?: MembershipServiceContract;
    provisioningTaskRepository?: IProvisioningTaskRepository;
    workflowTemplateRepository?: IOnboardingWorkflowTemplateRepository;
    workflowRunRepository?: IOnboardingWorkflowRunRepository;
    emailSequenceTemplateRepository?: IEmailSequenceTemplateRepository;
    emailSequenceEnrollmentRepository?: IEmailSequenceEnrollmentRepository;
    emailSequenceDeliveryRepository?: IEmailSequenceDeliveryRepository;
    onboardingMetricDefinitionRepository?: IOnboardingMetricDefinitionRepository;
    onboardingMetricResultRepository?: IOnboardingMetricResultRepository;
}

export interface StartOffboardingResult {
    offboarding: OffboardingRecord;
    checklistInstanceId?: string | null;
}

export async function startOffboarding(
    deps: StartOffboardingDependencies,
    input: StartOffboardingInput,
): Promise<StartOffboardingResult> {
    await assertOffboardingStarter({
        authorization: input.authorization,
        resourceAttributes: {
            orgId: input.authorization.orgId,
            employeeId: input.profileId,
        },
    });

    const profile = await deps.employeeProfileRepository.getEmployeeProfile(
        input.authorization.orgId,
        input.profileId,
    );
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { profileId: input.profileId, orgId: input.authorization.orgId });
    }

    const existing = await deps.offboardingRepository.getOffboardingByEmployee(
        input.authorization.orgId,
        input.profileId,
    );
    if (existing?.status === 'IN_PROGRESS') {
        throw new Error('Offboarding already in progress for this employee.');
    }

    const offboarding = await deps.offboardingRepository.createOffboarding({
        orgId: input.authorization.orgId,
        employeeId: profile.id,
        initiatedByUserId: input.authorization.userId,
        checklistInstanceId: null,
        reason: input.reason,
        metadata: input.metadata ?? null,
        dataResidency: input.authorization.dataResidency,
        dataClassification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        correlationId: input.authorization.correlationId,
        createdBy: input.authorization.userId,
    });

    let checklistInstanceId: string | null = null;

    if (input.mode === 'CHECKLIST') {
        checklistInstanceId = await handleChecklistMode({
            deps,
            input,
            profile,
            offboarding,
        });
    }

    if (input.mode === 'DIRECT') {
        return handleDirectOffboarding({
            deps,
            input,
            profile,
            offboarding,
            checklistInstanceId,
        });
    }

    await deps.employeeProfileRepository.updateEmployeeProfile(
        input.authorization.orgId,
        profile.id,
        {
            employmentStatus: 'OFFBOARDING',
        },
    );

    await recordOffboardingStartedAudit({
        authorization: input.authorization,
        offboardingId: offboarding.id,
        profileId: profile.id,
        mode: input.mode,
        checklistInstanceId,
        reason: input.reason,
    });

    await applyOffboardingAutomationIfConfigured({
        deps,
        input,
        profile,
        offboardingId: offboarding.id,
    });

    return { offboarding, checklistInstanceId };
}

