/**
 * Shared type definitions for use-cases.
 * Provides common types used across multiple use-cases.
 */

/**
 * Standard result wrapper for successful operations.
 */
export interface SuccessResult<T = void> {
    success: true;
    data?: T;
}

/**
 * Actor information for authenticated requests.
 */
export interface Actor {
    userId: string;
    email: string;
}

/**
 * Common pagination input.
 */
export interface PaginationInput {
    page?: number;
    limit?: number;
    offset?: number;
}

/**
 * Common pagination result.
 */
export interface PaginationResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

/**
 * Common filter input.
 */
export interface FilterInput {
    searchQuery?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Employment type enum.
 */
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'INTERN';

/**
 * Common metadata structure.
 */
export interface Metadata {
    source: string;
    [key: string]: unknown;
}

/**
 * Common timestamp fields.
 */
export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Common soft delete field.
 */
export interface SoftDelete {
    deletedAt?: Date | null;
}

/**
 * Common audit fields.
 */
export interface AuditFields {
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Common network metadata.
 */
export interface NetworkMetadata {
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Common request context.
 */
export interface RequestContext extends NetworkMetadata {
    correlationId?: string;
    auditSource?: string;
}

/**
 * Operation result with optional error.
 */
export type OperationResult<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

/**
 * Optional nullable type.
 */
export type Nullable<T> = T | null;

/**
 * Make specific properties optional.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required.
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
