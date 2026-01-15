import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IHRNotificationRepository } from '@/server/repositories/contracts/hr/notifications/hr-notification-repository-contract';
import {
    type HRNotificationCreateDTO,
    type HRNotificationDTO,
    type HRNotificationListFilters,
} from '@/server/types/hr/notifications';
import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export interface HrNotificationServiceDependencies {
    hrNotificationRepository: IHRNotificationRepository;
}

export interface CreateNotificationInput {
    authorization: RepositoryAuthorizationContext;
    notification: Omit<
        HRNotificationCreateDTO,
        'orgId' | 'dataClassification' | 'residencyTag' | 'createdByUserId' | 'correlationId'
    > &
    Partial<Pick<HRNotificationCreateDTO, 'dataClassification' | 'residencyTag' | 'createdByUserId' | 'correlationId'>>;
}

export interface CreateNotificationResult {
    notification: HRNotificationDTO;
}

export interface ListNotificationsInput {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
    filters?: HRNotificationListFilters;
}

export interface ListNotificationsResult {
    notifications: HRNotificationDTO[];
    unreadCount: number;
}

export interface MarkNotificationReadInput {
    authorization: RepositoryAuthorizationContext;
    notificationId: string;
    readAt?: Date | string;
}

export interface MarkNotificationReadResult {
    notification: HRNotificationDTO;
}

export interface MarkAllNotificationsReadInput {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
    before?: Date | string;
}

export interface MarkAllNotificationsReadResult {
    updatedCount: number;
    unreadCount: number;
}

export interface DeleteNotificationInput {
    authorization: RepositoryAuthorizationContext;
    notificationId: string;
}

export class HrNotificationService extends AbstractHrService {
    private readonly repo: IHRNotificationRepository;

    constructor(private readonly dependencies: HrNotificationServiceDependencies) {
        super();
        this.repo = dependencies.hrNotificationRepository;
    }

    async createNotification(input: CreateNotificationInput): Promise<CreateNotificationResult> {
        const authorization = input.authorization;
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.CREATE,
            resourceType: HR_RESOURCE.HR_NOTIFICATION,
            resourceAttributes: { targetUserId: input.notification.userId, type: input.notification.type },
        });

        const payload: HRNotificationCreateDTO = {
            ...input.notification,
            orgId: authorization.orgId,
            createdByUserId: input.notification.createdByUserId ?? authorization.userId,
            dataClassification: input.notification.dataClassification ?? authorization.dataClassification,
            residencyTag: input.notification.residencyTag ?? authorization.dataResidency,
            correlationId: input.notification.correlationId ?? authorization.correlationId,
        };

        const context = this.buildServiceContext(authorization, 'hr.notifications.create', {
            'hr.notifications.type': payload.type,
            'hr.notifications.priority': payload.priority,
        });

        const notification = await this.executeInServiceContext(context, 'hr.notifications.create', () =>
            this.repo.createNotification(authorization, payload),
        );

        return { notification };
    }

    async listNotifications(input: ListNotificationsInput): Promise<ListNotificationsResult> {
        const authorization = input.authorization;
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_NOTIFICATION,
            resourceAttributes: { userId: input.userId ?? authorization.userId, filters: input.filters },
        });
        const targetUser: string = input.userId ?? authorization.userId;

        const context = this.buildServiceContext(authorization, 'hr.notifications.list', {
            'hr.notifications.user': targetUser,
        });

        const notifications = await this.executeInServiceContext(context, 'hr.notifications.list', () =>
            this.repo.listNotifications(authorization, targetUser, input.filters),
        );

        const unreadCount: number = await this.repo.getUnreadCount(authorization, targetUser);

        return { notifications, unreadCount };
    }

    async markNotificationRead(input: MarkNotificationReadInput): Promise<MarkNotificationReadResult> {
        const authorization = input.authorization;
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_NOTIFICATION,
            resourceAttributes: { notificationId: input.notificationId },
        });
        const readAt = input.readAt ? new Date(input.readAt) : undefined;

        const context = this.buildServiceContext(authorization, 'hr.notifications.read', {
            'hr.notifications.notificationId': input.notificationId,
        });

        const notification = await this.executeInServiceContext(context, 'hr.notifications.read', () =>
            this.repo.markRead(authorization, input.notificationId, readAt),
        );

        return { notification };
    }

    async markAllNotificationsRead(
        input: MarkAllNotificationsReadInput,
    ): Promise<MarkAllNotificationsReadResult> {
        const authorization = input.authorization;
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_NOTIFICATION,
            resourceAttributes: { userId: input.userId ?? authorization.userId, before: input.before },
        });
        const before = input.before ? new Date(input.before) : undefined;
        const targetUser: string = input.userId ?? authorization.userId;

        const context = this.buildServiceContext(authorization, 'hr.notifications.read-all', {
            'hr.notifications.user': targetUser,
        });

        const updatedCount = await this.executeInServiceContext(context, 'hr.notifications.read-all', () =>
            this.repo.markAllRead(authorization, targetUser, before),
        );

        const unreadCount: number = await this.repo.getUnreadCount(authorization, targetUser);

        return { updatedCount, unreadCount };
    }

    async deleteNotification(input: DeleteNotificationInput): Promise<{ success: true }> {
        const authorization = input.authorization;
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.DELETE,
            resourceType: HR_RESOURCE.HR_NOTIFICATION,
            resourceAttributes: { notificationId: input.notificationId },
        });

        const context = this.buildServiceContext(authorization, 'hr.notifications.delete', {
            'hr.notifications.notificationId': input.notificationId,
        });

        await this.executeInServiceContext(context, 'hr.notifications.delete', () =>
            this.repo.deleteNotification(authorization, input.notificationId),
        );

        return { success: true };
    }

    private buildServiceContext(
        authorization: RepositoryAuthorizationContext,
        operation: string,
        metadata?: Record<string, unknown>,
    ): ServiceExecutionContext {
        return this.buildContext(authorization, {
            metadata: {
                auditSource: `service:${operation}`,
                ...metadata,
            },
        });
    }
}
