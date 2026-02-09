import type { NextRequest } from 'next/server';
import { AuthorizationError } from '@/server/errors';

const AUTH_ROUTE_PREFIX = '/api/auth';
const SIGN_UP_ENDPOINT_PREFIXES = [
    '/sign-up',
    '/register',
] as const;

export function assertInviteOnlyEndpointAccess(request: NextRequest): void {
    const authPath = resolveAuthPath(request.nextUrl.pathname);
    if (!authPath) {
        return;
    }

    if (!isSignUpEndpoint(authPath)) {
        return;
    }

    throw new AuthorizationError(
        'Self-service sign-up is disabled. Accept an invitation to continue.',
        {
            reason: 'invite_only_required',
            authPath,
        },
    );
}

function resolveAuthPath(pathname: string): string | null {
    if (!pathname.startsWith(AUTH_ROUTE_PREFIX)) {
        return null;
    }

    const suffix = pathname.slice(AUTH_ROUTE_PREFIX.length).trim();
    if (!suffix.startsWith('/')) {
        return null;
    }

    return suffix.toLowerCase();
}

function isSignUpEndpoint(authPath: string): boolean {
    return SIGN_UP_ENDPOINT_PREFIXES.some((prefix) =>
        authPath === prefix || authPath.startsWith(`${prefix}/`),
    );
}
