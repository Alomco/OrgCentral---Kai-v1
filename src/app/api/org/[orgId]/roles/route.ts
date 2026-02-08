import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { createRoleController, listRolesController } from '@/server/api-adapters/org/roles/role-route-controllers';

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const { orgId } = await context.params;
    const result = await listRolesController(request, orgId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const { orgId } = await context.params;
    const result = await createRoleController(request, orgId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
