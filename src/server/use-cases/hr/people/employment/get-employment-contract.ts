import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { EmploymentContract } from '@/server/types/hr-types';
import { registerContractsCache } from '../shared/cache-helpers';

// Use-case: get an employment contract by id via contract repositories with RBAC/ABAC guard checks.

export interface GetEmploymentContractInput {
  authorization: RepositoryAuthorizationContext;
  contractId: string;
}

export interface GetEmploymentContractResult {
  contract: EmploymentContract | null;
}

export interface GetEmploymentContractDependencies {
  employmentContractRepository: IEmploymentContractRepository;
}

export async function getEmploymentContract(
  dependencies: GetEmploymentContractDependencies,
  input: GetEmploymentContractInput,
): Promise<GetEmploymentContractResult> {
  const contract = await dependencies.employmentContractRepository.getEmploymentContract(
    input.authorization.orgId,
    input.contractId
  );

  registerContractsCache(input.authorization);

  return {
    contract: contract
      ? {
          ...contract,
          dataResidency: contract.dataResidency ?? input.authorization.dataResidency,
          dataClassification: contract.dataClassification ?? input.authorization.dataClassification,
        }
      : null,
  };
}
