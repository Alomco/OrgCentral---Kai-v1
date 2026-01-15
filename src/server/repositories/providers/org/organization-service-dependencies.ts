import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';

export interface OrganizationRepositoryDependencies {
    organizationRepository: IOrganizationRepository;
}

export type Overrides = Partial<OrganizationRepositoryDependencies>;

export interface OrganizationServiceDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Overrides;
}

export function buildOrganizationServiceDependencies(
    options?: OrganizationServiceDependencyOptions,
): OrganizationRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        organizationRepository:
            options?.overrides?.organizationRepository ??
            new PrismaOrganizationRepository(repoOptions),
    };
}
