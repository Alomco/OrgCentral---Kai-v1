import type {
    NotificationCreateInput,
    NotificationListFilters,
    NotificationRecord,
} from '@/server/types/notification-schemas';
import type { JsonRecord } from '@/server/types/json';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export {
    NOTIFICATION_PRIORITIES,
    NOTIFICATION_SCHEMA_VERSION,
    NOTIFICATION_TOPICS,
    notificationAuditSchema,
    notificationCreateSchema,
    notificationEnvelopeSchema,
    notificationListFiltersSchema,
    notificationRecordSchema,
} from '@/server/types/notification-schemas';

export type {
    NotificationAuditMetadata,
    NotificationCreateInput,
    NotificationEnvelope,
    NotificationListFilters,
    NotificationPriorityCode,
    NotificationRecord,
    NotificationTopicCode,
    NotificationValidationContext,
} from '@/server/types/notification-schemas';

export type NotificationChannel = 'EMAIL' | 'IN_APP' | 'SMS';

export interface DeliveryTarget {
    channel: NotificationChannel;
    to: string;
    provider?: string;
}

export interface NotificationDeliveryPayload {
    orgId: string;
    userId: string;
    to: string;
    subject: string;
    body: string;
    actionUrl?: string | null;
    correlationId?: string;
}

export interface NotificationDeliveryResult {
    provider: string;
    channel: NotificationChannel;
    status: 'sent' | 'queued' | 'skipped' | 'failed';
    detail?: string;
    externalId?: string;
}

export interface NotificationDeliveryAdapter {
    readonly provider: string;
    readonly channel: NotificationChannel;
    send(payload: NotificationDeliveryPayload): Promise<NotificationDeliveryResult>;
}

export interface NotificationAbacContext {
    action?: string;
    resourceType?: string;
    resourceAttributes?: JsonRecord;
}

export type NormalizableNotificationInput = Pick<
    NotificationCreateInput,
    'userId' | 'title' | 'body' | 'topic' | 'priority'
> &
    Partial<Omit<NotificationCreateInput, 'userId' | 'title' | 'body' | 'topic' | 'priority'>>;

export interface ComposeNotificationInput {
    authorization: RepositoryAuthorizationContext;
    notification: NormalizableNotificationInput;
    targets?: DeliveryTarget[];
    abac?: NotificationAbacContext;
}

export interface ComposeNotificationResult {
    notification: NotificationRecord;
    deliveries: NotificationDeliveryResult[];
}

export interface NotificationInboxInput {
    authorization: RepositoryAuthorizationContext;
    filters?: NotificationListFilters;
    userId?: string;
}

export interface NotificationInboxResult {
    notifications: NotificationRecord[];
    unreadCount: number;
}

export interface NotificationMutationInput {
    authorization: RepositoryAuthorizationContext;
    notificationId: string;
}

export interface MarkAllNotificationsInput {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
    before?: Date | string;
}
