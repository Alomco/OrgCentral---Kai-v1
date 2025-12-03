import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { ContractMutationPayload } from '@/server/types/hr/people';
import { invalidateContractsAfterMutation } from '../shared/cache-helpers';

// Use-case: update an employment contract using contract repositories under RBAC/ABAC tenant authorization.

export interface UpdateEmploymentContractInput {
  authorization: RepositoryAuthorizationContext;
  contractId: string;
  contractUpdates: ContractMutationPayload['changes'];
}

export interface UpdateEmploymentContractResult {
  success: true;
}

export interface UpdateEmploymentContractDependencies {
  employmentContractRepository: IEmploymentContractRepository;
}

export async function updateEmploymentContract(
  dependencies: UpdateEmploymentContractDependencies,
  input: UpdateEmploymentContractInput,
): Promise<UpdateEmploymentContractResult> {
  await dependencies.employmentContractRepository.updateEmploymentContract(
    input.authorization.orgId,
    input.contractId,
    {
      ...input.contractUpdates,
      dataResidency: input.contractUpdates.dataResidency ?? input.authorization.dataResidency,
      dataClassification: input.contractUpdates.dataClassification ?? input.authorization.dataClassification,
    }
  );

  await invalidateContractsAfterMutation(input.authorization);

  return {
    success: true,
  };
}
