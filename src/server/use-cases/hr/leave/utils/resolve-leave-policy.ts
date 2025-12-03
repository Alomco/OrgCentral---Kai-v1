import { invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_LEAVE_POLICIES } from '@/server/repositories/cache-scopes';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { LeavePolicy } from '@/server/types/leave-types';

export interface LeavePolicyResolverDependencies {
    leavePolicyRepository: ILeavePolicyRepository;
}

export async function resolveLeavePolicyId(
    { leavePolicyRepository }: LeavePolicyResolverDependencies,
    tenantId: string,
    leaveType: string,
): Promise<string> {
    const existingPolicy = await leavePolicyRepository.getLeavePolicyByName(tenantId, leaveType);
    if (existingPolicy) {
        return existingPolicy.id;
    }

    await leavePolicyRepository.createLeavePolicy(tenantId, buildDefaultPolicy(tenantId, leaveType));
    await invalidateOrgCache(tenantId, CACHE_SCOPE_LEAVE_POLICIES);

    const createdPolicy = await leavePolicyRepository.getLeavePolicyByName(tenantId, leaveType);
    if (!createdPolicy) {
        throw new Error('Failed to resolve leave policy');
    }

    return createdPolicy.id;
}

function buildDefaultPolicy(orgId: string, leaveType: string): Omit<LeavePolicy, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date().toISOString();
    return {
        orgId,
        name: leaveType,
        policyType: 'SPECIAL',
        accrualFrequency: 'NONE',
        accrualAmount: 0,
        carryOverLimit: undefined,
        requiresApproval: true,
        isDefault: false,
        activeFrom: now,
        activeTo: undefined,
        statutoryCompliance: false,
        maxConsecutiveDays: null,
        allowNegativeBalance: false,
        metadata: { createdFromLeaveService: true },
    };
}
