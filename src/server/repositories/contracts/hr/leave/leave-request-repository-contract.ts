/**
 * Repository contract for Leave Requests
 * Following SOLID principles with clear separation of concerns
 */
import type { LeaveRequest } from '@/server/types/leave-types';

export type LeaveRequestCreateInput = Omit<LeaveRequest, 'createdAt'> & { policyId: string; hoursPerDay?: number };
export interface LeaveRequestReadOptions {
  hoursPerDay?: number;
}

export interface ILeaveRequestRepository {
  /**
   * Create a new leave request
   */
  createLeaveRequest(
    tenantId: string,
    request: LeaveRequestCreateInput
  ): Promise<void>;

  /**
   * Update an existing leave request
   */
  updateLeaveRequest(
    tenantId: string,
    requestId: string,
    updates: Partial<Pick<LeaveRequest,
      'status' | 'approvedBy' | 'approvedAt' | 'rejectedBy' | 'rejectedAt' |
      'rejectionReason' | 'cancelledBy' | 'cancelledAt' | 'cancellationReason' |
      'managerComments'>>
  ): Promise<void>;

  /**
   * Get a specific leave request by ID
   */
  getLeaveRequest(
    tenantId: string,
    requestId: string,
    options?: LeaveRequestReadOptions
  ): Promise<LeaveRequest | null>;

  /**
   * Get all leave requests for a specific employee
   */
  getLeaveRequestsByEmployee(
    tenantId: string,
    employeeId: string,
    options?: LeaveRequestReadOptions
  ): Promise<LeaveRequest[]>;

  /**
   * Get all leave requests for an organization with optional status filter
   */
  getLeaveRequestsByOrganization(
    tenantId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date },
    options?: LeaveRequestReadOptions
  ): Promise<LeaveRequest[]>;
}
