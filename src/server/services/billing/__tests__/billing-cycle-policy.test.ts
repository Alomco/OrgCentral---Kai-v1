import { describe, expect, it } from 'vitest';

import {
  resolveInitialPostpaidBillingAt,
  toStripeTrialEndTimestamp,
} from '@/server/services/billing/billing-cycle-policy';

describe('billing-cycle-policy', () => {
  it('resolves monthly postpaid billing one month ahead with day clamp', () => {
    const now = new Date('2026-01-31T10:15:30.000Z');

    const billingAt = resolveInitialPostpaidBillingAt(now, 'monthly');

    expect(billingAt.toISOString()).toBe('2026-02-28T10:15:30.000Z');
  });

  it('resolves annual postpaid billing one year ahead with leap-year clamp', () => {
    const now = new Date('2024-02-29T09:00:00.000Z');

    const billingAt = resolveInitialPostpaidBillingAt(now, 'annual');

    expect(billingAt.toISOString()).toBe('2025-02-28T09:00:00.000Z');
  });

  it('converts billing date to unix timestamp for Stripe trial_end', () => {
    const billingAt = new Date('2026-05-01T00:00:00.000Z');

    const timestamp = toStripeTrialEndTimestamp(billingAt);

    expect(timestamp).toBe(1777593600);
  });
});
