import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';
import { createAuth } from '@/server/lib/auth';

export interface BetterAuthService {
    handle(request: NextRequest): Promise<Response>;
}

interface BetterAuthServiceOptions {
    baseURL?: string;
    trustProxyHeaders?: boolean;
}

function resolveBaseURLFromRequest(request: NextRequest, trustProxyHeaders: boolean): string {
    if (trustProxyHeaders) {
        const forwardedProto = request.headers.get('x-forwarded-proto');
        const forwardedHost = request.headers.get('x-forwarded-host');

        const host = forwardedHost ?? request.headers.get('host');
        const proto = forwardedProto ?? request.nextUrl.protocol.replace(':', '');

        if (host) {
            return `${proto}://${host}`;
        }
    }

    return request.nextUrl.origin;
}

export function createBetterAuthService(options: BetterAuthServiceOptions = {}): BetterAuthService {
    const authByBaseURL = new Map<string, ReturnType<typeof createAuth>>();

    const envBaseURL =
        options.baseURL ??
        process.env.AUTH_BASE_URL ??
        undefined;

    const trustProxyHeaders =
        options.trustProxyHeaders ??
        process.env.AUTH_TRUST_PROXY_HEADERS === 'true';

    function getAuthForRequest(request: NextRequest): ReturnType<typeof createAuth> {
        const baseURL = envBaseURL ?? resolveBaseURLFromRequest(request, trustProxyHeaders);

        const cached = authByBaseURL.get(baseURL);
        if (cached) {
            return cached;
        }

        const created = createAuth(baseURL);
        authByBaseURL.set(baseURL, created);
        return created;
    }

    return {
        async handle(request) {
            const auth = getAuthForRequest(request);
            const handler = toNextJsHandler(auth.handler);

            if (request.method === 'GET') {
                return handler.GET(request);
            }

            if (request.method === 'POST') {
                return handler.POST(request);
            }

            return new Response(null, { status: 405 });
        },
    } satisfies BetterAuthService;
}

const sharedService = createBetterAuthService();

export function getBetterAuthService(): BetterAuthService {
    return sharedService;
}
