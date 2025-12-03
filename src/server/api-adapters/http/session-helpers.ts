import type { AuthSession } from '@/server/lib/auth';
import { AuthorizationError } from '@/server/errors';

export interface SessionUserContext {
    userId: string;
    email?: string;
}

function resolveUserId(session: AuthSession | null): string | undefined {
    return (
        (session as { user?: { id?: string } } | null)?.user?.id ??
        (session as { session?: { userId?: string } } | null)?.session?.userId ??
        (session as { session?: { user?: { id?: string } } } | null)?.session?.user?.id
    );
}

function resolveEmail(session: AuthSession | null): string | undefined {
    return (
        (session as { user?: { email?: string } } | null)?.user?.email ??
        (session as { session?: { user?: { email?: string } } } | null)?.session?.user?.email
    );
}

export function requireSessionUser(session: AuthSession | null): SessionUserContext {
    const userId = resolveUserId(session);
    if (!userId) {
        throw new AuthorizationError('Authenticated session is required for this operation.');
    }

    const email = resolveEmail(session);
    return { userId, email };
}
