import { z } from 'zod';
import { AuthorizationError } from '@/server/errors';
import {
    completeOnboardingInvite,
    type CompleteOnboardingInviteDependencies,
    type CompleteOnboardingInviteResult,
} from '@/server/use-cases/hr/onboarding/complete-onboarding-invite';
import { getCompleteOnboardingInviteDependencies } from '@/server/services/hr/onboarding/onboarding-controller-dependencies';

const payloadSchema = z
    .union([
        z.object({ inviteToken: z.string().min(1, 'Invitation token is required') }),
        z.object({ token: z.string().min(1, 'Invitation token is required') }),
    ])
    .transform((value) => ({ inviteToken: 'inviteToken' in value ? value.inviteToken : value.token }));

export interface CompleteOnboardingInvitePayload {
    inviteToken: string;
}

export interface CompleteOnboardingInviteActor {
    userId?: string;
    email?: string;
}

export async function completeOnboardingInviteController(
    payload: unknown,
    actor: CompleteOnboardingInviteActor,
    dependencies: CompleteOnboardingInviteDependencies = getCompleteOnboardingInviteDependencies(),
): Promise<CompleteOnboardingInviteResult> {
    const { inviteToken } = payloadSchema.parse(payload);
    const userId = actor.userId?.trim();
    if (!userId) {
        throw new AuthorizationError('Authenticated user id is required to accept onboarding invitations.');
    }
    const email = actor.email?.trim();
    if (!email) {
        throw new AuthorizationError('Authenticated email is required to accept onboarding invitations.');
    }

    return completeOnboardingInvite(dependencies, {
        inviteToken,
        userId,
        actorEmail: email,
    });
}
