"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { PaymentMethodData } from '@/server/types/billing-types';
import {
  billingKeys,
  createSetupIntent,
  listPaymentMethodsQuery,
  removePaymentMethod,
  setDefaultPaymentMethod,
} from './billing-payment-methods.api';
import {
  PaymentMethodSetupForm,
  buildStripeOptions,
  formatPaymentMethodMeta,
  formatPaymentMethodTitle,
} from './billing-payment-methods-setup.client';

interface BillingPaymentMethodsClientProps {
  orgId: string;
  paymentMethods: PaymentMethodData[];
  billingConfigured: boolean;
  canManage: boolean;
  publishableKey: string;
}

export function BillingPaymentMethodsClient({
  orgId,
  paymentMethods,
  billingConfigured,
  canManage,
  publishableKey,
}: BillingPaymentMethodsClientProps) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    ...listPaymentMethodsQuery(orgId),
    initialData: { paymentMethods, billingConfigured },
  });
  const methods = data.paymentMethods;
  const isBillingConfigured = data.billingConfigured;
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey],
  );
  const [completedClientSecret, setCompletedClientSecret] = useState<string | null>(null);
  const setupFormReference = useRef<HTMLFormElement | null>(null);
  const setupIntent = useMutation({
    mutationFn: () => createSetupIntent(orgId),
  });
  const setDefault = useMutation({
    mutationFn: (pmId: string) => setDefaultPaymentMethod(orgId, pmId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods(orgId) });
    },
  });
  const remove = useMutation({
    mutationFn: (pmId: string) => removePaymentMethod(orgId, pmId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods(orgId) });
    },
  });

  const feedback = [setupIntent.error?.message, setDefault.error?.message, remove.error?.message]
    .filter(Boolean)
    .join(' ');
  const clientSecret = setupIntent.data?.clientSecret ?? null;
  const showSetupForm = Boolean(
    clientSecret && stripePromise && completedClientSecret !== clientSecret,
  );
  const handleCreateSetupIntent = () => {
    setupIntent.mutate(undefined, {
      onSuccess: () => setCompletedClientSecret(null),
    });
  };

  useEffect(() => {
    if (showSetupForm) {
      setupFormReference.current?.focus();
    }
  }, [showSetupForm]);

  return (
    <div className="mt-4 space-y-4">
      {methods.length ? (
        <div className="space-y-2">
          {methods.map((method) => (
            <div
              key={method.stripePaymentMethodId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/80 p-4 transition hover:bg-background"
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPaymentMethodTitle(method)}
                    </p>
                    {method.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatPaymentMethodMeta(method)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!method.isDefault ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={setDefault.isPending}
                    onClick={async () => {
                      await setDefault.mutateAsync(method.stripePaymentMethodId);
                    }}
                  >
                    {setDefault.isPending ? <Spinner className="mr-2" /> : null}
                    Set default
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={remove.isPending}
                  onClick={async () => {
                    await remove.mutateAsync(method.stripePaymentMethodId);
                  }}
                >
                  {remove.isPending ? <Spinner className="mr-2" /> : null}
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : isBillingConfigured ? (
        <p className="text-sm text-muted-foreground">No payment methods saved yet.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Billing not configured.</p>
      )}

      {feedback ? (
        <p className="text-xs text-destructive" role="alert">
          {feedback}
        </p>
      ) : null}

      <div className="rounded-xl border border-border bg-background/70 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            disabled={!canManage || !isBillingConfigured || setupIntent.isPending || !publishableKey}
            onClick={handleCreateSetupIntent}
          >
            {setupIntent.isPending ? <Spinner className="mr-2" /> : null}
            Add payment method
          </Button>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" role="status" aria-live="polite">
            {!publishableKey ? <span>Stripe publishable key missing.</span> : null}
            {!isBillingConfigured ? <span>Billing not configured.</span> : null}
            {!canManage ? <span>Subscribe to enable payment methods.</span> : null}
          </div>
        </div>
      </div>

      {showSetupForm && clientSecret ? (
        <Elements stripe={stripePromise} options={buildStripeOptions(clientSecret)}>
          <PaymentMethodSetupForm
            formRef={setupFormReference}
            onComplete={async () => {
              setCompletedClientSecret(clientSecret);
              await queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods(orgId) });
            }}
          />
        </Elements>
      ) : null}
      {clientSecret && completedClientSecret === clientSecret ? (
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          Payment method added. Refreshing details...
        </p>
      ) : null}
    </div>
  );
}

