import Stripe from 'stripe';

import type {
  BillingCheckoutSessionInput,
  BillingCheckoutSessionResult,
  BillingGateway,
  BillingPortalSessionInput,
  BillingPortalSessionResult,
  BillingProrationBehavior,
  BillingSubscriptionSnapshot,
  BillingWebhookEvent,
} from '@/server/services/billing/billing-gateway';
import type { BillingConfig } from '@/server/services/billing/billing-config';
import type { BillingSubscriptionStatus } from '@/server/types/billing-types';

const DEFAULT_STRIPE_API_VERSION: Stripe.LatestApiVersion = '2024-04-10';

const STATUS_MAP: Record<Stripe.Subscription.Status, BillingSubscriptionStatus> = {
  incomplete: 'INCOMPLETE',
  incomplete_expired: 'INCOMPLETE_EXPIRED',
  trialing: 'TRIALING',
  active: 'ACTIVE',
  past_due: 'PAST_DUE',
  canceled: 'CANCELED',
  unpaid: 'UNPAID',
  paused: 'PAUSED',
};

export class StripeBillingGateway implements BillingGateway {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly priceId: string;

  constructor(config: BillingConfig) {
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: (config.stripeApiVersion ?? DEFAULT_STRIPE_API_VERSION) as Stripe.LatestApiVersion,
    });
    this.webhookSecret = config.stripeWebhookSecret;
    this.priceId = config.stripePriceId;
  }

  async createCheckoutSession(
    input: BillingCheckoutSessionInput,
  ): Promise<BillingCheckoutSessionResult> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      customer_email: input.customerEmail ?? undefined,
      client_reference_id: input.orgId,
      metadata: {
        orgId: input.orgId,
        userId: input.userId,
      },
      subscription_data: {
        metadata: {
          orgId: input.orgId,
          userId: input.userId,
        },
      },
      line_items: [
        {
          price: input.priceId,
          quantity: input.seatCount,
        },
      ],
    });

    if (!session.url) {
      throw new Error('Stripe checkout session missing redirect URL.');
    }

    return { id: session.id, url: session.url };
  }

  async createPortalSession(
    input: BillingPortalSessionInput,
  ): Promise<BillingPortalSessionResult> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: input.customerId,
      return_url: input.returnUrl,
    });
    return { url: session.url };
  }

  async updateSubscriptionSeats(input: {
    subscriptionItemId: string;
    seatCount: number;
    prorationBehavior?: BillingProrationBehavior;
    idempotencyKey?: string;
  }): Promise<void> {
    await this.stripe.subscriptionItems.update(
      input.subscriptionItemId,
      {
        quantity: input.seatCount,
        proration_behavior: input.prorationBehavior ?? 'create_prorations',
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );
  }

  parseWebhookEvent(input: { signature: string; payload: string }): BillingWebhookEvent {
    const event = this.stripe.webhooks.constructEvent(
      input.payload,
      input.signature,
      this.webhookSecret,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;
      const clientReferenceId = session.client_reference_id;
      return {
        type: 'checkout.completed',
        session: {
          orgId: getMetadataValue(metadata, 'orgId') ?? clientReferenceId,
          userId: getMetadataValue(metadata, 'userId'),
        },
      };
    }

    if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object as Stripe.Subscription;
      const snapshot = this.toSubscriptionSnapshot(subscription);
      const createdAt = new Date(event.created * 1000);

      if (event.type === 'customer.subscription.created') {
        return { type: 'subscription.created', subscription: snapshot, stripeEventCreatedAt: createdAt };
      }
      if (event.type === 'customer.subscription.updated') {
        return { type: 'subscription.updated', subscription: snapshot, stripeEventCreatedAt: createdAt };
      }
      if (event.type === 'customer.subscription.deleted') {
        return { type: 'subscription.deleted', subscription: snapshot, stripeEventCreatedAt: createdAt };
      }
    }

    return { type: 'ignored', eventType: event.type };
  }
  private toSubscriptionSnapshot(subscription: Stripe.Subscription): BillingSubscriptionSnapshot {
    const item = subscription.items.data.find((entry) => entry.price.id === this.priceId);
    if (!item) {
      throw new Error('Stripe subscription is missing the expected price item.');
    }

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    const metadata = subscription.metadata;

    return {
      orgId: getMetadataValue(metadata, 'orgId'),
      userId: getMetadataValue(metadata, 'userId'),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionItemId: item.id,
      stripePriceId: item.price.id,
      status: STATUS_MAP[subscription.status],
      seatCount: item.quantity ?? 1,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata,
    };
  }
}

function getMetadataValue(metadata: Stripe.Metadata | null, key: string): string | null {
  if (!metadata) {
    return null;
  }
  return Object.prototype.hasOwnProperty.call(metadata, key) ? metadata[key] : null;
}
