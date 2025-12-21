import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IHRNotificationRepository } from '@/server/repositories/contracts/hr/notifications/hr-notification-repository-contract';
import { mapDomainHRNotificationToPrismaCreate, mapPrismaHRNotificationToDomain } from '@/server/repositories/mappers/hr/notifications/hr-notification-mapper';
import type {
  HRNotificationCreateDTO,
  HRNotificationDTO,
  HRNotificationListFilters,
} from '@/server/types/hr/notifications';
import type { Prisma, HRNotification, DataClassificationLevel, DataResidencyZone, $Enums } from '@prisma/client';
import { AuthorizationError } from '@/server/errors';
import { invalidateHrNotifications, registerHrNotificationTag } from '@/server/lib/cache-tags/hr-notifications';

const toPrismaNotificationTypes = (
    types?: HRNotificationListFilters['types'],
): $Enums.HRNotificationType[] | undefined => {
    if (!types?.length) {
        return undefined;
    }
    return types.map((type) => type as $Enums.HRNotificationType);
};

const toPrismaNotificationPriorities = (
    priorities?: HRNotificationListFilters['priorities'],
): $Enums.NotificationPriority[] | undefined => {
    if (!priorities?.length) {
        return undefined;
    }
    return priorities.map((priority) => priority as $Enums.NotificationPriority);
};

export class PrismaHRNotificationRepository extends BasePrismaRepository implements IHRNotificationRepository {
    async createNotification(orgId: string, input: HRNotificationCreateDTO): Promise<HRNotificationDTO> {
        if (input.orgId !== orgId) {
            throw new AuthorizationError('Cross-tenant notification creation mismatch', { orgId });
        }
        const isRead = input.isRead ?? false;
        const readAt = input.readAt ?? (isRead ? new Date() : null);
        const data = mapDomainHRNotificationToPrismaCreate({
            ...input,
            isRead,
            readAt,
        });
        const rec = await this.prisma.hRNotification.create({ data });
        this.assertTenantRecord(rec, orgId);
        const domain = mapPrismaHRNotificationToDomain(rec);
        await invalidateHrNotifications(this.buildCacheContext(rec));
        return domain;
    }

    async markRead(orgId: string, notificationId: string, readAt?: Date): Promise<HRNotificationDTO> {
        const rec = await this.prisma.hRNotification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: readAt ?? new Date() },
        });
        this.assertTenantRecord(rec, orgId);
        const domain = mapPrismaHRNotificationToDomain(rec);
        await invalidateHrNotifications(this.buildCacheContext(rec));
        return domain;
    }

    async markAllRead(orgId: string, userId: string, before?: Date): Promise<number> {
        const res = await this.prisma.hRNotification.updateMany({
            where: { orgId, userId, isRead: false, createdAt: before ? { lte: before } : undefined },
            data: { isRead: true, readAt: new Date() },
        });
        const context = await this.resolveCacheContext(orgId, userId);
        await invalidateHrNotifications(context);
        return res.count;
    }

    async listNotifications(
        orgId: string,
        userId: string,
        filters?: HRNotificationListFilters,
    ): Promise<HRNotificationDTO[]> {
        const typeFilter = toPrismaNotificationTypes(filters?.types);
        const priorityFilter = toPrismaNotificationPriorities(filters?.priorities);
        const where: Prisma.HRNotificationWhereInput = {
            orgId,
            userId,
            isRead: filters?.unreadOnly ? false : undefined,
            type: typeFilter ? { in: typeFilter } : undefined,
            priority: priorityFilter ? { in: priorityFilter } : undefined,
        };

        if (filters?.since || filters?.until) {
            where.createdAt = {
                gte: filters.since ? new Date(filters.since) : undefined,
                lte: filters.until ? new Date(filters.until) : undefined,
            };
        }

        if (filters?.includeExpired === false) {
            where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
        }

        const recs = await this.prisma.hRNotification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: filters?.limit,
        });
        if (recs.length) {
            registerHrNotificationTag(this.buildCacheContext(recs[0]));
        }
        return recs.map(mapPrismaHRNotificationToDomain);
    }

    async getUnreadCount(orgId: string, userId: string): Promise<number> {
        return this.prisma.hRNotification.count({ where: { orgId, userId, isRead: false } });
    }

    async deleteNotification(orgId: string, notificationId: string): Promise<void> {
        const rec = await this.prisma.hRNotification.findUnique({
            where: { id: notificationId },
            select: { orgId: true },
        });
        if (rec?.orgId !== orgId) {
            return;
        }
        await this.prisma.hRNotification.delete({ where: { id: notificationId } });
        const context = await this.resolveCacheContext(orgId);
        await invalidateHrNotifications(context);
    }

    private buildCacheContext(
        record: Pick<HRNotification, 'orgId' | 'dataClassification' | 'residencyTag'>,
    ): { orgId: string; classification: DataClassificationLevel; residency: DataResidencyZone } {
        const { orgId, dataClassification, residencyTag } = record;
        return {
            orgId,
            classification: dataClassification,
            residency: residencyTag,
        };
    }

    private async resolveCacheContext(orgId: string, userId?: string): Promise<{
        orgId: string;
        classification: DataClassificationLevel;
        residency: DataResidencyZone;
    }> {
        const sample = await this.prisma.hRNotification.findFirst({
            where: { orgId, userId },
            select: { dataClassification: true, residencyTag: true },
        });

        return {
            orgId,
            classification: sample?.dataClassification ?? 'OFFICIAL',
            residency: sample?.residencyTag ?? 'UK_ONLY',
        };
    }
}
