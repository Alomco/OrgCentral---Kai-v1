import type { SecurityAlert } from '@/server/types/enhanced-security-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { OrgAccessInput } from '@/server/security/guards';
import { logAlertEvent, mapAlertSeverityToEventSeverity } from './security-alert-events';
import { sendAlertNotification, sendEscalationNotification } from './security-alert-notifications';
import type {
    CreateSecurityAlertInput,
    ResolveSecurityAlertInput,
    SecurityAlertServiceDependencies,
    SecurityAlertServiceOptions,
    UpdateSecurityAlertInput,
} from './security-alert-contracts';

const ALERT_AUDIT_SOURCE = 'security-alert-service';
const ALERT_RESOURCE_TYPE = 'security_alert';
const ALERT_NOT_FOUND = 'Security alert not found';
const ALERT_CROSS_ORG = 'Cannot manage alert from another organization';
const ALERT_REFRESH_FAILED = 'Security alert refresh failed';

export interface AlertHandlerContext {
    dependencies: SecurityAlertServiceDependencies;
    guard: (input: OrgAccessInput) => Promise<unknown>;
    options: Required<SecurityAlertServiceOptions>;
}
function normalizeMetadata(metadata: SecurityAlert['metadata']): Record<string, unknown> {
    return metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? metadata as Record<string, unknown>
        : {};
}

async function loadAlert(
    handlerContext: AlertHandlerContext,
    context: RepositoryAuthorizationContext,
    alertId: string,
): Promise<SecurityAlert> {
    const alert = await handlerContext.dependencies.securityAlertRepository.getAlert(context, alertId);
    if (!alert) {
        throw new Error(ALERT_NOT_FOUND);
    }
    if (alert.orgId !== context.orgId) {
        throw new Error(ALERT_CROSS_ORG);
    }
    return alert;
}
export async function handleCreateAlert(
    handlerContext: AlertHandlerContext,
    context: RepositoryAuthorizationContext,
    input: CreateSecurityAlertInput,
): Promise<SecurityAlert> {
    await handlerContext.guard({
        orgId: context.orgId,
        userId: context.userId,
        expectedResidency: context.dataResidency,
        expectedClassification: context.dataClassification,
        auditSource: ALERT_AUDIT_SOURCE,
        correlationId: context.correlationId,
        action: 'security.alert.create',
        resourceType: ALERT_RESOURCE_TYPE,
    });

    if (input.orgId !== context.orgId) {
        throw new Error('Cannot create alert for another organization');
    }

    if (!input.title || !input.description) {
        throw new Error('Title and description are required for security alerts');
    }

    const alert: Omit<SecurityAlert, 'id'> = {
        orgId: input.orgId,
        alertType: input.alertType,
        severity: input.severity,
        title: input.title,
        description: input.description,
        status: 'new',
        priority: input.priority,
        assignedTo: input.assignedTo,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: input.metadata,
    };

    const createdAlert = await handlerContext.dependencies.securityAlertRepository.createAlert(context, alert);

    await logAlertEvent(context, {
        eventType: 'security.alert.created',
        severity: mapAlertSeverityToEventSeverity(input.severity),
        description: `Security alert created: ${input.title}`,
        resourceId: createdAlert.id,
        metadata: { alertType: input.alertType, priority: input.priority, assignedTo: input.assignedTo ?? null },
    });
    if (handlerContext.options.autoEscalateCriticalAlerts && input.severity === 'critical') {
        await handleEscalateAlert(handlerContext, context, createdAlert.id);
    }
    if (handlerContext.options.notificationEnabled) {
        await sendAlertNotification(context, createdAlert);
    }

    return createdAlert;
}
export async function handleUpdateAlert(
    handlerContext: AlertHandlerContext,
    context: RepositoryAuthorizationContext,
    input: UpdateSecurityAlertInput,
): Promise<SecurityAlert> {
    const existingAlert = await loadAlert(handlerContext, context, input.alertId);

    await handlerContext.guard({
        orgId: context.orgId,
        userId: context.userId,
        expectedResidency: context.dataResidency,
        expectedClassification: context.dataClassification,
        auditSource: ALERT_AUDIT_SOURCE,
        correlationId: context.correlationId,
        action: 'security.alert.update',
        resourceType: ALERT_RESOURCE_TYPE,
    });

    await handlerContext.dependencies.securityAlertRepository.updateAlert(
        context,
        input.alertId,
        { ...input.updates, updatedAt: new Date() },
    );
    await logAlertEvent(context, {
        eventType: 'security.alert.updated',
        severity: 'medium',
        description: `Security alert updated: ${existingAlert.title}`,
        resourceId: input.alertId,
        metadata: { updates: Object.keys(input.updates) },
    });

    const refreshedAlert = await handlerContext.dependencies.securityAlertRepository.getAlert(context, input.alertId);
    if (!refreshedAlert) {
        throw new Error(ALERT_REFRESH_FAILED);
    }
    return refreshedAlert;
}

