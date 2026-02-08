import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
  deleteProfileController,
  getProfileController,
  updateProfileController,
} from '@/server/api-adapters/hr/people/profiles-controller';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params): Promise<NextResponse> {
  try {
          const resolvedParams = await params;
    const result = await getProfileController(request, resolvedParams.id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
  try {
          const resolvedParams = await params;
    const result = await updateProfileController(request, resolvedParams.id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params): Promise<NextResponse> {
  try {
          const resolvedParams = await params;
    const result = await deleteProfileController(request, resolvedParams.id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
