import { EntityNotFoundError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { IOffboardingRepository } from '@/server/repositories/contracts/hr/offboarding';
import type { IUserSessionRepository } from '@/server/repositories/contracts/auth/sessions/user-session-repository-contract';
import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import type { MembershipServiceContract } from '@/server/services/org/membership/membership-service.provider';
import { assertOffboardingCompleter } from '@/server/security/authorization/hr-guards/offboarding';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { revokeOffboardingAccess } from './offboarding-access';

export interface CompleteOffboardingInput {
    authorization: RepositoryAuthorizationContext;
    offboardingId: string;
}

export interface CompleteOffboardingDependencies {
    offboardingRepository: IOffboardingRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
    checklistInstanceRepository?: IChecklistInstanceRepository;
    userSessionRepository: IUserSessionRepository;
    membershipService?: MembershipServiceContract;
}

export interface CompleteOffboardingResult {
    offboarding: OffboardingRecord;
    revokedSessions: boolean;
    membershipSuspended: boolean;
}

export async function completeOffboarding(
    deps: CompleteOffboardingDependencies,
    input: CompleteOffboardingInput,
): Promise<CompleteOffboardingResult> {
    await assertOffboardingCompleter({
        authorization: input.authorization,
        resourceAttributes: {
            orgId: input.authorization.orgId,
            offboardingId: input.offboardingId,
        },
    });

    const offboarding = await deps.offboardingRepository.getOffboarding(
        input.authorization.orgId,
        input.offboardingId,
    );
    if (!offboarding) {
        throw new EntityNotFoundError('Offboarding record', { offboardingId: input.offboardingId, orgId: input.authorization.orgId });
    }

    if (offboarding.status === 'COMPLETED') {
        return { offboarding, revokedSessions: false, membershipSuspended: false };
    }

    if (offboarding.checklistInstanceId) {
        if (!deps.checklistInstanceRepository) {
            throw new Error('Checklist repository required to validate offboarding completion.');
        }
        const instance = await deps.checklistInstanceRepository.getInstance(
            input.authorization.orgId,
            offboarding.checklistInstanceId,
        );
        if (instance?.status !== 'COMPLETED') {
            throw new Error('Offboarding checklist must be completed before closing offboarding.');
        }
    }

    const profile = await deps.employeeProfileRepository.getEmployeeProfile(
        input.authorization.orgId,
        offboarding.employeeId,
    );
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { profileId: offboarding.employeeId, orgId: input.authorization.orgId });
    }

    const completed = await deps.offboardingRepository.updateOffboarding(
        input.authorization.orgId,
        offboarding.id,
        {
            status: 'COMPLETED',
            completedAt: new Date(),
            updatedBy: input.authorization.userId,
        },
    );

    await deps.employeeProfileRepository.updateEmployeeProfile(
        input.authorization.orgId,
        profile.id,
        {
            employmentStatus: 'ARCHIVED',
            archivedAt: new Date(),
        },
    );

    const accessResult = await revokeOffboardingAccess({
        authorization: input.authorization,
        userId: profile.userId,
        userSessionRepository: deps.userSessionRepository,
        membershipService: deps.membershipService,
    });

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: 'hr.offboarding.completed',
        resource: 'hr.offboarding',
        resourceId: completed.id,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        payload: {
            profileId: profile.id,
            checklistInstanceId: completed.checklistInstanceId ?? null,
            revokedSessions: accessResult.revokedSessions,
            membershipSuspended: accessResult.membershipSuspended,
        },
    });

    return {
        offboarding: completed,
        revokedSessions: accessResult.revokedSessions,
        membershipSuspended: accessResult.membershipSuspended,
    };
}
