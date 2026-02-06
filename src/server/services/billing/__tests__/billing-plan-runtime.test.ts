import { describe, expect, it, vi } from 'vitest';

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { resolveTenantBillingPlan } from '@/server/repositories/platform/billing-plan-runtime-resolver';
import type { PlatformJsonStoreDependencies } from '@/server/repositories/prisma/platform/settings/platform-settings-json-store';

const authorization: RepositoryAuthorizationContext = {
  orgId: '11111111-1111-4111-8111-111111111031',
  userId: '11111111-1111-4111-8111-111111111032',
  roleKey: 'custom',
  permissions: {},
  dataResidency: 'UK_ONLY',
  dataClassification: 'OFFICIAL',
  auditSource: 'test',
  tenantScope: {
    orgId: '11111111-1111-4111-8111-111111111031',
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test',
  },
};

describe('billing-plan-runtime', () => {
  it('activates due pending assignment and resolves active tenant plan', async () => {
    const { prisma, getRecord } = createPrismaStub({
      'platform-billing-plans': [
        {
          id: '11111111-1111-4111-8111-111111111101',
          orgId: '11111111-1111-4111-8111-111111111999',
          dataResidency: 'UK_ONLY',
          dataClassification: 'OFFICIAL',
          auditSource: 'seed',
          name: 'Monthly Platform Plan',
          description: null,
          stripePriceId: 'price_plan_1',
          currency: 'gbp',
          amountCents: 1000,
          cadence: 'monthly',
          features: [],
          limits: {},
          status: 'ACTIVE',
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          effectiveTo: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      'platform-billing-plan-assignments': [
        {
          id: '11111111-1111-4111-8111-111111111102',
          orgId: '11111111-1111-4111-8111-111111111999',
          dataResidency: 'UK_ONLY',
          dataClassification: 'OFFICIAL',
          auditSource: 'seed',
          tenantId: authorization.orgId,
          planId: '11111111-1111-4111-8111-111111111101',
          effectiveFrom: '2026-02-01T00:00:00.000Z',
          effectiveTo: null,
          status: 'PENDING',
          createdAt: '2026-01-15T00:00:00.000Z',
          updatedAt: '2026-01-15T00:00:00.000Z',
        },
      ],
    });

    const result = await resolveTenantBillingPlan(authorization, {
      asOf: new Date('2026-02-06T00:00:00.000Z'),
      prisma,
    });

    expect(result?.plan.stripePriceId).toBe('price_plan_1');
    expect(result?.assignment.status).toBe('ACTIVE');

    const persistedAssignments = getRecord('platform-billing-plan-assignments');
    expect(persistedAssignments[0].status).toBe('ACTIVE');
  });

  it('does not resolve plan when only future pending assignment exists', async () => {
    const { prisma } = createPrismaStub({
      'platform-billing-plans': [
        {
          id: '11111111-1111-4111-8111-111111111101',
          orgId: '11111111-1111-4111-8111-111111111999',
          dataResidency: 'UK_ONLY',
          dataClassification: 'OFFICIAL',
          auditSource: 'seed',
          name: 'Monthly Platform Plan',
          description: null,
          stripePriceId: 'price_plan_1',
          currency: 'gbp',
          amountCents: 1000,
          cadence: 'monthly',
          features: [],
          limits: {},
          status: 'ACTIVE',
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          effectiveTo: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      'platform-billing-plan-assignments': [
        {
          id: '11111111-1111-4111-8111-111111111103',
          orgId: '11111111-1111-4111-8111-111111111999',
          dataResidency: 'UK_ONLY',
          dataClassification: 'OFFICIAL',
          auditSource: 'seed',
          tenantId: authorization.orgId,
          planId: '11111111-1111-4111-8111-111111111101',
          effectiveFrom: '2026-04-01T00:00:00.000Z',
          effectiveTo: null,
          status: 'PENDING',
          createdAt: '2026-01-15T00:00:00.000Z',
          updatedAt: '2026-01-15T00:00:00.000Z',
        },
      ],
    });

    const result = await resolveTenantBillingPlan(authorization, {
      asOf: new Date('2026-02-06T00:00:00.000Z'),
      prisma,
    });

    expect(result).toBeNull();
  });
});

type JsonLeaf = string | number | boolean | null;
type JsonValue = JsonLeaf | { [key: string]: JsonValue } | JsonValue[];

function createPrismaStub(initial: Record<string, JsonValue[]>) {
  const records = new Map(Object.entries(initial));

  const prisma = {
    platformSetting: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        const metadata = records.get(where.id);
        if (!metadata) {
          return null;
        }
        return { id: where.id, metadata };
      }),
      upsert: vi.fn(async (input: {
        where: { id: string };
        create: { id: string; metadata: JsonValue };
        update: { metadata: JsonValue };
      }) => {
        const current = records.get(input.where.id);
        const metadata = current === undefined ? input.create.metadata : input.update.metadata;
        records.set(input.where.id, metadata as JsonValue[]);
        return { id: input.where.id, metadata };
      }),
    },
  } as PlatformJsonStoreDependencies['prisma'];

  return {
    prisma,
    getRecord: (id: string) => records.get(id) as Array<Record<string, JsonValue>>,
  };
}
