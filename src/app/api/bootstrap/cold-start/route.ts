import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { coldStartController } from '@/server/api-adapters/platform/bootstrap/cold-start-controller';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const result = await coldStartController(request);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
