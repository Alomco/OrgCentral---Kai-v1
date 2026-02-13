import { NextResponse } from 'next/server';

import { auth } from '@/server/lib/auth';
import { getEnhancedSecurityEventService } from '@/server/services/security/security-event-service.provider';
import {
    buildAllowedMutationOrigins,
    isTrustedMutationOrigin,
    resolveMutationOrigin,
} from '@/server/security/origin-policy';
import { extractIpAddress, extractUserAgent } from '@/server/use-cases/shared/request-metadata';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function buildInvalidOriginResponse(): NextResponse {
    return NextResponse.json(
        {
            error: {
                code: 'AUTHORIZATION_ERROR',
                message: 'Invalid origin.',
            },
        },
        { status: 403 },
    );
}

interface SecurityIdentityContext {
    orgId: string;
    userId: string;
    metadata: Record<string, string | null>;
}

async function resolveSecurityIdentityContext(request: Request): Promise<SecurityIdentityContext> {
    const headerOrgId = request.headers.get('x-org-id');
    const headerUserId = request.headers.get('x-user-id');
    const untrustedMetadata = {
        untrustedHeaderOrgId: headerOrgId,
        untrustedHeaderUserId: headerUserId,
    };

    try {
        const session = await auth.api.getSession({ headers: request.headers });
        const trustedOrgId = session?.session.activeOrganizationId ?? null;
        const trustedUserId = session?.user.id ?? session?.session.userId ?? null;

        if (trustedOrgId && trustedUserId) {
            return {
                orgId: trustedOrgId,
                userId: trustedUserId,
                metadata: {
                    identitySource: 'session',
                    ...untrustedMetadata,
                },
            };
        }
    } catch (sessionError) {
        void sessionError;
    }

    return {
        orgId: 'unknown',
        userId: 'unknown',
        metadata: {
            identitySource: 'headers-untrusted-fallback',
            ...untrustedMetadata,
        },
    };
}

export async function enforceCsrfOriginGuard(request: Request): Promise<NextResponse | null> {
    if (!MUTATION_METHODS.has(request.method.toUpperCase())) {
        return null;
    }

    const originHeader = request.headers.get('origin');
    const refererHeader = request.headers.get('referer');
    const origin = resolveMutationOrigin(request.headers);
    const allowedOrigins = buildAllowedMutationOrigins({ request });

    if (isTrustedMutationOrigin(origin, allowedOrigins)) {
        return null;
    }

    try {
        const service = getEnhancedSecurityEventService();
        const identity = await resolveSecurityIdentityContext(request);
        await service.logSecurityEvent({
            orgId: identity.orgId,
            eventType: 'security.csrf.origin.invalid',
            severity: 'high',
            description: 'Mutation blocked by CSRF/origin guard.',
            userId: identity.userId,
            ipAddress: extractIpAddress(request.headers),
            userAgent: extractUserAgent(request.headers),
            metadata: {
                method: request.method,
                origin: originHeader,
                referer: refererHeader,
                allowedOrigins,
                ...identity.metadata,
            },
        });
    } catch {
        return buildInvalidOriginResponse();
    }

    return buildInvalidOriginResponse();
}