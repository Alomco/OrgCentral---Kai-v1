import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { createBillingPortalController } from '@/server/api-adapters/org/billing/billing-route-controllers';

interface RouteParams {
  params: { orgId: string };
}

export async function POST(request: Request, context: RouteParams): Promise<NextResponse> {
  try {
    const result = await createBillingPortalController(request, context.params.orgId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
