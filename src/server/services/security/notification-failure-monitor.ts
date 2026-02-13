import { appLogger } from '@/server/logging/structured-logger';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { JsonRecord } from '@/server/types/json';
import { getEnhancedSecurityEventService } from '@/server/services/security/security-event-service.provider';

const DEFAULT_THRESHOLD = 5;
const DEFAULT_WINDOW_MINUTES = 5;
const DEFAULT_COOLDOWN_MINUTES = 15;

export interface NotificationFailureInput {
    authorization: RepositoryAuthorizationContext;
    eventType: string;
    description: string;
    resourceId?: string;
    metadata?: JsonRecord;
}

function getEnvironmentNumber(name: string, fallback: number): number {
    const raw = process.env[name];
    if (!raw) {
        return fallback;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function recordNotificationFailure(input: NotificationFailureInput): Promise<void> {
    const service = getEnhancedSecurityEventService();
    const threshold = getEnvironmentNumber('SECURITY_NOTIFICATION_FAILURE_THRESHOLD', DEFAULT_THRESHOLD);
    const windowMinutes = getEnvironmentNumber('SECURITY_NOTIFICATION_FAILURE_WINDOW_MINUTES', DEFAULT_WINDOW_MINUTES);
    const cooldownMinutes = getEnvironmentNumber('SECURITY_NOTIFICATION_FAILURE_ALERT_COOLDOWN_MINUTES', DEFAULT_COOLDOWN_MINUTES);
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60_000);
    const cooldownStart = new Date(now.getTime() - cooldownMinutes * 60_000);

    try {
        await service.logSecurityEvent({
            orgId: input.authorization.orgId,
            eventType: input.eventType,
            severity: 'medium',
            description: input.description,
            userId: input.authorization.userId,
            ipAddress: input.authorization.ipAddress,
            userAgent: input.authorization.userAgent,
            resourceId: input.resourceId,
            resourceType: 'notification',
            dataClassification: input.authorization.dataClassification,
            dataResidency: input.authorization.dataResidency,
            metadata: input.metadata,
            auditSource: input.authorization.auditSource,
            correlationId: input.authorization.correlationId,
        });

        const failureCount = await service.countSecurityEventsByOrg(input.authorization, {
            eventType: input.eventType,
            startDate: windowStart,
            endDate: now,
        });

        if (failureCount < threshold) {
            return;
        }

        const alertEventType = `${input.eventType}.threshold`;
        const recentAlerts = await service.countSecurityEventsByOrg(input.authorization, {
            eventType: alertEventType,
            startDate: cooldownStart,
            endDate: now,
        });

        if (recentAlerts > 0) {
            return;
        }

        await service.logSecurityEvent({
            orgId: input.authorization.orgId,
            eventType: alertEventType,
            severity: 'high',
            description:
                'Notification failures exceeded threshold (' +
                String(failureCount) +
                ' in ' +
                String(windowMinutes) +
                ' minutes).',
            userId: input.authorization.userId,
            ipAddress: input.authorization.ipAddress,
            userAgent: input.authorization.userAgent,
            resourceId: input.resourceId,
            resourceType: 'notification',
            dataClassification: input.authorization.dataClassification,
            dataResidency: input.authorization.dataResidency,
            metadata: {
                failureCount,
                windowMinutes,
                threshold,
            },
            auditSource: input.authorization.auditSource,
            correlationId: input.authorization.correlationId,
        });
    } catch (error) {
        appLogger.warn('security.notification-failure.monitor.failed', {
            orgId: input.authorization.orgId,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}