'use server';

import { headers } from 'next/headers';

import { ValidationError } from '@/server/errors';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';

import { onboardingWizardSchema, type OnboardingWizardValues } from './wizard.schema';
import type { WizardSubmitResult } from './wizard.types';
import { resendPendingInvitation } from './wizard.email';
import { readPendingInvitationToken, resolveInvitableRoleNames } from './wizard.actions.helpers';
import {
    invitationRepository,
    organizationRepository,
    profileRepository,
    userRepository,
} from './wizard.repositories';
import {
    sendMembershipWizardInvite,
    sendOnboardingWizardInvite,
    validateLeaveTypeSelections,
} from './wizard.submit.helpers';

const ORG_INVITATION_RESOURCE = 'org.invitation';

export async function submitOnboardingWizardAction(
    values: OnboardingWizardValues,
): Promise<WizardSubmitResult> {
    const parsed = onboardingWizardSchema.safeParse(values);
    if (!parsed.success) {
        return {
            success: false,
            error: 'Invalid form data. Please review and try again.',
        };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    let headerStore: Headers;
    try {
        headerStore = await headers();
        session = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: parsed.data.useOnboarding
                    ? HR_PERMISSION_PROFILE.ONBOARDING_SEND
                    : { member: ['invite'] },
                auditSource: 'ui:invitation-wizard',
                action: parsed.data.useOnboarding ? HR_ACTION.SEND : 'org.invitation.create',
                resourceType: parsed.data.useOnboarding ? HR_RESOURCE_TYPE.ONBOARDING_INVITE : ORG_INVITATION_RESOURCE,
                resourceAttributes: {
                    email: parsed.data.email,
                    role: parsed.data.role,
                },
            },
        );
    } catch {
        return {
            success: false,
            error: parsed.data.useOnboarding
                ? 'Not authorized to invite employees.'
                : 'Not authorized to invite members.',
        };
    }

    const allowedRoles = await resolveInvitableRoleNames(session.authorization);
    if (!allowedRoles.includes(parsed.data.role)) {
        return {
            success: false,
            error: 'You are not authorized to invite this role.',
        };
    }

    const leaveTypeError = await validateLeaveTypeSelections(
        session.authorization,
        parsed.data.useOnboarding ? parsed.data.eligibleLeaveTypes : undefined,
    );
    if (leaveTypeError) {
        return {
            success: false,
            error: leaveTypeError,
        };
    }

    try {
        if (parsed.data.useOnboarding) {
            return await sendOnboardingWizardInvite(
                {
                    authorization: session.authorization,
                    headerStore,
                    values: parsed.data,
                },
                {
                    profileRepository,
                    invitationRepository,
                    organizationRepository,
                    userRepository,
                },
            );
        }

        return await sendMembershipWizardInvite({
            authorization: session.authorization,
            headerStore,
            values: parsed.data,
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            const pendingToken = readPendingInvitationToken(error.details);
            if (pendingToken) {
                return resendPendingInvitation(session.authorization, pendingToken);
            }

            return {
                success: false,
                error: error.message,
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create invitation.',
        };
    }
}
