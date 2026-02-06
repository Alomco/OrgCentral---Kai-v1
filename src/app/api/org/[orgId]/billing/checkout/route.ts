import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { createBillingCheckoutController } from '@/server/api-adapters/org/billing/billing-route-controllers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  try {
    const { orgId } = await params;
    const result = await createBillingCheckoutController(request, orgId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
