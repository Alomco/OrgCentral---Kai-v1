import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { ContractMutationPayload, ContractTypeCode } from '@/server/types/hr/people';
import { invalidateContractsAfterMutation } from '../shared/cache-helpers';
import { assertEmploymentContractEditor } from '@/server/security/guards-hr-people';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

// Use-case: create an employment contract via employment contract repositories with RBAC/ABAC guard enforcement.

export interface CreateEmploymentContractInput {
  authorization: RepositoryAuthorizationContext;
  contractData: ContractMutationPayload['changes'] & {
    userId: string;
    contractType: ContractTypeCode;
    jobTitle: string;
    startDate: Date | string;
  };
}

export interface CreateEmploymentContractResult {
  success: true;
}

export interface CreateEmploymentContractDependencies {
  employmentContractRepository: IEmploymentContractRepository;
}

export async function createEmploymentContract(
  dependencies: CreateEmploymentContractDependencies,
  input: CreateEmploymentContractInput,
): Promise<CreateEmploymentContractResult> {
  const orgId = input.authorization.orgId;
  await assertEmploymentContractEditor({
    authorization: input.authorization,
    action: HR_ACTION.CREATE,
    resourceAttributes: {
      orgId,
      userId: input.contractData.userId,
      employeeId: input.contractData.userId,
      departmentId: input.contractData.departmentId ?? null,
      contractType: input.contractData.contractType,
      jobTitle: input.contractData.jobTitle,
      startDate: input.contractData.startDate,
    },
  });

  await dependencies.employmentContractRepository.createEmploymentContract(
    orgId,
    {
      ...input.contractData,
      orgId,
      dataResidency: input.authorization.dataResidency,
      dataClassification: input.authorization.dataClassification,
    }
  );

  await invalidateContractsAfterMutation(input.authorization);

  return {
    success: true,
  };
}
