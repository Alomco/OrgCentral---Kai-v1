import { NextResponse } from 'next/server';
import { completeOnboardingInviteController } from '@/server/api-adapters/hr/onboarding/complete-onboarding-invite';
import { acceptInvitationController } from '@/server/api-adapters/auth/accept-invitation';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { AuthorizationError, ValidationError } from '@/server/errors';
import { auth, type AuthSession } from '@/server/lib/auth';
import { PrismaInvitationRepository } from '@/server/repositories/prisma/auth/invitations';

function extractToken(payload: unknown): string {
    if (!payload || typeof payload !== 'object') {
        throw new ValidationError('Invitation token is required.');
    }
    const record = payload as { token?: unknown; inviteToken?: unknown };
    const token = typeof record.inviteToken === 'string' ? record.inviteToken : record.token;
    if (!token || token.trim().length === 0) {
        throw new ValidationError('Invitation token is required.');
    }
    return token.trim();
}

function shouldUseOnboardingFlow(payload: { employeeId?: string; employeeNumber?: string; onboardingTemplateId?: string | null }): boolean {
    return Boolean(
        (typeof payload.employeeId === 'string' && payload.employeeId.trim().length > 0) ||
            (typeof payload.employeeNumber === 'string' && payload.employeeNumber.trim().length > 0) ||
            (typeof payload.onboardingTemplateId === 'string' && payload.onboardingTemplateId.trim().length > 0),
    );
}

function requireActor(session: AuthSession | null): { userId: string; email: string } {
    const { userId, email } = requireSessionUser(session);
    if (!email) {
        throw new AuthorizationError('Authenticated email address is required to accept invitations.');
    }

    return { userId, email };
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const payload = (await request.json()) as unknown;
        const token = extractToken(payload);
        const session = await auth.api.getSession({ headers: request.headers });
        const actor = requireActor(session);
        const invitationRepository = new PrismaInvitationRepository();
        const invitation = await invitationRepository.findByToken(token);
        const useOnboardingFlow = invitation ? shouldUseOnboardingFlow(invitation.onboardingData) : false;
        const result = useOnboardingFlow
            ? await completeOnboardingInviteController({ inviteToken: token }, actor)
            : await acceptInvitationController({ token }, actor);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
