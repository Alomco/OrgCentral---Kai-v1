import { Prisma, type NotificationPreference as PrismaNotificationPreference } from '@prisma/client';
import { OrgScopedPrismaRepository } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { INotificationPreferenceRepository } from '@/server/repositories/contracts/org/notifications/notification-preference-repository-contract';
import {
  mapPrismaNotificationPreferenceToDomain,
} from '@/server/repositories/mappers/org/notifications/notification-preference-mapper';
import type { NotificationPreference } from '@/server/types/hr-types';
import type {
  NotificationPreferenceFilters,
  NotificationPreferenceCreationData,
  NotificationPreferenceUpdateData,
} from './prisma-notification-preference-repository.types';

export class PrismaNotificationPreferenceRepository
  extends OrgScopedPrismaRepository
  implements INotificationPreferenceRepository {
  // BasePrismaRepository enforces DI

  async findById(id: string): Promise<PrismaNotificationPreference | null> {
    return this.prisma.notificationPreference.findUnique({ where: { id } });
  }

  async findByUserAndChannel(orgId: string, userId: string, channel: string): Promise<PrismaNotificationPreference | null> {
    return this.prisma.notificationPreference.findUnique({ where: { orgId_userId_channel: { orgId, userId, channel: channel as NotificationPreference['channel'] } } });
  }

  async findAll(filters?: NotificationPreferenceFilters): Promise<PrismaNotificationPreference[]> {
    const whereClause: Prisma.NotificationPreferenceWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters?.channel) {
      whereClause.channel = filters.channel as NotificationPreference['channel'];
    }

    if (filters?.enabled !== undefined) {
      whereClause.enabled = filters.enabled;
    }

    return this.prisma.notificationPreference.findMany({ where: whereClause, orderBy: { updatedAt: 'desc' } });
  }

  async create(data: NotificationPreferenceCreationData): Promise<PrismaNotificationPreference> {
    return this.prisma.notificationPreference.create({ data: { ...data, enabled: data.enabled ?? true } });
  }

  async update(id: string, data: NotificationPreferenceUpdateData): Promise<PrismaNotificationPreference> {
    return this.prisma.notificationPreference.update({ where: { id }, data });
  }

  async delete(id: string): Promise<PrismaNotificationPreference> {
    return this.prisma.notificationPreference.delete({ where: { id } });
  }

  // --- Contract-facing methods ---
  async createNotificationPreference(tenantId: string, preference: Omit<NotificationPreference, 'id' | 'updatedAt'>): Promise<void> {
    await this.create({
      orgId: tenantId,
      userId: preference.userId,
      channel: preference.channel,
      enabled: preference.enabled,
      quietHours: preference.quietHours === null ? Prisma.JsonNull : (preference.quietHours as Prisma.InputJsonValue | undefined),
      metadata: preference.metadata === null ? Prisma.JsonNull : (preference.metadata as Prisma.InputJsonValue | undefined),
    });
  }

  async updateNotificationPreference(tenantId: string, preferenceId: string, updates: Partial<Omit<NotificationPreference, 'id' | 'orgId' | 'userId'>>): Promise<void> {
    this.assertOrgRecord(await this.findById(preferenceId), tenantId);
    await this.update(preferenceId, updates as Prisma.NotificationPreferenceUpdateInput);
  }

  async getNotificationPreference(tenantId: string, preferenceId: string): Promise<NotificationPreference | null> {
    const rec = await this.findById(preferenceId);
    if (rec?.orgId !== tenantId) { return null; }
    return mapPrismaNotificationPreferenceToDomain(rec);
  }

  async getNotificationPreferencesByUser(tenantId: string, userId: string): Promise<NotificationPreference[]> {
    const records = await this.findAll({ orgId: tenantId, userId });
    return records.map(mapPrismaNotificationPreferenceToDomain);
  }

  async getNotificationPreferencesByOrganization(tenantId: string, filters?: { userId?: string; channel?: string; enabled?: boolean; }): Promise<NotificationPreference[]> {
    const records = await this.findAll({ orgId: tenantId, userId: filters?.userId, channel: filters?.channel, enabled: filters?.enabled });
    return records.map(mapPrismaNotificationPreferenceToDomain);
  }

  async deleteNotificationPreference(tenantId: string, preferenceId: string): Promise<void> {
    this.assertOrgRecord(await this.findById(preferenceId), tenantId);
    await this.delete(preferenceId);
  }

  async setDefaultNotificationPreferences(tenantId: string, userId: string): Promise<void> {
    const defaultPrefs: { channel: NotificationPreference['channel']; enabled: boolean }[] = [
      { channel: 'EMAIL' as NotificationPreference['channel'], enabled: true },
      { channel: 'IN_APP' as NotificationPreference['channel'], enabled: true },
    ];
    for (const pref of defaultPrefs) {
      const existing = await this.findByUserAndChannel(tenantId, userId, pref.channel);
      if (!existing) {
        await this.create({ orgId: tenantId, userId, channel: pref.channel, enabled: pref.enabled });
      }
    }
  }
}
