import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaAbsenceSettingsRepository } from '@/server/repositories/prisma/hr/absences';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';

export interface AbsenceSettingsRepositoryProviderOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<{ absenceSettingsRepository: IAbsenceSettingsRepository }>;
}

export function createAbsenceSettingsRepository(
    options?: AbsenceSettingsRepositoryProviderOptions,
): IAbsenceSettingsRepository {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return (
        options?.overrides?.absenceSettingsRepository ??
        new PrismaAbsenceSettingsRepository(repoOptions)
    );
}
