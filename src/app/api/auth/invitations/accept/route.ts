import { NextResponse } from 'next/server';
import { acceptInvitationController } from '@/server/api-adapters/auth/accept-invitation';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { AuthorizationError } from '@/server/errors';
import { auth, type AuthSession } from '@/server/lib/auth';

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
        const session = await auth.api.getSession({ headers: request.headers });
        const actor = requireActor(session);
        const result = await acceptInvitationController(payload, actor);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
