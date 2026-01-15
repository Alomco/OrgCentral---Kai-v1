import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { IBrandingRepository } from '@/server/repositories/contracts/org/branding/branding-repository-contract';
import type { BrandingServiceDependencies } from '@/server/repositories/contracts/org/branding/branding-service-dependencies';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaBrandingRepository } from '@/server/repositories/prisma/org/branding/prisma-branding-repository';
import { PrismaPlatformBrandingRepository } from '@/server/repositories/prisma/platform/branding/prisma-platform-branding-repository';

export interface BrandingRepositoryDependencies {
    brandingRepository: IBrandingRepository;
}

export type BrandingRepositoryOverrides = Partial<BrandingRepositoryDependencies>;

export interface BrandingRepositoryDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: BrandingRepositoryOverrides;
}

export function buildBrandingRepositoryDependencies(
    options?: BrandingRepositoryDependencyOptions,
): BrandingRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        brandingRepository:
            options?.overrides?.brandingRepository ??
            new PrismaBrandingRepository(repoOptions),
    };
}

export type BrandingServiceOverrides = Partial<BrandingServiceDependencies>;

export interface BrandingServiceDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: BrandingServiceOverrides;
}

export function buildBrandingServiceDependencies(
    options?: BrandingServiceDependencyOptions,
): BrandingServiceDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        orgBrandingRepository:
            options?.overrides?.orgBrandingRepository ??
            new PrismaBrandingRepository(repoOptions),
        platformBrandingRepository:
            options?.overrides?.platformBrandingRepository ??
            new PrismaPlatformBrandingRepository(repoOptions),
    };
}
