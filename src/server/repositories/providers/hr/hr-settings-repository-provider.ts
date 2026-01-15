import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaHRSettingsRepository } from '@/server/repositories/prisma/hr/settings';
import type { IHRSettingsRepository } from '@/server/repositories/contracts/hr/settings/hr-settings-repository-contract';

export interface HrSettingsRepositoryProviderOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<{ hrSettingsRepository: IHRSettingsRepository }>;
}

export function createHrSettingsRepository(
    options?: HrSettingsRepositoryProviderOptions,
): IHRSettingsRepository {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return options?.overrides?.hrSettingsRepository ?? new PrismaHRSettingsRepository(repoOptions);
}
