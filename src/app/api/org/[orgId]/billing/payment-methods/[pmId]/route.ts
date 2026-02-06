import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { removeBillingPaymentMethodController } from '@/server/api-adapters/org/billing/billing-payment-method-controllers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; pmId: string }> },
): Promise<NextResponse> {
  try {
    const { orgId, pmId } = await params;
    const result = await removeBillingPaymentMethodController(
      request,
      orgId,
      pmId,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
