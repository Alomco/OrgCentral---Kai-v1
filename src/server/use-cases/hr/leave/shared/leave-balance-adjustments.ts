import { randomUUID } from 'node:crypto';

import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveBalance, LeaveRequest } from '@/server/types/leave-types';
import type { TenantScope } from '@/server/types/tenant';
import { resolveLeavePolicyId } from '../utils/resolve-leave-policy';

export interface LeaveBalanceAdjustmentContext {
    authorization: RepositoryAuthorizationContext;
    request: Pick<LeaveRequest, 'userId' | 'leaveType' | 'startDate' | 'totalDays'>;
}

export interface ApprovalBalanceDependencies {
    leaveBalanceRepository: ILeaveBalanceRepository;
    leavePolicyRepository: ILeavePolicyRepository;
    organizationRepository: IOrganizationRepository;
}

export interface BalanceDependencies {
    leaveBalanceRepository: ILeaveBalanceRepository;
}

interface BalanceLookupResult {
    year: number;
}

interface BalanceState {
    balanceId: string;
    totalEntitlement: number;
    used: number;
    pending: number;
}

export async function reconcileBalanceForApproval(
    deps: ApprovalBalanceDependencies,
    context: LeaveBalanceAdjustmentContext,
): Promise<void> {
    const lookup = resolveBalanceLookup(context.request);
    const state = await ensureBalanceState(deps, context.authorization.tenantScope, context.request, lookup);
    const newUsed = state.used + context.request.totalDays;
    const newPending = Math.max(0, state.pending - context.request.totalDays);
    const newAvailable = state.totalEntitlement - newUsed - newPending;

    await deps.leaveBalanceRepository.updateLeaveBalance(context.authorization.tenantScope, state.balanceId, {
        used: newUsed,
        pending: newPending,
        available: newAvailable,
        updatedAt: new Date(),
    });
}

export async function reconcileBalanceForPendingIncrease(
    deps: ApprovalBalanceDependencies,
    context: LeaveBalanceAdjustmentContext,
): Promise<void> {
    const lookup = resolveBalanceLookup(context.request);
    const state = await ensureBalanceState(deps, context.authorization.tenantScope, context.request, lookup);

    const newPending = state.pending + context.request.totalDays;
    const newAvailable = state.totalEntitlement - state.used - newPending;

    await deps.leaveBalanceRepository.updateLeaveBalance(context.authorization.tenantScope, state.balanceId, {
        pending: newPending,
        available: newAvailable,
        updatedAt: new Date(),
    });
}

export async function reconcileBalanceForPendingReduction(
    deps: BalanceDependencies,
    context: LeaveBalanceAdjustmentContext,
): Promise<void> {
    const lookup = resolveBalanceLookup(context.request);
    const state = await loadBalanceState(
        deps.leaveBalanceRepository,
        context.authorization.tenantScope,
        context.request.userId,
        context.request.leaveType,
        lookup.year,
    );
    if (!state) {
        return;
    }

    const newPending = Math.max(0, state.pending - context.request.totalDays);
    const newAvailable = state.totalEntitlement - state.used - newPending;

    await deps.leaveBalanceRepository.updateLeaveBalance(context.authorization.tenantScope, state.balanceId, {
        pending: newPending,
        available: newAvailable,
        updatedAt: new Date(),
    });
}

export async function reconcileBalanceForUsedReduction(
    deps: BalanceDependencies,
    context: LeaveBalanceAdjustmentContext,
): Promise<void> {
    const lookup = resolveBalanceLookup(context.request);
    const state = await loadBalanceState(
        deps.leaveBalanceRepository,
        context.authorization.tenantScope,
        context.request.userId,
        context.request.leaveType,
        lookup.year,
    );
    if (!state) {
        return;
    }

    const newUsed = Math.max(0, state.used - context.request.totalDays);
    const newAvailable = state.totalEntitlement - newUsed - state.pending;

    await deps.leaveBalanceRepository.updateLeaveBalance(context.authorization.tenantScope, state.balanceId, {
        used: newUsed,
        available: newAvailable,
        updatedAt: new Date(),
    });
}

export function resolveLeaveYear(startDate?: string): number {
    if (!startDate) {
        return new Date().getFullYear();
    }
    const parsed = new Date(startDate);
    if (Number.isNaN(parsed.getTime())) {
        return new Date().getFullYear();
    }
    return parsed.getFullYear();
}

export function buildLeaveBalanceId(employeeId: string, leaveType: string, year: number): string {
    return `${employeeId}_${leaveType}_${year.toString()}`;
}

function resolveBalanceLookup(request: Pick<LeaveRequest, 'startDate'>): BalanceLookupResult {
    const year = resolveLeaveYear(request.startDate);
    return {
        year,
    };
}

async function ensureBalanceState(
    deps: ApprovalBalanceDependencies,
    tenant: TenantScope,
    request: Pick<LeaveRequest, 'userId' | 'leaveType'>,
    lookup: BalanceLookupResult,
): Promise<BalanceState> {
    const existing = await loadBalanceState(
        deps.leaveBalanceRepository,
        tenant,
        request.userId,
        request.leaveType,
        lookup.year,
    );
    if (existing) {
        return existing;
    }

    const entitlements = await deps.organizationRepository.getLeaveEntitlements(tenant.orgId);
    const totalEntitlement = entitlements[request.leaveType] ?? 0;
    const policyId = await resolveLeavePolicyId(
        { leavePolicyRepository: deps.leavePolicyRepository },
        tenant,
        request.leaveType,
    );

    const balanceId = randomUUID();
    await deps.leaveBalanceRepository.createLeaveBalance(tenant, {
        id: balanceId,
        orgId: tenant.orgId,
        dataResidency: tenant.dataResidency,
        dataClassification: tenant.dataClassification,
        auditSource: tenant.auditSource,
        auditBatchId: tenant.auditBatchId,
        employeeId: request.userId,
        leaveType: request.leaveType,
        year: lookup.year,
        totalEntitlement,
        used: 0,
        pending: 0,
        available: totalEntitlement,
        policyId,
    });

    return {
        balanceId,
        totalEntitlement,
        used: 0,
        pending: 0,
    };
}

async function loadBalanceState(
    repository: ILeaveBalanceRepository,
    tenant: TenantScope,
    userId: string,
    leaveType: string,
    year: number,
): Promise<BalanceState | null> {
    const record = await findBalanceRecord(repository, tenant, userId, leaveType, year);
    if (!record) {
        return null;
    }

    return mapRecordToState(record);
}

async function findBalanceRecord(
    repository: ILeaveBalanceRepository,
    tenant: TenantScope,
    userId: string,
    leaveType: string,
    year: number,
): Promise<LeaveBalance | null> {
    const balances = await repository.getLeaveBalancesByEmployeeAndYear(tenant, userId, year);
    return balances.find((balance) => balance.leaveType === leaveType) ?? null;
}

function mapRecordToState(record: LeaveBalance): BalanceState {
    return {
        balanceId: record.id,
        totalEntitlement: record.totalEntitlement,
        used: record.used,
        pending: record.pending,
    };
}
