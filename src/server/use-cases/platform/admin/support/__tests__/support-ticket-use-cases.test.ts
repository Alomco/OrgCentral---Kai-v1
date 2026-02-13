import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictError, ValidationError } from '@/server/errors';
import type { NotificationDispatchContract } from '@/server/repositories/contracts/notifications/notification-dispatch-contract';
import { updateSupportTicket } from '@/server/use-cases/platform/admin/support/update-support-ticket';
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

describe('updateSupportTicket', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects invalid status transitions', async () => {
        const existing = buildTicket({ status: 'NEW' });
        const supportTicketRepository = buildSupportRepository({
            getTicket: vi.fn().mockResolvedValue(existing),
        });

        await expect(
            updateSupportTicket(
                {
                    supportTicketRepository,
                    tenantRepository: buildTenantRepository(),
                },
                {
                    authorization: authContext(),
                    request: {
                        ticketId: existing.id,
                        expectedVersion: existing.version,
                        status: 'RESOLVED',
                    },
                },
            ),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    it('returns conflict error when expected version is stale', async () => {
        const existing = buildTicket({ status: 'IN_PROGRESS' });
        const supportTicketRepository = buildSupportRepository({
            getTicket: vi.fn().mockResolvedValue(existing),
            updateTicket: vi.fn().mockResolvedValue(null),
        });

        await expect(
            updateSupportTicket(
                {
                    supportTicketRepository,
                    tenantRepository: buildTenantRepository(),
                },
                {
                    authorization: authContext(),
                    request: {
                        ticketId: existing.id,
                        expectedVersion: existing.version,
                        status: 'WAITING_ON_CUSTOMER',
                    },
                },
            ),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    it('updates SLA state and dispatches update + SLA breach notifications', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
        const existing = buildTicket({
            status: 'IN_PROGRESS',
            severity: 'HIGH',
            assignedTo: '66666666-6666-4666-8666-666666666666',
            createdAt,
            updatedAt: createdAt,
        });
        const dispatchNotification = vi.fn().mockResolvedValue(undefined);
        const notificationDispatchService: NotificationDispatchContract = {
            dispatchNotification,
        };
        const supportTicketRepository = buildSupportRepository({
            getTicket: vi.fn().mockResolvedValue(existing),
            updateTicket: vi
                .fn()
                .mockImplementation(async (_ctx, ticket, expectedVersion) => ({ ...ticket, version: expectedVersion + 1 })),
        });

        const result = await updateSupportTicket(
            {
                supportTicketRepository,
                tenantRepository: buildTenantRepository(),
                notificationDispatchService,
            },
            {
                authorization: authContext(),
                request: {
                    ticketId: existing.id,
                    expectedVersion: existing.version,
                    tags: ['security', 'incident'],
                },
            },
        );

        expect(result.slaBreached).toBe(true);
        expect(dispatchNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                notification: expect.objectContaining({ templateKey: 'platform.support.ticket.updated' }),
            }),
        );
        expect(dispatchNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                notification: expect.objectContaining({ templateKey: 'platform.support.ticket.sla-breached' }),
            }),
        );
    });
});
