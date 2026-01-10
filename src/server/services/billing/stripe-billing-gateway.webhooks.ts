/**
 * TODO: Refactor this file (currently > 250 LOC).
 * Action: Split into smaller modules and ensure adherence to SOLID principles, Dependency Injection, and Design Patterns.
 */
import type Stripe from 'stripe';

import type { BillingWebhookEvent } from '@/server/services/billing/billing-gateway';
import {
  toInvoiceSnapshot,
  toPaymentMethodSummary,
  toSubscriptionSnapshot,
} from '@/server/services/billing/stripe-billing-gateway.mappers';
import {
  getMetadataValue,
  isCheckoutSessionObject,
  isInvoiceObject,
  isPaymentIntent,
  isPaymentMethodObject,
  isSetupIntentObject,
  isSubscriptionObject,
  resolvePaymentMethodCustomerId,
  resolveStripeId,
} from './stripe-billing-gateway.webhooks.helpers';

const PAYMENT_METHOD_ATTACHED = 'payment_method.attached';
const PAYMENT_METHOD_DETACHED = 'payment_method.detached';

export function parseStripeWebhookEvent(input: {
  stripe: Stripe;
  webhookSecret: string;
  priceIds: Set<string>;
  signature: string;
  payload: string;
}): BillingWebhookEvent {
  const event = input.stripe.webhooks.constructEvent(
    input.payload,
    input.signature,
    input.webhookSecret,
  );

  const checkoutEvent = handleCheckoutEvent(event);
  if (checkoutEvent) {
    return checkoutEvent;
  }

  const subscriptionEvent = handleSubscriptionEvent(event, input.priceIds);
  if (subscriptionEvent) {
    return subscriptionEvent;
  }

  const invoiceEvent = handleInvoiceEvent(event, input.priceIds);
  if (invoiceEvent) {
    return invoiceEvent;
  }

  const paymentMethodEvent = handlePaymentMethodEvent(event);
  if (paymentMethodEvent) {
    return paymentMethodEvent;
  }

  const setupIntentEvent = handleSetupIntentEvent(event);
  if (setupIntentEvent) {
    return setupIntentEvent;
  }

  return { type: 'ignored', eventType: event.type };
}

function handleCheckoutEvent(event: Stripe.Event): BillingWebhookEvent | null {
  if (event.type !== 'checkout.session.completed') {
    return null;
  }

  const sessionObject = event.data.object;
  if (!isCheckoutSessionObject(sessionObject)) {
    return null;
  }

  const metadata = sessionObject.metadata;
  const clientReferenceId = sessionObject.client_reference_id;
  return {
    type: 'checkout.completed',
    session: {
      orgId: getMetadataValue(metadata, 'orgId') ?? clientReferenceId,
      userId: getMetadataValue(metadata, 'userId'),
    },
  };
}

function handleSubscriptionEvent(
  event: Stripe.Event,
  priceIds: Set<string>,
): BillingWebhookEvent | null {
  if (!event.type.startsWith('customer.subscription.')) {
    return null;
  }

  const subscriptionObject = event.data.object;
  if (!isSubscriptionObject(subscriptionObject)) {
    return null;
  }

  const snapshot = toSubscriptionSnapshot(subscriptionObject, priceIds);
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

  return null;
}

function handleInvoiceEvent(
  event: Stripe.Event,
  priceIds: Set<string>,
): BillingWebhookEvent | null {
  if (!event.type.startsWith('invoice.')) {
    return null;
  }

  const invoiceObject = event.data.object;
  if (!isInvoiceObject(invoiceObject)) {
    return null;
  }

  const snapshot = toInvoiceSnapshot(invoiceObject, priceIds);
  const createdAt = new Date(event.created * 1000);

  if (event.type === 'invoice.created') {
    return { type: 'invoice.created', invoice: snapshot, stripeEventCreatedAt: createdAt };
  }
  if (event.type === 'invoice.finalized') {
    return { type: 'invoice.finalized', invoice: snapshot, stripeEventCreatedAt: createdAt };
  }
  if (event.type === 'invoice.paid') {
    return { type: 'invoice.paid', invoice: snapshot, stripeEventCreatedAt: createdAt };
  }
  if (event.type === 'invoice.payment_failed') {
    const paymentIntent: Stripe.PaymentIntent | null = isPaymentIntent(invoiceObject.payment_intent)
      ? invoiceObject.payment_intent
      : null;
    const failureReason = paymentIntent?.last_payment_error?.message ?? null;
    return {
      type: 'invoice.payment_failed',
      invoice: snapshot,
      failureReason,
      stripeEventCreatedAt: createdAt,
    };
  }
  if (event.type === 'invoice.upcoming') {
    return { type: 'invoice.upcoming', invoice: snapshot, stripeEventCreatedAt: createdAt };
  }

  return null;
}

function handlePaymentMethodEvent(event: Stripe.Event): BillingWebhookEvent | null {
  if (event.type !== PAYMENT_METHOD_ATTACHED && event.type !== PAYMENT_METHOD_DETACHED) {
    return null;
  }

  const methodObject = event.data.object;
  if (!isPaymentMethodObject(methodObject)) {
    return null;
  }

  const customerId = resolvePaymentMethodCustomerId(methodObject, event.data.previous_attributes);
  if (!customerId) {
    return null;
  }

  if (event.type === PAYMENT_METHOD_ATTACHED) {
    return {
      type: 'payment_method.attached',
      paymentMethod: toPaymentMethodSummary(methodObject),
      stripeCustomerId: customerId,
    };
  }

  return {
    type: 'payment_method.detached',
    paymentMethodId: methodObject.id,
    stripeCustomerId: customerId,
  };
}

function handleSetupIntentEvent(event: Stripe.Event): BillingWebhookEvent | null {
  if (event.type !== 'setup_intent.succeeded') {
    return null;
  }

  const intentObject = event.data.object;
  if (!isSetupIntentObject(intentObject)) {
    return null;
  }

  const customerId = resolveStripeId(intentObject.customer);
  const paymentMethodId = resolveStripeId(intentObject.payment_method);

  if (customerId && paymentMethodId) {
    return { type: 'setup_intent.succeeded', stripeCustomerId: customerId, paymentMethodId };
  }

  return null;
}
