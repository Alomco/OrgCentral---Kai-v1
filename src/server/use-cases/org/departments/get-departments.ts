// Use-case: list departments for an organization via repositories under tenant scope.

import type { IDepartmentRepository } from '@/server/repositories/contracts/org/departments/department-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { Department } from '@/server/types/hr-types';

export interface GetDepartmentsDependencies {
    departmentRepository: IDepartmentRepository;
}

export interface GetDepartmentsInput {
    authorization: RepositoryAuthorizationContext;
    filters?: {
        status?: string;
        parentId?: string;
    };
}

export interface GetDepartmentsResult {
    departments: Department[];
}

export async function getDepartments(
    deps: GetDepartmentsDependencies,
    input: GetDepartmentsInput,
): Promise<GetDepartmentsResult> {
    const filters = normalizeFilters(input.filters);
    const departments = await deps.departmentRepository.getDepartmentsByOrganization(
        input.authorization,
        filters,
    );

    return { departments };
}

function normalizeFilters(
    filters: GetDepartmentsInput['filters'],
): NonNullable<GetDepartmentsInput['filters']> | undefined {
    if (!filters) {
        return undefined;
    }

    const status = filters.status?.trim();
    const parentId = filters.parentId?.trim();

    const normalized = {
        status: status?.length ? status : undefined,
        parentId: parentId?.length ? parentId : undefined,
    };

    return normalized.status || normalized.parentId ? normalized : undefined;
}
