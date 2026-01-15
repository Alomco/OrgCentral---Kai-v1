import { PermissionResourceService, type PermissionResourceServiceDependencies } from './permission-resource-service';
import { buildPermissionResourceServiceDependencies, type PermissionResourceServiceDependencyOptions } from '@/server/repositories/providers/org/permission-resource-service-dependencies';

type ProviderPrismaOptions = PermissionResourceServiceDependencyOptions['prismaOptions'];

export interface PermissionResourceServiceProviderOptions {
    prismaOptions?: ProviderPrismaOptions;
}

export class PermissionResourceServiceProvider {
    private readonly prismaOptions?: ProviderPrismaOptions;
    private readonly sharedService: PermissionResourceService;

    constructor(options?: PermissionResourceServiceProviderOptions) {
        this.prismaOptions = options?.prismaOptions;
        this.sharedService = new PermissionResourceService(this.createDependencies(this.prismaOptions));
    }

    getService(overrides?: Partial<PermissionResourceServiceDependencies>): PermissionResourceService {
        if (!overrides || Object.keys(overrides).length === 0) {
            return this.sharedService;
        }
        const deps = this.createDependencies(this.prismaOptions, overrides);
        return new PermissionResourceService(deps);
    }

    private createDependencies(
        prismaOptions?: ProviderPrismaOptions,
        overrides?: Partial<PermissionResourceServiceDependencies>,
    ): PermissionResourceServiceDependencies {
        const dependencies = buildPermissionResourceServiceDependencies({
            prismaOptions: prismaOptions,
            overrides: overrides,
        });

        return {
            permissionRepository: dependencies.permissionRepository,
        };
    }
}

const defaultPermissionResourceServiceProvider = new PermissionResourceServiceProvider();

export function getPermissionResourceService(
    overrides?: Partial<PermissionResourceServiceDependencies>,
    options?: PermissionResourceServiceDependencyOptions,
): PermissionResourceService {
    const provider = options
        ? new PermissionResourceServiceProvider({ prismaOptions: options.prismaOptions })
        : defaultPermissionResourceServiceProvider;
    return provider.getService(overrides);
}
