import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
  createProfileController,
  listProfilesController,
} from '@/server/api-adapters/hr/people/profiles-controller';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const result = await listProfilesController(request);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const result = await createProfileController(request);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
