/**
 * Repository contract for Training Records
 * Following SOLID principles with clear separation of concerns
 */
import type { TrainingRecord } from '@/server/types/hr-types';

export interface ITrainingRecordRepository {
  /**
   * Create a new training record
   */
  createTrainingRecord(
    tenantId: string,
    record: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing training record
   */
  updateTrainingRecord(
    tenantId: string,
    recordId: string,
    updates: Partial<Omit<TrainingRecord, 'id' | 'orgId' | 'createdAt' | 'employeeId'>>
  ): Promise<void>;

  /**
   * Get a specific training record by ID
   */
  getTrainingRecord(
    tenantId: string,
    recordId: string
  ): Promise<TrainingRecord | null>;

  /**
   * Get all training records for an employee
   */
  getTrainingRecordsByEmployee(
    tenantId: string,
    employeeId: string
  ): Promise<TrainingRecord[]>;

  /**
   * Get all training records for an organization with optional filters
   */
  getTrainingRecordsByOrganization(
    tenantId: string,
    filters?: {
      status?: string;
      trainingTitle?: string;
      startDate?: Date;
      endDate?: Date;
      employeeId?: string;
    }
  ): Promise<TrainingRecord[]>;

  /**
   * Delete a training record
   */
  deleteTrainingRecord(
    tenantId: string,
    recordId: string
  ): Promise<void>;
}