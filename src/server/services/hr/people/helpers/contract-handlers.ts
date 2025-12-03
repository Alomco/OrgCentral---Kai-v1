import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import { getEmploymentContract as getEmploymentContractUseCase } from '@/server/use-cases/hr/people/employment/get-employment-contract';
import { getEmploymentContractByEmployee as getEmploymentContractByEmployeeUseCase } from '@/server/use-cases/hr/people/employment/get-employment-contract-by-employee';
import { listEmploymentContracts as listEmploymentContractsUseCase } from '@/server/use-cases/hr/people/employment/list-employment-contracts';
import { createEmploymentContract as createEmploymentContractUseCase } from '@/server/use-cases/hr/people/employment/create-employment-contract';
import { updateEmploymentContract as updateEmploymentContractUseCase } from '@/server/use-cases/hr/people/employment/update-employment-contract';
import {
  deleteEmploymentContract as deleteEmploymentContractUseCase,
  type DeleteEmploymentContractResult,
} from '@/server/use-cases/hr/people/employment/delete-employment-contract';
import type { ContractListFilters, ContractMutationPayload, ContractTypeCode } from '@/server/types/hr/people';
import type { EmploymentContract } from '@/server/types/hr-types';
import { ResultAsync } from 'neverthrow';

interface ContractRepositoryDeps {
  contractRepo: IEmploymentContractRepository;
}

const toError = (error: unknown): Error => (error instanceof Error ? error : new Error('Unknown error'));

export function getEmploymentContract(params: {
  authorization: RepositoryAuthorizationContext;
  contractId: string;
  repositories: ContractRepositoryDeps;
}): ResultAsync<{ contract: EmploymentContract | null }, Error> {
  return ResultAsync.fromPromise(
    getEmploymentContractUseCase(
      { employmentContractRepository: params.repositories.contractRepo },
      {
        authorization: params.authorization,
        contractId: params.contractId,
      },
    ),
    toError,
  );
}

export function getEmploymentContractByEmployee(params: {
  authorization: RepositoryAuthorizationContext;
  employeeId: string;
  repositories: ContractRepositoryDeps;
}): ResultAsync<{ contract: EmploymentContract | null }, Error> {
  return ResultAsync.fromPromise(
    getEmploymentContractByEmployeeUseCase(
      { employmentContractRepository: params.repositories.contractRepo },
      {
        authorization: params.authorization,
        employeeId: params.employeeId,
      },
    ),
    toError,
  );
}

export function listEmploymentContracts(params: {
  authorization: RepositoryAuthorizationContext;
  filters?: ContractListFilters;
  repositories: ContractRepositoryDeps;
}): ResultAsync<{ contracts: EmploymentContract[] }, Error> {
  return ResultAsync.fromPromise(
    listEmploymentContractsUseCase(
      { employmentContractRepository: params.repositories.contractRepo },
      {
        authorization: params.authorization,
        filters: params.filters,
      },
    ),
    toError,
  );
}

export function createEmploymentContract(params: {
  authorization: RepositoryAuthorizationContext;
  payload: ContractMutationPayload['changes'] & {
    userId: string;
    contractType: ContractTypeCode;
    jobTitle: string;
    startDate: Date | string;
  };
  repositories: ContractRepositoryDeps;
}): ResultAsync<{ contractId: string; contract?: EmploymentContract }, Error> {
  return ResultAsync.fromPromise(
    createEmploymentContractUseCase(
      { employmentContractRepository: params.repositories.contractRepo },
      {
        authorization: params.authorization,
        contractData: params.payload,
      },
    ),
    toError,
  ).andThen(() =>
    getEmploymentContractByEmployee({
      authorization: params.authorization,
      employeeId: params.payload.userId,
      repositories: params.repositories,
    }).map((result) => {
      const contract = result.contract;
      if (!contract) {
        return { contractId: '' };
      }

      return { contractId: contract.id, contract };
    }),
  );
}

export function updateEmploymentContract(params: {
  authorization: RepositoryAuthorizationContext;
  contractId: string;
  updates: ContractMutationPayload['changes'];
  repositories: ContractRepositoryDeps;
}): ResultAsync<{ contract: EmploymentContract | null }, Error> {
  return ResultAsync.fromPromise(
    updateEmploymentContractUseCase(
      { employmentContractRepository: params.repositories.contractRepo },
      {
        authorization: params.authorization,
        contractId: params.contractId,
        contractUpdates: params.updates,
      },
    ),
    toError,
  ).andThen(() =>
    getEmploymentContract({
      authorization: params.authorization,
      contractId: params.contractId,
      repositories: params.repositories,
    }),
  );
}

export function deleteEmploymentContract(params: {
  authorization: RepositoryAuthorizationContext;
  contractId: string;
  repositories: ContractRepositoryDeps;
}): ResultAsync<DeleteEmploymentContractResult, Error> {
  return ResultAsync.fromPromise(
    deleteEmploymentContractUseCase(
      { employmentContractRepository: params.repositories.contractRepo },
      {
        authorization: params.authorization,
        contractId: params.contractId,
      },
    ),
    toError,
  );
}
