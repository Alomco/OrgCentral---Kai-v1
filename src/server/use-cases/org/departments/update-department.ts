// Use-case: update department details using org department repositories under tenant guard.

import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IDepartmentRepository } from '@/server/repositories/contracts/org/departments/department-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { Department } from '@/server/types/hr-types';

export interface UpdateDepartmentDependencies {
    departmentRepository: IDepartmentRepository;
}

export interface UpdateDepartmentInput {
    authorization: RepositoryAuthorizationContext;
    departmentId: string;
    updates: Partial<
        Pick<
            Department,
            'name' | 'path' | 'leaderOrgId' | 'leaderUserId' | 'businessUnit' | 'costCenter'
        >
    >;
}

export interface UpdateDepartmentResult {
    department: Department;
}

export async function updateDepartment(
    deps: UpdateDepartmentDependencies,
    input: UpdateDepartmentInput,
): Promise<UpdateDepartmentResult> {
    const existing = await deps.departmentRepository.getDepartment(
        input.authorization,
        input.departmentId,
    );

    if (!existing) {
        throw new EntityNotFoundError('Department', { departmentId: input.departmentId });
    }

    const normalizedUpdates = normalizeUpdates(input.updates);

    if (normalizedUpdates.name) {
        const duplicate = await deps.departmentRepository.getDepartmentByCode(
            input.authorization,
            normalizedUpdates.name,
        );

        if (duplicate && duplicate.id !== input.departmentId) {
            throw new ValidationError('A department with this name already exists.');
        }
    }

    await deps.departmentRepository.updateDepartment(
        input.authorization,
        input.departmentId,
        normalizedUpdates,
    );

    const updated = await deps.departmentRepository.getDepartment(
        input.authorization,
        input.departmentId,
    );

    if (!updated) {
        throw new EntityNotFoundError('Department', { departmentId: input.departmentId });
    }

    return { department: updated };
}

function normalizeUpdates(
    updates: UpdateDepartmentInput['updates'],
): UpdateDepartmentInput['updates'] {
    const normalized: UpdateDepartmentInput['updates'] = {};

    if (updates.name !== undefined) {
        const name = updates.name.trim();
        if (!name) {
            throw new ValidationError('Department name cannot be empty.');
        }
        normalized.name = name;
    }

    if (updates.path !== undefined) {
        normalized.path = normalizeOptionalString(updates.path);
    }
    if (updates.leaderOrgId !== undefined) {
        normalized.leaderOrgId = normalizeOptionalString(updates.leaderOrgId);
    }
    if (updates.leaderUserId !== undefined) {
        normalized.leaderUserId = normalizeOptionalString(updates.leaderUserId);
    }
    if (updates.businessUnit !== undefined) {
        normalized.businessUnit = normalizeOptionalString(updates.businessUnit);
    }
    if (updates.costCenter !== undefined) {
        normalized.costCenter = normalizeOptionalString(updates.costCenter);
    }

    return normalized;
}

function normalizeOptionalString(value?: string | null): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}
