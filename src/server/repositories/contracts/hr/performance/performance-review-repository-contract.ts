/**
 * Repository contract for Performance Reviews
 * Following SOLID principles with clear separation of concerns
 */
import type { PerformanceReview } from '@/server/types/hr-types';

export interface IPerformanceReviewRepository {
  /**
   * Create a new performance review
   */
  createPerformanceReview(
    tenantId: string,
    review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing performance review
   */
  updatePerformanceReview(
    tenantId: string,
    reviewId: string,
    updates: Partial<Omit<PerformanceReview, 'id' | 'orgId' | 'createdAt' | 'employeeId'>>
  ): Promise<void>;

  /**
   * Get a specific performance review by ID
   */
  getPerformanceReview(
    tenantId: string,
    reviewId: string
  ): Promise<PerformanceReview | null>;

  /**
   * Get all performance reviews for an employee
   */
  getPerformanceReviewsByEmployee(
    tenantId: string,
    employeeId: string
  ): Promise<PerformanceReview[]>;

  /**
   * Get all performance reviews for an organization with optional filters
   */
  getPerformanceReviewsByOrganization(
    tenantId: string,
    filters?: {
      status?: string;
      reviewerId?: string;
      reviewPeriod?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<PerformanceReview[]>;

  /**
   * Delete a performance review
   */
  deletePerformanceReview(
    tenantId: string,
    reviewId: string
  ): Promise<void>;
}