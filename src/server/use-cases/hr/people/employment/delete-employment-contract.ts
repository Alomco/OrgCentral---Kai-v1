import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import { invalidateContractsAfterMutation } from '../shared/cache-helpers';

// Use-case: delete an employment contract using contract repositories under RBAC/ABAC guard policies.

export interface DeleteEmploymentContractInput {
  authorization: RepositoryAuthorizationContext;
  contractId: string;
}

export interface DeleteEmploymentContractResult {
  success: true;
}

export interface DeleteEmploymentContractDependencies {
  employmentContractRepository: IEmploymentContractRepository;
}

export async function deleteEmploymentContract(
  dependencies: DeleteEmploymentContractDependencies,
  input: DeleteEmploymentContractInput,
): Promise<DeleteEmploymentContractResult> {
  await dependencies.employmentContractRepository.deleteEmploymentContract(
    input.authorization.orgId,
    input.contractId
  );

  await invalidateContractsAfterMutation(input.authorization);

  return {
    success: true,
  };
}
