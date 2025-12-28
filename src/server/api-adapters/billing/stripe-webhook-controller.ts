import { ValidationError } from '@/server/errors';
import { resolveBillingConfig } from '@/server/services/billing/billing-config';
import { StripeBillingGateway } from '@/server/services/billing/stripe-billing-gateway';
import { getBillingService } from '@/server/services/billing/billing-service.provider';

export interface StripeWebhookResult {
  success: true;
}

export async function handleStripeWebhook(request: Request): Promise<StripeWebhookResult> {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    throw new ValidationError('Stripe signature header is required.');
  }

  const config = resolveBillingConfig();
  if (!config) {
    throw new ValidationError('Billing is not configured.');
  }

  const payload = await request.text();
  const gateway = new StripeBillingGateway(config);
  const event = gateway.parseWebhookEvent({ signature, payload });

  const billingService = getBillingService({
    billingGateway: gateway,
    billingConfig: config,
  });

  await billingService.handleWebhookEvent(event);
  return { success: true };
}
