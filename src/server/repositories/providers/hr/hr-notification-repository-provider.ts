import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaHRNotificationRepository } from '@/server/repositories/prisma/hr/notifications';
import type { IHRNotificationRepository } from '@/server/repositories/contracts/hr/notifications/hr-notification-repository-contract';

export interface HrNotificationRepositoryProviderOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<{ hrNotificationRepository: IHRNotificationRepository }>;
}

export function createHrNotificationRepository(
    options?: HrNotificationRepositoryProviderOptions,
): IHRNotificationRepository {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return options?.overrides?.hrNotificationRepository ?? new PrismaHRNotificationRepository(repoOptions);
}
