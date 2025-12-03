import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { EmploymentContract } from '@/server/types/hr-types';
import type { ContractListFilters } from '@/server/types/hr/people';
import { EntityNotFoundError } from '@/server/errors';

// Contract helper functions that contain the business logic

export type ContractQueryFilters = ContractListFilters;

/**
 * Get a specific employment contract by ID
 */
export async function getEmploymentContract(
  contractRepository: IEmploymentContractRepository,
  orgId: string,
  contractId: string,
): Promise<EmploymentContract> {
  const contract = await contractRepository.getEmploymentContract(orgId, contractId);
  
  if (!contract) {
    throw new EntityNotFoundError('EmploymentContract', { orgId, contractId });
  }
  
  return contract;
}

/**
 * Get an employment contract by employee ID
 */
export async function getEmploymentContractByEmployee(
  contractRepository: IEmploymentContractRepository,
  orgId: string,
  employeeId: string,
): Promise<EmploymentContract> {
  const contract = await contractRepository.getEmploymentContractByEmployee(orgId, employeeId);
  
  if (!contract) {
    throw new EntityNotFoundError('EmploymentContract', { orgId, employeeId });
  }
  
  return contract;
}

/**
 * List employment contracts for an organization with optional filters
 */
export async function listEmploymentContracts(
  contractRepository: IEmploymentContractRepository,
  orgId: string,
  filters?: ContractQueryFilters,
): Promise<EmploymentContract[]> {
  const normalizedFilters = filters
    ? normalizeFilters(filters)
    : undefined;
  return contractRepository.getEmploymentContractsByOrganization(orgId, normalizedFilters);
}

function normalizeFilters(filters: ContractQueryFilters): ContractQueryFilters {
  const start = filters.startDate ? new Date(filters.startDate) : undefined;
  const end = filters.endDate ? new Date(filters.endDate) : undefined;

  return {
    ...filters,
    startDate: start && !Number.isNaN(start.getTime()) ? start.toISOString() : undefined,
    endDate: end && !Number.isNaN(end.getTime()) ? end.toISOString() : undefined,
  };
}

/**
 * Create a new employment contract
 */
export async function createEmploymentContract(
  contractRepository: IEmploymentContractRepository,
  orgId: string,
  contractData: Omit<EmploymentContract, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>,
): Promise<EmploymentContract> {
  const newContract: Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt'> = {
    ...contractData,
    orgId,
  };

  await contractRepository.createEmploymentContract(orgId, newContract);
  
  // Return the contract that was created (fetch again for full data including ID)
  return getEmploymentContractByEmployee(contractRepository, orgId, contractData.userId);
}

/**
 * Update an existing employment contract
 */
export async function updateEmploymentContract(
  contractRepository: IEmploymentContractRepository,
  orgId: string,
  contractId: string,
  updates: Partial<Omit<EmploymentContract, 'id' | 'orgId' | 'employeeId' | 'userId' | 'createdAt'>>,
): Promise<EmploymentContract> {
  await contractRepository.updateEmploymentContract(orgId, contractId, updates);
  
  // Return updated contract
  return getEmploymentContract(contractRepository, orgId, contractId);
}

/**
 * Delete an employment contract
 */
export async function deleteEmploymentContract(
  contractRepository: IEmploymentContractRepository,
  orgId: string,
  contractId: string,
): Promise<void> {
  await contractRepository.deleteEmploymentContract(orgId, contractId);
}
