import { ValidationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IMembershipRepository } from '@/server/repositories/contracts/org/membership';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type {
  IOrganizationSubscriptionRepository,
} from '@/server/repositories/contracts/org/billing';
import type { OrganizationSubscriptionData } from '@/server/types/billing-types';
import { AbstractOrgService } from '@/server/services/org/abstract-org-service';
import type {
  BillingGateway,
  BillingWebhookEvent,
} from '@/server/services/billing/billing-gateway';
import type { BillingConfig } from '@/server/services/billing/billing-config';
import { buildSystemAuthorizationContext } from '@/server/services/billing/billing-service.helpers';

export interface BillingServiceDependencies {
  subscriptionRepository: IOrganizationSubscriptionRepository;
  membershipRepository: IMembershipRepository;
  organizationRepository: IOrganizationRepository;
  billingGateway: BillingGateway;
  billingConfig: BillingConfig;
}

export class BillingService extends AbstractOrgService {
  private readonly subscriptionRepository: IOrganizationSubscriptionRepository;
  private readonly membershipRepository: IMembershipRepository;
  private readonly organizationRepository: IOrganizationRepository;
  private readonly billingGateway: BillingGateway;
  private readonly billingConfig: BillingConfig;

  constructor(deps: BillingServiceDependencies) {
    super();
    this.subscriptionRepository = deps.subscriptionRepository;
    this.membershipRepository = deps.membershipRepository;
    this.organizationRepository = deps.organizationRepository;
    this.billingGateway = deps.billingGateway;
    this.billingConfig = deps.billingConfig;
  }

  async createCheckoutSession(input: {
    authorization: RepositoryAuthorizationContext;
    customerEmail?: string | null;
  }): Promise<{ url: string }> {
    await this.ensureOrgAccess(input.authorization, {
      requiredPermissions: { organization: ['update'] },
      action: 'org.billing.checkout',
      resourceType: ORG_BILLING_RESOURCE_TYPE,
      resourceAttributes: { orgId: input.authorization.orgId },
    });

    const context = this.buildContext(input.authorization);

    return this.executeInServiceContext(context, 'billing.checkout.create', async () => {
      const existing = await this.subscriptionRepository.getByOrgId(
        input.authorization,
        input.authorization.orgId,
      );
      if (existing?.status === 'ACTIVE' || existing?.status === 'TRIALING') {
        throw new ValidationError('Subscription is already active.');
      }

      const seatCount = await this.resolveSeatCount(input.authorization);
      const result = await this.billingGateway.createCheckoutSession({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        customerEmail: input.customerEmail,
        seatCount,
        successUrl: this.billingConfig.stripeSuccessUrl,
        cancelUrl: this.billingConfig.stripeCancelUrl,
        priceId: this.billingConfig.stripePriceId,
      });

      return { url: result.url };
    });
  }

  async createPortalSession(input: {
    authorization: RepositoryAuthorizationContext;
  }): Promise<{ url: string }> {
    await this.ensureOrgAccess(input.authorization, {
      requiredPermissions: { organization: ['update'] },
      action: 'org.billing.portal',
      resourceType: ORG_BILLING_RESOURCE_TYPE,
      resourceAttributes: { orgId: input.authorization.orgId },
    });

    const context = this.buildContext(input.authorization);

    return this.executeInServiceContext(context, 'billing.portal.create', async () => {
      const subscription = await this.subscriptionRepository.getByOrgId(
        input.authorization,
        input.authorization.orgId,
      );
      if (!subscription) {
        throw new ValidationError('Subscription not found for this organization.');
      }

      const result = await this.billingGateway.createPortalSession({
        customerId: subscription.stripeCustomerId,
        returnUrl: this.billingConfig.stripePortalReturnUrl ?? this.billingConfig.stripeSuccessUrl,
      });

      return { url: result.url };
    });
  }

  async getSubscription(input: {
    authorization: RepositoryAuthorizationContext;
  }): Promise<OrganizationSubscriptionData | null> {
    await this.ensureOrgAccess(input.authorization, {
      requiredPermissions: { organization: ['read'] },
      action: 'org.billing.read',
      resourceType: ORG_BILLING_RESOURCE_TYPE,
      resourceAttributes: { orgId: input.authorization.orgId },
    });

    const context = this.buildContext(input.authorization);

    return this.executeInServiceContext(context, 'billing.subscription.get', () =>
      this.subscriptionRepository.getByOrgId(input.authorization, input.authorization.orgId),
    );
  }

  async syncSeats(input: {
    authorization: RepositoryAuthorizationContext;
  }): Promise<void> {
    const context = this.buildContext(input.authorization);

    await this.executeInServiceContext(context, 'billing.seats.sync', async () => {
      const subscription = await this.subscriptionRepository.getByOrgId(
        input.authorization,
        input.authorization.orgId,
      );
      if (
        !subscription?.stripeSubscriptionItemId ||
        !['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(subscription.status)
      ) {
        return;
      }

      const seatCount = await this.resolveSeatCount(input.authorization);
      if (seatCount === subscription.seatCount) {
        return;
      }

      await this.billingGateway.updateSubscriptionSeats({
        subscriptionItemId: subscription.stripeSubscriptionItemId,
        seatCount,
        idempotencyKey: buildSeatSyncIdempotencyKey(
          subscription.stripeSubscriptionItemId,
          seatCount,
        ),
      });

      await this.subscriptionRepository.updateSeatCount(
        input.authorization,
        input.authorization.orgId,
        seatCount,
      );
    });
  }

  async handleWebhookEvent(event: BillingWebhookEvent): Promise<{ received: true }> {
    if (event.type === 'checkout.completed') {
      return { received: true };
    }
    if (event.type === 'ignored') {
      return { received: true };
    }

    const subscription = event.subscription;
    const orgId = subscription.orgId ?? null;
    if (!orgId) {
      this.logger.warn('billing.webhook.missing-org-id', {
        eventType: event.type,
        subscriptionId: subscription.stripeSubscriptionId,
      });
      return { received: true };
    }

    const authorization = await buildSystemAuthorizationContext({
      organizationRepository: this.organizationRepository,
      orgId,
      userId: subscription.userId,
      auditSource: 'stripe:webhook',
    });

    await this.subscriptionRepository.upsertSubscription(authorization, {
      orgId,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripeSubscriptionItemId: subscription.stripeSubscriptionItemId ?? null,
      stripePriceId: subscription.stripePriceId,
      status: subscription.status,
      seatCount: subscription.seatCount,
      currentPeriodEnd: subscription.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeEventCreatedAt: event.stripeEventCreatedAt,
      metadata: subscription.metadata ?? null,
    });

    return { received: true };
  }

  private async resolveSeatCount(
    authorization: RepositoryAuthorizationContext,
  ): Promise<number> {
    const count = await this.membershipRepository.countActiveMemberships(authorization);
    return Math.max(count, 1);
  }
}

const SEAT_SYNC_BUCKET_MS = 5 * 60 * 1000;
const ORG_BILLING_RESOURCE_TYPE = 'org.billing';

function buildSeatSyncIdempotencyKey(subscriptionItemId: string, seatCount: number): string {
  const bucket = Math.floor(Date.now() / SEAT_SYNC_BUCKET_MS);
  return `seat-sync:${subscriptionItemId}:${String(seatCount)}:${String(bucket)}`;
}
