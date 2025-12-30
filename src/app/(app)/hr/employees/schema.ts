import { z } from 'zod';

/**
 * Search and filter parameters for employee directory
 */
export const employeeSearchSchema = z.object({
    query: z.string().optional(),
    department: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE', 'OFFBOARDING', 'ARCHIVED']).optional(),
    location: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['firstName', 'lastName', 'department', 'startDate', 'jobTitle']).default('lastName'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type EmployeeSearchParams = z.infer<typeof employeeSearchSchema>;

/**
 * Schema for adding a new employee
 */
export const addEmployeeSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Valid email required'),
    jobTitle: z.string().min(1, 'Job title is required').max(200),
    department: z.string().optional(),
    location: z.string().optional(),
    startDate: z.coerce.date(),
    managerId: z.string().uuid().optional(),
});

export type AddEmployeeInput = z.infer<typeof addEmployeeSchema>;
