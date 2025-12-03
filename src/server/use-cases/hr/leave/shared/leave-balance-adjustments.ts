import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveBalance, LeaveRequest } from '@/server/types/leave-types';
import { resolveLeavePolicyId } from '../utils/resolve-leave-policy';

export interface LeaveBalanceAdjustmentContext {
    authorization: RepositoryAuthorizationContext;
    request: Pick<LeaveRequest, 'employeeId' | 'leaveType' | 'startDate' | 'totalDays'>;
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
    balanceId: string;
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
    const state = await ensureBalanceState(deps, context.authorization.orgId, context.request, lookup);
    const newUsed = state.used + context.request.totalDays;
    const newPending = Math.max(0, state.pending - context.request.totalDays);
    const newAvailable = state.totalEntitlement - newUsed - newPending;

    await deps.leaveBalanceRepository.updateLeaveBalance(context.authorization.orgId, lookup.balanceId, {
        used: newUsed,
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
    const state = await loadBalanceState(deps.leaveBalanceRepository, context.authorization.orgId, lookup.balanceId);
    if (!state) {
        return;
    }

    const newPending = Math.max(0, state.pending - context.request.totalDays);
    const newAvailable = state.totalEntitlement - state.used - newPending;

    await deps.leaveBalanceRepository.updateLeaveBalance(context.authorization.orgId, lookup.balanceId, {
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
    const state = await loadBalanceState(deps.leaveBalanceRepository, context.authorization.orgId, lookup.balanceId);
    if (!state) {
        return;
    }

    const newUsed = Math.max(0, state.used - context.request.totalDays);
    const newAvailable = state.totalEntitlement - newUsed - state.pending;

    await deps.leaveBalanceRepository.updateLeaveBalance(context.authorization.orgId, lookup.balanceId, {
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

function resolveBalanceLookup(request: Pick<LeaveRequest, 'employeeId' | 'leaveType' | 'startDate'>): BalanceLookupResult {
    const year = resolveLeaveYear(request.startDate);
    return {
        year,
        balanceId: buildLeaveBalanceId(request.employeeId, request.leaveType, year),
    };
}

async function ensureBalanceState(
    deps: ApprovalBalanceDependencies,
    orgId: string,
    request: Pick<LeaveRequest, 'employeeId' | 'leaveType'>,
    lookup: BalanceLookupResult,
): Promise<BalanceState> {
    const existing = await loadBalanceState(deps.leaveBalanceRepository, orgId, lookup.balanceId);
    if (existing) {
        return existing;
    }

    const entitlements = await deps.organizationRepository.getLeaveEntitlements(orgId);
    const totalEntitlement = entitlements[request.leaveType] ?? 0;
    const policyId = await resolveLeavePolicyId(
        { leavePolicyRepository: deps.leavePolicyRepository },
        orgId,
        request.leaveType,
    );

    await deps.leaveBalanceRepository.createLeaveBalance(orgId, {
        id: lookup.balanceId,
        orgId,
        employeeId: request.employeeId,
        leaveType: request.leaveType,
        year: lookup.year,
        totalEntitlement,
        used: 0,
        pending: 0,
        available: totalEntitlement,
        policyId,
    });

    return {
        balanceId: lookup.balanceId,
        totalEntitlement,
        used: 0,
        pending: 0,
    };
}

async function loadBalanceState(
    repository: ILeaveBalanceRepository,
    orgId: string,
    balanceId: string,
): Promise<BalanceState | null> {
    const record = await repository.getLeaveBalance(orgId, balanceId);
    if (!record) {
        return null;
    }

    return mapRecordToState(record);
}

function mapRecordToState(record: LeaveBalance): BalanceState {
    return {
        balanceId: record.id,
        totalEntitlement: record.totalEntitlement,
        used: record.used,
        pending: record.pending,
    };
}
