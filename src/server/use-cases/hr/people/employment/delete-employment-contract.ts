import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import { invalidateContractsAfterMutation } from '../shared/cache-helpers';
import { assertEmploymentContractEditor } from '@/server/security/guards-hr-people';
import { EntityNotFoundError } from '@/server/errors';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

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
  const existing = await dependencies.employmentContractRepository.getEmploymentContract(
    input.authorization.orgId,
    input.contractId,
  );
  if (!existing) {
    throw new EntityNotFoundError('Employment contract');
  }

  await assertEmploymentContractEditor({
    authorization: input.authorization,
    action: HR_ACTION.DELETE,
    resourceAttributes: {
      contractId: input.contractId,
      userId: existing.userId,
      employeeId: existing.userId,
      departmentId: existing.departmentId ?? null,
      orgId: existing.orgId,
    },
  });

  await dependencies.employmentContractRepository.deleteEmploymentContract(
    input.authorization.orgId,
    input.contractId
  );

  await invalidateContractsAfterMutation(input.authorization);

  return {
    success: true,
  };
}
