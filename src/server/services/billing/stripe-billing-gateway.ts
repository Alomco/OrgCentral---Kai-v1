import Stripe from 'stripe';

import type {
  BillingCustomerCreateInput,
  BillingCustomerCreateResult,
  BillingCheckoutSessionInput,
  BillingCheckoutSessionResult,
  BillingGateway,
  BillingInvoicePreview,
  BillingPaymentMethodType,
  BillingPortalSessionInput,
  BillingPortalSessionResult,
  BillingProrationBehavior,
  BillingSetupIntentInput,
  BillingSetupIntentResult,
  BillingSubscriptionUpdateInput,
  BillingWebhookEvent,
  PaymentMethodSummary,
} from '@/server/services/billing/billing-gateway';
import type { BillingConfig } from '@/server/services/billing/billing-config';
import { toStripeTrialEndTimestamp } from '@/server/services/billing/billing-cycle-policy';
import {
  buildSupportedPaymentMethodTypes,
  toInvoicePreview,
  toPaymentMethodSummary,
} from '@/server/services/billing/stripe-billing-gateway.mappers';
import { parseStripeWebhookEvent } from '@/server/services/billing/stripe-billing-gateway.webhooks';

const DEFAULT_STRIPE_API_VERSION: Stripe.LatestApiVersion = '2024-04-10';

export class StripeBillingGateway implements BillingGateway {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly supportedPaymentMethodTypes: BillingPaymentMethodType[];

  constructor(config: BillingConfig) {
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: (config.stripeApiVersion ?? DEFAULT_STRIPE_API_VERSION) as Stripe.LatestApiVersion,
    });
    this.webhookSecret = config.stripeWebhookSecret;
    this.supportedPaymentMethodTypes = buildSupportedPaymentMethodTypes(config);
  }

  async createCheckoutSession(
    input: BillingCheckoutSessionInput,
  ): Promise<BillingCheckoutSessionResult> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      customer: input.customerId,
      customer_email: input.customerId ? undefined : input.customerEmail ?? undefined,
      client_reference_id: input.orgId,
      metadata: {
        orgId: input.orgId,
        userId: input.userId,
        billingCadence: input.cadence,
        billingStartAt: input.billingStartAt.toISOString(),
      },
      subscription_data: {
        trial_end: toStripeTrialEndTimestamp(input.billingStartAt),
        proration_behavior: 'none',
        metadata: {
          orgId: input.orgId,
          userId: input.userId,
          billingCadence: input.cadence,
          billingStartAt: input.billingStartAt.toISOString(),
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

  async createCustomer(input: BillingCustomerCreateInput): Promise<BillingCustomerCreateResult> {
    const customer = await this.stripe.customers.create({
      email: input.email ?? undefined,
      metadata: {
        orgId: input.orgId,
        userId: input.userId,
      },
    });
    return { customerId: customer.id };
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

  async createSetupIntent(
    input: BillingSetupIntentInput,
  ): Promise<BillingSetupIntentResult> {
    const intent = await this.stripe.setupIntents.create({
      customer: input.customerId,
      payment_method_types: input.paymentMethodTypes,
    });

    if (!intent.client_secret) {
      throw new Error('Stripe setup intent missing client secret.');
    }

    return { clientSecret: intent.client_secret };
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethodSummary[]> {
    const customer = await this.stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return [];
    }
    const defaultPaymentMethodId =
      typeof customer.invoice_settings.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : customer.invoice_settings.default_payment_method?.id;

    const results = await Promise.allSettled(
      this.supportedPaymentMethodTypes.map((type) =>
        this.stripe.paymentMethods.list({ customer: customerId, type }),
      ),
    );

    const methods = results.flatMap((result) =>
      result.status === 'fulfilled' ? result.value.data : [],
    );

    return methods.map((method) => toPaymentMethodSummary(method, defaultPaymentMethodId));
  }

  async getPaymentMethodCustomerId(paymentMethodId: string): Promise<string | null> {
    const method = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (!method.customer) {
      return null;
    }
    return typeof method.customer === 'string' ? method.customer : method.customer.id;
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  async setDefaultPaymentMethod(input: {
    customerId: string;
    paymentMethodId: string;
  }): Promise<void> {
    await this.stripe.customers.update(input.customerId, {
      invoice_settings: { default_payment_method: input.paymentMethodId },
    });
  }

  async previewUpcomingInvoice(customerId: string): Promise<BillingInvoicePreview | null> {
    try {
      const invoice = await this.stripe.invoices.retrieveUpcoming({ customer: customerId });
      return toInvoicePreview(invoice);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError && error.code === 'invoice_upcoming_none') {
        return null;
      }
      throw error;
    }
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

  async updateSubscription(input: BillingSubscriptionUpdateInput): Promise<void> {
    const update: Stripe.SubscriptionUpdateParams = {};
    if (input.cancelAtPeriodEnd !== undefined) {
      update.cancel_at_period_end = input.cancelAtPeriodEnd;
    }
    if (input.priceId) {
      if (!input.subscriptionItemId) {
        throw new Error('Subscription item id is required to update pricing.');
      }
      update.items = [{ id: input.subscriptionItemId, price: input.priceId }];
      update.proration_behavior = input.prorationBehavior ?? 'create_prorations';
    }

    if (Object.keys(update).length === 0) {
      return;
    }

    await this.stripe.subscriptions.update(
      input.subscriptionId,
      update,
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );
  }

  parseWebhookEvent(input: { signature: string; payload: string }): BillingWebhookEvent {
    return parseStripeWebhookEvent({
      stripe: this.stripe,
      webhookSecret: this.webhookSecret,
      signature: input.signature,
      payload: input.payload,
    });
  }
}
