import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaComplianceReminderSettingsRepository } from '@/server/repositories/prisma/hr/compliance';
import type { IComplianceReminderSettingsRepository } from '@/server/repositories/contracts/hr/compliance/compliance-reminder-settings-repository-contract';

export function createComplianceReminderSettingsRepository(
    options?: PrismaOptions,
): IComplianceReminderSettingsRepository {
    const prismaClient = options?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.trace,
        onAfterWrite: options?.onAfterWrite,
    };

    return new PrismaComplianceReminderSettingsRepository(repoOptions);
}
