// Use-case: create a department via org department repositories with authorization checks.

import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IDepartmentRepository } from '@/server/repositories/contracts/org/departments/department-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { Department } from '@/server/types/hr-types';

export interface CreateDepartmentDependencies {
    departmentRepository: IDepartmentRepository;
}

export interface CreateDepartmentInput {
    authorization: RepositoryAuthorizationContext;
    department: Pick<
        Department,
        'name' | 'path' | 'leaderOrgId' | 'leaderUserId' | 'businessUnit' | 'costCenter'
    >;
}

export interface CreateDepartmentResult {
    department: Department;
}

export async function createDepartment(
    deps: CreateDepartmentDependencies,
    input: CreateDepartmentInput,
): Promise<CreateDepartmentResult> {
    const name = input.department.name.trim();

    if (!name) {
        throw new ValidationError('Department name is required.');
    }

    const existing = await deps.departmentRepository.getDepartmentByCode(
        input.authorization,
        name,
    );

    if (existing) {
        throw new ValidationError('A department with this name already exists.');
    }

    await deps.departmentRepository.createDepartment(input.authorization, {
        orgId: input.authorization.orgId,
        name,
        path: normalizeOptionalString(input.department.path),
        leaderOrgId: normalizeOptionalString(input.department.leaderOrgId),
        leaderUserId: normalizeOptionalString(input.department.leaderUserId),
        businessUnit: normalizeOptionalString(input.department.businessUnit),
        costCenter: normalizeOptionalString(input.department.costCenter),
    });

    const created = await deps.departmentRepository.getDepartmentByCode(
        input.authorization,
        name,
    );

    if (!created) {
        throw new EntityNotFoundError('Department', { name });
    }

    return { department: created };
}

function normalizeOptionalString(value?: string | null): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}
