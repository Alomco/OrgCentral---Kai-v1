/**
 * Repository contract for Leave Policies
 * Following SOLID principles with clear separation of concerns
 */
import type { LeavePolicy } from '@/server/types/leave-types';

export interface ILeavePolicyRepository {
  /**
   * Create a new leave policy
   */
  createLeavePolicy(
    tenantId: string,
    policy: Omit<LeavePolicy, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing leave policy
   */
  updateLeavePolicy(
    tenantId: string,
    policyId: string,
    updates: Partial<Omit<LeavePolicy, 'id' | 'orgId' | 'createdAt'>>
  ): Promise<void>;

  /**
   * Get a specific leave policy by ID
   */
  getLeavePolicy(
    tenantId: string,
    policyId: string
  ): Promise<LeavePolicy | null>;

  /**
   * Get a leave policy by name within an organization
   */
  getLeavePolicyByName(
    tenantId: string,
    name: string
  ): Promise<LeavePolicy | null>;

  /**
   * Get all leave policies for an organization
   */
  getLeavePoliciesByOrganization(
    tenantId: string
  ): Promise<LeavePolicy[]>;

  /**
   * Delete a leave policy
   */
  deleteLeavePolicy(
    tenantId: string,
    policyId: string
  ): Promise<void>;
}
