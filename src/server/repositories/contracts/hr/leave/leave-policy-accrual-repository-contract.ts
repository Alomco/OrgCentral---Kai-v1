/**
 * Repository contract for Leave Policy Accruals
 * Following SOLID principles with clear separation of concerns
 */
import type { LeavePolicyAccrual } from '@/server/types/leave-types';

export interface ILeavePolicyAccrualRepository {
  /**
   * Create a new leave policy accrual record
   */
  createLeavePolicyAccrual(
    tenantId: string,
    accrual: Omit<LeavePolicyAccrual, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing leave policy accrual record
   */
  updateLeavePolicyAccrual(
    tenantId: string,
    accrualId: string,
    updates: Partial<Omit<LeavePolicyAccrual, 'id' | 'orgId' | 'createdAt'>>
  ): Promise<void>;

  /**
   * Get a specific leave policy accrual record by ID
   */
  getLeavePolicyAccrual(
    tenantId: string,
    accrualId: string
  ): Promise<LeavePolicyAccrual | null>;

  /**
   * Get all leave policy accrual records for an employee
   */
  getLeavePolicyAccrualsByEmployee(
    tenantId: string,
    employeeId: string
  ): Promise<LeavePolicyAccrual[]>;

  /**
   * Get all leave policy accrual records for an organization
   */
  getLeavePolicyAccrualsByOrganization(
    tenantId: string
  ): Promise<LeavePolicyAccrual[]>;

  /**
   * Delete a leave policy accrual record
   */
  deleteLeavePolicyAccrual(
    tenantId: string,
    accrualId: string
  ): Promise<void>;
}