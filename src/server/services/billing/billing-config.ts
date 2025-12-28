import { z } from 'zod';

export interface BillingConfig {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePriceId: string;
  stripeSuccessUrl: string;
  stripeCancelUrl: string;
  stripePortalReturnUrl?: string;
  stripeApiVersion?: string;
}

const billingConfigSchema = z.object({
  stripeSecretKey: z.string().min(1),
  stripeWebhookSecret: z.string().min(1),
  stripePriceId: z.string().min(1),
  stripeSuccessUrl: z.url(),
  stripeCancelUrl: z.url(),
  stripePortalReturnUrl: z.url().optional(),
  stripeApiVersion: z.string().min(1).optional(),
});

export function resolveBillingConfig(): BillingConfig | null {
  const parsed = billingConfigSchema.safeParse({
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripePriceId: process.env.STRIPE_PRICE_ID,
    stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL,
    stripeCancelUrl: process.env.STRIPE_CANCEL_URL,
    stripePortalReturnUrl: process.env.STRIPE_PORTAL_RETURN_URL,
    stripeApiVersion: process.env.STRIPE_API_VERSION,
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function requireBillingConfig(): BillingConfig {
  const config = resolveBillingConfig();
  if (!config) {
    throw new Error('Billing is not configured. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and STRIPE_PRICE_ID.');
  }
  return config;
}
