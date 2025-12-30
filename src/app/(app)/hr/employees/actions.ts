'use server';

import { headers as nextHeaders } from 'next/headers';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { employeeSearchSchema, type EmployeeSearchParams } from './schema';
import type { EmployeeListResult, EmployeeListItem, EmployeeFilterOptions } from './types';

/**
 * Fetch paginated employee list with search/filter
 */
export async function getEmployeeList(
    params: Partial<EmployeeSearchParams>,
): Promise<EmployeeListResult> {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'action:hr:employees:list',
        },
    );

    const validatedParams = employeeSearchSchema.parse(params);
    const { query, department, status, page, pageSize, sortBy, sortOrder } = validatedParams;

    const peopleService = getPeopleService();
    const result = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    });

    // Transform to EmployeeListItem
    let employees: EmployeeListItem[] = result.profiles.map((p) => {
        // Handle startDate which can be Date | string | null
        let startDate: Date | null = null;
        if (p.startDate) {
            startDate = p.startDate instanceof Date ? p.startDate : new Date(p.startDate);
        }

        // Handle location which can be JsonValue | null
        let location: string | null = null;
        if (p.location) {
            location = typeof p.location === 'string' ? p.location : String(p.location);
        }

        return {
            id: p.id,
            userId: p.userId,
            firstName: p.firstName ?? '',
            lastName: p.lastName ?? '',
            displayName: p.displayName ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
            email: p.email ?? '',
            jobTitle: p.jobTitle ?? null,
            department: p.departmentId ?? null,
            location,
            employmentStatus: p.employmentStatus ?? 'ACTIVE',
            startDate,
            avatarUrl: null, // Would come from user profile
            manager: null, // Would require additional lookup
        };
    });

    // Apply filters
    if (query) {
        const lowerQuery = query.toLowerCase();
        employees = employees.filter(
            (e) =>
                e.displayName.toLowerCase().includes(lowerQuery) ||
                e.email.toLowerCase().includes(lowerQuery) ||
                (e.jobTitle?.toLowerCase().includes(lowerQuery) ?? false) ||
                (e.department?.toLowerCase().includes(lowerQuery) ?? false),
        );
    }

    if (department) {
        employees = employees.filter((e) => e.department === department);
    }

    if (status) {
        employees = employees.filter((e) => e.employmentStatus === status);
    }

    // Sort
    employees.sort((a, b) => {
        let aValue: string | Date | null = null;
        let bValue: string | Date | null = null;

        switch (sortBy) {
            case 'firstName':
                aValue = a.firstName;
                bValue = b.firstName;
                break;
            case 'lastName':
                aValue = a.lastName;
                bValue = b.lastName;
                break;
            case 'department':
                aValue = a.department ?? '';
                bValue = b.department ?? '';
                break;
            case 'jobTitle':
                aValue = a.jobTitle ?? '';
                bValue = b.jobTitle ?? '';
                break;
            case 'startDate':
                aValue = a.startDate;
                bValue = b.startDate;
                break;
        }

        if (aValue === null && bValue === null) {return 0;}
        if (aValue === null) {return sortOrder === 'asc' ? 1 : -1;}
        if (bValue === null) {return sortOrder === 'asc' ? -1 : 1;}

        if (aValue instanceof Date && bValue instanceof Date) {
            return sortOrder === 'asc'
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime();
        }

        const comparison = String(aValue).localeCompare(String(bValue));
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const total = employees.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedEmployees = employees.slice(start, start + pageSize);

    return {
        employees: paginatedEmployees,
        total,
        page,
        pageSize,
        totalPages,
    };
}

/**
 * Get filter options for employee directory
 */
export async function getEmployeeFilterOptions(): Promise<EmployeeFilterOptions> {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'action:hr:employees:filter-options',
        },
    );

    const peopleService = getPeopleService();
    const result = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    });

    // Extract unique departments and locations
    const departments = new Set<string>();
    const locations = new Set<string>();

    for (const profile of result.profiles) {
        if (profile.departmentId) {departments.add(profile.departmentId);}
        if (profile.location && typeof profile.location === 'string') {
            locations.add(profile.location);
        }
    }

    return {
        departments: Array.from(departments).sort(),
        locations: Array.from(locations).sort(),
        statuses: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'ON_LEAVE', label: 'On Leave' },
            { value: 'OFFBOARDING', label: 'Offboarding' },
            { value: 'TERMINATED', label: 'Terminated' },
            { value: 'ARCHIVED', label: 'Archived' },
        ],
    };
}

/**
 * Get employee count stats
 */
export async function getEmployeeStats(): Promise<{
    total: number;
    active: number;
    onLeave: number;
    newThisMonth: number;
}> {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'action:hr:employees:stats',
        },
    );

    const peopleService = getPeopleService();
    const result = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
        total: result.profiles.length,
        active: result.profiles.filter((p) => p.employmentStatus === 'ACTIVE').length,
        onLeave: result.profiles.filter((p) => p.employmentStatus === 'ON_LEAVE').length,
        newThisMonth: result.profiles.filter((p) => {
            if (!p.startDate) {return false;}
            const startDate = p.startDate instanceof Date ? p.startDate : new Date(p.startDate);
            return startDate >= startOfMonth;
        }).length,
    };
}
