"use client";

import { useState, type FormEvent, type RefObject } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';

import { Button } from '@/components/ui/button';
import type { PaymentMethodData } from '@/server/types/billing-types';

export function PaymentMethodSetupForm({
    onComplete,
    formRef,
}: {
    onComplete: () => Promise<void>;
    formRef: RefObject<HTMLFormElement | null>;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [status, setStatus] = useState<'idle' | 'saving'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        setStatus('saving');
        setMessage(null);

        const result = await stripe.confirmSetup({
            elements,
            redirect: 'if_required',
        });

        if (result.error) {
            setMessage(result.error.message ?? 'Payment method setup failed.');
            setStatus('idle');
            return;
        }

        setStatus('idle');
        await onComplete();
    }

    return (
        <form
            ref={formRef}
            tabIndex={-1}
            onSubmit={handleSubmit}
            className="space-y-3 rounded-xl border border-border bg-background/80 p-4"
        >
            <PaymentElement options={{ layout: 'tabs' }} />
            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm" disabled={status === 'saving' || !stripe || !elements}>
                    Save payment method
                </Button>
                {message ? (
                    <span className="text-xs text-destructive" role="alert">
                        {message}
                    </span>
                ) : null}
            </div>
        </form>
    );
}

export function buildStripeOptions(clientSecret: string): StripeElementsOptions {
    return {
        clientSecret,
        appearance: { theme: 'stripe' },
    };
}

export function formatPaymentMethodTitle(method: PaymentMethodData): string {
    switch (method.type) {
        case 'CARD':
            return `${method.brand ?? 'Card'} **** ${method.last4}`;
        case 'BACS_DEBIT':
            return `BACS **** ${method.last4}`;
        case 'SEPA_DEBIT':
            return `SEPA **** ${method.last4}`;
        default:
            return `Payment **** ${method.last4}`;
    }
}

export function formatPaymentMethodMeta(method: PaymentMethodData): string {
    switch (method.type) {
        case 'CARD':
            if (method.expiryMonth && method.expiryYear) {
                return `Expires ${String(method.expiryMonth).padStart(2, '0')}/${String(method.expiryYear).slice(-2)}`;
            }
            return 'Card payment method';
        case 'BACS_DEBIT':
            return method.bankName ? `Bank: ${method.bankName}` : 'UK Direct Debit';
        case 'SEPA_DEBIT':
            return 'SEPA Direct Debit';
        default:
            return 'Saved payment method';
    }
}
