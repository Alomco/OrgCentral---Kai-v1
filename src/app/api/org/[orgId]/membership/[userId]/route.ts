import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { updateMembershipController } from '@/server/api-adapters/org/membership/membership-route-controllers';

interface RouteParams {
  params: { orgId: string; userId: string };
}

export async function PUT(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const result = await updateMembershipController(request, context.params.orgId, context.params.userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
