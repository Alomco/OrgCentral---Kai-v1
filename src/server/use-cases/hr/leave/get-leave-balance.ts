import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveBalance } from '@/server/types/leave-types';
import { assertNonEmpty } from '@/server/use-cases/shared';
import { registerLeaveCacheScopes } from './shared';
import { buildEntitlementMap, normalizeLeaveType } from './acc/sync-leave-accruals.entitlements';
import { readEntitlementSyncMarker } from './shared/entitlement-sync';

export interface GetLeaveBalanceDependencies {
    leaveBalanceRepository: ILeaveBalanceRepository;
    organizationRepository: IOrganizationRepository;
}

export interface GetLeaveBalanceInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
    year?: number;
}

export interface GetLeaveBalanceResult {
    balances: LeaveBalance[];
    employeeId: string;
    year?: number;
}

async function applyPendingEntitlementSync(
    deps: GetLeaveBalanceDependencies,
    authorization: RepositoryAuthorizationContext,
    balances: LeaveBalance[],
): Promise<LeaveBalance[]> {
    const settings = await deps.organizationRepository.getOrganizationSettings(authorization.orgId);
    const marker = readEntitlementSyncMarker(settings);
    if (!marker) {
        return balances;
    }

    const effectiveFrom = new Date(marker.effectiveFrom);
    if (Number.isNaN(effectiveFrom.getTime()) || effectiveFrom > new Date()) {
        return balances;
    }

    const organization = await deps.organizationRepository.getOrganization(authorization.orgId);
    if (!organization) {
        return balances;
    }

    const entitlementMap = buildEntitlementMap(organization.leaveEntitlements);
    const targetLeaveTypes = new Set(marker.leaveTypes.map((value) => normalizeLeaveType(value)));

    const updatedBalances: LeaveBalance[] = [];
    for (const balance of balances) {
        if (balance.year < effectiveFrom.getUTCFullYear()) {
            updatedBalances.push(balance);
            continue;
        }

        const normalizedType = normalizeLeaveType(balance.leaveType);
        if (!targetLeaveTypes.has(normalizedType)) {
            updatedBalances.push(balance);
            continue;
        }

        const targetEntitlement = entitlementMap.get(normalizedType) ?? 0;
        if (balance.totalEntitlement === targetEntitlement) {
            updatedBalances.push(balance);
            continue;
        }

        const nextAvailable = targetEntitlement - balance.used - balance.pending;
        const updatedAt = new Date();
        await deps.leaveBalanceRepository.updateLeaveBalance(
            authorization.tenantScope,
            balance.id,
            {
                totalEntitlement: targetEntitlement,
                available: nextAvailable,
                updatedAt,
            },
        );

        updatedBalances.push({
            ...balance,
            totalEntitlement: targetEntitlement,
            available: nextAvailable,
            updatedAt: updatedAt.toISOString(),
        });
    }

    return updatedBalances;
}

export async function getLeaveBalance(
    deps: GetLeaveBalanceDependencies,
    input: GetLeaveBalanceInput,
): Promise<GetLeaveBalanceResult> {
    assertNonEmpty(input.employeeId, 'Employee ID');

    registerLeaveCacheScopes(input.authorization, 'balances');

    const balances = input.year
        ? await deps.leaveBalanceRepository.getLeaveBalancesByEmployeeAndYear(
            input.authorization.tenantScope,
            input.employeeId,
            input.year,
        )
        : await deps.leaveBalanceRepository.getLeaveBalancesByEmployee(
            input.authorization.tenantScope,
            input.employeeId,
        );

    const syncedBalances = await applyPendingEntitlementSync(deps, input.authorization, balances);

    return {
        balances: syncedBalances,
        employeeId: input.employeeId,
        year: input.year,
    };
}
