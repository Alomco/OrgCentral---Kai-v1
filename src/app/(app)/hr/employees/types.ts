/**
 * Employee list item for directory display
 */
export interface EmployeeListItem {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    jobTitle: string | null;
    department: string | null;
    location: string | null;
    employmentStatus: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE' | 'OFFBOARDING' | 'ARCHIVED';
    startDate: Date | null;
    avatarUrl: string | null;
    manager: {
        id: string;
        displayName: string;
    } | null;
}

/**
 * Paginated employee list result
 */
export interface EmployeeListResult {
    employees: EmployeeListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Employee directory filter options (for dropdowns)
 */
export interface EmployeeFilterOptions {
    departments: string[];
    locations: string[];
    statuses: {
        value: EmployeeListItem['employmentStatus'];
        label: string;
    }[];
}

/**
 * Status label mapping
 */
export const EMPLOYEE_STATUS_LABELS: Record<EmployeeListItem['employmentStatus'], string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    TERMINATED: 'Terminated',
    ON_LEAVE: 'On Leave',
    OFFBOARDING: 'Offboarding',
    ARCHIVED: 'Archived',
};
