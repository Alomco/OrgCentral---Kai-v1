import { appLogger } from '@/server/logging/structured-logger';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import {
    IncidentSeverity,
    IncidentStatus,
    type IncidentResponseWorkflow,
    type ReportIncidentInput,
    type UpdateIncidentInput,
    type AssignIncidentInput,
    type IncidentResponseServiceOptions,
    type SecurityIncident,
} from './incident-types';
import { sendIncidentNotification, sendAssignmentNotification, sendEscalationNotification } from './incident-notifications';
import {
    createIncidentFromInput,
    createMockIncident,
    logIncidentEvent,
    mapIncidentSeverityToEventSeverity,
} from './incident-response.helpers';
import { createDefaultWorkflows } from './workflow-templates';


export class SecurityIncidentResponseService {
    private readonly enableAutoEscalation: boolean;
    private readonly notificationEnabled: boolean;
    private readonly autoCloseInactiveIncidents: boolean;
    private readonly workflows: Map<string, IncidentResponseWorkflow>;

    constructor(options: IncidentResponseServiceOptions = {}) {
        this.enableAutoEscalation = options.enableAutoEscalation ?? true;
        this.notificationEnabled = options.notificationEnabled ?? true;
        this.autoCloseInactiveIncidents = options.autoCloseInactiveIncidents ?? true;
        this.workflows = new Map(createDefaultWorkflows().map(workflow => [workflow.id, workflow]));
    }

    async reportIncident(context: RepositoryAuthorizationContext, input: ReportIncidentInput): Promise<SecurityIncident> {
        if (input.orgId !== context.orgId) {
            throw new Error('Cannot report incident for another organization');
        }

        const incident = createIncidentFromInput(input);

        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.reported',
            severity: mapIncidentSeverityToEventSeverity(incident.severity),
            description: `Security incident reported: ${incident.title}`,
            metadata: {
                title: incident.title,
                severity: incident.severity,
                reporterId: incident.reporterId,
                affectedSystems: incident.affectedSystems,
            },
        });

        await this.triggerResponseWorkflow(context, incident);

        if (this.notificationEnabled) {
            await sendIncidentNotification(context, incident);
        }

        if (this.enableAutoEscalation && incident.severity === IncidentSeverity.Critical) {
            await this.escalateIncident(context, incident.id);
        }

        return incident;
    }

    async updateIncident(context: RepositoryAuthorizationContext, input: UpdateIncidentInput): Promise<SecurityIncident> {
        const incident = createMockIncident(context, input.incidentId);
        Object.assign(incident, { ...input.updates, updatedAt: new Date() });

        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.updated',
            severity: 'medium',
            description: `Security incident updated: ${incident.title}`,
            metadata: {
                updates: Object.keys(input.updates),
                updatedBy: context.userId,
            },
        });

        return incident;
    }

    async assignIncident(context: RepositoryAuthorizationContext, input: AssignIncidentInput): Promise<SecurityIncident> {
        const incident = createMockIncident(context, input.incidentId, {
            assignedTo: input.assigneeId,
            updatedAt: new Date(),
        });

        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.assigned',
            severity: 'medium',
            description: `Security incident assigned to user ${input.assigneeId}`,
            metadata: {
                assignedTo: input.assigneeId,
                assignedBy: input.assignedById,
            },
        });

        if (this.notificationEnabled) {
            await sendAssignmentNotification(context, incident, input.assigneeId);
        }

        return incident;
    }

    async updateIncidentStatus(
        context: RepositoryAuthorizationContext,
        incidentId: string,
        newStatus: IncidentStatus,
        statusChangeReason?: string,
    ): Promise<SecurityIncident> {
        const incident = createMockIncident(context, incidentId, {
            status: newStatus,
            updatedAt: new Date(),
        });

        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.status.changed',
            severity: 'medium',
            description: `Security incident status changed to ${newStatus}`,
            metadata: {
                newStatus,
                statusChangeReason: statusChangeReason ?? null,
                changedBy: context.userId,
            },
        });

        await this.handleStatusChange(context, incident, newStatus);
        return incident;
    }

    async escalateIncident(context: RepositoryAuthorizationContext, incidentId: string): Promise<SecurityIncident> {
        const incident = createMockIncident(context, incidentId, {
            severity: IncidentSeverity.Critical,
            assignedTo: 'security-team',
            updatedAt: new Date(),
        });

        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.escalated',
            severity: 'high',
            description: `Security incident escalated: ${incident.title}`,
            metadata: {
                escalatedBy: context.userId,
                escalationReason: 'Automatic escalation for critical incident',
            },
        });

        if (this.notificationEnabled) {
            await sendEscalationNotification(context, incident);
        }

        return incident;
    }

    async addEvidenceToIncident(
        context: RepositoryAuthorizationContext,
        incidentId: string,
        evidence: string,
    ): Promise<SecurityIncident> {
        const incident = createMockIncident(context, incidentId, {
            evidence: [],
            updatedAt: new Date(),
        });

        incident.evidence.push(evidence);

        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.evidence.added',
            severity: 'medium',
            description: `Evidence added to incident ${incidentId}`,
            metadata: {
                evidenceAdded: evidence,
                addedBy: context.userId,
            },
        });

        return incident;
    }

    registerWorkflow(workflow: IncidentResponseWorkflow): void {
        this.workflows.set(workflow.id, workflow);
    }

    getWorkflow(workflowId: string): IncidentResponseWorkflow | undefined {
        return this.workflows.get(workflowId);
    }

    private async triggerResponseWorkflow(context: RepositoryAuthorizationContext, incident: SecurityIncident): Promise<void> {
        const workflow = Array.from(this.workflows.values()).find(candidate => candidate.severity === incident.severity);

        if (!workflow) {
            appLogger.warn('incident.workflow.missing', { orgId: context.orgId, incidentId: incident.id, severity: incident.severity });
            return;
        }

        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.workflow.triggered',
            severity: 'medium',
            description: `Response workflow triggered for incident: ${incident.title}`,
            metadata: {
                workflowId: workflow.id,
                workflowName: workflow.name,
                triggeredBy: context.userId,
            },
        });

        appLogger.info('incident.workflow.started', {
            orgId: context.orgId,
            incidentId: incident.id,
            workflowId: workflow.id,
            workflowName: workflow.name,
        });
    }

    private async handleStatusChange(
        context: RepositoryAuthorizationContext,
        incident: SecurityIncident,
        newStatus: IncidentStatus,
    ): Promise<void> {
        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.lifecycle',
            severity: 'medium',
            description: `Incident lifecycle updated: ${newStatus}`,
            metadata: {
                status: newStatus,
                changedBy: context.userId,
            },
        });

        if (this.autoCloseInactiveIncidents && newStatus === IncidentStatus.Closed) {
            await this.performIncidentCleanup(context, incident);
        }
    }

    private async performIncidentCleanup(context: RepositoryAuthorizationContext, incident: SecurityIncident): Promise<void> {
        await logIncidentEvent(context, incident, {
            eventType: 'security.incident.cleanup',
            severity: 'low',
            description: `Incident cleanup performed for: ${incident.title}`,
            metadata: {
                cleanedUpBy: context.userId,
            },
        });
    }

}
