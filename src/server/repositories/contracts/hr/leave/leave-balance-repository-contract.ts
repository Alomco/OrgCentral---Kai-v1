/**
 * Repository contract for Leave Balances
 * Following SOLID principles with clear separation of concerns
 */
import type { LeaveBalance } from '@/server/types/leave-types';

export interface ILeaveBalanceRepository {
  /**
   * Create a new leave balance record
   */
  createLeaveBalance(
    tenantId: string,
    balance: Omit<LeaveBalance, 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing leave balance
   */
  updateLeaveBalance(
    tenantId: string,
    balanceId: string,
    updates: Partial<{
      used: number;
      pending: number;
      available: number;
      updatedAt: Date;
    }>
  ): Promise<void>;

  /**
   * Get a specific leave balance by ID
   */
  getLeaveBalance(
    tenantId: string,
    balanceId: string
  ): Promise<LeaveBalance | null>;

  /**
   * Get leave balances for an employee in a specific year
   */
  getLeaveBalancesByEmployeeAndYear(
    tenantId: string,
    employeeId: string,
    year: number
  ): Promise<LeaveBalance[]>;

  /**
   * Get all leave balances for an employee regardless of year
   */
  getLeaveBalancesByEmployee(
    tenantId: string,
    employeeId: string
  ): Promise<LeaveBalance[]>;
}