import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaAbacPolicyRepository } from '@/server/repositories/prisma/org/abac/prisma-abac-policy-repository';

export interface AbacPolicyRepositoryDependencies {
    abacPolicyRepository: IAbacPolicyRepository;
}

export type Overrides = Partial<AbacPolicyRepositoryDependencies>;

export interface AbacPolicyServiceDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Overrides;
}

export function buildAbacPolicyServiceDependencies(
    options?: AbacPolicyServiceDependencyOptions,
): AbacPolicyRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        abacPolicyRepository:
            options?.overrides?.abacPolicyRepository ??
            new PrismaAbacPolicyRepository(repoOptions),
    };
}
