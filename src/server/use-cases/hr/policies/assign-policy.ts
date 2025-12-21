import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgPolicyActor } from '@/server/security/authorization/hr-policies';
import type { HRPolicy } from '@/server/types/hr-ops-types';

export interface AssignHrPolicyDependencies {
    policyRepository: IHRPolicyRepository;
}

export interface AssignHrPolicyInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
    assignment: {
        applicableRoles?: string[];
        applicableDepartments?: string[];
        requiresAcknowledgment?: boolean;
    };
}

export async function assignHrPolicy(
    deps: AssignHrPolicyDependencies,
    input: AssignHrPolicyInput,
): Promise<HRPolicy> {
    assertPrivilegedOrgPolicyActor(input.authorization);

    return deps.policyRepository.updatePolicy(input.authorization.orgId, input.policyId, {
        applicableRoles: input.assignment.applicableRoles,
        applicableDepartments: input.assignment.applicableDepartments,
        requiresAcknowledgment: input.assignment.requiresAcknowledgment,
    });
}

