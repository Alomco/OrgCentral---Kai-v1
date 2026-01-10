'use server';

import { headers } from 'next/headers';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';

import { employeeSearchSchema, type EmployeeSearchParams } from '../schema';
import type { EmployeeFilterOptions, EmployeeListItem, EmployeeListResult } from '../types';

/**
 * Fetch paginated employee list with search/filter
 */
export async function getEmployeeList(
    params: Partial<EmployeeSearchParams>,
): Promise<EmployeeListResult> {
    const headerStore = await headers();
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

    const employees = result.profiles.map<EmployeeListItem>((profile) => {
        const startDate = profile.startDate
            ? profile.startDate instanceof Date
                ? profile.startDate
                : new Date(profile.startDate)
            : null;

        const location = typeof profile.location === 'string' ? profile.location : null;
        const trimmedDisplayName = profile.displayName?.trim();
        const displayName = trimmedDisplayName && trimmedDisplayName.length > 0
            ? trimmedDisplayName
            : `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
        const employmentStatus = (profile.employmentStatus as EmployeeListItem['employmentStatus'] | null | undefined)
            ?? 'ACTIVE';

        return {
            id: profile.id,
            userId: profile.userId,
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            displayName,
            email: profile.email ?? '',
            jobTitle: profile.jobTitle ?? null,
            department: profile.departmentId ?? null,
            location,
            employmentStatus,
            startDate,
            avatarUrl: null,
            manager: null,
        };
    });

    let filtered = employees;
    if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter((employee) =>
            employee.displayName.toLowerCase().includes(lowerQuery) ||
            employee.email.toLowerCase().includes(lowerQuery) ||
            Boolean(employee.jobTitle?.toLowerCase().includes(lowerQuery)) ||
            Boolean(employee.department?.toLowerCase().includes(lowerQuery)),
        );
    }

    if (department) {
        filtered = filtered.filter((employee) => employee.department === department);
    }

    if (status) {
        filtered = filtered.filter((employee) => employee.employmentStatus === status);
    }

    filtered.sort((a, b) => {
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

        if (aValue === null && bValue === null) { return 0; }
        if (aValue === null) { return sortOrder === 'asc' ? 1 : -1; }
        if (bValue === null) { return sortOrder === 'asc' ? -1 : 1; }

        if (aValue instanceof Date && bValue instanceof Date) {
            return sortOrder === 'asc'
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime();
        }

        const comparison = String(aValue).localeCompare(String(bValue));
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedEmployees = filtered.slice(start, start + pageSize);

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
    const headerStore = await headers();
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

    const departments = new Set<string>();
    const locations = new Set<string>();

    for (const profile of result.profiles) {
        if (profile.departmentId) { departments.add(profile.departmentId); }
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
    const headerStore = await headers();
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
        active: result.profiles.filter((profile) => profile.employmentStatus === 'ACTIVE').length,
        onLeave: result.profiles.filter((profile) => profile.employmentStatus === 'ON_LEAVE').length,
        newThisMonth: result.profiles.filter((profile) => {
            if (!profile.startDate) { return false; }
            const startDate = profile.startDate instanceof Date ? profile.startDate : new Date(profile.startDate);
            return startDate >= startOfMonth;
        }).length,
    };
}
