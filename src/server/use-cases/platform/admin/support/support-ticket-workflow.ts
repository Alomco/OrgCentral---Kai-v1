import type { SupportTicketStatus } from '@/server/types/platform/support-tickets';
import { ValidationError } from '@/server/errors';

export const SUPPORT_TICKET_OPEN_STATUSES: readonly SupportTicketStatus[] = [
    'NEW',
    'IN_PROGRESS',
    'WAITING_ON_CUSTOMER',
];

const ALLOWED_STATUS_TRANSITIONS: Readonly<Record<SupportTicketStatus, readonly SupportTicketStatus[]>> = {
    NEW: ['IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'CLOSED'],
    IN_PROGRESS: ['WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'],
    WAITING_ON_CUSTOMER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    RESOLVED: ['IN_PROGRESS', 'CLOSED'],
    CLOSED: ['IN_PROGRESS'],
};

export function isSupportTicketOpenStatus(status: SupportTicketStatus): boolean {
    return SUPPORT_TICKET_OPEN_STATUSES.includes(status);
}

export function assertSupportTicketStatusTransition(
    currentStatus: SupportTicketStatus,
    nextStatus: SupportTicketStatus,
): void {
    if (currentStatus === nextStatus) {
        return;
    }

    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
    if (allowed.includes(nextStatus)) {
        return;
    }

    throw new ValidationError('Invalid support ticket status transition.', {
        currentStatus,
        nextStatus,
        allowedStatuses: allowed,
    });
}
