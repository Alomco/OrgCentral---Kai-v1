/**
 * Repository contract for Employment Contracts
 * Following SOLID principles with clear separation of concerns
 */
import type { EmploymentContract } from '@/server/types/hr-types';

export interface IEmploymentContractRepository {
  /**
   * Create a new employment contract
   */
  createEmploymentContract(
    tenantId: string,
    contract: Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing employment contract
   */
  updateEmploymentContract(
    tenantId: string,
    contractId: string,
    updates: Partial<Omit<EmploymentContract, 'id' | 'orgId' | 'employeeId' | 'userId' | 'createdAt'>>
  ): Promise<void>;

  /**
   * Get a specific employment contract by ID
   */
  getEmploymentContract(
    tenantId: string,
    contractId: string
  ): Promise<EmploymentContract | null>;

  /**
   * Get employment contract by employee ID
   */
  getEmploymentContractByEmployee(
    tenantId: string,
    employeeId: string
  ): Promise<EmploymentContract | null>;

  /**
   * Get all employment contracts for an organization
   */
  getEmploymentContractsByOrganization(
    tenantId: string,
    filters?: {
      status?: string;
      contractType?: string;
      departmentId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<EmploymentContract[]>;

  /**
   * Delete an employment contract
   */
  deleteEmploymentContract(
    tenantId: string,
    contractId: string
  ): Promise<void>;
}