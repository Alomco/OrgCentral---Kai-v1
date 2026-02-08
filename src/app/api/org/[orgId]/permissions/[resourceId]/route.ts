import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
  deletePermissionResourceController,
  getPermissionResourceController,
  updatePermissionResourceController,
} from '@/server/api-adapters/org/permissions/permission-route-controllers';

interface RouteParams {
  params: Promise<{ orgId: string; resourceId: string }>;
}

export async function GET(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const { orgId, resourceId } = await context.params;
    const result = await getPermissionResourceController(
      request,
      orgId,
      resourceId,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const { orgId, resourceId } = await context.params;
    const result = await updatePermissionResourceController(
      request,
      orgId,
      resourceId,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const { orgId, resourceId } = await context.params;
    const result = await deletePermissionResourceController(
      request,
      orgId,
      resourceId,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
