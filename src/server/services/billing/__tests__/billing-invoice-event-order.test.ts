import { describe, expect, it } from 'vitest';

import {
  LAST_STRIPE_EVENT_AT_METADATA_KEY,
  mergeInvoiceMetadataWithStripeEvent,
  readLastStripeEventAt,
  shouldIgnoreStaleInvoiceEvent,
} from '@/server/lib/billing/invoice-event-order';

describe('billing-invoice-event-order', () => {
  it('ignores stale invoice events when metadata has a newer timestamp', () => {
    const metadata = {
      [LAST_STRIPE_EVENT_AT_METADATA_KEY]: '2026-02-01T12:00:00.000Z',
    };
    const incoming = new Date('2026-02-01T11:59:59.000Z');

    expect(shouldIgnoreStaleInvoiceEvent(metadata, incoming)).toBe(true);
  });

  it('does not ignore newer invoice events', () => {
    const metadata = {
      [LAST_STRIPE_EVENT_AT_METADATA_KEY]: '2026-02-01T12:00:00.000Z',
    };
    const incoming = new Date('2026-02-01T12:00:01.000Z');

    expect(shouldIgnoreStaleInvoiceEvent(metadata, incoming)).toBe(false);
  });

  it('merges metadata and persists latest stripe event timestamp', () => {
    const merged = mergeInvoiceMetadataWithStripeEvent({
      existingMetadata: { existing: 'value' },
      incomingMetadata: { next: 'value' },
      stripeEventCreatedAt: new Date('2026-02-05T10:30:00.000Z'),
    });

    expect(merged.existing).toBe('value');
    expect(merged.next).toBe('value');
    expect(merged[LAST_STRIPE_EVENT_AT_METADATA_KEY]).toBe('2026-02-05T10:30:00.000Z');
    expect(readLastStripeEventAt(merged)?.toISOString()).toBe('2026-02-05T10:30:00.000Z');
  });
});
