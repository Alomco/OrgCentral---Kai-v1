import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';

import { PageContainer } from '@/components/theme/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InfoButton } from '@/components/ui/info-button';
import { Label } from '@/components/ui/label';
import {
    SUPPORT_TICKET_SEVERITIES,
    SUPPORT_TICKET_STATUSES,
    type SupportTicketSeverity,
} from '@/server/types/platform/support-tickets';
import { isSupportTicketOpenStatus } from '@/server/use-cases/platform/admin/support/support-ticket-workflow';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';

import { CreateSupportTicketForm } from './_components/create-support-ticket-form';
import { SupportTicketUpdateForm } from './_components/support-ticket-update-form';
import {
    applySupportTicketQuery,
    buildSupportTicketQueryHref,
    parseSupportTicketQuery,
    type SupportTicketQuery,
} from './support-ticket-query';
import { loadSupportTicketsForUi } from './support-ticket-page-store';

export const metadata: Metadata = {
    title: 'Support Tickets - OrgCentral',
    description: 'Global support ticket triage console.',
};

interface SupportTicketsPageProps {
    searchParams?: Record<string, string | string[] | undefined>;
}

export default async function SupportTicketsPage({ searchParams = {} }: SupportTicketsPageProps) {
    const headerStore = await headers();
    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { platformSupport: ['read'] },
            auditSource: 'ui:admin:support-tickets',
        },
    );

    const query = parseSupportTicketQuery(searchParams);
    const tickets = await loadSupportTicketsForUi(authorization);
    const view = applySupportTicketQuery(tickets, query);

    const openCount = tickets.filter((ticket) => isSupportTicketOpenStatus(ticket.status)).length;
    const breachedCount = tickets.filter((ticket) => ticket.slaBreached).length;

    return (
        <PageContainer padding="lg" maxWidth="full" className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">Support tickets</h1>
                <p className="text-sm text-muted-foreground">
                    Open tickets are <strong>NEW</strong>, <strong>IN_PROGRESS</strong>, and{' '}
                    <strong>WAITING_ON_CUSTOMER</strong>. Use triage filters to manage queue risk.
                </p>
            </header>

            <CreateSupportTicketForm />

            <Card>
                <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center justify-between">
                        <span>Triage queue</span>
                        <InfoButton
                            label="Support ticket triage"
                            sections={[
                                { label: 'What', text: 'Filter and prioritize support tickets for action.' },
                                { label: 'Prereqs', text: 'Platform support read access.' },
                                { label: 'Next', text: 'Assign owner and transition status.' },
                                { label: 'Compliance', text: 'Updates and SLA events are audited.' },
                            ]}
                        />
                    </CardTitle>
                    <form method="get" className="grid gap-3 rounded-lg border border-border/40 p-3 md:grid-cols-5">
                        <div className="space-y-1 md:col-span-2">
                            <Label htmlFor="q">Search</Label>
                            <Input id="q" name="q" defaultValue={query.q ?? ''} placeholder="Subject, tenant, requester" />
                        </div>
                        <SelectFilter id="status" label="Status" defaultValue={query.status} options={['OPEN', 'ALL', ...SUPPORT_TICKET_STATUSES]} />
                        <SelectFilter id="severity" label="Severity" defaultValue={query.severity} options={['ALL', ...SUPPORT_TICKET_SEVERITIES]} />
                        <SelectFilter id="sla" label="SLA" defaultValue={query.sla} options={['ALL', 'BREACHED', 'WITHIN_SLA']} />
                        <SelectFilter
                            id="sort"
                            label="Sort"
                            defaultValue={query.sort}
                            options={['UPDATED_DESC', 'UPDATED_ASC', 'CREATED_DESC', 'CREATED_ASC', 'SEVERITY_DESC']}
                        />
                        <input type="hidden" name="page" value="1" />
                        <input type="hidden" name="pageSize" value={String(query.pageSize)} />
                        <Button type="submit" size="sm" className="md:col-span-5 md:w-fit">Apply filters</Button>
                    </form>
                    <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                        <span>Total tickets: {tickets.length}</span>
                        <span>Open tickets: {openCount}</span>
                        <span>SLA breached: {breachedCount}</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {view.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tickets match the current filters.</p>
                    ) : (
                        view.items.map((ticket) => (
                            <div key={ticket.id} className="rounded-xl border border-border/40 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                                        <p className="text-xs text-muted-foreground">Tenant: {ticket.tenantId}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={isSupportTicketOpenStatus(ticket.status) ? 'default' : 'secondary'}>
                                            {ticket.status}
                                        </Badge>
                                        <Badge variant={severityVariant(ticket.severity)}>{ticket.severity}</Badge>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">{ticket.description}</p>
                                <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                                    <span>Requester: {ticket.requesterEmail}</span>
                                    <span>Updated: {formatIso(ticket.updatedAt)}</span>
                                    <span>SLA breached: {ticket.slaBreached ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="mt-3">
                                    <SupportTicketUpdateForm
                                        ticketId={ticket.id}
                                        status={ticket.status}
                                        version={ticket.version}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                    <SupportTicketPagination query={query} page={view.page} totalPages={view.totalPages} total={view.total} />
                </CardContent>
            </Card>
        </PageContainer>
    );
}

function SelectFilter(props: {
    id: string;
    label: string;
    defaultValue: string;
    options: readonly string[];
}) {
    const { id, label, defaultValue, options } = props;

    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <select
                id={id}
                name={id}
                defaultValue={defaultValue}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function SupportTicketPagination(props: {
    query: SupportTicketQuery;
    page: number;
    totalPages: number;
    total: number;
}) {
    const { query, page, totalPages, total } = props;
    const canPrevious = page > 1;
    const canNext = page < totalPages;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
            <span>
                Showing page {page} of {totalPages} ({total} tickets)
            </span>
            <div className="flex items-center gap-2">
                {canPrevious ? (
                    <Link href={buildSupportTicketQueryHref(query, { page: page - 1 })} className="underline-offset-2 hover:underline">
                        Previous
                    </Link>
                ) : (
                    <span className="opacity-60">Previous</span>
                )}
                {canNext ? (
                    <Link href={buildSupportTicketQueryHref(query, { page: page + 1 })} className="underline-offset-2 hover:underline">
                        Next
                    </Link>
                ) : (
                    <span className="opacity-60">Next</span>
                )}
            </div>
        </div>
    );
}

function severityVariant(severity: SupportTicketSeverity): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
        return 'destructive';
    }
    if (severity === 'MEDIUM') {
        return 'secondary';
    }
    return 'outline';
}

function formatIso(value: string): string {
    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) {
        return value;
    }
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(parsed));
}
