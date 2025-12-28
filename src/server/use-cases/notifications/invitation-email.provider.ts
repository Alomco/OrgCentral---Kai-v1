import type { InvitationEmailDependencies } from './invitation-email.helpers';
import { PrismaInvitationRepository } from '@/server/repositories/prisma/auth/invitations';
import { ResendNotificationAdapter } from '@/server/services/platform/notifications/adapters/resend-notification-adapter';

export function getInvitationEmailDependencies(
    overrides?: Partial<InvitationEmailDependencies>,
): InvitationEmailDependencies {
    return {
        invitationRepository: overrides?.invitationRepository ?? new PrismaInvitationRepository(),
        deliveryAdapters:
            overrides?.deliveryAdapters ??
            [
                new ResendNotificationAdapter({
                    apiKey: process.env.RESEND_API_KEY,
                    fromAddress: process.env.NOTIFICATION_FROM_EMAIL ?? 'OrgCentral <no-reply@orgcentral.test>',
                }),
            ],
        invitationLinkBuilder: overrides?.invitationLinkBuilder,
    };
}
