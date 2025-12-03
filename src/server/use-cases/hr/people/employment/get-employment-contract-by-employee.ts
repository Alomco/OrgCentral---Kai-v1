import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { EmploymentContract } from '@/server/types/hr-types';
import { registerContractsCache } from '../shared/cache-helpers';

// Use-case: get an employment contract by employee id through contract repositories under RBAC/ABAC tenant guard.

export interface GetEmploymentContractByEmployeeInput {
  authorization: RepositoryAuthorizationContext;
  employeeId: string; // The ID of the employee whose contract we want to get
}

export interface GetEmploymentContractByEmployeeResult {
  contract: EmploymentContract | null;
}

export interface GetEmploymentContractByEmployeeDependencies {
  employmentContractRepository: IEmploymentContractRepository;
}

export async function getEmploymentContractByEmployee(
  dependencies: GetEmploymentContractByEmployeeDependencies,
  input: GetEmploymentContractByEmployeeInput,
): Promise<GetEmploymentContractByEmployeeResult> {
  const contract = await dependencies.employmentContractRepository.getEmploymentContractByEmployee(
    input.authorization.orgId,
    input.employeeId
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
