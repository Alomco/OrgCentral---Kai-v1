import { AuthorizationError, EntityNotFoundError } from '@/server/errors';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveRoundingRule } from '@/server/types/leave-types';
import type { LeaveYearStartDate } from '@/server/types/org/organization-settings';

export interface OrgLeaveSettings {
    leaveEntitlements: Record<string, number>;
    primaryLeaveType: string;
    leaveYearStartDate: LeaveYearStartDate;
    leaveRoundingRule: LeaveRoundingRule;
}

export interface GetLeaveSettingsDependencies {
    organizationRepository: IOrganizationRepository;
}

export interface GetLeaveSettingsInput {
    authorization: RepositoryAuthorizationContext;
    orgId: string;
}

export interface GetLeaveSettingsResult {
    settings: OrgLeaveSettings;
}

export async function getLeaveSettings(
    deps: GetLeaveSettingsDependencies,
    input: GetLeaveSettingsInput,
): Promise<GetLeaveSettingsResult> {
    if (input.orgId !== input.authorization.orgId) {
        throw new AuthorizationError('Cross-tenant leave settings access denied.');
    }

    const organization = await deps.organizationRepository.getOrganization(input.orgId);
    if (!organization) {
        throw new EntityNotFoundError('Organization', { orgId: input.orgId });
    }

    return {
        settings: {
            leaveEntitlements: organization.leaveEntitlements,
            primaryLeaveType: organization.primaryLeaveType,
            leaveYearStartDate: organization.leaveYearStartDate,
            leaveRoundingRule: organization.leaveRoundingRule,
        },
    };
}
