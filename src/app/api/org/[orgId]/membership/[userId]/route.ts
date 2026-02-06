import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { updateMembershipController } from '@/server/api-adapters/org/membership/membership-route-controllers';

interface RouteParams {
  params: Promise<{ orgId: string; userId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { orgId, userId } = await params;
    const result = await updateMembershipController(request, orgId, userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
