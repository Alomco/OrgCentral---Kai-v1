'use server';

import { headers as nextHeaders } from 'next/headers';

import { AuthorizationError, ValidationError } from '@/server/errors';
import { auth } from '@/server/lib/auth';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { PrismaInvitationRepository } from '@/server/repositories/prisma/auth/invitations';
import { acceptInvitationController } from '@/server/api-adapters/auth/accept-invitation';
import { completeOnboardingInviteController } from '@/server/api-adapters/hr/onboarding/complete-onboarding-invite';
import { loadOrgSettings } from '@/server/services/org/settings/org-settings-store';
import { shouldUseOnboardingFlowForInvitation } from '@/server/use-cases/auth/invitations/resolve-invitation-flow';
import { resolveWorkspaceSetupState } from '@/server/use-cases/auth/sessions/workspace-setup-state';

import type { AcceptInvitationActionState } from './accept-invitation.state';

export async function acceptInvitationAction(
    _previous: AcceptInvitationActionState,
    formData: FormData,
): Promise<AcceptInvitationActionState> {
    void _previous;

    try {
        const token = resolveToken(formData);
        const headerStore = await nextHeaders();
        const session = await auth.api.getSession({ headers: headerStore });
        if (!session?.user) {
            throw new AuthorizationError('Authenticated session is required to accept invitations.');
        }
        const actor = requireSessionUser(session);
        if (!actor.email) {
            throw new AuthorizationError('Authenticated email address is required to accept invitations.');
        }

        const invitationRepository = new PrismaInvitationRepository();
        const invitation = await invitationRepository.findByToken(token);
        if (!invitation) {
            throw new ValidationError('Invitation not found.');
        }

        const useOnboardingFlow = shouldUseOnboardingFlowForInvitation(invitation);
        const result = useOnboardingFlow
            ? await completeOnboardingInviteController({ inviteToken: token }, actor, headerStore)
            : await acceptInvitationController({ token }, actor, headerStore);

        const orgSettings = await loadOrgSettings(result.organizationId);
        const setupPath = `/two-factor/setup?next=${encodeURIComponent('/hr/profile')}`;
        const requiresMfaSetup = orgSettings.security.mfaRequired && !session.user.twoFactorEnabled;
        let nextPath = '/api/auth/post-login';

        if (requiresMfaSetup) {
            nextPath = setupPath;
        } else {
            const setupState = await resolveWorkspaceSetupState({
                authUserId: session.user.id,
                orgId: result.organizationId,
                userId: actor.userId,
                roleKey: null,
            });
            if (setupState.requiresPasswordSetup) {
                nextPath = setupPath;
            } else if (setupState.requiresProfileSetup) {
                nextPath = '/hr/profile';
            }
        }

        return {
            status: 'success',
            organizationName: result.organizationName,
            alreadyMember: result.alreadyMember,
            requiresSetup: nextPath !== '/api/auth/post-login',
            nextPath,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to accept invitation.',
        };
    }
}

function resolveToken(formData: FormData): string {
    const value = formData.get('token');
    if (typeof value !== 'string') {
        throw new ValidationError('Invitation token is required.');
    }
    const trimmed = value.trim();
    if (!trimmed) {
        throw new ValidationError('Invitation token is required.');
    }
    return trimmed;
}
