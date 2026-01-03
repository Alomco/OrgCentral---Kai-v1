'use server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import {
    normalizeContractChanges,
    normalizeProfileChanges,
} from '@/server/services/hr/people/helpers/onboard-payload.helpers';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { EMPLOYMENT_STATUS_VALUES } from '@/server/types/hr/people';
import type { ProfileMutationPayload } from '@/server/types/hr/people';

import { toFieldErrors, type FieldErrors } from '../_components/form-errors';
import {
    employeeContractFormSchema,
    employeeProfileFormSchema,
    employeeSearchSchema,
    type EmployeeContractFormValues,
    type EmployeeProfileFormValues,
    type EmployeeSearchParams,
} from './schema';
import type {
    EmployeeContractFormState,
    EmployeeProfileFormState,
} from './form-state';
import type { EmployeeFilterOptions, EmployeeListItem, EmployeeListResult } from './types';
import {
    FIELD_CHECK_MESSAGE,
    buildEmergencyContact,
    buildPhoneNumbers,
    buildPostalAddress,
    buildEmployeeContractCandidate,
    buildEmployeeProfileCandidate,
    normalizeOptionalText,
    parseDateField,
    parseJsonField,
    parseOptionalNumberField,
} from './action-helpers';

export interface EmployeeQuickEditState {
    status: 'idle' | 'success' | 'error';
    message?: string;
    fieldErrors?: Partial<Record<'employmentStatus' | 'jobTitle', string>>;
}

export const EMPLOYEE_QUICK_EDIT_INITIAL_STATE: EmployeeQuickEditState = {
    status: 'idle',
};

const UNAUTHORIZED_PROFILE_MESSAGE = 'Not authorized to update employee profiles.';

const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const UPDATE_PROFILE_ERROR_MESSAGE = 'Unable to update employee profile.';
const REVALIDATE_EMPLOYEE_LIST_PATH = '/hr/employees';

