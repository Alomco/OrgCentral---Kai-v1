import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { LeavePolicy } from '@/server/types/leave-types';

export interface LeavePolicyServiceDependencies {
    leavePolicyRepository: ILeavePolicyRepository;
    leaveBalanceRepository: ILeaveBalanceRepository;
    leaveRequestRepository: ILeaveRequestRepository;
    organizationRepository: IOrganizationRepository;
}

export interface CreateLeavePolicyServiceInput {
    authorization: RepositoryAuthorizationContext;
    payload: {
        orgId: string;
        name: string;
        type: LeavePolicy['policyType'];
        accrualAmount: number;
    };
}

export interface UpdateLeavePolicyServiceInput {
    authorization: RepositoryAuthorizationContext;
    orgId: string;
    policyId: string;
    patch: {
        name?: string;
        type?: LeavePolicy['policyType'];
        accrualAmount?: number;
        carryOverLimit?: number | null;
        requiresApproval?: boolean;
        isDefault?: boolean;
        activeFrom?: Date;
        activeTo?: Date | null;
        statutoryCompliance?: boolean;
        maxConsecutiveDays?: number | null;
        allowNegativeBalance?: boolean;
        metadata?: LeavePolicy['metadata'];
    };
}

export interface ListLeavePoliciesServiceInput {
    authorization: RepositoryAuthorizationContext;
    payload: {
        orgId: string;
    };
}

export interface DeleteLeavePolicyServiceInput {
    authorization: RepositoryAuthorizationContext;
    payload: {
        orgId: string;
        policyId: string;
    };
}

export type LeavePolicyServiceContract = Pick<
    {
        createLeavePolicy(input: CreateLeavePolicyServiceInput): Promise<LeavePolicy>;
        updateLeavePolicy(input: UpdateLeavePolicyServiceInput): Promise<LeavePolicy>;
        listLeavePolicies(input: ListLeavePoliciesServiceInput): Promise<LeavePolicy[]>;
        deleteLeavePolicy(input: DeleteLeavePolicyServiceInput): Promise<{ success: true }>;
    },
    'createLeavePolicy' | 'updateLeavePolicy' | 'listLeavePolicies' | 'deleteLeavePolicy'
>;
