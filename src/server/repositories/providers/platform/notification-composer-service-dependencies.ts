import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import {
  PrismaNotificationRepository,
  type PrismaNotificationRepositoryOptions,
} from '@/server/repositories/prisma/notifications/prisma-notification-repository';
import { PrismaNotificationPreferenceRepository } from '@/server/repositories/prisma/org/notifications';
import type { NotificationAuditWriter } from '@/server/repositories/contracts/notifications';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { INotificationRepository } from '@/server/repositories/contracts/notifications';
import type { INotificationPreferenceRepository } from '@/server/repositories/contracts/org/notifications/notification-preference-repository-contract';

const notificationAuditWriter: NotificationAuditWriter = {
  async write(envelope) {
    await recordAuditEvent({
      orgId: envelope.orgId,
      userId: envelope.userId,
      eventType: 'DATA_CHANGE',
      action: 'notification.audit',
      resource: 'notification',
      resourceId: envelope.notificationId,
      payload: JSON.parse(JSON.stringify(envelope)) as Record<string, unknown>,
      correlationId: envelope.auditMetadata.correlationId,
      residencyZone: envelope.residencyTag,
      classification: envelope.dataClassification,
      auditSource: envelope.auditMetadata.auditSource,
    });
  },
};

export interface NotificationComposerRepositoryDependencies {
  notificationRepository: INotificationRepository;
  preferenceRepository?: INotificationPreferenceRepository;
}

export type Overrides = Partial<NotificationComposerRepositoryDependencies>;

export interface NotificationComposerServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildNotificationComposerServiceDependencies(
  options?: NotificationComposerServiceDependencyOptions,
): NotificationComposerRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };
  const notificationRepoOptions: PrismaNotificationRepositoryOptions = {
    prisma: repoOptions.prisma,
    trace: repoOptions.trace,
    onAfterWrite: repoOptions.onAfterWrite,
    auditWriter: notificationAuditWriter,
  };

  return {
    notificationRepository:
      options?.overrides?.notificationRepository ?? new PrismaNotificationRepository(notificationRepoOptions),
    preferenceRepository:
      options?.overrides?.preferenceRepository ?? new PrismaNotificationPreferenceRepository(repoOptions),
  };
}
