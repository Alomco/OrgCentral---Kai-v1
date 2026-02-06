import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { listBillingPaymentMethodsController } from '@/server/api-adapters/org/billing/billing-payment-method-controllers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  try {
    const { orgId } = await params;
    const result = await listBillingPaymentMethodsController(request, orgId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
