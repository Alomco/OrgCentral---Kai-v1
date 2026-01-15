import { appLogger } from '@/server/logging/structured-logger';
import { getSecurityEventService } from '@/server/services/security/security-event-service.provider';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SecurityIncident } from './incident-types';

export async function sendIncidentNotification(
    context: RepositoryAuthorizationContext,
    incident: SecurityIncident,
): Promise<void> {
    appLogger.info('incident.notification', {
        orgId: context.orgId,
        incidentId: incident.id,
        severity: incident.severity,
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
    });

    await getSecurityEventService().logSecurityEvent({
        orgId: context.orgId,
        eventType: 'security.incident.notification.sent',
        severity: incident.severity,
        description: `Incident notification sent for: ${incident.title}`,
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        resourceId: incident.id,
        resourceType: 'security_incident',
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
        metadata: {
            incidentId: incident.id,
            notificationType: 'initial_report',
        },
    });
}

export async function sendAssignmentNotification(
    context: RepositoryAuthorizationContext,
    incident: SecurityIncident,
    assigneeId: string,
): Promise<void> {
    appLogger.info('incident.assignment.notification', {
        orgId: context.orgId,
        incidentId: incident.id,
        assigneeId,
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
    });

    await getSecurityEventService().logSecurityEvent({
        orgId: context.orgId,
        eventType: 'security.incident.assignment.notification.sent',
        severity: incident.severity,
        description: `Assignment notification sent to ${assigneeId} for incident ${incident.title}`,
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        resourceId: incident.id,
        resourceType: 'security_incident',
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
        metadata: {
            incidentId: incident.id,
            assigneeId,
            notificationType: 'assignment',
        },
    });
}

export async function sendEscalationNotification(
    context: RepositoryAuthorizationContext,
    incident: SecurityIncident,
): Promise<void> {
    appLogger.warn('incident.escalation.notification', {
        orgId: context.orgId,
        incidentId: incident.id,
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
    });

    await getSecurityEventService().logSecurityEvent({
        orgId: context.orgId,
        eventType: 'security.incident.escalation.notification.sent',
        severity: incident.severity,
        description: `Escalation notification sent for incident ${incident.title}`,
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        resourceId: incident.id,
        resourceType: 'security_incident',
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
        metadata: {
            incidentId: incident.id,
            notificationType: 'escalation',
        },
    });
}
