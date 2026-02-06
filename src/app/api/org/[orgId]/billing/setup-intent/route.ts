import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { createBillingSetupIntentController } from '@/server/api-adapters/org/billing/billing-payment-method-controllers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  try {
    const { orgId } = await params;
    const result = await createBillingSetupIntentController(request, orgId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
