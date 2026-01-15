import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { IHRSettingsRepository } from '@/server/repositories/contracts/hr/settings/hr-settings-repository-contract';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaHRSettingsRepository } from '@/server/repositories/prisma/hr/settings';

export interface HrSettingsRepositoryDependencies {
    hrSettingsRepository: IHRSettingsRepository;
}

export type Overrides = Partial<HrSettingsRepositoryDependencies>;

export interface HrSettingsServiceDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Overrides;
}

export function buildHrSettingsServiceDependencies(
    options?: HrSettingsServiceDependencyOptions,
): HrSettingsRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        hrSettingsRepository:
            options?.overrides?.hrSettingsRepository ??
            new PrismaHRSettingsRepository(repoOptions),
    };
}
