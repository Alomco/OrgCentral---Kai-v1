import { PrismaBrandingRepository } from '@/server/repositories/prisma/org/branding/prisma-branding-repository';
import { PrismaPlatformBrandingRepository } from '@/server/repositories/prisma/platform/branding/prisma-platform-branding-repository';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { prisma as defaultPrismaClient } from '@/server/lib/prisma';

import { BrandingService, type BrandingServiceDependencies } from './branding-service';

export interface BrandingServiceProviderOptions {
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

export class BrandingServiceProvider {
    private readonly prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
    private readonly defaultDependencies: BrandingServiceDependencies;
    private readonly sharedBrandingService: BrandingService;

    constructor(options?: BrandingServiceProviderOptions) {
        this.prismaOptions = options?.prismaOptions;
        this.defaultDependencies = this.createDependencies(this.prismaOptions);
        this.sharedBrandingService = new BrandingService(this.defaultDependencies);
    }

    getService(overrides?: Partial<BrandingServiceDependencies>): BrandingService {
        if (!overrides || Object.keys(overrides).length === 0) {
            return this.sharedBrandingService;
        }

        const deps = this.createDependencies(this.prismaOptions);

        return new BrandingService({
            orgBrandingRepository: overrides.orgBrandingRepository ?? deps.orgBrandingRepository,
            platformBrandingRepository:
                overrides.platformBrandingRepository ?? deps.platformBrandingRepository,
        });
    }

    private createDependencies(
        prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>,
    ): BrandingServiceDependencies {
        const prismaClient = prismaOptions?.prisma ?? defaultPrismaClient;
        const repoOptions = {
            prisma: prismaClient,
            trace: prismaOptions?.trace,
            onAfterWrite: prismaOptions?.onAfterWrite,
        };

        return {
            orgBrandingRepository: new PrismaBrandingRepository(repoOptions),
            platformBrandingRepository: new PrismaPlatformBrandingRepository(repoOptions),
        };
    }
}

const defaultBrandingServiceProvider = new BrandingServiceProvider();

export function getBrandingService(
    overrides?: Partial<BrandingServiceDependencies>,
    options?: BrandingServiceProviderOptions,
): BrandingService {
    const provider = options ? new BrandingServiceProvider(options) : defaultBrandingServiceProvider;
    return provider.getService(overrides);
}

export type BrandingServiceContract = Pick<BrandingService, 'getOrgBranding' | 'getPlatformBranding'>;
