import type { Prisma } from '@/server/types/prisma';

export const LAST_STRIPE_EVENT_AT_METADATA_KEY = 'lastStripeEventAt';

export function shouldIgnoreStaleInvoiceEvent(
  existingMetadata: Prisma.JsonValue | null,
  incomingEventAt: Date | null,
): boolean {
  const currentEventAt = readLastStripeEventAt(existingMetadata);
  if (!currentEventAt) {
    return false;
  }
  return !incomingEventAt || incomingEventAt <= currentEventAt;
}

export function mergeInvoiceMetadataWithStripeEvent(input: {
  existingMetadata: Prisma.JsonValue | null;
  incomingMetadata: Record<string, string> | null;
  stripeEventCreatedAt: Date | null;
}): Record<string, string> {
  const merged: Record<string, string> = {
    ...toStringRecord(input.existingMetadata),
    ...(input.incomingMetadata ?? {}),
  };

  if (input.stripeEventCreatedAt) {
    merged[LAST_STRIPE_EVENT_AT_METADATA_KEY] = input.stripeEventCreatedAt.toISOString();
  }

  return merged;
}

export function readLastStripeEventAt(metadata: Prisma.JsonValue | null): Date | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const rawValue = (metadata as Record<string, Prisma.JsonValue | undefined>)[LAST_STRIPE_EVENT_AT_METADATA_KEY];
  if (typeof rawValue !== 'string') {
    return null;
  }

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toStringRecord(metadata: Prisma.JsonValue | null): Record<string, string> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  return Object.entries(metadata).reduce<Record<string, string>>((record, [key, value]) => {
    if (typeof value === 'string') {
      record[key] = value;
    }
    return record;
  }, {});
}
