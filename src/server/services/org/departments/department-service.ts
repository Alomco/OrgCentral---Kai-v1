import type { IDepartmentRepository } from '@/server/repositories/contracts/org/departments/department-repository-contract';
import type { OrgPermissionMap } from '@/server/security/access-control';
import { AbstractOrgService } from '@/server/services/org/abstract-org-service';
import type { Department } from '@/server/types/hr-types';
import {
    createDepartment as createDepartmentUseCase,
    type CreateDepartmentInput,
} from '@/server/use-cases/org/departments/create-department';
import {
    deleteDepartment as deleteDepartmentUseCase,
    type DeleteDepartmentInput,
} from '@/server/use-cases/org/departments/delete-department';
import {
    getDepartments as getDepartmentsUseCase,
    type GetDepartmentsInput,
    type GetDepartmentsResult,
} from '@/server/use-cases/org/departments/get-departments';
import {
    updateDepartment as updateDepartmentUseCase,
    type UpdateDepartmentInput,
} from '@/server/use-cases/org/departments/update-department';

const DEPARTMENT_RESOURCE_TYPE = 'org.department';
const DEPARTMENT_ADMIN_PERMISSIONS: OrgPermissionMap = { organization: ['update'] };
const DEPARTMENT_READ_PERMISSIONS: OrgPermissionMap = { organization: ['read'] };

export interface DepartmentServiceDependencies {
    departmentRepository: IDepartmentRepository;
}

export class DepartmentService extends AbstractOrgService {
    constructor(private readonly dependencies: DepartmentServiceDependencies) {
        super();
    }

    async getDepartments(input: GetDepartmentsInput): Promise<GetDepartmentsResult> {
        await this.ensureOrgAccess(input.authorization, {
            requiredPermissions: DEPARTMENT_READ_PERMISSIONS,
            action: 'org.department.list',
            resourceType: DEPARTMENT_RESOURCE_TYPE,
            resourceAttributes: { filters: input.filters },
        });

        const context = this.buildContext(
            input.authorization,
            input.filters ? { metadata: { filters: input.filters } } : undefined,
        );

        return this.executeInServiceContext(context, 'org.departments.list', () =>
            getDepartmentsUseCase({ departmentRepository: this.dependencies.departmentRepository }, input),
        );
    }

    async createDepartment(input: CreateDepartmentInput): Promise<Department> {
        await this.ensureOrgAccess(input.authorization, {
            requiredPermissions: DEPARTMENT_ADMIN_PERMISSIONS,
            action: 'org.department.create',
            resourceType: DEPARTMENT_RESOURCE_TYPE,
            resourceAttributes: { name: input.department.name },
        });

        const context = this.buildContext(input.authorization, {
            metadata: { name: input.department.name },
        });

        const result = await this.executeInServiceContext(context, 'org.departments.create', () =>
            createDepartmentUseCase({ departmentRepository: this.dependencies.departmentRepository }, input),
        );

        return result.department;
    }

    async updateDepartment(input: UpdateDepartmentInput): Promise<Department> {
        await this.ensureOrgAccess(input.authorization, {
            requiredPermissions: DEPARTMENT_ADMIN_PERMISSIONS,
            action: 'org.department.update',
            resourceType: DEPARTMENT_RESOURCE_TYPE,
            resourceAttributes: {
                departmentId: input.departmentId,
                updateKeys: Object.keys(input.updates),
            },
        });

        const context = this.buildContext(input.authorization, {
            metadata: { departmentId: input.departmentId },
        });

        const result = await this.executeInServiceContext(context, 'org.departments.update', () =>
            updateDepartmentUseCase({ departmentRepository: this.dependencies.departmentRepository }, input),
        );

        return result.department;
    }

    async deleteDepartment(input: DeleteDepartmentInput): Promise<void> {
        await this.ensureOrgAccess(input.authorization, {
            requiredPermissions: DEPARTMENT_ADMIN_PERMISSIONS,
            action: 'org.department.delete',
            resourceType: DEPARTMENT_RESOURCE_TYPE,
            resourceAttributes: { departmentId: input.departmentId },
        });

        const context = this.buildContext(input.authorization, {
            metadata: { departmentId: input.departmentId },
        });

        await this.executeInServiceContext(context, 'org.departments.delete', () =>
            deleteDepartmentUseCase({ departmentRepository: this.dependencies.departmentRepository }, input),
        );
    }
}
