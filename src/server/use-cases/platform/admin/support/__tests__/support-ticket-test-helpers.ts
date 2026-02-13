import { vi } from 'vitest';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SupportTicket } from '@/server/types/platform/support-tickets';
import type { ISupportTicketRepository } from '@/server/repositories/contracts/platform/admin/support-ticket-repository-contract';
import type { IPlatformTenantRepository } from '@/server/repositories/contracts/platform/admin/platform-tenant-repository-contract';

export function buildSupportRepository(
    overrides: Partial<ISupportTicketRepository> = {},
): ISupportTicketRepository {
    return {
        listTickets: overrides.listTickets ?? vi.fn().mockResolvedValue([]),
        getTicket: overrides.getTicket ?? vi.fn().mockResolvedValue(null),
        createTicket: overrides.createTicket ?? vi.fn(),
        updateTicket: overrides.updateTicket ?? vi.fn(),
    };
}

export function buildTenantRepository(): IPlatformTenantRepository {
    return {
        listTenants: vi.fn(),
        getTenantDetail: vi.fn().mockResolvedValue({
            id: '22222222-2222-4222-8222-222222222222',
            name: 'Tenant',
            slug: 'tenant',
            status: 'ACTIVE',
            complianceTier: 'STANDARD',
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            regionCode: 'UK',
            ownerEmail: 'owner@example.com',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            subscription: null,
            governanceTags: null,
            securityControls: null,
        }),
        updateTenantStatus: vi.fn(),
        getTenantMetrics: vi.fn(),
    };
}

export function authContext(): RepositoryAuthorizationContext {
    const now = new Date('2026-02-01T00:00:00.000Z');
    return {
        orgId: '11111111-1111-4111-8111-111111111111',
        userId: '99999999-9999-4999-8999-999999999999',
        roleKey: 'globalAdmin',
        permissions: { platformSupport: ['read', 'create', 'update'] },
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        tenantScope: {
            orgId: '11111111-1111-4111-8111-111111111111',
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            auditSource: 'test',
        },
        auditBatchId: undefined,
        mfaVerified: true,
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        authenticatedAt: now,
        sessionExpiresAt: new Date(now.getTime() + 60_000),
        lastActivityAt: now,
        sessionId: 'session',
        sessionToken: 'token',
        correlationId: 'corr-id',
        authorizedAt: now,
        authorizationReason: 'test',
    };
}

export function buildTicket(overrides: Partial<SupportTicket> = {}): SupportTicket {
    return {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        version: 1,
        orgId: '11111111-1111-4111-8111-111111111111',
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        tenantId: '22222222-2222-4222-8222-222222222222',
        requesterEmail: 'requester@example.com',
        requesterName: 'Requester',
        subject: 'Support incident',
        description: 'Investigate incident in tenant environment.',
        severity: 'MEDIUM',
        status: 'NEW',
        assignedTo: null,
        slaBreached: false,
        tags: ['security'],
        metadata: null,
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
        ...overrides,
    };
}
