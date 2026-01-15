import type {
  OrganizationSubscriptionData,
  OrganizationSubscriptionRecord,
} from '@/server/types/billing-types';

export function mapOrganizationSubscriptionToData(
  subscription: OrganizationSubscriptionRecord,
): OrganizationSubscriptionData {
  return {
    id: subscription.id,
    orgId: subscription.orgId,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    stripeSubscriptionItemId: subscription.stripeSubscriptionItemId ?? undefined,
    stripePriceId: subscription.stripePriceId,
    status: subscription.status,
    seatCount: subscription.seatCount,
    currentPeriodEnd: subscription.currentPeriodEnd
      ? subscription.currentPeriodEnd.toISOString()
      : null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    lastStripeEventAt: subscription.lastStripeEventAt
      ? subscription.lastStripeEventAt.toISOString()
      : null,
    dataClassification: subscription.dataClassification,
    dataResidency: subscription.residencyTag,
    auditSource: 'billing-repository',
    auditBatchId: undefined,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  };
}
