import { NextResponse } from 'next/server';

import { executeLoginWithCookies } from '@/server/api-adapters/auth/login-controller';
import { appendSetCookieHeaders } from '@/server/api-adapters/http/set-cookie-headers';

export async function POST(request: Request): Promise<Response> {
    const headers = request.headers;
    const payload: unknown = await request.json().catch(() => null);
    const { result, headers: authHeaders } = await executeLoginWithCookies(payload ?? {}, { headers });
    const status = result.ok
        ? 200
        : result.code === 'VALIDATION_ERROR'
            ? 422
            : result.code === 'RATE_LIMITED'
                ? 429
                : result.code === 'ACCOUNT_LOCKED'
                    ? 423
                    : 401;
    const response = NextResponse.json(result, { status });
    if (authHeaders) {
        appendSetCookieHeaders(authHeaders, response.headers);
    }
    return response;
}
