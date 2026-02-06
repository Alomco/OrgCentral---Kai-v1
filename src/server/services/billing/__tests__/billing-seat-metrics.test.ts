import { describe, expect, it } from 'vitest';

import {
  normalizeBillableSeatCount,
  resolveBillableSeatCountFromInvoiceLines,
  resolveBillableSeatCountFromMemberships,
  resolveBillableSeatCountFromSubscriptionItem,
} from '@/server/services/billing/billing-seat-metrics';

describe('billing-seat-metrics', () => {
  it('normalizes invalid or non-positive seat counts to one', () => {
    expect(normalizeBillableSeatCount(-3)).toBe(1);
    expect(normalizeBillableSeatCount(0)).toBe(1);
    expect(normalizeBillableSeatCount(Number.NaN)).toBe(1);
  });

  it('resolves billable seats from membership count', () => {
    expect(resolveBillableSeatCountFromMemberships(12)).toBe(12);
    expect(resolveBillableSeatCountFromMemberships(0)).toBe(1);
  });

  it('resolves subscription seat count from item quantity', () => {
    expect(resolveBillableSeatCountFromSubscriptionItem({ quantity: 5 })).toBe(5);
    expect(resolveBillableSeatCountFromSubscriptionItem({ quantity: null })).toBe(1);
    expect(resolveBillableSeatCountFromSubscriptionItem(null)).toBe(1);
  });

  it('prefers expected price line when resolving invoice seat counts', () => {
    const seats = resolveBillableSeatCountFromInvoiceLines(
      [
        { quantity: 3, priceId: 'price_other' },
        { quantity: 11, priceId: 'price_expected' },
      ],
      'price_expected',
    );

    expect(seats).toBe(11);
  });
});
