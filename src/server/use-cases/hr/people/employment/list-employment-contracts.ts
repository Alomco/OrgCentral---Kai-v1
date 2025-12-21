import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { EmploymentContract } from '@/server/types/hr-types';
import type { ContractListFilters } from '@/server/types/hr/people';
import { registerContractsCache } from '../shared/cache-helpers';
import { normalizeContractFilters } from '../shared/profile-validators';
import { assertEmploymentContractReader } from '@/server/security/guards-hr-people';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

// Use-case: list employment contracts for an organization via contract repositories with RBAC/ABAC filters.

export interface ListEmploymentContractsInput {
  authorization: RepositoryAuthorizationContext;
  filters?: ContractListFilters;
}

export interface ListEmploymentContractsResult {
  contracts: EmploymentContract[];
}

export interface ListEmploymentContractsDependencies {
  employmentContractRepository: IEmploymentContractRepository;
}

export async function listEmploymentContracts(
  dependencies: ListEmploymentContractsDependencies,
  input: ListEmploymentContractsInput,
): Promise<ListEmploymentContractsResult> {
  const normalizedFilters = normalizeContractFilters(input.filters);

  await assertEmploymentContractReader({
    authorization: input.authorization,
    action: HR_ACTION.READ,
    resourceAttributes: {
      orgId: input.authorization.orgId,
      filterCount: Object.keys(normalizedFilters ?? {}).length,
      filters: normalizedFilters,
    },
  });

  const contracts = await dependencies.employmentContractRepository.getEmploymentContractsByOrganization(
    input.authorization.orgId,
    normalizedFilters
  );

  registerContractsCache(input.authorization);

  return {
    contracts: contracts.map((contract) => ({
      ...contract,
      dataResidency: contract.dataResidency ?? input.authorization.dataResidency,
      dataClassification: contract.dataClassification ?? input.authorization.dataClassification,
    })),
  };
}
