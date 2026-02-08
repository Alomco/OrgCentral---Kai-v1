import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { listInvitationsController } from '@/server/api-adapters/org/invitations/invitation-route-controllers';

interface RouteParams {
    params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, context: RouteParams): Promise<NextResponse> {
    try {
        const { orgId } = await context.params;
        const result = await listInvitationsController(request, orgId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
