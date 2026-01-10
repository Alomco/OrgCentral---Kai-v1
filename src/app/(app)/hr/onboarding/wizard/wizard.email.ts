'use server';

import { invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_ONBOARDING_INVITATIONS } from '@/server/repositories/cache-scopes';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { isInvitationDeliverySuccessful } from '@/server/use-cases/notifications/invitation-email.helpers';
import { resendInvitationEmail } from '@/server/use-cases/notifications/resend-invitation-email';
import { sendInvitationEmail } from '@/server/use-cases/notifications/send-invitation-email';
import { getInvitationEmailDependencies } from '@/server/use-cases/notifications/invitation-email.provider';

import type { WizardSubmitResult } from './wizard.types';

export interface InvitationDeliverySummary {
    delivered: boolean;
    invitationUrl?: string;
}

export async function attemptInvitationEmail(
    authorization: RepositoryAuthorizationContext,
    token: string,
): Promise<InvitationDeliverySummary> {
    try {
        const dependencies = getInvitationEmailDependencies();
        const result = await sendInvitationEmail(dependencies, {
            authorization,
            invitationToken: token,
        });
        return {
            delivered: isInvitationDeliverySuccessful(result.delivery),
            invitationUrl: result.invitationUrl,
        };
    } catch {
        return {
            delivered: false,
        };
    }
}

export async function resendPendingInvitation(
    authorization: RepositoryAuthorizationContext,
    token: string,
): Promise<WizardSubmitResult> {
    try {
        const dependencies = getInvitationEmailDependencies();
        const resendResult = await resendInvitationEmail(dependencies, {
            authorization,
            invitationToken: token,
        });
        const delivered = isInvitationDeliverySuccessful(resendResult.delivery);

        await invalidateOrgCache(
            authorization.orgId,
            CACHE_SCOPE_ONBOARDING_INVITATIONS,
            authorization.dataClassification,
            authorization.dataResidency,
        );

        return {
            success: true,
            token,
            invitationUrl: resendResult.invitationUrl,
            emailDelivered: delivered,
            message: delivered
                ? 'Invitation already exists. Email resent.'
                : 'Invitation already exists. Share the invite link manually.',
        };
    } catch (resendError) {
        return {
            success: false,
            error: resendError instanceof Error ? resendError.message : 'Unable to resend invitation.',
        };
    }
}
