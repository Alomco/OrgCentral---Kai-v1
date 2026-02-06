import { ValidationError } from '@/server/errors';
import { appLogger } from '@/server/logging/structured-logger';
import { resolveTenantBillingPlan } from '@/server/repositories/platform/billing-plan-runtime-resolver';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { BillingServiceDependencies } from '@/server/services/billing/billing-service';
import { buildSeatSyncIdempotencyKey, resolveBillingPriceId } from '@/server/services/billing/billing-preferences';
import { resolveInitialPostpaidBillingAt } from '@/server/services/billing/billing-cycle-policy';
import { resolveBillableSeatCountFromMemberships } from '@/server/services/billing/billing-seat-metrics';
import {
  resolveBillingCustomerEmail,
  resolveBillingCustomerId,
} from '@/server/services/billing/billing-customer-profile';
import type { OrganizationSubscriptionData } from '@/server/types/billing-types';
import type { OrgSettings } from '@/server/services/org/settings/org-settings-model';

export async function createCheckoutSessionOperation(
  deps: BillingServiceDependencies,
  orgSettingsLoader: (orgId: string) => Promise<OrgSettings>,
  input: {
    authorization: RepositoryAuthorizationContext;
    customerEmail?: string | null;
  },
): Promise<{ url: string }> {
  const orgSettings = await orgSettingsLoader(input.authorization.orgId);
  const existing = await deps.subscriptionRepository.getByOrgId(
    input.authorization,
    input.authorization.orgId,
  );
  if (existing?.status === 'ACTIVE' || existing?.status === 'TRIALING') {
    throw new ValidationError('Subscription is already active.');
  }

  const assignedPlan = await resolveTenantBillingPlan(input.authorization);
  const cadence = assignedPlan?.plan.cadence ?? orgSettings.billing.billingCadence;
  const fallbackPriceId = resolveBillingPriceId(orgSettings.billing.billingCadence, deps.billingConfig);
  const priceId = assignedPlan?.plan.stripePriceId ?? fallbackPriceId;
  const seatCount = await resolveSeatCount(deps, input.authorization);
  const billingStartAt = resolveInitialPostpaidBillingAt(new Date(), cadence);
  const result = await deps.billingGateway.createCheckoutSession({
    orgId: input.authorization.orgId,
    userId: input.authorization.userId,
    customerId: resolveBillingCustomerId(orgSettings) ?? undefined,
    customerEmail: resolveBillingCustomerEmail(orgSettings, input.customerEmail) ?? undefined,
    seatCount,
    successUrl: deps.billingConfig.stripeSuccessUrl,
    cancelUrl: deps.billingConfig.stripeCancelUrl,
    priceId,
    cadence,
    billingStartAt,
  });

  return { url: result.url };
}

export async function createPortalSessionOperation(
  deps: BillingServiceDependencies,
  input: {
    authorization: RepositoryAuthorizationContext;
  },
): Promise<{ url: string }> {
  const subscription = await deps.subscriptionRepository.getByOrgId(
    input.authorization,
    input.authorization.orgId,
  );
  if (!subscription) {
    throw new ValidationError('Subscription not found for this organization.');
  }

  const result = await deps.billingGateway.createPortalSession({
    customerId: subscription.stripeCustomerId,
    returnUrl: deps.billingConfig.stripePortalReturnUrl ?? deps.billingConfig.stripeSuccessUrl,
  });

  return { url: result.url };
}

export async function syncSeatsOperation(
  deps: BillingServiceDependencies,
  orgSettingsLoader: (orgId: string) => Promise<OrgSettings>,
  input: {
    authorization: RepositoryAuthorizationContext;
  },
): Promise<void> {
  const orgSettings = await orgSettingsLoader(input.authorization.orgId);
  if (!orgSettings.billing.autoRenew) {
    return;
  }
  const subscription = await deps.subscriptionRepository.getByOrgId(
    input.authorization,
    input.authorization.orgId,
  );
  if (
    !subscription?.stripeSubscriptionItemId ||
    !['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(subscription.status)
  ) {
    return;
  }

  await syncAssignedPlanPriceIfNeeded(deps, input.authorization, subscription);

  const seatCount = await resolveSeatCount(deps, input.authorization);
  if (seatCount === subscription.seatCount) {
    return;
  }

  await deps.billingGateway.updateSubscriptionSeats({
    subscriptionItemId: subscription.stripeSubscriptionItemId,
    seatCount,
    idempotencyKey: buildSeatSyncIdempotencyKey(
      subscription.stripeSubscriptionItemId,
      seatCount,
    ),
  });

  await deps.subscriptionRepository.updateSeatCount(
    input.authorization,
    input.authorization.orgId,
    seatCount,
  );
}

async function resolveSeatCount(
  deps: BillingServiceDependencies,
  authorization: RepositoryAuthorizationContext,
): Promise<number> {
  const count = await deps.membershipRepository.countActiveMemberships(authorization);
  return resolveBillableSeatCountFromMemberships(count);
}

async function syncAssignedPlanPriceIfNeeded(
  deps: BillingServiceDependencies,
  authorization: RepositoryAuthorizationContext,
  subscription: OrganizationSubscriptionData,
): Promise<void> {
  const assignedPlan = await resolveTenantBillingPlan(authorization);
  if (!assignedPlan || assignedPlan.plan.stripePriceId === subscription.stripePriceId) {
    return;
  }

  if (!subscription.stripeSubscriptionItemId) {
    appLogger.warn('billing.assignment.activation.subscription-item-missing', {
      orgId: authorization.orgId,
      assignmentId: assignedPlan.assignment.id,
      subscriptionId: subscription.stripeSubscriptionId,
    });
    return;
  }

  await deps.billingGateway.updateSubscription({
    subscriptionId: subscription.stripeSubscriptionId,
    subscriptionItemId: subscription.stripeSubscriptionItemId,
    priceId: assignedPlan.plan.stripePriceId,
    prorationBehavior: 'none',
  });

  await deps.subscriptionRepository.updatePrice(
    authorization,
    authorization.orgId,
    assignedPlan.plan.stripePriceId,
  );

  appLogger.info('billing.assignment.activation.applied', {
    orgId: authorization.orgId,
    assignmentId: assignedPlan.assignment.id,
    stripePriceId: assignedPlan.plan.stripePriceId,
  });
}
