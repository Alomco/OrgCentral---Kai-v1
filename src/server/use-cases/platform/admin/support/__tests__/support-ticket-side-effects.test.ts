import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createSupportTicket } from '@/server/use-cases/platform/admin/support/create-support-ticket';
import { listSupportTickets } from '@/server/use-cases/platform/admin/support/list-support-tickets';
import {
    authContext,
    buildSupportRepository,
    buildTenantRepository,
    buildTicket,
} from './support-ticket-test-helpers';

const recordAuditEventMock = vi.fn();

vi.mock('@/server/logging/audit-logger', () => ({
    recordAuditEvent: (...args: unknown[]) => recordAuditEventMock(...args),
}));

describe('support ticket side effects', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('reconciles stale SLA flags during listing and emits breach notification', async () => {
        const ticket = buildTicket({
            status: 'WAITING_ON_CUSTOMER',
            severity: 'CRITICAL',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        });
        const dispatchNotification = vi.fn().mockResolvedValue(undefined);
        const supportTicketRepository = buildSupportRepository({
            listTickets: vi.fn().mockResolvedValue([ticket]),
            updateTicket: vi.fn().mockImplementation(async (_ctx, next, expectedVersion) => ({
                ...next,
                version: expectedVersion + 1,
            })),
        });

        const listed = await listSupportTickets(
            {
                supportTicketRepository,
                tenantRepository: buildTenantRepository(),
                notificationDispatchService: {
                    dispatchNotification,
                },
            },
            { authorization: authContext() },
        );

        expect(listed[0].slaBreached).toBe(true);
        expect(dispatchNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                notification: expect.objectContaining({ templateKey: 'platform.support.ticket.sla-breached' }),
            }),
        );
    });

    it('dispatches create notification with audit-safe payload', async () => {
        const dispatchNotification = vi.fn().mockResolvedValue(undefined);
        const createTicket = vi.fn().mockImplementation(async (_ctx, ticket) => ticket);

        const created = await createSupportTicket(
            {
                supportTicketRepository: buildSupportRepository({ createTicket }),
                tenantRepository: buildTenantRepository(),
                notificationDispatchService: { dispatchNotification },
            },
            {
                authorization: authContext(),
                request: {
                    tenantId: '22222222-2222-4222-8222-222222222222',
                    requesterEmail: 'requester@example.com',
                    subject: 'Need help with onboarding',
                    description: 'The onboarding checklist is blocked for a tenant user.',
                    severity: 'MEDIUM',
                    tags: ['onboarding'],
                },
            },
        );

        expect(created.version).toBe(1);
        expect(dispatchNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                notification: expect.objectContaining({
                    templateKey: 'platform.support.ticket.created',
                    data: expect.objectContaining({
                        ticketId: created.id,
                        tenantId: created.tenantId,
                        severity: created.severity,
                        status: created.status,
                    }),
                }),
            }),
        );
    });
});
