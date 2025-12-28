import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { revokeInvitationController } from '@/server/api-adapters/org/invitations/invitation-route-controllers';

interface RouteParams {
    params: { orgId: string; token: string };
}

export async function POST(request: Request, context: RouteParams): Promise<NextResponse> {
    try {
        const result = await revokeInvitationController(request, context.params.orgId, context.params.token);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
