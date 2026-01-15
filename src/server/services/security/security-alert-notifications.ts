import { appLogger } from '@/server/logging/structured-logger';
import type { SecurityAlert } from '@/server/types/enhanced-security-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { logAlertEvent } from './security-alert-events';

export async function sendAlertNotification(
    context: RepositoryAuthorizationContext,
    alert: SecurityAlert,
): Promise<void> {
    appLogger.info('security.alert.notification', {
        orgId: context.orgId,
        alertId: alert.id,
        title: alert.title,
        severity: alert.severity,
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
    });

    await logAlertEvent(context, {
        eventType: 'security.notification.sent',
        severity: 'medium',
        description: `Notification sent for security alert: ${alert.title}`,
        resourceId: alert.id,
        metadata: { notificationType: 'alert' },
    });
}

export async function sendEscalationNotification(
    context: RepositoryAuthorizationContext,
    alertId: string,
): Promise<void> {
    appLogger.warn('security.alert.escalation-notification', {
        orgId: context.orgId,
        alertId,
        dataClassification: context.dataClassification,
        dataResidency: context.dataResidency,
        auditSource: context.auditSource,
    });

    await logAlertEvent(context, {
        eventType: 'security.escalation.notification.sent',
        severity: 'medium',
        description: `Escalation notification sent for alert ID: ${alertId}`,
        resourceId: alertId,
        metadata: { notificationType: 'escalation' },
    });
}
