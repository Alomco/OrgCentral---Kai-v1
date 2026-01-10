'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getInvitationEmailDependencies } from '@/server/use-cases/notifications/invitation-email.provider';
import { resendInvitationEmail } from '@/server/use-cases/notifications/resend-invitation-email';
import { isInvitationDeliverySuccessful } from '@/server/use-cases/notifications/invitation-email.helpers';

export type ResendOrgInvitationActionState =
    | { status: 'idle' }
    | { status: 'success'; message: string }
    | { status: 'error'; message: string };

const payloadSchema = z.object({
    token: z.string().trim().min(1, 'Invitation token is required.'),
});

export async function resendOrgInvitationAction(
    _previous: ResendOrgInvitationActionState,
    formData: FormData,
): Promise<ResendOrgInvitationActionState> {
    void _previous;

    const parsed = payloadSchema.safeParse({
        token: formData.get('token'),
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid invitation request.' };
    }

    try {
        const headerStore = await headers();
        const { authorization } = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: { member: ['invite'] },
                auditSource: 'ui:org-members:invitation:resend',
                resourceType: 'org.invitation',
                action: 'resend',
                resourceAttributes: { token: parsed.data.token },
            },
        );

        const dependencies = getInvitationEmailDependencies();
        const result = await resendInvitationEmail(dependencies, {
            authorization,
            invitationToken: parsed.data.token,
        });

        if (!isInvitationDeliverySuccessful(result.delivery)) {
            return {
                status: 'error',
                message: result.delivery.status === 'skipped'
                    ? result.delivery.detail ?? 'Email delivery is not configured.'
                    : 'Invitation email could not be delivered.',
            };
        }

        return { status: 'success', message: 'Invitation resent.' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to resend invitation.';
        return { status: 'error', message };
    }
}
