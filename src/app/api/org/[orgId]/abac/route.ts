import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { getOrgAbacPoliciesController, setOrgAbacPoliciesController } from '@/server/api-adapters/org/abac/abac-route-controllers';

interface RouteParams {
  params: { orgId: string };
}

export async function GET(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const result = await getOrgAbacPoliciesController(request, context.params.orgId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const result = await setOrgAbacPoliciesController(request, context.params.orgId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
