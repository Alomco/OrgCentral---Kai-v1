import type { InvitationEmailDependencies } from './invitation-email.helpers';
import { PrismaInvitationRepository } from '@/server/repositories/prisma/auth/invitations';
import { appLogger } from '@/server/logging/structured-logger';
import { SenderXNotificationAdapter } from '@/server/services/platform/notifications/adapters/senderx-notification-adapter';
import type {
    NotificationDeliveryAdapter,
    NotificationDeliveryResult,
} from '@/server/services/platform/notifications/notification-types';

const DEFAULT_FROM_ADDRESS =
    process.env.SENDERX_FROM_EMAIL ?? process.env.NOTIFICATION_FROM_EMAIL ?? 'OrgCentral <no-reply@orgcentral.test>';
const DEFAULT_BRAND_NAME = process.env.SENDERX_BRAND_NAME;
const DEFAULT_ENDPOINT = process.env.SENDERX_ENDPOINT;

let loggedMissingEmailConfig = false;

class DisabledEmailAdapter implements NotificationDeliveryAdapter {
    readonly provider = 'senderx';
    readonly channel = 'EMAIL';

    constructor(private readonly detail: string) {}

    send(): Promise<NotificationDeliveryResult> {
        return Promise.resolve({
            provider: this.provider,
            channel: this.channel,
            status: 'skipped',
            detail: this.detail,
        });
    }
}

function buildInvitationDeliveryAdapters(): NotificationDeliveryAdapter[] {
    const apiKey = process.env.SENDERX_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
        if (!loggedMissingEmailConfig) {
            loggedMissingEmailConfig = true;
            appLogger.warn('notifications.invitation-email.config-missing', {
                provider: 'senderx',
                missing: ['SENDERX_API_KEY'],
            });
        }

        return [new DisabledEmailAdapter('Email delivery is not configured.')];
    }

    return [
        new SenderXNotificationAdapter({
            apiKey,
            endpoint: DEFAULT_ENDPOINT,
            defaultBrandName: DEFAULT_BRAND_NAME,
            defaultFromAddress: DEFAULT_FROM_ADDRESS,
            useTracker: process.env.SENDERX_USE_TRACKER === 'true',
        }),
    ];
}

export function getInvitationEmailDependencies(
    overrides?: Partial<InvitationEmailDependencies>,
): InvitationEmailDependencies {
    return {
        invitationRepository: overrides?.invitationRepository ?? new PrismaInvitationRepository(),
        deliveryAdapters:
            overrides?.deliveryAdapters ?? buildInvitationDeliveryAdapters(),
        invitationLinkBuilder: overrides?.invitationLinkBuilder,
    };
}
