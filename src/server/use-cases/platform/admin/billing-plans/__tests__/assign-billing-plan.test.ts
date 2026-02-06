import { describe, expect, it, vi } from 'vitest';

import { assignBillingPlanToTenant } from '@/server/use-cases/platform/admin/billing-plans/assign-billing-plan';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { IBillingPlanRepository } from '@/server/repositories/contracts/platform/admin/billing-plan-repository-contract';
import type { IPlatformSubscriptionRepository } from '@/server/repositories/contracts/platform/admin/platform-subscription-repository-contract';
import type { BillingGateway } from '@/server/services/billing/billing-gateway';
import type { BillingPlan } from '@/server/types/platform/billing-plan';
import type { BillingPlanAssignment } from '@/server/types/platform/billing-plan';
import type { OrganizationSubscriptionData } from '@/server/types/billing-types';
import type { IPlatformTenantRepository } from '@/server/repositories/contracts/platform/admin/platform-tenant-repository-contract';
import type { PlatformTenantDetail } from '@/server/types/platform/tenant-admin';

const authorization: RepositoryAuthorizationContext = {
    orgId: '11111111-1111-4111-8111-111111111140',
    userId: '11111111-1111-4111-8111-111111111141',
    roleKey: 'globalAdmin',
    permissions: { platformBillingPlans: ['assign'] },
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test',
    tenantScope: {
        orgId: '00000000-0000-0000-0000-000000000040',
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
    },
    auditBatchId: undefined,
    mfaVerified: true,
    ipAddress: '127.0.0.1',
    userAgent: 'vitest',
    authenticatedAt: new Date(),
    sessionExpiresAt: new Date(Date.now() + 1000 * 60),
    lastActivityAt: new Date(),
    sessionId: 'session',
    sessionToken: 'token',
    authorizedAt: new Date(),
    authorizationReason: 'test',
};

const draftPlan: BillingPlan = {
    id: '11111111-1111-4111-8111-111111111142',
    orgId: authorization.orgId,
    dataResidency: authorization.dataResidency,
    dataClassification: authorization.dataClassification,
    auditSource: authorization.auditSource,
    name: 'Draft Plan',
    description: null,
    stripePriceId: 'price_123',
    currency: 'gbp',
    amountCents: 1000,
    cadence: 'monthly',
    features: [],
    limits: {},
    status: 'DRAFT',
    effectiveFrom: new Date().toISOString(),
    effectiveTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const mockAssignment: BillingPlanAssignment = {
    id: '11111111-1111-4111-8111-111111111150',
    orgId: authorization.orgId,
    dataResidency: authorization.dataResidency,
    dataClassification: authorization.dataClassification,
    auditSource: authorization.auditSource,
    tenantId: '11111111-1111-4111-8111-111111111151',
    planId: draftPlan.id,
    effectiveFrom: new Date().toISOString(),
    effectiveTo: null,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const mockTenant: PlatformTenantDetail = {
    id: '11111111-1111-4111-8111-111111111151',
    name: 'Tenant',
    slug: 'tenant',
    status: 'ACTIVE',
    complianceTier: 'STANDARD',
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    regionCode: 'UK',
    ownerEmail: 'owner@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subscription: null,
    governanceTags: null,
    securityControls: null,
};

const billingPlanRepository: IBillingPlanRepository = {
    listPlans: vi.fn().mockResolvedValue([draftPlan]),
    getPlan: vi.fn().mockResolvedValue(draftPlan),
    createPlan: vi.fn().mockResolvedValue(draftPlan),
    updatePlan: vi.fn().mockResolvedValue(draftPlan),
    listAssignments: vi.fn().mockResolvedValue([]),
    createAssignment: vi.fn().mockResolvedValue(mockAssignment),
};

const mockSubscription: OrganizationSubscriptionData = {
    id: '11111111-1111-4111-8111-111111111152',
    orgId: '11111111-1111-4111-8111-111111111151',
    stripeCustomerId: 'cus',
    stripeSubscriptionId: 'sub',
    stripeSubscriptionItemId: 'item',
    stripePriceId: 'price',
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
};

const subscriptionRepository: IPlatformSubscriptionRepository = {
    getSubscriptionByOrgId: vi.fn().mockResolvedValue(mockSubscription),
    updateSubscriptionPrice: vi.fn().mockResolvedValue(mockSubscription),
};

const tenantRepository: IPlatformTenantRepository = {
    listTenants: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 25 }),
    getTenantDetail: vi.fn().mockResolvedValue(mockTenant),
    updateTenantStatus: vi.fn().mockResolvedValue(mockTenant),
    getTenantMetrics: vi.fn().mockResolvedValue({ total: 0, active: 0, suspended: 0, decommissioned: 0 }),
};

const billingGateway: BillingGateway = {
    createCheckoutSession: vi.fn(),
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

describe('assignBillingPlanToTenant', () => {
    it('rejects assignment for non-active plans', async () => {
        await expect(
            assignBillingPlanToTenant(
                { billingPlanRepository, subscriptionRepository, billingGateway, tenantRepository },
                {
                    authorization,
                    request: { tenantId: '11111111-1111-4111-8111-111111111151', planId: draftPlan.id },
                },
            ),
        ).rejects.toThrow('Only active billing plans can be assigned');
    });
});