const quickEditSchema = z.object({
    profileId: z.string().regex(UUID_PATTERN, 'Invalid profile id'),
    employmentStatus: z.enum(EMPLOYMENT_STATUS_VALUES).optional(),
    jobTitle: z
        .string()
        .trim()
        .max(120, 'Job title is too long')
        .optional()
        .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export async function quickUpdateEmployeeProfileAction(
    previous: EmployeeQuickEditState,
    formData: FormData,
): Promise<EmployeeQuickEditState> {
    const parsed = quickEditSchema.safeParse({
        profileId: formData.get('profileId'),
        employmentStatus: formData.get('employmentStatus'),
        jobTitle: formData.get('jobTitle'),
    });

    if (!parsed.success) {
        const fieldErrors = parsed.error.issues.reduce<NonNullable<EmployeeQuickEditState['fieldErrors']>>(
            (accumulator, issue) => {
                const key = issue.path[0];
                if (key === 'employmentStatus' || key === 'jobTitle') {
                    accumulator[key] = issue.message;
                }
                return accumulator;
            },
            {},
        );

        return {
            status: 'error',
            message: 'Please review the highlighted fields.',
            fieldErrors,
        };
    }

    const { profileId, employmentStatus, jobTitle } = parsed.data;
    const profileUpdates: Pick<ProfileMutationPayload['changes'], 'employmentStatus' | 'jobTitle'> = {};

    if (employmentStatus) {
        profileUpdates.employmentStatus = employmentStatus;
    }

    if (jobTitle) {
        profileUpdates.jobTitle = jobTitle;
    }

    if (Object.keys(profileUpdates).length === 0) {
        return {
            status: 'error',
            message: 'Add a change before saving.',
            fieldErrors: {
                jobTitle: previous.fieldErrors?.jobTitle,
                employmentStatus: previous.fieldErrors?.employmentStatus,
            },
        };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            requiredPermissions: { employeeProfile: ['update'] },
            auditSource: 'ui:hr:employees:quick-edit',
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
            resourceAttributes: { profileId },
        });
    } catch {
        return {
            status: 'error',
            message: UNAUTHORIZED_PROFILE_MESSAGE,
            fieldErrors: previous.fieldErrors,
        };
    }

    try {
        const peopleService = getPeopleService();
        await peopleService.updateEmployeeProfile({
            authorization: session.authorization,
            payload: {
                profileId,
                profileUpdates,
            },
        });

        revalidatePath(REVALIDATE_EMPLOYEE_LIST_PATH);
        revalidatePath(`/hr/employees/${profileId}`);

        return {
            status: 'success',
            message: 'Quick update saved.',
            fieldErrors: undefined,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : UPDATE_PROFILE_ERROR_MESSAGE,
            fieldErrors: previous.fieldErrors,
        };
    }
}
export async function updateEmployeeProfileAction(
    previous: EmployeeProfileFormState,
    formData: FormData,
): Promise<EmployeeProfileFormState> {
    const candidate = buildEmployeeProfileCandidate(formData);

    const parsed = employeeProfileFormSchema.safeParse(candidate);
    if (!parsed.success) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: toFieldErrors(parsed.error),
            values: previous.values,
        };
    }

    const startDateParsed = parseDateField(parsed.data.startDate, false);
    const endDateParsed = parseDateField(parsed.data.endDate, false);
    const annualSalaryParsed = parseOptionalNumberField(parsed.data.annualSalary);
    const hourlyRateParsed = parseOptionalNumberField(parsed.data.hourlyRate);
    const salaryAmountParsed = parseOptionalNumberField(parsed.data.salaryAmount);
    const metadataParsed = parseJsonField(parsed.data.metadata);

    const fieldErrors: FieldErrors<EmployeeProfileFormValues> = {};
    if (startDateParsed.error) {
        fieldErrors.startDate = startDateParsed.error;
    }
    if (endDateParsed.error) {
        fieldErrors.endDate = endDateParsed.error;
    }
    if (annualSalaryParsed.error) {
        fieldErrors.annualSalary = annualSalaryParsed.error;
    }
    if (hourlyRateParsed.error) {
        fieldErrors.hourlyRate = hourlyRateParsed.error;
    }
    if (salaryAmountParsed.error) {
        fieldErrors.salaryAmount = salaryAmountParsed.error;
    }
    if (metadataParsed.error) {
        fieldErrors.metadata = metadataParsed.error;
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors,
            values: parsed.data,
        };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            requiredPermissions: { employeeProfile: ['update'] },
            auditSource: 'ui:hr:employees:profile:update',
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
            resourceAttributes: { profileId: parsed.data.profileId },
        });
    } catch {
        return {
            status: 'error',
            message: UNAUTHORIZED_PROFILE_MESSAGE,
            values: previous.values,
        };
    }

    const salaryFrequency = parsed.data.salaryFrequency
        ? (parsed.data.salaryFrequency)
        : null;
    const salaryBasis = parsed.data.salaryBasis
        ? (parsed.data.salaryBasis)
        : null;
    const paySchedule = parsed.data.paySchedule
        ? (parsed.data.paySchedule)
        : null;

    const profileUpdates = normalizeProfileChanges({
        displayName: normalizeOptionalText(parsed.data.displayName),
        firstName: normalizeOptionalText(parsed.data.firstName),
        lastName: normalizeOptionalText(parsed.data.lastName),
        email: normalizeOptionalText(parsed.data.email),
        personalEmail: normalizeOptionalText(parsed.data.personalEmail),
        phone: buildPhoneNumbers(
            parsed.data.phoneWork,
            parsed.data.phoneMobile,
            parsed.data.phoneHome,
        ),
        jobTitle: normalizeOptionalText(parsed.data.jobTitle),
        departmentId: normalizeOptionalText(parsed.data.departmentId),
        costCenter: normalizeOptionalText(parsed.data.costCenter),
        managerUserId: normalizeOptionalText(parsed.data.managerUserId),
        employmentType: parsed.data.employmentType,
        employmentStatus: parsed.data.employmentStatus,
        startDate: startDateParsed.date,
        endDate: endDateParsed.date,
        address: buildPostalAddress(
            parsed.data.addressStreet,
            parsed.data.addressCity,
            parsed.data.addressState,
            parsed.data.addressPostalCode,
            parsed.data.addressCountry,
        ),
        emergencyContact: buildEmergencyContact(
            parsed.data.emergencyContactName,
            parsed.data.emergencyContactRelationship,
            parsed.data.emergencyContactPhone,
            parsed.data.emergencyContactEmail,
        ),
        annualSalary: annualSalaryParsed.value,
        hourlyRate: hourlyRateParsed.value,
        salaryAmount: salaryAmountParsed.value,
        salaryCurrency: normalizeOptionalText(parsed.data.salaryCurrency),
        salaryFrequency,
        salaryBasis,
        paySchedule,
        metadata: metadataParsed.value,
    });

    try {
        const peopleService = getPeopleService();
        await peopleService.updateEmployeeProfile({
            authorization: session.authorization,
            payload: {
                profileId: parsed.data.profileId,
                profileUpdates,
            },
        });

        revalidatePath(REVALIDATE_EMPLOYEE_LIST_PATH);
        revalidatePath(`/hr/employees/${parsed.data.profileId}`);

        return {
            status: 'success',
            message: 'Employee profile updated.',
            fieldErrors: undefined,
            values: parsed.data,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : UPDATE_PROFILE_ERROR_MESSAGE,
            fieldErrors: undefined,
            values: parsed.data,
        };
    }
}

