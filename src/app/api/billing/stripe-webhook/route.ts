import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { handleStripeWebhook } from '@/server/api-adapters/billing/stripe-webhook-controller';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const result = await handleStripeWebhook(request);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
