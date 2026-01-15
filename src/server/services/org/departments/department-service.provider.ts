import { DepartmentService, type DepartmentServiceDependencies } from './department-service';
import { buildDepartmentServiceDependencies, type DepartmentServiceDependencyOptions } from '@/server/repositories/providers/org/department-service-dependencies';

type ProviderPrismaOptions = DepartmentServiceDependencyOptions['prismaOptions'];

export interface DepartmentServiceProviderOptions {
    prismaOptions?: ProviderPrismaOptions;
}

export class DepartmentServiceProvider {
    private readonly prismaOptions?: ProviderPrismaOptions;
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

        const deps = this.createDependencies(this.prismaOptions, overrides);

        return new DepartmentService(deps);
    }

    private createDependencies(
        prismaOptions?: ProviderPrismaOptions,
        overrides?: Partial<DepartmentServiceDependencies>,
    ): DepartmentServiceDependencies {
        const dependencies = buildDepartmentServiceDependencies({
            prismaOptions: prismaOptions,
            overrides: overrides,
        });

        return {
            departmentRepository: dependencies.departmentRepository,
        };
    }
}

const defaultDepartmentServiceProvider = new DepartmentServiceProvider();

export function getDepartmentService(
    overrides?: Partial<DepartmentServiceDependencies>,
    options?: DepartmentServiceDependencyOptions,
): DepartmentService {
    const provider = options
        ? new DepartmentServiceProvider({ prismaOptions: options.prismaOptions })
        : defaultDepartmentServiceProvider;

    return provider.getService(overrides);
}

export type DepartmentServiceContract = Pick<
    DepartmentService,
    'getDepartments' | 'createDepartment' | 'updateDepartment' | 'deleteDepartment'
>;