export async function saveEmployeeContractAction(
    previous: EmployeeContractFormState,
    formData: FormData,
): Promise<EmployeeContractFormState> {
    const candidate = buildEmployeeContractCandidate(formData);

    const parsed = employeeContractFormSchema.safeParse(candidate);
    if (!parsed.success) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: toFieldErrors(parsed.error),
            values: previous.values,
        };
    }

    const startDateParsed = parseDateField(parsed.data.startDate, true);
    const endDateParsed = parseDateField(parsed.data.endDate, false);
    const probationDateParsed = parseDateField(parsed.data.probationEndDate, false);
    const furloughStartParsed = parseDateField(parsed.data.furloughStartDate, false);
    const furloughEndParsed = parseDateField(parsed.data.furloughEndDate, false);
    const workingPatternParsed = parseJsonField(parsed.data.workingPattern);
    const benefitsParsed = parseJsonField(parsed.data.benefits);

    const contractFieldErrors: FieldErrors<EmployeeContractFormValues> = {};

    const validationErrors = [
        ['startDate', startDateParsed.error],
        ['endDate', endDateParsed.error],
        ['probationEndDate', probationDateParsed.error],
        ['furloughStartDate', furloughStartParsed.error],
        ['furloughEndDate', furloughEndParsed.error],
        ['workingPattern', workingPatternParsed.error],
        ['benefits', benefitsParsed.error],
    ] as const satisfies readonly (readonly [
        Extract<keyof EmployeeContractFormValues, string>,
        string | undefined
    ])[];

    for (const [key, error] of validationErrors) {
        if (error) {
            contractFieldErrors[key] = error;
        }
    }

    if (Object.keys(contractFieldErrors).length > 0) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: contractFieldErrors,
            values: parsed.data,
        };
    }

    const contractId = parsed.data.contractId.trim();
    const isCreate = contractId.length === 0;

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            requiredPermissions: {
                employmentContract: [isCreate ? 'create' : 'update'],
            },
            auditSource: isCreate
                ? 'ui:hr:employees:contract:create'
                : 'ui:hr:employees:contract:update',
            action: isCreate ? HR_ACTION.CREATE : HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
            resourceAttributes: isCreate
                ? { employeeId: parsed.data.userId }
                : { contractId },
        });
    } catch {
        return {
            status: 'error',
            message: 'Not authorized to update employment contracts.',
            values: previous.values,
        };
    }

    const startDate = startDateParsed.date;
    if (!startDate) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: { startDate: 'Date is required.' },
            values: parsed.data,
        };
    }

    const contractUpdates = normalizeContractChanges({
        contractType: parsed.data.contractType,
        jobTitle: parsed.data.jobTitle,
        departmentId: normalizeOptionalText(parsed.data.departmentId),
        location: normalizeOptionalText(parsed.data.location),
        startDate,
        endDate: endDateParsed.date,
        probationEndDate: probationDateParsed.date,
        furloughStartDate: furloughStartParsed.date,
        furloughEndDate: furloughEndParsed.date,
        terminationReason: normalizeOptionalText(parsed.data.terminationReason),
        terminationNotes: normalizeOptionalText(parsed.data.terminationNotes),
        workingPattern: workingPatternParsed.value,
        benefits: benefitsParsed.value,
    });

    try {
        const peopleService = getPeopleService();

        if (isCreate) {
            await peopleService.createEmploymentContract({
                authorization: session.authorization,
                payload: {
                    contractData: {
                        ...contractUpdates,
                        userId: parsed.data.userId,
                        contractType: parsed.data.contractType,
                        jobTitle: parsed.data.jobTitle,
                        startDate,
                    },
                },
            });
        } else {
            await peopleService.updateEmploymentContract({
                authorization: session.authorization,
                payload: {
                    contractId,
                    contractUpdates,
                },
            });
        }

        revalidatePath(REVALIDATE_EMPLOYEE_LIST_PATH);
        revalidatePath(`/hr/employees/${parsed.data.profileId}`);

        return {
            status: 'success',
            message: isCreate ? 'Employment contract created.' : 'Employment contract updated.',
            fieldErrors: undefined,
            values: parsed.data,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to update employment contract.',
            fieldErrors: undefined,
            values: parsed.data,
        };
    }
}

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

    // Transform to EmployeeListItem
    let employees: EmployeeListItem[] = result.profiles.map((p) => {
        // Handle startDate which can be Date | string | null
        let startDate: Date | null = null;
        if (p.startDate) {
            startDate = p.startDate instanceof Date ? p.startDate : new Date(p.startDate);
        }

        // Handle location which can be JsonValue | null
        const location = typeof p.location === 'string' ? p.location : null;
        const trimmedDisplayName = p.displayName?.trim();
        const displayName = trimmedDisplayName && trimmedDisplayName.length > 0
            ? trimmedDisplayName
            : `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
        const employmentStatus = (p.employmentStatus as EmployeeListItem['employmentStatus'] | null | undefined)
            ?? 'ACTIVE';

        return {
            id: p.id,
            userId: p.userId,
            firstName: p.firstName ?? '',
            lastName: p.lastName ?? '',
            displayName,
            email: p.email ?? '',
            jobTitle: p.jobTitle ?? null,
            department: p.departmentId ?? null,
            location,
            employmentStatus,
            startDate,
            avatarUrl: null, // Would come from user profile
            manager: null, // Would require additional lookup
        };
    });

    // Apply filters
    if (query) {
        const lowerQuery = query.toLowerCase();
        employees = employees.filter(
            (employee) =>
                employee.displayName.toLowerCase().includes(lowerQuery) ||
                employee.email.toLowerCase().includes(lowerQuery) ||
                Boolean(employee.jobTitle?.toLowerCase().includes(lowerQuery)) ||
                Boolean(employee.department?.toLowerCase().includes(lowerQuery)),
        );
    }

    if (department) {
        employees = employees.filter((employee) => employee.department === department);
    }

    if (status) {
        employees = employees.filter((employee) => employee.employmentStatus === status);
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

    // Extract unique departments and locations
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
        active: result.profiles.filter((p) => p.employmentStatus === 'ACTIVE').length,
        onLeave: result.profiles.filter((p) => p.employmentStatus === 'ON_LEAVE').length,
        newThisMonth: result.profiles.filter((p) => {
            if (!p.startDate) { return false; }
            const startDate = p.startDate instanceof Date ? p.startDate : new Date(p.startDate);
            return startDate >= startOfMonth;
        }).length,
    };
}
