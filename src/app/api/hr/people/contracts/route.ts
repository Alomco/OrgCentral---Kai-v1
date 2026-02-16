import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import {
  createContractController,
  listContractsController,
} from '@/server/api-adapters/hr/people/contracts-controller';

export async function GET(request: Request): Promise<NextResponse> {
  noStore();
  try {
    const result = await listContractsController(request);
    return buildNoStoreJsonResponse(result, 200);
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const result = await createContractController(request);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
