import { describe, expect, it } from 'vitest';
import { Prisma } from '@/server/types/prisma';
import type { PrismaClientInstance } from '@/server/types/prisma';
import { PrismaSupportTicketRepository } from '@/server/repositories/prisma/platform/admin/prisma-support-ticket-repository';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SupportTicket } from '@/server/types/platform/support-tickets';

const ORG_A = '00000000-0000-4000-8000-0000000000a1';
const ORG_B = '00000000-0000-4000-8000-0000000000b1';

describe('PrismaSupportTicketRepository', () => {
    it('preserves records from other orgs when creating and updating a ticket', async () => {
        const store = createPlatformSettingStore([
            createTicket({ id: '11111111-1111-4111-8111-111111111111', orgId: ORG_A }),
            createTicket({ id: '22222222-2222-4222-8222-222222222222', orgId: ORG_B }),
        ]);
        const repository = new PrismaSupportTicketRepository({ prisma: store.prisma });

        const created = await repository.createTicket(
            authContext(ORG_A),
            createTicket({
                id: '33333333-3333-4333-8333-333333333333',
                orgId: ORG_A,
                version: 1,
            }),
        );
        expect(created.id).toBe('33333333-3333-4333-8333-333333333333');

        const updated = await repository.updateTicket(
            authContext(ORG_A),
            {
                ...created,
                status: 'IN_PROGRESS',
                updatedAt: new Date('2026-02-01T09:00:00.000Z').toISOString(),
            },
            1,
        );
        expect(updated?.version).toBe(2);

        const raw = store.getTickets();
        expect(raw).toHaveLength(3);
        expect(raw.filter((ticket) => ticket.orgId === ORG_B)).toHaveLength(1);
    });

    it('returns null on version mismatch without mutating records', async () => {
        const initial = createTicket({ id: '44444444-4444-4444-8444-444444444444', orgId: ORG_A, version: 3 });
        const store = createPlatformSettingStore([initial]);
        const repository = new PrismaSupportTicketRepository({ prisma: store.prisma });

        const result = await repository.updateTicket(
            authContext(ORG_A),
            { ...initial, status: 'RESOLVED', updatedAt: new Date('2026-02-01T10:00:00.000Z').toISOString() },
            2,
        );

        expect(result).toBeNull();
        expect(store.getTickets()[0]).toMatchObject({ version: 3, status: 'NEW' });
    });
});

function authContext(orgId: string): RepositoryAuthorizationContext {
    const now = new Date();
    return {
        orgId,
        userId: '99999999-9999-4999-8999-999999999999',
        roleKey: 'globalAdmin',
        permissions: { platformSupport: ['read', 'create', 'update'] },
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        tenantScope: { orgId, dataResidency: 'UK_ONLY', dataClassification: 'OFFICIAL', auditSource: 'test' },
        auditBatchId: undefined,
        mfaVerified: true,
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        authenticatedAt: now,
        sessionExpiresAt: new Date(now.getTime() + 60_000),
        lastActivityAt: now,
        sessionId: 'session',
        sessionToken: 'token',
        correlationId: 'corr',
        authorizedAt: now,
        authorizationReason: 'test',
    };
}

function createTicket(overrides: Partial<SupportTicket>): SupportTicket {
    const now = new Date('2026-02-01T08:00:00.000Z').toISOString();
    return {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        version: 1,
        orgId: ORG_A,
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        requesterEmail: 'requester@example.com',
        requesterName: 'Requester',
        subject: 'Support issue',
        description: 'Detailed support issue description.',
        severity: 'LOW',
        status: 'NEW',
        assignedTo: null,
        slaBreached: false,
        tags: [],
        metadata: null,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}

function createPlatformSettingStore(seed: SupportTicket[]) {
    let tickets = [...seed];
    let updatedAt = new Date('2026-02-01T08:00:00.000Z');

    const prisma = {
        platformSetting: {
            findUnique: async () => ({
                id: 'platform-support-tickets',
                metadata: tickets,
                updatedAt,
            }),
            create: async (_args: {
                data: { id: string; metadata: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput };
            }) => {
                tickets = castMetadata(_args.data.metadata);
                updatedAt = new Date(updatedAt.getTime() + 1_000);
                return { id: 'platform-support-tickets', metadata: tickets, updatedAt };
            },
            updateMany: async (args: {
                where: { id: string; updatedAt: Date };
                data: { metadata: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput };
            }) => {
                if (args.where.updatedAt.getTime() !== updatedAt.getTime()) {
                    return { count: 0 };
                }
                tickets = castMetadata(args.data.metadata);
                updatedAt = new Date(updatedAt.getTime() + 1_000);
                return { count: 1 };
            },
        },
    };

    return {
        prisma: prisma as unknown as PrismaClientInstance,
        getTickets: () => [...tickets],
    };
}

function castMetadata(value: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput): SupportTicket[] {
    if (value === Prisma.JsonNull || value === null) {
        return [];
    }
    return value as unknown as SupportTicket[];
}
