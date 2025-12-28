import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { listInvitationsController } from '@/server/api-adapters/org/invitations/invitation-route-controllers';

interface RouteParams {
    params: { orgId: string };
}

export async function GET(request: Request, context: RouteParams): Promise<NextResponse> {
    try {
        const result = await listInvitationsController(request, context.params.orgId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
