import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { EmployeeProfileDTO } from '@/server/types/hr/people';
import { normalizeEmployeeNumber } from './sync-leave-accruals.entitlements';

export interface EmployeeContext {
    targetedEmployees: (EmployeeProfileDTO | undefined)[];
    missingEmployees: string[];
}

export async function buildEmployeeContext(
    profileRepository: IEmployeeProfileRepository,
    orgId: string,
    requestedEmployeeIds?: string[],
): Promise<EmployeeContext> {
    const filters = requestedEmployeeIds?.length ? undefined : { employmentStatus: 'ACTIVE' as const };
    const employees = await profileRepository.getEmployeeProfilesByOrganization(orgId, filters);
    const employeeIndex = buildEmployeeIndex(employees);

    return {
        targetedEmployees: resolveTargetEmployees(employeeIndex, employees, requestedEmployeeIds),
        missingEmployees: resolveMissingEmployeeIds(employeeIndex, requestedEmployeeIds),
    };
}

function buildEmployeeIndex(employees: EmployeeProfileDTO[]): Map<string, EmployeeProfileDTO> {
    const index = new Map<string, EmployeeProfileDTO>();
    for (const employee of employees) {
        if (!employee.employeeNumber) {
            continue;
        }
        index.set(normalizeEmployeeNumber(employee.employeeNumber), employee);
    }
    return index;
}

function resolveTargetEmployees(
    employeeIndex: Map<string, EmployeeProfileDTO>,
    employees: EmployeeProfileDTO[],
    requestedEmployeeIds?: string[],
): (EmployeeProfileDTO | undefined)[] {
    if (!requestedEmployeeIds || requestedEmployeeIds.length === 0) {
        return employees;
    }
    return requestedEmployeeIds.map((id) => employeeIndex.get(normalizeEmployeeNumber(id)));
}

function resolveMissingEmployeeIds(
    employeeIndex: Map<string, EmployeeProfileDTO>,
    requestedEmployeeIds?: string[],
): string[] {
    if (!requestedEmployeeIds || requestedEmployeeIds.length === 0) {
        return [];
    }
    return requestedEmployeeIds.filter((id) => !employeeIndex.has(normalizeEmployeeNumber(id)));
}
