import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { IPlatformProvisioningRepository } from '@/server/repositories/contracts/platform';
import { PrismaPlatformProvisioningRepository } from '@/server/repositories/prisma/platform/prisma-platform-provisioning-repository';
import type { PrismaClientInstance } from '@/server/types/prisma';

export interface PlatformProvisioningRepositoryDependencies {
    provisioningRepository: IPlatformProvisioningRepository;
}

export type Overrides = Partial<PlatformProvisioningRepositoryDependencies>;

export interface PlatformProvisioningServiceDependencyOptions {
    prisma?: PrismaClientInstance;
    overrides?: Overrides;
}

export function buildPlatformProvisioningServiceDependencies(
    options?: PlatformProvisioningServiceDependencyOptions,
): PlatformProvisioningRepositoryDependencies {
    const prismaClient = options?.prisma ?? defaultPrismaClient;

    return {
        provisioningRepository:
            options?.overrides?.provisioningRepository ??
            new PrismaPlatformProvisioningRepository(prismaClient),
    };
}
