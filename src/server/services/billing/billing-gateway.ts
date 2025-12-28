import type { BillingSubscriptionStatus } from '@/server/types/billing-types';

export interface BillingCheckoutSessionInput {
  orgId: string;
  userId: string;
  customerEmail?: string | null;
  seatCount: number;
  successUrl: string;
  cancelUrl: string;
  priceId: string;
}

export interface BillingCheckoutSessionResult {
  id: string;
  url: string;
}

export interface BillingPortalSessionInput {
  customerId: string;
  returnUrl: string;
}

export interface BillingPortalSessionResult {
  url: string;
}

export interface BillingSubscriptionSnapshot {
  orgId?: string | null;
  userId?: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSubscriptionItemId?: string | null;
  stripePriceId: string;
  status: BillingSubscriptionStatus;
  seatCount: number;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, string> | null;
}

export type BillingProrationBehavior = 'create_prorations' | 'always_invoice' | 'none';

export type BillingWebhookEvent =
  | { type: 'subscription.created'; subscription: BillingSubscriptionSnapshot; stripeEventCreatedAt: Date }
  | { type: 'subscription.updated'; subscription: BillingSubscriptionSnapshot; stripeEventCreatedAt: Date }
  | { type: 'subscription.deleted'; subscription: BillingSubscriptionSnapshot; stripeEventCreatedAt: Date }
  | { type: 'checkout.completed'; session: { orgId?: string | null; userId?: string | null } }
  | { type: 'ignored'; eventType: string };

export interface BillingGateway {
  createCheckoutSession(input: BillingCheckoutSessionInput): Promise<BillingCheckoutSessionResult>;
  createPortalSession(input: BillingPortalSessionInput): Promise<BillingPortalSessionResult>;
  updateSubscriptionSeats(input: {
    subscriptionItemId: string;
    seatCount: number;
    prorationBehavior?: BillingProrationBehavior;
    idempotencyKey?: string;
  }): Promise<void>;
  parseWebhookEvent(input: { signature: string; payload: string }): BillingWebhookEvent;
}
