import { redirect } from 'next/navigation';

import { AuthorizationError } from '@/server/errors';
import { RepositoryAuthorizationError } from '@/server/repositories/security/repository-errors';
import { getSessionContext, type GetSessionDependencies, type GetSessionInput, type GetSessionResult } from '@/server/use-cases/auth/sessions/get-session';

const DEFAULT_FALLBACK_NEXT_PATH = '/dashboard';

interface SessionRedirectOptions {
    /** Optional explicit next path to preserve. When omitted, we attempt to infer from request headers. */
    nextPath?: string | null;
    /** Where unauthenticated users should be redirected. Default: /login */
    loginPath?: string;
    /** Where users with no org membership should be redirected. Default: /not-invited */
    notInvitedPath?: string;
    /** Where authenticated but unauthorized users should be redirected. Default: /access-denied */
    accessDeniedPath?: string;
}

export async function getSessionContextOrRedirect(
    deps: GetSessionDependencies,
    input: GetSessionInput,
    options: SessionRedirectOptions = {},
): Promise<GetSessionResult> {
    try {
        return await getSessionContext(deps, input);
    } catch (error) {
        const decision = classifySessionError(error);
        if (!decision) {
            throw error;
        }

        const nextPath =
            resolveSafeNextPath(options.nextPath) ??
            resolveSafeNextPath(resolveNextPathFromHeaders(normalizeHeaders(input.headers))) ??
            DEFAULT_FALLBACK_NEXT_PATH;

        const loginPath = options.loginPath ?? '/login';
        const notInvitedPath = options.notInvitedPath ?? '/not-invited';
        const accessDeniedPath = options.accessDeniedPath ?? '/access-denied';
        const postLoginPath = `/api/auth/post-login?next=${encodeURIComponent(nextPath)}`;

        if (decision === 'missing-org') {
            redirect(postLoginPath);
        }

        if (decision === 'not-invited') {
            redirect(withNext(notInvitedPath, nextPath));
        }

        if (decision === 'unauthenticated') {
            const reason = resolveSessionExpiryReason(error);
            const target = reason
                ? withNextAndReason(loginPath, nextPath, reason)
                : withNext(loginPath, nextPath);
            redirect(target);
        }

        redirect(accessDeniedPath);
    }
}

    type SessionErrorDecision = 'unauthenticated' | 'not-invited' | 'forbidden' | 'missing-org';

function classifySessionError(error: unknown): SessionErrorDecision | null {
    if (isNotInvitedError(error)) {
        return 'not-invited';
    }
    if (isMissingOrgError(error)) {
        return 'missing-org';
    }
    if (isUnauthenticatedError(error)) {
        return 'unauthenticated';
    }
    if (error instanceof AuthorizationError || error instanceof RepositoryAuthorizationError) {
        return 'forbidden';
    }
    return null;
}

function isNotInvitedError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : '';
    if (!message) {
        return false;
    }
    if (error instanceof RepositoryAuthorizationError && message.includes('Membership not found')) {
        return true;
    }
    return message.includes('Membership not found');
}

function isMissingOrgError(error: unknown): boolean {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    return message.includes('organization id was not provided');
}

function isUnauthenticatedError(error: unknown): boolean {
    if (!(error instanceof AuthorizationError) && !(error instanceof RepositoryAuthorizationError)) {
        return false;
    }

    if (error instanceof AuthorizationError && error.details?.reason === 'session_expired') {
        return true;
    }

    const message = error instanceof Error ? error.message.toLowerCase() : '';
    return (
        message.includes('unauthenticated') ||
        message.includes('session not found') ||
        message.includes('session expired') ||
        message.includes('authenticated session is required')
    );
}

function resolveSessionExpiryReason(error: unknown): string | null {
    if (error instanceof AuthorizationError && error.details?.reason === 'session_expired') {
        return 'session_expired';
    }
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    return message.includes('session expired') ? 'session_expired' : null;
}

function withNext(path: string, nextPath: string): string {
    const url = new URL(path, 'http://localhost');
    if (!url.searchParams.has('next')) {
        url.searchParams.set('next', nextPath);
    }
    return `${url.pathname}${url.search}`;
}

function withNextAndReason(path: string, nextPath: string, reason: string): string {
    const url = new URL(path, 'http://localhost');
    if (!url.searchParams.has('next')) {
        url.searchParams.set('next', nextPath);
    }
    if (!url.searchParams.has('reason')) {
        url.searchParams.set('reason', reason);
    }
    return `${url.pathname}${url.search}`;
}

function resolveSafeNextPath(candidate: string | null | undefined): string | null {
    if (typeof candidate !== 'string') {
        return null;
    }
    const trimmed = candidate.trim();
    if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://')) {
        return null;
    }
    return trimmed;
}

function resolveNextPathFromHeaders(headers: Headers): string | null {
    const candidateHeaders = [
        'next-url',
        'x-next-url',
        'x-invoke-path',
        'x-matched-path',
        'x-original-url',
        'x-rewrite-url',
    ];

    for (const header of candidateHeaders) {
        const value = headers.get(header);
        if (!value) {
            continue;
        }

        const normalized = normalizeNextPathHeader(value);
        if (normalized) {
            return normalized;
        }
    }

    return null;
}

function normalizeNextPathHeader(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    try {
        const url = new URL(trimmed);
        return `${url.pathname}${url.search}`;
    } catch {
        return null;
    }
}

function normalizeHeaders(input: Headers | HeadersInit): Headers {
    if (input instanceof Headers) {
        return input;
    }
    return new Headers(input);
}
