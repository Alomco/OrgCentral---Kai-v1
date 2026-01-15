import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { PrismaClientInstance } from '@/server/types/prisma';

export interface AuthOrganizationBridgeServiceOptions {
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

export interface AuthOrganizationBridgeServiceDependencies {
    prisma: PrismaClientInstance;
}

export function buildAuthOrganizationBridgeServiceDependencies(
    options?: AuthOrganizationBridgeServiceOptions,
): AuthOrganizationBridgeServiceDependencies {
    return {
        prisma: options?.prismaOptions?.prisma ?? defaultPrismaClient,
    };
}
