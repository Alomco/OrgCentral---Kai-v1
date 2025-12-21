import { EntityNotFoundError } from '@/server/errors';
import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { IPolicyAcknowledgmentRepository } from '@/server/repositories/contracts/hr/policies/policy-acknowledgment-repository-contract';
import { RepositoryAuthorizer, type RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgPolicyActor } from '@/server/security/authorization/hr-policies';
import type { PolicyAcknowledgment } from '@/server/types/hr-ops-types';

export interface ListPolicyAcknowledgmentsDependencies {
    policyRepository: IHRPolicyRepository;
    acknowledgmentRepository: IPolicyAcknowledgmentRepository;
}

export interface ListPolicyAcknowledgmentsInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
    version?: string;
}

export async function listPolicyAcknowledgments(
    deps: ListPolicyAcknowledgmentsDependencies,
    input: ListPolicyAcknowledgmentsInput,
): Promise<PolicyAcknowledgment[]> {
    assertPrivilegedOrgPolicyActor(input.authorization);

    const policy = await deps.policyRepository.getPolicy(input.authorization.orgId, input.policyId);
    if (!policy) {
        throw new EntityNotFoundError('HRPolicy', { policyId: input.policyId });
    }

    RepositoryAuthorizer.default().assertTenantRecord(policy, input.authorization);

    const version = input.version ?? policy.version;
    return deps.acknowledgmentRepository.listAcknowledgments(
        input.authorization.orgId,
        input.policyId,
        version,
    );
}

