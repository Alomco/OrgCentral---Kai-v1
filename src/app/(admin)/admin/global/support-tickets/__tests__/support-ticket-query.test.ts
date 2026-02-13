import { describe, expect, it } from 'vitest';
import type { SupportTicket } from '@/server/types/platform/support-tickets';
import { applySupportTicketQuery, parseSupportTicketQuery } from '../support-ticket-query';

describe('support-ticket-query', () => {
    it('defaults to open-ticket semantics', () => {
        const query = parseSupportTicketQuery({});
        const result = applySupportTicketQuery(
            [
                ticket({ id: '1', status: 'NEW' }),
                ticket({ id: '2', status: 'IN_PROGRESS' }),
                ticket({ id: '3', status: 'RESOLVED' }),
            ],
            query,
        );

        expect(result.items.map((item) => item.id)).toEqual(['1', '2']);
    });

    it('applies sort and pagination controls', () => {
        const query = parseSupportTicketQuery({ sort: 'CREATED_ASC', page: '2', pageSize: '5', status: 'ALL' });
        const result = applySupportTicketQuery(
            [
                ticket({ id: 'a', createdAt: '2026-02-01T01:00:00.000Z' }),
                ticket({ id: 'b', createdAt: '2026-02-01T02:00:00.000Z' }),
                ticket({ id: 'c', createdAt: '2026-02-01T03:00:00.000Z' }),
                ticket({ id: 'd', createdAt: '2026-02-01T04:00:00.000Z' }),
                ticket({ id: 'e', createdAt: '2026-02-01T05:00:00.000Z' }),
                ticket({ id: 'f', createdAt: '2026-02-01T06:00:00.000Z' }),
            ],
            query,
        );

        expect(result.page).toBe(2);
        expect(result.items.map((item) => item.id)).toEqual(['f']);
    });
});

function ticket(overrides: Partial<SupportTicket>): SupportTicket {
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
        subject: 'Subject',
        description: 'Description body for support ticket.',
        severity: 'LOW',
        status: 'NEW',
        assignedTo: null,
        slaBreached: false,
        tags: [],
        metadata: null,
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
        ...overrides,
    };
}
