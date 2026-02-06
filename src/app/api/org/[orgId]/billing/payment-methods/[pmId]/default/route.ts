import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { setDefaultBillingPaymentMethodController } from '@/server/api-adapters/org/billing/billing-payment-method-controllers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string; pmId: string }> },
): Promise<NextResponse> {
  try {
    const { orgId, pmId } = await params;
    const result = await setDefaultBillingPaymentMethodController(
      request,
      orgId,
      pmId,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
