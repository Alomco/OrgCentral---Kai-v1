import { PermissionResolutionService, type PermissionResolutionServiceDependencies } from './permission-resolution-service';
import { buildPermissionResolutionServiceDependencies, type PermissionResolutionServiceDependencyOptions } from '@/server/repositories/providers/security/permission-resolution-service-dependencies';

let defaultPermissionResolutionServiceProvider: PermissionResolutionServiceProvider | null = null;

export interface PermissionResolutionServiceProviderOptions {
    prismaOptions?: PermissionResolutionServiceDependencyOptions['prismaOptions'];
}

export class PermissionResolutionServiceProvider {
    private readonly prismaOptions?: PermissionResolutionServiceDependencyOptions['prismaOptions'];
    private readonly sharedService: PermissionResolutionService;

    constructor(options?: PermissionResolutionServiceProviderOptions) {
        this.prismaOptions = options?.prismaOptions;
        this.sharedService = new PermissionResolutionService(this.createDependencies(this.prismaOptions));
    }

    getService(overrides?: Partial<PermissionResolutionServiceDependencies>): PermissionResolutionService {
        if (!overrides || Object.keys(overrides).length === 0) {
            return this.sharedService;
        }
        const deps = this.createDependencies(this.prismaOptions, overrides);
        return new PermissionResolutionService(deps);
    }

    private createDependencies(
        prismaOptions?: PermissionResolutionServiceDependencyOptions['prismaOptions'],
        overrides?: Partial<PermissionResolutionServiceDependencies>,
    ): PermissionResolutionServiceDependencies {
        const dependencies = buildPermissionResolutionServiceDependencies({
            prismaOptions: prismaOptions,
            overrides: overrides,
        });

        return {
            roleRepository: dependencies.roleRepository,
        };
    }
}

export function getPermissionResolutionService(
    overrides?: Partial<PermissionResolutionServiceDependencies>,
    options?: PermissionResolutionServiceDependencyOptions,
): PermissionResolutionService {
    // Lazy init to avoid eager graph construction that can trigger circular imports at module load.
    const provider = options
        ? new PermissionResolutionServiceProvider({ prismaOptions: options.prismaOptions })
        : (defaultPermissionResolutionServiceProvider ??=
            new PermissionResolutionServiceProvider());
    return provider.getService(overrides);
}
