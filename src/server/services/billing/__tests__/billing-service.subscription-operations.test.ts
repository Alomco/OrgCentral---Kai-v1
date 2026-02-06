import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { resolveTenantBillingPlanMock } = vi.hoisted(() => ({
  resolveTenantBillingPlanMock: vi.fn(),
}));

vi.mock('@/server/repositories/platform/billing-plan-runtime-resolver', () => ({
  resolveTenantBillingPlan: resolveTenantBillingPlanMock,
}));

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { BillingServiceDependencies } from '@/server/services/billing/billing-service';
import { createCheckoutSessionOperation } from '@/server/services/billing/billing-service.subscription-operations';

const authorization: RepositoryAuthorizationContext = {
  orgId: '11111111-1111-4111-8111-111111111021',
  userId: '11111111-1111-4111-8111-111111111022',
  roleKey: 'custom',
  permissions: {},
  dataResidency: 'UK_ONLY',
  dataClassification: 'OFFICIAL',
  auditSource: 'test',
  tenantScope: {
    orgId: '11111111-1111-4111-8111-111111111021',
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test',
  },
};

describe('billing-service.subscription-operations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
    resolveTenantBillingPlanMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses tenant-assigned billing plan as checkout SSOT and schedules postpaid billing start', async () => {
    resolveTenantBillingPlanMock.mockResolvedValue({
      assignment: {
        id: 'assign_1',
        orgId: '11111111-1111-4111-8111-111111111999',
        tenantId: authorization.orgId,
        planId: 'plan_1',
        status: 'ACTIVE',
        effectiveFrom: '2026-02-01T00:00:00.000Z',
        effectiveTo: null,
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
      plan: {
        id: 'plan_1',
        orgId: '11111111-1111-4111-8111-111111111999',
        name: 'Enterprise Annual',
        description: null,
        stripePriceId: 'price_assigned_annual',
        currency: 'gbp',
        amountCents: 120000,
        cadence: 'annual',
        features: [],
        limits: {},
        status: 'ACTIVE',
        effectiveFrom: '2026-02-01T00:00:00.000Z',
        effectiveTo: null,
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    });

    const deps = buildDependencies();
    const orgSettingsLoader = vi.fn().mockResolvedValue({
      invites: { open: false },
      security: {
        mfaRequired: false,
        sessionTimeoutMinutes: 480,
        ipAllowlistEnabled: false,
        ipAllowlist: [],
      },
      notifications: {
        adminDigest: 'weekly',
        securityAlerts: true,
        productUpdates: true,
      },
      billing: {
        billingEmail: 'billing@example.com',
        billingCadence: 'monthly',
        autoRenew: true,
        billingCustomerId: 'cus_existing',
        invoicePrefix: undefined,
        vatNumber: undefined,
        billingAddress: undefined,
      },
    });

    const result = await createCheckoutSessionOperation(
      deps,
      orgSettingsLoader,
      { authorization, customerEmail: null },
    );

    expect(result.url).toBe('https://stripe.example.com/checkout');
    expect(deps.billingGateway.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: authorization.orgId,
        userId: authorization.userId,
        customerId: 'cus_existing',
        customerEmail: 'billing@example.com',
        priceId: 'price_assigned_annual',
        cadence: 'annual',
        seatCount: 7,
      }),
    );

    const checkoutInput = deps.billingGateway.createCheckoutSession.mock.calls[0][0];
    expect(checkoutInput.billingStartAt.toISOString()).toBe('2027-02-06T12:00:00.000Z');
  });
});

function buildDependencies() {
  const billingGateway = {
    createCheckoutSession: vi.fn().mockResolvedValue({
      id: 'cs_test',
      url: 'https://stripe.example.com/checkout',
    }),
    createCustomer: vi.fn(),
    createSetupIntent: vi.fn(),
    listPaymentMethods: vi.fn(),
    getPaymentMethodCustomerId: vi.fn(),
    detachPaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn(),
    previewUpcomingInvoice: vi.fn(),
    createPortalSession: vi.fn(),
    updateSubscription: vi.fn(),
    updateSubscriptionSeats: vi.fn(),
    parseWebhookEvent: vi.fn(),
  };

  const deps: BillingServiceDependencies & {
    billingGateway: { createCheckoutSession: ReturnType<typeof vi.fn> };
  } = {
    subscriptionRepository: {
      getByOrgId: vi.fn().mockResolvedValue(null),
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
      countActiveMemberships: vi.fn().mockResolvedValue(7),
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
      getOrganizationSettings: vi.fn(),
      updateOrganizationSettings: vi.fn(),
    },
    paymentMethodRepository: {
      listByOrgId: vi.fn(),
      getByStripeId: vi.fn(),
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
      stripeMonthlyPriceId: 'price_monthly',
      stripeAnnualPriceId: 'price_annual',
      stripeSuccessUrl: 'https://example.com/success',
      stripeCancelUrl: 'https://example.com/cancel',
    },
  };

  return deps;
}
