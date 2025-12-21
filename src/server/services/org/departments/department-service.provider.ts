import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaDepartmentRepository } from '@/server/repositories/prisma/org/departments/prisma-department-repository';
import { DepartmentService, type DepartmentServiceDependencies } from './department-service';

export interface DepartmentServiceProviderOptions {
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

export class DepartmentServiceProvider {
    private readonly prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
    private readonly defaultDependencies: DepartmentServiceDependencies;
    private readonly sharedService: DepartmentService;

    constructor(options?: DepartmentServiceProviderOptions) {
        this.prismaOptions = options?.prismaOptions;
        this.defaultDependencies = this.createDependencies(this.prismaOptions);
        this.sharedService = new DepartmentService(this.defaultDependencies);
    }

    getService(overrides?: Partial<DepartmentServiceDependencies>): DepartmentService {
        if (!overrides || Object.keys(overrides).length === 0) {
            return this.sharedService;
        }

        const deps = this.createDependencies(this.prismaOptions);

        return new DepartmentService({
            departmentRepository: overrides.departmentRepository ?? deps.departmentRepository,
        });
    }

    private createDependencies(
        prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>,
    ): DepartmentServiceDependencies {
        const prismaClient = prismaOptions?.prisma ?? defaultPrismaClient;
        const repoOptions = {
            prisma: prismaClient,
            trace: prismaOptions?.trace,
            onAfterWrite: prismaOptions?.onAfterWrite,
        };

        return {
            departmentRepository: new PrismaDepartmentRepository(repoOptions),
        };
    }
}

const defaultDepartmentServiceProvider = new DepartmentServiceProvider();

export function getDepartmentService(
    overrides?: Partial<DepartmentServiceDependencies>,
    options?: DepartmentServiceProviderOptions,
): DepartmentService {
    const provider = options
        ? new DepartmentServiceProvider(options)
        : defaultDepartmentServiceProvider;

    return provider.getService(overrides);
}

export type DepartmentServiceContract = Pick<
    DepartmentService,
    'getDepartments' | 'createDepartment' | 'updateDepartment' | 'deleteDepartment'
>;
