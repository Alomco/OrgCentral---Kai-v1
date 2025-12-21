import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { IPolicyAcknowledgmentRepository } from '@/server/repositories/contracts/hr/policies/policy-acknowledgment-repository-contract';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { HRPolicy, PolicyAcknowledgment } from '@/server/types/hr-ops-types';

export interface HrPolicyServiceDependencies {
    policyRepository: IHRPolicyRepository;
    acknowledgmentRepository: IPolicyAcknowledgmentRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
}

export type CreatePolicyDTO = Parameters<IHRPolicyRepository['createPolicy']>[1];
export type UpdatePolicyDTO = Parameters<IHRPolicyRepository['updatePolicy']>[2];
export type ListPoliciesFilters = Parameters<IHRPolicyRepository['listPolicies']>[1];
export type AcknowledgePolicyDTO = Parameters<IPolicyAcknowledgmentRepository['acknowledgePolicy']>[1];

export interface CreatePolicyInput {
    authorization: RepositoryAuthorizationContext;
    policy: CreatePolicyDTO;
}

export interface UpdatePolicyInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
    updates: UpdatePolicyDTO;
}

export interface ListPoliciesInput {
    authorization: RepositoryAuthorizationContext;
    filters?: ListPoliciesFilters;
}

export interface GetPolicyInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
}

export interface AcknowledgePolicyInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
    policyId: string;
    version: string;
    acknowledgedAt?: Date;
    ipAddress?: string | null;
    metadata?: PolicyAcknowledgment['metadata'];
}

export interface GetPolicyAcknowledgmentInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
    policyId: string;
}

export interface ListPolicyAcknowledgmentsInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
    version?: string;
}

export type HrPolicyServiceContract = Pick<
    {
        createPolicy(input: CreatePolicyInput): Promise<HRPolicy>;
        updatePolicy(input: UpdatePolicyInput): Promise<HRPolicy>;
        listPolicies(input: ListPoliciesInput): Promise<HRPolicy[]>;
        getPolicy(input: GetPolicyInput): Promise<HRPolicy | null>;
        acknowledgePolicy(input: AcknowledgePolicyInput): Promise<PolicyAcknowledgment>;
        getPolicyAcknowledgment(input: GetPolicyAcknowledgmentInput): Promise<PolicyAcknowledgment | null>;
        listPolicyAcknowledgments(input: ListPolicyAcknowledgmentsInput): Promise<PolicyAcknowledgment[]>;
    },
    | 'createPolicy'
    | 'updatePolicy'
    | 'listPolicies'
    | 'getPolicy'
    | 'acknowledgePolicy'
    | 'getPolicyAcknowledgment'
    | 'listPolicyAcknowledgments'
>;
