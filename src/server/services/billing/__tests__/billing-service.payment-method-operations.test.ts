import { describe, expect, it, vi, beforeEach } from 'vitest';

const { updateOrgSettingsMock } = vi.hoisted(() => ({
  updateOrgSettingsMock: vi.fn(),
}));

vi.mock('@/server/services/org/settings/org-settings-store', () => ({
  updateOrgSettings: updateOrgSettingsMock,
}));

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { BillingServiceDependencies } from '@/server/services/billing/billing-service';
import {
  createSetupIntentOperation,
  removePaymentMethodOperation,
} from '@/server/services/billing/billing-service.payment-method-operations';

const authorization: RepositoryAuthorizationContext = {
  orgId: '11111111-1111-4111-8111-111111111001',
  userId: '11111111-1111-4111-8111-111111111002',
  roleKey: 'custom',
  permissions: {},
  dataResidency: 'UK_ONLY',
  dataClassification: 'OFFICIAL',
  auditSource: 'test',
  tenantScope: {
    orgId: '11111111-1111-4111-8111-111111111001',
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test',
  },
};

describe('billing-service.payment-method-operations', () => {
  beforeEach(() => {
    updateOrgSettingsMock.mockReset();
  });

  it('creates a Stripe customer for setup intent when subscription does not exist', async () => {
    const deps = buildDependencies({
      subscriptionByOrg: null,
      organizationSettings: {},
      createdCustomerId: 'cus_new',
      setupIntentClientSecret: 'seti_secret',
    });

    const result = await createSetupIntentOperation(deps, { authorization });

    expect(result.clientSecret).toBe('seti_secret');
    expect(deps.billingGateway.createCustomer).toHaveBeenCalledWith({
      orgId: authorization.orgId,
      userId: authorization.userId,
      email: null,
    });
    expect(updateOrgSettingsMock).toHaveBeenCalledWith(
      authorization,
      expect.objectContaining({
        billing: expect.objectContaining({ billingCustomerId: 'cus_new' }),
      }),
    );
    expect(deps.billingGateway.createSetupIntent).toHaveBeenCalledWith({
      customerId: 'cus_new',
      paymentMethodTypes: ['card'],
    });
  });

  it('rejects payment method removal when Stripe ownership does not match tenant customer', async () => {
    const deps = buildDependencies({
      subscriptionByOrg: {
        stripeCustomerId: 'cus_org',
      },
      localPaymentMethodExists: true,
      stripePaymentMethodCustomerId: 'cus_other',
    });

    await expect(
      removePaymentMethodOperation(deps, {
        authorization,
        paymentMethodId: 'pm_123',
      }),
    ).rejects.toThrow('Payment method does not belong to this organization.');

    expect(deps.billingGateway.detachPaymentMethod).not.toHaveBeenCalled();
  });
});

function buildDependencies(options: {
  subscriptionByOrg?: { stripeCustomerId: string } | null;
  organizationSettings?: Record<string, string | number | boolean | null | object> | null;
  createdCustomerId?: string;
  setupIntentClientSecret?: string;
  localPaymentMethodExists?: boolean;
  stripePaymentMethodCustomerId?: string | null;
}): BillingServiceDependencies {
  const subscriptionByOrg = options.subscriptionByOrg ?? null;
  const createdCustomerId = options.createdCustomerId ?? 'cus_default';
  const setupIntentClientSecret = options.setupIntentClientSecret ?? 'seti_default';
  const localPaymentMethodExists = options.localPaymentMethodExists ?? true;
  const stripePaymentMethodCustomerId = options.stripePaymentMethodCustomerId ?? 'cus_org';

  const billingGateway = {
    createCheckoutSession: vi.fn(),
    createCustomer: vi.fn().mockResolvedValue({ customerId: createdCustomerId }),
    createSetupIntent: vi.fn().mockResolvedValue({ clientSecret: setupIntentClientSecret }),
    listPaymentMethods: vi.fn().mockResolvedValue([]),
    getPaymentMethodCustomerId: vi.fn().mockResolvedValue(stripePaymentMethodCustomerId),
    detachPaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn(),
    previewUpcomingInvoice: vi.fn(),
    createPortalSession: vi.fn(),
    updateSubscription: vi.fn(),
    updateSubscriptionSeats: vi.fn(),
    parseWebhookEvent: vi.fn(),
  };

  const deps: BillingServiceDependencies = {
    subscriptionRepository: {
      getByOrgId: vi.fn().mockResolvedValue(
        subscriptionByOrg
          ? {
            id: 'sub_1',
            orgId: authorization.orgId,
            stripeCustomerId: subscriptionByOrg.stripeCustomerId,
            stripeSubscriptionId: 'sub_stripe',
            stripeSubscriptionItemId: 'si_1',
            stripePriceId: 'price_1',
            status: 'ACTIVE',
            seatCount: 1,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            lastStripeEventAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            auditSource: 'test',
            auditBatchId: undefined,
          }
          : null,
      ),
      getByStripeCustomerId: vi.fn(),
      getByStripeSubscriptionId: vi.fn(),
      upsertSubscription: vi.fn(),
      updateSeatCount: vi.fn(),
      updatePrice: vi.fn(),
    },
    membershipRepository: {
      findMembership: vi.fn(),
      createMembershipWithProfile: vi.fn(),
      updateMembershipStatus: vi.fn(),
      countActiveMemberships: vi.fn(),
    },
    organizationRepository: {
      getOrganization: vi.fn(),
      getOrganizationBySlug: vi.fn(),
      getLeaveEntitlements: vi.fn(),
      updateLeaveSettings: vi.fn(),
      updateOrganizationProfile: vi.fn(),
      createOrganization: vi.fn(),
      addCustomLeaveType: vi.fn(),
      removeLeaveType: vi.fn(),
      getOrganizationSettings: vi.fn().mockResolvedValue(options.organizationSettings ?? null),
      updateOrganizationSettings: vi.fn(),
    },
    paymentMethodRepository: {
      listByOrgId: vi.fn(),
      getByStripeId: vi.fn().mockResolvedValue(
        localPaymentMethodExists
          ? {
            id: 'pm_local',
            orgId: authorization.orgId,
            stripePaymentMethodId: 'pm_123',
            type: 'CARD',
            last4: '4242',
            brand: 'visa',
            bankName: null,
            expiryMonth: 12,
            expiryYear: 2030,
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            auditSource: 'test',
            auditBatchId: undefined,
          }
          : null,
      ),
      upsertPaymentMethod: vi.fn(),
      setDefaultPaymentMethod: vi.fn(),
      removePaymentMethod: vi.fn(),
    },
    billingInvoiceRepository: {
      listByOrgId: vi.fn(),
      getByStripeId: vi.fn(),
      getById: vi.fn(),
      upsertInvoice: vi.fn(),
    },
    billingGateway,
    billingConfig: {
      stripeSecretKey: 'sk_test',
      stripeWebhookSecret: 'whsec_test',
      stripePriceId: 'price_default',
      stripeSuccessUrl: 'https://example.com/success',
      stripeCancelUrl: 'https://example.com/cancel',
      stripeEnableBacsDebit: false,
      stripeEnableSepaDebit: false,
    },
  };

  return deps;
}
