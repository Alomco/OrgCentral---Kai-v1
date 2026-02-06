import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { getBillingInvoiceController } from '@/server/api-adapters/org/billing/billing-invoice-controllers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string; invoiceId: string }> },
): Promise<NextResponse> {
  try {
    const { orgId, invoiceId } = await params;
    const result = await getBillingInvoiceController(
      request,
      orgId,
      invoiceId,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
