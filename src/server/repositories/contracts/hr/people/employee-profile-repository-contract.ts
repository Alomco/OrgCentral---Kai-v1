/**
 * Repository contract for Employee Profiles
 * Following SOLID principles with clear separation of concerns
 */
import type { EmployeeProfile } from '@/server/types/hr-types';

export interface IEmployeeProfileRepository {
  /**
   * Create a new employee profile
   */
  createEmployeeProfile(
    tenantId: string,
    profile: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing employee profile
   */
  updateEmployeeProfile(
    tenantId: string,
    profileId: string,
    updates: Partial<Omit<EmployeeProfile, 'id' | 'orgId' | 'userId' | 'createdAt' | 'employeeNumber'>>
  ): Promise<void>;

  /**
   * Get a specific employee profile by ID
   */
  getEmployeeProfile(
    tenantId: string,
    profileId: string
  ): Promise<EmployeeProfile | null>;

  /**
   * Get employee profile by user ID
   */
  getEmployeeProfileByUser(
    tenantId: string,
    userId: string
  ): Promise<EmployeeProfile | null>;

  /**
   * Get all employee profiles for an organization
   */
  getEmployeeProfilesByOrganization(
    tenantId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<EmployeeProfile[]>;

  /**
   * Delete an employee profile
   */
  deleteEmployeeProfile(
    tenantId: string,
    profileId: string
  ): Promise<void>;
}
