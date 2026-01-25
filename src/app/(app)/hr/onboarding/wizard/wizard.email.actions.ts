'use server';

import { headers } from 'next/headers';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { checkExistingOnboardingTarget } from '@/server/use-cases/hr/onboarding/check-existing-onboarding-target';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';
import type { EmailCheckResult } from './wizard.types';
import { invitationRepository, profileRepository, userRepository } from './wizard.repositories';

export async function checkEmailExistsAction(email: string): Promise<EmailCheckResult> {
    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: HR_PERMISSION_PROFILE.ONBOARDING_SEND,
                auditSource: 'ui:invitation-wizard:email-check',
                action: HR_ACTION.SEND,
                resourceType: HR_RESOURCE_TYPE.ONBOARDING_INVITE,
                resourceAttributes: { email },
            },
        );
    } catch {
        return { exists: false };
    }

    try {
        const result = await checkExistingOnboardingTarget(
            {
                profileRepository,
                invitationRepository,
                userRepository,
            },
            {
                authorization: session.authorization,
                email: email.trim().toLowerCase(),
            },
        );

        if (!result.exists) {
            return { exists: false };
        }

        switch (result.kind) {
            case 'profile':
                return {
                    exists: true,
                    reason: 'An employee profile with this email already exists. Update the existing profile instead of inviting again.',
                };
            case 'pending_invitation':
                return {
                    exists: true,
                    reason: 'A pending invitation has already been sent to this email. You can resend it from the invitations list.',
                };
            case 'auth_user':
                return {
                    exists: true,
                    reason: 'This email already belongs to an OrgCentral user. Invite them to this organization from user management.',
                    actionUrl: '/org/members',
                    actionLabel: 'Go to user management',
                };
            default:
                return { exists: false };
        }
    } catch {
        return { exists: false };
    }
}
