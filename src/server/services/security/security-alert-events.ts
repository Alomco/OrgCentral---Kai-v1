import { getSecurityEventService } from '@/server/services/security/security-event-service.provider';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { JsonRecord } from '@/server/types/json';

export type AlertEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export function mapAlertSeverityToEventSeverity(severity: 'info' | 'warning' | 'critical'): AlertEventSeverity {
    if (severity === 'critical') {
        return 'critical';
    }
    if (severity === 'warning') {
        return 'medium';
    }
    return 'low';
}

export async function logAlertEvent(
    context: RepositoryAuthorizationContext,
    details: {
        eventType: string;
        severity: AlertEventSeverity;
        description: string;
        resourceId: string;
        metadata?: JsonRecord;
    },
): Promise<void> {
    await getSecurityEventService().logSecurityEvent({
        orgId: context.orgId,
        eventType: details.eventType,
        severity: details.severity,
        description: details.description,
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        resourceId: details.resourceId,
        resourceType: 'security_alert',
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
        metadata: {
            alertId: details.resourceId,
            ...details.metadata,
        },
    });
}
