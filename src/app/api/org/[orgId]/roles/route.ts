import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { createRoleController, listRolesController } from '@/server/api-adapters/org/roles/role-route-controllers';

interface RouteParams {
  params: { orgId: string };
}

export async function GET(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const result = await listRolesController(request, context.params.orgId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const result = await createRoleController(request, context.params.orgId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
