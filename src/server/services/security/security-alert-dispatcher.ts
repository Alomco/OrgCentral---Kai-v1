import { appLogger } from '@/server/logging/structured-logger';

interface SecurityAlertPayload {
    orgId: string;
    eventType: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    description: string;
    userId: string;
    correlationId?: string;
    occurredAt: string;
}

export async function dispatchSecurityAlert(payload: SecurityAlertPayload): Promise<void> {
    const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL;
    if (!webhookUrl) {
        return;
    }

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orgId: payload.orgId,
                eventType: payload.eventType,
                severity: payload.severity,
                description: payload.description,
                userId: payload.userId,
                correlationId: payload.correlationId,
                occurredAt: payload.occurredAt,
            }),
        });
    } catch (error) {
        appLogger.warn('security-alert.dispatch_failed', {
            orgId: payload.orgId,
            eventType: payload.eventType,
            severity: payload.severity,
            message: error instanceof Error ? error.message : String(error),
        });
    }
}
