import { EntityNotFoundError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IOffboardingRepository } from '@/server/repositories/contracts/hr/offboarding';
import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import { assertOffboardingCanceler } from '@/server/security/authorization/hr-guards/offboarding';
import { recordAuditEvent } from '@/server/logging/audit-logger';

export interface CancelOffboardingInput {
    authorization: RepositoryAuthorizationContext;
    offboardingId: string;
    reason?: string;
}

export interface CancelOffboardingDependencies {
    offboardingRepository: IOffboardingRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
}

export interface CancelOffboardingResult {
    offboarding: OffboardingRecord;
}

export async function cancelOffboarding(
    deps: CancelOffboardingDependencies,
    input: CancelOffboardingInput,
): Promise<CancelOffboardingResult> {
    await assertOffboardingCanceler({
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

    if (offboarding.status !== 'IN_PROGRESS') {
        throw new Error('Only in-progress offboarding can be cancelled.');
    }

    const updated = await deps.offboardingRepository.updateOffboarding(
        input.authorization.orgId,
        offboarding.id,
        {
            status: 'CANCELLED',
            canceledAt: new Date(),
            updatedBy: input.authorization.userId,
            metadata: {
                ...(offboarding.metadata ?? {}),
                cancelReason: input.reason ?? null,
            },
        },
    );

    await deps.employeeProfileRepository.updateEmployeeProfile(
        input.authorization.orgId,
        offboarding.employeeId,
        {
            employmentStatus: 'ACTIVE',
        },
    );

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: 'hr.offboarding.canceled',
        resource: 'hr.offboarding',
        resourceId: updated.id,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        payload: {
            profileId: updated.employeeId,
            reason: input.reason ?? null,
        },
    });

    return { offboarding: updated };
}
