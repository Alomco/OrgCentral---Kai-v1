import type { OrgId, TenantMetadata } from './tenant';
import type { TimestampString } from './leave-types';

export const BILLING_SUBSCRIPTION_STATUSES = [
  'INCOMPLETE',
  'INCOMPLETE_EXPIRED',
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'UNPAID',
  'PAUSED',
] as const;

export type BillingSubscriptionStatus = (typeof BILLING_SUBSCRIPTION_STATUSES)[number];

export interface OrganizationSubscriptionData extends TenantMetadata {
  id: string;
  orgId: OrgId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSubscriptionItemId?: string | null;
  stripePriceId: string;
  status: BillingSubscriptionStatus;
  seatCount: number;
  currentPeriodEnd?: TimestampString | null;
  cancelAtPeriodEnd: boolean;
  lastStripeEventAt?: TimestampString | null;
  createdAt: TimestampString;
  updatedAt: TimestampString;
}
