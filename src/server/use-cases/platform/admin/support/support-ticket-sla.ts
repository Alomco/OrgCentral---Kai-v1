import type { JsonRecord } from '@/server/types/json';
import type { SupportTicket, SupportTicketSeverity } from '@/server/types/platform/support-tickets';
import { isSupportTicketOpenStatus } from '@/server/use-cases/platform/admin/support/support-ticket-workflow';

const HOURS_TO_MS = 60 * 60 * 1000;

export const SUPPORT_TICKET_SLA_TARGET_HOURS: Readonly<Record<SupportTicketSeverity, number>> = {
    LOW: 72,
    MEDIUM: 24,
    HIGH: 8,
    CRITICAL: 4,
};

export interface SupportTicketSlaEvaluation {
    breached: boolean;
    newlyBreached: boolean;
    deadlineAt: string | null;
}

export function evaluateSupportTicketSla(ticket: SupportTicket, now: Date = new Date()): SupportTicketSlaEvaluation {
    const createdAtMs = Date.parse(ticket.createdAt);
    if (!Number.isFinite(createdAtMs)) {
        return {
            breached: ticket.slaBreached,
            newlyBreached: false,
            deadlineAt: null,
        };
    }

    const targetHours = SUPPORT_TICKET_SLA_TARGET_HOURS[ticket.severity];
    const deadlineMs = createdAtMs + targetHours * HOURS_TO_MS;
    const deadlineAt = new Date(deadlineMs).toISOString();
    const isOpen = isSupportTicketOpenStatus(ticket.status);
    const breachedNow = isOpen && now.getTime() > deadlineMs;
    const breached = ticket.slaBreached || breachedNow;

    return {
        breached,
        newlyBreached: !ticket.slaBreached && breached,
        deadlineAt,
    };
}

export function applySupportTicketSla(ticket: SupportTicket, evaluation: SupportTicketSlaEvaluation, nowIso: string): SupportTicket {
    const nextMetadata: JsonRecord = {
        ...(ticket.metadata ?? {}),
        slaTargetHours: SUPPORT_TICKET_SLA_TARGET_HOURS[ticket.severity],
        slaDeadlineAt: evaluation.deadlineAt,
        slaEvaluatedAt: nowIso,
    };

    if (evaluation.newlyBreached) {
        nextMetadata.slaBreachedAt = nowIso;
    }

    return {
        ...ticket,
        slaBreached: evaluation.breached,
        metadata: nextMetadata,
    };
}
