import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IHRNotificationRepository } from '@/server/repositories/contracts/hr/notifications/hr-notification-repository-contract';
import { mapDomainHRNotificationToPrismaCreate, mapPrismaHRNotificationToDomain } from '@/server/repositories/mappers/hr/notifications/hr-notification-mapper';
import type { HRNotification } from '@/server/types/hr-ops-types';
import { Prisma } from '@prisma/client';

export class PrismaHRNotificationRepository extends BasePrismaRepository implements IHRNotificationRepository {
  async createNotification(
    orgId: string,
    input: Omit<HRNotification, 'id' | 'isRead' | 'readAt' | 'createdAt'> & { isRead?: boolean; readAt?: Date | null },
  ): Promise<HRNotification> {
    const data = mapDomainHRNotificationToPrismaCreate({ ...input, isRead: input.isRead ?? false, readAt: input.readAt ?? null });
    const rec = await this.prisma.hRNotification.create({ data });
    if (rec.orgId !== orgId) {
      throw new Error('Cross-tenant notification creation mismatch');
    }
    return mapPrismaHRNotificationToDomain(rec);
  }

  async markRead(orgId: string, notificationId: string, readAt?: Date): Promise<HRNotification> {
    const rec = await this.prisma.hRNotification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: readAt ?? new Date() },
    });
    if (rec.orgId !== orgId) {
      throw new Error('Cross-tenant notification update mismatch');
    }
    return mapPrismaHRNotificationToDomain(rec);
  }

  async markAllRead(orgId: string, userId: string, before?: Date): Promise<number> {
    const res = await this.prisma.hRNotification.updateMany({
      where: { orgId, userId, isRead: false, createdAt: before ? { lte: before } : undefined },
      data: { isRead: true, readAt: new Date() },
    });
    return res.count;
  }

  async listNotifications(orgId: string, userId: string, filters?: { unreadOnly?: boolean; since?: Date; until?: Date }): Promise<HRNotification[]> {
    const where: Prisma.HRNotificationWhereInput = { orgId, userId };
    if (filters?.unreadOnly) { where.isRead = false; }
    if (filters?.since || filters?.until) {
      where.createdAt = { gte: filters.since ?? undefined, lte: filters.until ?? undefined };
    }
    const recs = await this.prisma.hRNotification.findMany({ where, orderBy: { createdAt: 'desc' } });
    return recs.map(mapPrismaHRNotificationToDomain);
  }

  async deleteNotification(orgId: string, notificationId: string): Promise<void> {
    const rec = await this.prisma.hRNotification.findUnique({ where: { id: notificationId }, select: { orgId: true } });
    if (!rec || rec.orgId !== orgId) {
      return;
    }
    await this.prisma.hRNotification.delete({ where: { id: notificationId } });
  }
}
