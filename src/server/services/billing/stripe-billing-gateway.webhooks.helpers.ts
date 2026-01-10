import type Stripe from 'stripe';

export function getMetadataValue(metadata: Stripe.Metadata | null, key: string): string | null {
    if (!metadata) {
        return null;
    }
    return Object.prototype.hasOwnProperty.call(metadata, key) ? metadata[key] : null;
}

type PaymentMethodPreviousAttributes = Stripe.Event.Data.PreviousAttributes & {
    customer?: string | null;
};

type ResolvableStripeId =
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | Stripe.PaymentMethod
    | null
    | undefined;

export function isPaymentIntent(value: unknown): value is Stripe.PaymentIntent {
    if (!value || typeof value !== 'object') {
        return false;
    }
    return 'last_payment_error' in value;
}

export function resolvePaymentMethodCustomerId(
    method: Stripe.PaymentMethod,
    previousAttributes?: Stripe.Event.Data.PreviousAttributes,
): string | null {
    const current = resolveStripeId(method.customer);
    if (current) {
        return current;
    }

    const previousCustomer = (previousAttributes as PaymentMethodPreviousAttributes | undefined)?.customer;
    return typeof previousCustomer === 'string' ? previousCustomer : null;
}

export function resolveStripeId(value: ResolvableStripeId): string | null {
    if (!value) {
        return null;
    }
    return typeof value === 'string' ? value : value.id;
}

export function hasObjectType(value: unknown, objectType: string): value is { object: string } {
    if (!value || typeof value !== 'object') {
        return false;
    }
    return (value as { object?: string }).object === objectType;
}

export function isCheckoutSessionObject(value: unknown): value is Stripe.Checkout.Session {
    return hasObjectType(value, 'checkout.session');
}

export function isSubscriptionObject(value: unknown): value is Stripe.Subscription {
    return hasObjectType(value, 'subscription');
}

export function isInvoiceObject(value: unknown): value is Stripe.Invoice {
    return hasObjectType(value, 'invoice');
}

export function isPaymentMethodObject(value: unknown): value is Stripe.PaymentMethod {
    return hasObjectType(value, 'payment_method');
}

export function isSetupIntentObject(value: unknown): value is Stripe.SetupIntent {
    return hasObjectType(value, 'setup_intent');
}
