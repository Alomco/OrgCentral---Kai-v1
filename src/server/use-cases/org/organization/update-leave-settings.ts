import { AuthorizationError, EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveRoundingRule, OrganizationData } from '@/server/types/leave-types';
import type { LeaveYearStartDate } from '@/server/types/org/organization-settings';
import { invalidateLeaveCacheScopes } from '@/server/use-cases/hr/leave/shared/cache-helpers';
import { buildSettingsWithEntitlementSync } from '@/server/use-cases/hr/leave/shared/entitlement-sync';

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

    const shouldSyncEntitlements =
        input.updates.leaveEntitlements !== undefined ||
        input.updates.primaryLeaveType !== undefined;

    if (shouldSyncEntitlements) {
        const leaveTypes = new Set<string>();
        if (input.updates.leaveEntitlements) {
            Object.keys(input.updates.leaveEntitlements).forEach((key) => leaveTypes.add(key));
        }
        if (input.updates.primaryLeaveType) {
            leaveTypes.add(input.updates.primaryLeaveType);
        }

        if (leaveTypes.size > 0) {
            const settings = await deps.organizationRepository.getOrganizationSettings(input.orgId);
            const markerTimestamp = new Date().toISOString();
            const nextSettings = buildSettingsWithEntitlementSync(
                settings,
                {
                    effectiveFrom: markerTimestamp,
                    leaveTypes: Array.from(leaveTypes),
                    updatedAt: markerTimestamp,
                },
                {
                    entitlements: next.leaveEntitlements,
                    primaryLeaveType: next.primaryLeaveType,
                },
            );

            await deps.organizationRepository.updateOrganizationSettings(input.orgId, nextSettings);
        }

        await invalidateLeaveCacheScopes(input.authorization, 'balances');
    }

    const updated = await deps.organizationRepository.getOrganization(input.orgId);
    if (!updated) {
        throw new EntityNotFoundError('Organization', { orgId: input.orgId });
    }

    return { organization: updated };
}
