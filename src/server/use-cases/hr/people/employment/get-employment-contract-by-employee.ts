import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { EmploymentContract } from '@/server/types/hr-types';
import { registerContractsCache } from '../shared/cache-helpers';
import { assertEmploymentContractReader } from '@/server/security/guards-hr-people';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

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

  await assertEmploymentContractReader({
    authorization: input.authorization,
    action: HR_ACTION.READ,
    resourceAttributes: contract
      ? {
          contractId: contract.id,
          userId: contract.userId,
          employeeId: contract.userId,
          departmentId: contract.departmentId ?? null,
          orgId: contract.orgId,
        }
      : {
          employeeId: input.employeeId,
          orgId: input.authorization.orgId,
        },
  });

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
