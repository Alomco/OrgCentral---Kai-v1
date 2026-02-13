import { z } from 'zod';
import {
    SUPPORT_TICKET_SEVERITIES,
    SUPPORT_TICKET_STATUSES,
    type SupportTicket,
    type SupportTicketSeverity,
    type SupportTicketStatus,
} from '@/server/types/platform/support-tickets';
import { isSupportTicketOpenStatus } from '@/server/use-cases/platform/admin/support/support-ticket-workflow';

const SUPPORT_TICKET_STATUS_FILTER_VALUES = ['OPEN', 'ALL', ...SUPPORT_TICKET_STATUSES] as const;
const SUPPORT_TICKET_SEVERITY_FILTER_VALUES = ['ALL', ...SUPPORT_TICKET_SEVERITIES] as const;
const SUPPORT_TICKET_SLA_FILTER_VALUES = ['ALL', 'BREACHED', 'WITHIN_SLA'] as const;
const SUPPORT_TICKET_SORT_VALUES = ['UPDATED_DESC', 'UPDATED_ASC', 'CREATED_DESC', 'CREATED_ASC', 'SEVERITY_DESC'] as const;

export type SupportTicketStatusFilter = (typeof SUPPORT_TICKET_STATUS_FILTER_VALUES)[number];
export type SupportTicketSeverityFilter = (typeof SUPPORT_TICKET_SEVERITY_FILTER_VALUES)[number];
export type SupportTicketSlaFilter = (typeof SUPPORT_TICKET_SLA_FILTER_VALUES)[number];
export type SupportTicketSort = (typeof SUPPORT_TICKET_SORT_VALUES)[number];

export interface SupportTicketQuery {
    status: SupportTicketStatusFilter;
    severity: SupportTicketSeverityFilter;
    sla: SupportTicketSlaFilter;
    sort: SupportTicketSort;
    q?: string;
    page: number;
    pageSize: number;
}

export interface SupportTicketQueryResult {
    items: SupportTicket[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

const supportTicketQuerySchema = z.object({
    status: z.enum(SUPPORT_TICKET_STATUS_FILTER_VALUES).default('OPEN'),
    severity: z.enum(SUPPORT_TICKET_SEVERITY_FILTER_VALUES).default('ALL'),
    sla: z.enum(SUPPORT_TICKET_SLA_FILTER_VALUES).default('ALL'),
    sort: z.enum(SUPPORT_TICKET_SORT_VALUES).default('UPDATED_DESC'),
    q: z.string().trim().min(1).max(120).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(5).max(50).default(10),
});

const severityRank: Readonly<Record<SupportTicketSeverity, number>> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
};

export function parseSupportTicketQuery(searchParams: Record<string, string | string[] | undefined>): SupportTicketQuery {
    const parsed = supportTicketQuerySchema.safeParse({
        status: pickSearchParameter(searchParams.status),
        severity: pickSearchParameter(searchParams.severity),
        sla: pickSearchParameter(searchParams.sla),
        sort: pickSearchParameter(searchParams.sort),
        q: pickSearchParameter(searchParams.q),
        page: pickSearchParameter(searchParams.page),
        pageSize: pickSearchParameter(searchParams.pageSize),
    });

    if (!parsed.success) {
        return supportTicketQuerySchema.parse({});
    }

    return parsed.data;
}

export function applySupportTicketQuery(
    tickets: SupportTicket[],
    query: SupportTicketQuery,
): SupportTicketQueryResult {
    const filtered = tickets.filter((ticket) => {
        if (!matchesStatus(ticket.status, query.status)) {
            return false;
        }
        if (query.severity !== 'ALL' && ticket.severity !== query.severity) {
            return false;
        }
        if (query.sla === 'BREACHED' && !ticket.slaBreached) {
            return false;
        }
        if (query.sla === 'WITHIN_SLA' && ticket.slaBreached) {
            return false;
        }

        if (!query.q) {
            return true;
        }

        const needle = query.q.toLowerCase();
        return (
            ticket.subject.toLowerCase().includes(needle) ||
            ticket.description.toLowerCase().includes(needle) ||
            ticket.requesterEmail.toLowerCase().includes(needle) ||
            ticket.tenantId.toLowerCase().includes(needle)
        );
    });

    const sorted = [...filtered].sort((left, right) => compareSupportTickets(left, right, query.sort));
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * query.pageSize;

    return {
        items: sorted.slice(start, start + query.pageSize),
        total,
        page,
        pageSize: query.pageSize,
        totalPages,
    };
}

export function buildSupportTicketQueryHref(
    query: SupportTicketQuery,
    updates: Partial<SupportTicketQuery>,
): string {
    const next: SupportTicketQuery = { ...query, ...updates };
    const params = new URLSearchParams();
    params.set('status', next.status);
    params.set('severity', next.severity);
    params.set('sla', next.sla);
    params.set('sort', next.sort);
    if (next.q) {
        params.set('q', next.q);
    }
    params.set('page', String(next.page));
    params.set('pageSize', String(next.pageSize));
    return `/admin/global/support-tickets?${params.toString()}`;
}

function pickSearchParameter(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}

function matchesStatus(status: SupportTicketStatus, filter: SupportTicketStatusFilter): boolean {
    if (filter === 'ALL') {
        return true;
    }
    if (filter === 'OPEN') {
        return isSupportTicketOpenStatus(status);
    }
    return status === filter;
}

function compareSupportTickets(left: SupportTicket, right: SupportTicket, sort: SupportTicketSort): number {
    if (sort === 'SEVERITY_DESC') {
        return severityRank[right.severity] - severityRank[left.severity] || compareIso(right.updatedAt, left.updatedAt);
    }
    if (sort === 'CREATED_ASC') {
        return compareIso(left.createdAt, right.createdAt);
    }
    if (sort === 'CREATED_DESC') {
        return compareIso(right.createdAt, left.createdAt);
    }
    if (sort === 'UPDATED_ASC') {
        return compareIso(left.updatedAt, right.updatedAt);
    }
    return compareIso(right.updatedAt, left.updatedAt);
}

function compareIso(left: string, right: string): number {
    return Date.parse(left) - Date.parse(right);
}