export async function handleResolveAlert(
    handlerContext: AlertHandlerContext,
    context: RepositoryAuthorizationContext,
    input: ResolveSecurityAlertInput,
): Promise<SecurityAlert> {
    const existingAlert = await loadAlert(handlerContext, context, input.alertId);

    await handlerContext.guard({
        orgId: context.orgId,
        userId: context.userId,
        expectedResidency: context.dataResidency,
        expectedClassification: context.dataClassification,
        auditSource: ALERT_AUDIT_SOURCE,
        correlationId: context.correlationId,
        action: 'security.alert.resolve',
        resourceType: ALERT_RESOURCE_TYPE,
    });

    await handlerContext.dependencies.securityAlertRepository.updateAlert(
        context,
        input.alertId,
        {
            status: 'resolved',
            resolvedAt: new Date(),
            updatedAt: new Date(),
            // keep metadata JSON-safe by normalizing optional fields to null
            metadata: {
                ...normalizeMetadata(existingAlert.metadata),
                resolvedBy: input.resolvedBy,
                resolutionNotes: typeof input.resolutionNotes === 'string' && input.resolutionNotes.length > 0
                    ? input.resolutionNotes
                    : null,
            },
        },
    );
    await logAlertEvent(context, {
        eventType: 'security.alert.resolved',
        severity: 'medium',
        description: `Security alert resolved: ${existingAlert.title}`,
        resourceId: input.alertId,
        metadata: {
            resolvedBy: input.resolvedBy,
            resolutionNotes:
                typeof input.resolutionNotes === 'string' && input.resolutionNotes.length > 0
                    ? input.resolutionNotes
                    : null,
        },
    });

    const refreshedAlert = await handlerContext.dependencies.securityAlertRepository.getAlert(context, input.alertId);
    if (!refreshedAlert) {
        throw new Error(ALERT_REFRESH_FAILED);
    }
    return refreshedAlert;
}

export async function handleEscalateAlert(
    handlerContext: AlertHandlerContext,
    context: RepositoryAuthorizationContext,
    alertId: string,
): Promise<SecurityAlert> {
    const existingAlert = await loadAlert(handlerContext, context, alertId);

    await handlerContext.guard({
        orgId: context.orgId,
        userId: context.userId,
        expectedResidency: context.dataResidency,
        expectedClassification: context.dataClassification,
        auditSource: ALERT_AUDIT_SOURCE,
        correlationId: context.correlationId,
        action: 'security.alert.escalate',
        resourceType: ALERT_RESOURCE_TYPE,
    });

    await handlerContext.dependencies.securityAlertRepository.updateAlert(
        context,
        alertId,
        {
            priority: 'critical',
            status: 'investigating',
            assignedTo: 'security-team',
            updatedAt: new Date(),
            metadata: {
                ...normalizeMetadata(existingAlert.metadata),
                escalatedAt: new Date().toISOString(),
                escalatedBy: context.userId,
            },
        },
    );
    await logAlertEvent(context, {
        eventType: 'security.alert.escalated',
        severity: 'high',
        description: `Security alert escalated: ${existingAlert.title}`,
        resourceId: alertId,
        metadata: { escalatedBy: context.userId },
    });

    if (handlerContext.options.notificationEnabled) {
        await sendEscalationNotification(context, alertId);
    }
    const refreshedAlert = await handlerContext.dependencies.securityAlertRepository.getAlert(context, alertId);
    if (!refreshedAlert) {
        throw new Error(ALERT_REFRESH_FAILED);
    }
    return refreshedAlert;
}
