import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { ISupportTicketRepository } from '@/server/repositories/contracts/platform/admin/support-ticket-repository-contract';
import type { IPlatformTenantRepository } from '@/server/repositories/contracts/platform/admin/platform-tenant-repository-contract';
import type { NotificationDispatchContract } from '@/server/repositories/contracts/notifications/notification-dispatch-contract';
import type { SupportTicket } from '@/server/types/platform/support-tickets';
import { enforcePermission } from '@/server/repositories/security';
import { filterRecordsByTenantScope } from '@/server/use-cases/platform/admin/tenants/tenant-scope-guards';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { applySupportTicketSla, evaluateSupportTicketSla } from '@/server/use-cases/platform/admin/support/support-ticket-sla';
import { sendSupportTicketSlaBreachNotifications } from '@/server/use-cases/platform/admin/support/support-ticket-notifications';

export interface ListSupportTicketsInput {
    authorization: RepositoryAuthorizationContext;
}

export interface ListSupportTicketsDependencies {
    supportTicketRepository: ISupportTicketRepository;
    tenantRepository: IPlatformTenantRepository;
    notificationDispatchService?: NotificationDispatchContract;
}

export async function listSupportTickets(
    deps: ListSupportTicketsDependencies,
    input: ListSupportTicketsInput,
): Promise<SupportTicket[]> {
    enforcePermission(input.authorization, 'platformSupport', 'read');
    const tickets = await deps.supportTicketRepository.listTickets(input.authorization);
    const scoped = await filterRecordsByTenantScope(
        deps.tenantRepository,
        input.authorization,
        tickets,
        (ticket) => ticket.tenantId,
    );
    const reconciled = await reconcileSlaState(deps, input.authorization, scoped);

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'ACCESS',
        action: 'platform.support.list',
        resource: 'platformSupportTicket',
        payload: { count: reconciled.length },
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        auditBatchId: input.authorization.auditBatchId,
    });

    return reconciled;
}

async function reconcileSlaState(
    deps: ListSupportTicketsDependencies,
    authorization: RepositoryAuthorizationContext,
    tickets: SupportTicket[],
): Promise<SupportTicket[]> {
    const nowIso = new Date().toISOString();
    const next: SupportTicket[] = [];

    for (const ticket of tickets) {
        const evaluation = evaluateSupportTicketSla(ticket, new Date(nowIso));
        if (evaluation.breached === ticket.slaBreached) {
            next.push(ticket);
            continue;
        }

        const withSla = applySupportTicketSla(
            {
                ...ticket,
                updatedAt: nowIso,
            },
            evaluation,
            nowIso,
        );

        const saved = await deps.supportTicketRepository.updateTicket(authorization, withSla, ticket.version);
        if (!saved) {
            next.push(ticket);
            continue;
        }

        if (evaluation.newlyBreached) {
            await sendSupportTicketSlaBreachNotifications({
                dispatcher: deps.notificationDispatchService,
                authorization,
                ticket: saved,
            });
        }

        next.push(saved);
    }

    return next;
}
