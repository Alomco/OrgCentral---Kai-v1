export interface StripeInvoiceSeatLine {
  quantity: number | null;
  priceId: string | null;
}

export function normalizeBillableSeatCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : 1;
}

export function resolveBillableSeatCountFromMemberships(activeMembershipCount: number): number {
  return normalizeBillableSeatCount(activeMembershipCount);
}

export function resolveBillableSeatCountFromSubscriptionItem(
  item: { quantity?: number | null } | null,
): number {
  if (!item) {
    return 1;
  }
  return normalizeBillableSeatCount(item.quantity ?? 1);
}

export function resolveBillableSeatCountFromInvoiceLines(
  lines: readonly StripeInvoiceSeatLine[],
  expectedPriceId?: string | null,
): number {
  if (lines.length === 0) {
    return 1;
  }

  if (expectedPriceId) {
    const matchingLine = lines.find((line) => line.priceId === expectedPriceId);
    if (matchingLine) {
      return normalizeBillableSeatCount(matchingLine.quantity ?? 1);
    }
  }

  const lineWithQuantity = lines.find((line) => (line.quantity ?? 0) > 0);
  if (lineWithQuantity) {
    return normalizeBillableSeatCount(lineWithQuantity.quantity ?? 1);
  }

  return 1;
}
