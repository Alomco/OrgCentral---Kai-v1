import { Prisma } from '@prisma/client';

import type {
  IOrganizationSubscriptionRepository,
  OrganizationSubscriptionUpsertInput,
} from '@/server/repositories/contracts/org/billing';
import type { OrganizationSubscriptionData } from '@/server/types/billing-types';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { OrgScopedPrismaRepository } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { mapOrganizationSubscriptionToData } from '@/server/repositories/mappers/org/billing/organization-subscription-mapper';

const SUBSCRIPTION_NOT_FOUND_MESSAGE = 'Organization subscription not found.';

export class PrismaOrganizationSubscriptionRepository
  extends OrgScopedPrismaRepository
  implements IOrganizationSubscriptionRepository {
  async getByOrgId(
    context: RepositoryAuthorizationContext,
    orgId: string,
  ): Promise<OrganizationSubscriptionData | null> {
    const subscription = await getModelDelegate(this.prisma, 'organizationSubscription').findUnique({
      where: { orgId },
    });
    if (!subscription) {
      return null;
    }
    this.assertTenantRecord(subscription, context.orgId);
    return mapOrganizationSubscriptionToData(subscription);
  }

  async upsertSubscription(
    context: RepositoryAuthorizationContext,
    input: OrganizationSubscriptionUpsertInput,
  ): Promise<OrganizationSubscriptionData> {
    if (input.orgId !== context.orgId) {
      throw new Error('Cross-tenant subscription update rejected.');
    }

    const existing = await getModelDelegate(this.prisma, 'organizationSubscription').findUnique({
      where: { orgId: input.orgId },
    });

    const incomingEventAt = input.stripeEventCreatedAt ?? null;
    if (existing?.lastStripeEventAt && (!incomingEventAt || incomingEventAt <= existing.lastStripeEventAt)) {
      return mapOrganizationSubscriptionToData(existing);
    }

    const metadata =
      input.metadata && Object.keys(input.metadata).length > 0
        ? toPrismaInputJson(input.metadata)
        : Prisma.JsonNull;

    const subscription = await getModelDelegate(this.prisma, 'organizationSubscription').upsert({
      where: { orgId: input.orgId },
      create: {
        orgId: input.orgId,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        stripeSubscriptionItemId: input.stripeSubscriptionItemId ?? null,
        stripePriceId: input.stripePriceId,
        status: input.status,
        seatCount: input.seatCount,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        lastStripeEventAt: incomingEventAt,
        metadata,
        dataClassification: context.dataClassification,
        residencyTag: context.dataResidency,
      },
      update: {
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        stripeSubscriptionItemId: input.stripeSubscriptionItemId ?? null,
        stripePriceId: input.stripePriceId,
        status: input.status,
        seatCount: input.seatCount,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        lastStripeEventAt: incomingEventAt ?? existing?.lastStripeEventAt ?? null,
        metadata,
        dataClassification: context.dataClassification,
        residencyTag: context.dataResidency,
      },
    });

    return mapOrganizationSubscriptionToData(subscription);
  }

  async updateSeatCount(
    context: RepositoryAuthorizationContext,
    orgId: string,
    seatCount: number,
  ): Promise<OrganizationSubscriptionData> {
    if (orgId !== context.orgId) {
      throw new Error('Cross-tenant subscription update rejected.');
    }

    const existing = await getModelDelegate(this.prisma, 'organizationSubscription').findUnique({
      where: { orgId },
    });

    if (!existing) {
      throw new Error(SUBSCRIPTION_NOT_FOUND_MESSAGE);
    }

    const subscription = await getModelDelegate(this.prisma, 'organizationSubscription').update({
      where: { orgId },
      data: {
        seatCount,
        dataClassification: context.dataClassification,
        residencyTag: context.dataResidency,
      },
    });

    return mapOrganizationSubscriptionToData(subscription);
  }
}
