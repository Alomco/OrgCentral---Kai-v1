// Use-case: delete a department through org department repositories with RBAC/ABAC enforcement.

import { EntityNotFoundError } from '@/server/errors';
import type { IDepartmentRepository } from '@/server/repositories/contracts/org/departments/department-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export interface DeleteDepartmentDependencies {
    departmentRepository: IDepartmentRepository;
}

export interface DeleteDepartmentInput {
    authorization: RepositoryAuthorizationContext;
    departmentId: string;
}

export interface DeleteDepartmentResult {
    success: true;
    departmentId: string;
    departmentName: string;
}

export async function deleteDepartment(
    deps: DeleteDepartmentDependencies,
    input: DeleteDepartmentInput,
): Promise<DeleteDepartmentResult> {
    const existing = await deps.departmentRepository.getDepartment(
        input.authorization,
        input.departmentId,
    );

    if (!existing) {
        throw new EntityNotFoundError('Department', { departmentId: input.departmentId });
    }

    await deps.departmentRepository.deleteDepartment(input.authorization, input.departmentId);

    return {
        success: true,
        departmentId: input.departmentId,
        departmentName: existing.name,
    };
}
