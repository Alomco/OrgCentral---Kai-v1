import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { INotificationPreferenceRepository } from '@/server/repositories/contracts/org/notifications/notification-preference-repository-contract';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaNotificationPreferenceRepository } from '@/server/repositories/prisma/org/notifications';

export interface NotificationPreferenceRepositoryDependencies {
    preferenceRepository: INotificationPreferenceRepository;
}

export type Overrides = Partial<NotificationPreferenceRepositoryDependencies>;

export interface NotificationPreferenceServiceDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Overrides;
}

export function buildNotificationPreferenceServiceDependencies(
    options?: NotificationPreferenceServiceDependencyOptions,
): NotificationPreferenceRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        preferenceRepository:
            options?.overrides?.preferenceRepository ??
            new PrismaNotificationPreferenceRepository(repoOptions),
    };
}
