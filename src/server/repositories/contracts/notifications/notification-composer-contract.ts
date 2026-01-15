import type {
    ComposeNotificationInput,
    ComposeNotificationResult,
    MarkAllNotificationsInput,
    NotificationInboxInput,
    NotificationInboxResult,
    NotificationMutationInput,
    NotificationRecord,
} from '@/server/types/notifications';

export interface NotificationComposerContract {
    composeAndSend(input: ComposeNotificationInput): Promise<ComposeNotificationResult>;
    listInbox(input: NotificationInboxInput): Promise<NotificationInboxResult>;
    markRead(input: NotificationMutationInput): Promise<NotificationRecord>;
    markAllRead(input: MarkAllNotificationsInput): Promise<number>;
    deleteNotification(input: NotificationMutationInput): Promise<void>;
}
