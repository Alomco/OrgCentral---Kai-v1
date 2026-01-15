import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaEnterpriseSettingsRepository } from '@/server/repositories/prisma/platform/settings/prisma-enterprise-settings-repository';
import type { IEnterpriseSettingsRepository } from '@/server/repositories/contracts/platform/settings/enterprise-settings-repository-contract';

export interface EnterpriseSettingsServiceDependencies {
    enterpriseSettingsRepository: IEnterpriseSettingsRepository;
}

export interface EnterpriseSettingsServiceDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<EnterpriseSettingsServiceDependencies>;
}

export function buildEnterpriseSettingsServiceDependencies(
    options?: EnterpriseSettingsServiceDependencyOptions,
): EnterpriseSettingsServiceDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;

    return {
        enterpriseSettingsRepository:
            options?.overrides?.enterpriseSettingsRepository ??
            new PrismaEnterpriseSettingsRepository({
                prisma: prismaClient,
                trace: options?.prismaOptions?.trace,
                onAfterWrite: options?.prismaOptions?.onAfterWrite,
            }),
    };
}
