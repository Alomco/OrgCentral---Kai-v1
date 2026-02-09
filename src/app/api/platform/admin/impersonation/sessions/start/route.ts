import { NextResponse } from 'next/server';
import { startImpersonationController } from '@/server/api-adapters/platform/admin/impersonation-controller';
import { DefaultErrorMapper } from '@/server/api-adapters/error-mappers/default-error-mapper';
import { appendSetCookieHeaders } from '@/server/api-adapters/http/set-cookie-headers';

export async function POST(request: Request) {
    try {
        const result = await startImpersonationController(request);
        const response = NextResponse.json({ success: true, data: result.data }, { status: 201 });
        appendSetCookieHeaders(result.authHeaders, response.headers);
        return response;
    } catch (error) {
        return DefaultErrorMapper.mapErrorToResponse(error);
    }
}
