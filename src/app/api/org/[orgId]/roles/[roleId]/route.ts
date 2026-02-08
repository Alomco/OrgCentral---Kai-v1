import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
  deleteRoleController,
  getRoleController,
  updateRoleController,
} from '@/server/api-adapters/org/roles/role-route-controllers';

interface RouteParams {
  params: Promise<{ orgId: string; roleId: string }>;
}

export async function GET(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const { orgId, roleId } = await context.params;
    const result = await getRoleController(request, orgId, roleId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const { orgId, roleId } = await context.params;
    const result = await updateRoleController(request, orgId, roleId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const { orgId, roleId } = await context.params;
    const result = await deleteRoleController(request, orgId, roleId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
