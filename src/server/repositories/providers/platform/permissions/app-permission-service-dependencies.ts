import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaAppPermissionRepository } from '@/server/repositories/prisma/platform/permissions/prisma-app-permission-repository';
import type { IAppPermissionRepository } from '@/server/repositories/contracts/platform/permissions/app-permission-repository-contract';

export interface AppPermissionServiceDependencies {
    appPermissionRepository: IAppPermissionRepository;
}

export interface AppPermissionServiceDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<AppPermissionServiceDependencies>;
}

export function buildAppPermissionServiceDependencies(
    options?: AppPermissionServiceDependencyOptions,
): AppPermissionServiceDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;

    return {
        appPermissionRepository:
            options?.overrides?.appPermissionRepository ??
            new PrismaAppPermissionRepository({
                prisma: prismaClient,
                trace: options?.prismaOptions?.trace,
                onAfterWrite: options?.prismaOptions?.onAfterWrite,
            }),
    };
}
