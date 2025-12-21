import { AuthorizationError, EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveRoundingRule, OrganizationData } from '@/server/types/leave-types';
import type { LeaveYearStartDate } from '@/server/types/org/organization-settings';

export interface LeaveSettingsUpdate {
    leaveEntitlements?: Record<string, number>;
    primaryLeaveType?: string;
    leaveYearStartDate?: LeaveYearStartDate;
    leaveRoundingRule?: LeaveRoundingRule;
}

export interface UpdateLeaveSettingsDependencies {
    organizationRepository: IOrganizationRepository;
}

export interface UpdateLeaveSettingsInput {
    authorization: RepositoryAuthorizationContext;
    orgId: string;
    updates: LeaveSettingsUpdate;
}

export interface UpdateLeaveSettingsResult {
    organization: OrganizationData;
}

export async function updateLeaveSettings(
    deps: UpdateLeaveSettingsDependencies,
    input: UpdateLeaveSettingsInput,
): Promise<UpdateLeaveSettingsResult> {
    if (input.orgId !== input.authorization.orgId) {
        throw new AuthorizationError('Cross-tenant leave settings update denied.');
    }

    if (Object.keys(input.updates).length === 0) {
        throw new ValidationError('No leave settings updates provided.');
    }

    const current = await deps.organizationRepository.getOrganization(input.orgId);
    if (!current) {
        throw new EntityNotFoundError('Organization', { orgId: input.orgId });
    }

    const next = {
        leaveEntitlements: input.updates.leaveEntitlements ?? current.leaveEntitlements,
        primaryLeaveType: input.updates.primaryLeaveType ?? current.primaryLeaveType,
        leaveYearStartDate: input.updates.leaveYearStartDate ?? current.leaveYearStartDate,
        leaveRoundingRule: input.updates.leaveRoundingRule ?? current.leaveRoundingRule,
    };

    await deps.organizationRepository.updateLeaveSettings(input.orgId, {
        leaveEntitlements: next.leaveEntitlements,
        primaryLeaveType: next.primaryLeaveType,
        leaveYearStartDate: next.leaveYearStartDate,
        leaveRoundingRule: next.leaveRoundingRule,
    });

    const updated = await deps.organizationRepository.getOrganization(input.orgId);
    if (!updated) {
        throw new EntityNotFoundError('Organization', { orgId: input.orgId });
    }

    return { organization: updated };
}
