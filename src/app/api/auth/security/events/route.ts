import { NextResponse } from 'next/server';
import { logSecurityEventController } from '@/server/api-adapters/auth/security/log-security-event';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { auth } from '@/server/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const payload = (await request.json()) as unknown;
        const session = await auth.api.getSession({ headers: request.headers });
        const { userId } = requireSessionUser(session);
        const result = await logSecurityEventController(payload, { userId });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
