import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SecurityIncidentResponseService } from '@/server/security/incident-response/incident-response-service';
import { IncidentSeverity, IncidentStatus } from '@/server/security/incident-response/incident-types';
import * as notifications from '@/server/security/incident-response/incident-notifications';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

const logSecurityEvent = vi.fn();

vi.mock('@/server/services/security/security-event-service.provider', () => ({
    getSecurityEventService: () => ({ logSecurityEvent }),
}));

describe('SecurityIncidentResponseService logging and notifications', () => {
    const incidentNotificationSpy = vi.spyOn(notifications, 'sendIncidentNotification');
    const assignmentNotificationSpy = vi.spyOn(notifications, 'sendAssignmentNotification');
    const escalationNotificationSpy = vi.spyOn(notifications, 'sendEscalationNotification');

    const context: RepositoryAuthorizationContext = {
        orgId: 'org-1',
        userId: 'user-1',
        sessionId: 'session-1',
        sessionToken: 'session-1',
        roles: ['admin'],
        roleKey: 'custom',
        permissions: {},
        mfaVerified: true,
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        authenticatedAt: new Date(),
        sessionExpiresAt: new Date(Date.now() + 60_000),
        lastActivityAt: new Date(),
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test-suite',
        tenantScope: {
            orgId: 'org-1',
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            auditSource: 'test-suite',
        },
        requiresMfa: false,
        piiAccessRequired: false,
        dataBreachRisk: false,
        authorizedAt: new Date(),
    };

    beforeEach(() => {
        logSecurityEvent.mockClear();
        incidentNotificationSpy.mockClear();
        assignmentNotificationSpy.mockClear();
        escalationNotificationSpy.mockClear();
    });

    it('logs tenant-aware incident creation and triggers notification', async () => {
        const service = new SecurityIncidentResponseService({ enableAutoEscalation: false });

        await service.reportIncident(context, {
            orgId: context.orgId,
            title: 'Database breach',
            description: 'Unauthorized access detected',
            severity: IncidentSeverity.High,
            reporterId: 'user-1',
        });

        const creationCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.incident.reported');
        const notificationCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.incident.notification.sent');

        expect(creationCall?.[0]).toMatchObject({
            orgId: context.orgId,
            dataClassification: context.dataClassification,
            dataResidency: context.dataResidency,
            auditSource: context.auditSource,
            severity: 'high',
        });
        expect(notificationCall?.[0]).toMatchObject({
            resourceType: 'security_incident',
            metadata: expect.objectContaining({ notificationType: 'initial_report' }),
        });
        expect(notifications.sendIncidentNotification).toHaveBeenCalledTimes(1);
    });

    it('logs escalation and sends escalation notification with tenant metadata', async () => {
        const service = new SecurityIncidentResponseService();

        await service.escalateIncident(context, 'incident-123');

        const escalationCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.incident.escalated');
        const escalationNotificationCall = logSecurityEvent.mock.calls.find(
            ([payload]) => payload.eventType === 'security.incident.escalation.notification.sent',
        );

        expect(escalationCall?.[0]).toMatchObject({
            orgId: context.orgId,
            dataClassification: context.dataClassification,
            dataResidency: context.dataResidency,
            resourceType: 'security_incident',
        });
        expect(escalationNotificationCall?.[0]).toMatchObject({
            metadata: expect.objectContaining({ notificationType: 'escalation' }),
        });
        expect(notifications.sendEscalationNotification).toHaveBeenCalledTimes(1);
    });

    it('logs assignment and sends assignment notification', async () => {
        const service = new SecurityIncidentResponseService();

        await service.assignIncident(context, {
            incidentId: 'incident-assign',
            assigneeId: 'analyst-1',
            assignedById: context.userId,
        });

        const assignmentCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.incident.assigned');
        const assignmentNotificationCall = logSecurityEvent.mock.calls.find(
            ([payload]) => payload.eventType === 'security.incident.assignment.notification.sent',
        );

        expect(assignmentCall?.[0]).toMatchObject({
            orgId: context.orgId,
            resourceType: 'security_incident',
            metadata: expect.objectContaining({ assignedTo: 'analyst-1', assignedBy: context.userId }),
        });
        expect(assignmentNotificationCall?.[0]).toMatchObject({
            metadata: expect.objectContaining({ notificationType: 'assignment', assigneeId: 'analyst-1' }),
        });
        expect(notifications.sendAssignmentNotification).toHaveBeenCalledTimes(1);
    });

    it('adds evidence with lifecycle logging and preserves tenant metadata', async () => {
        const service = new SecurityIncidentResponseService();

        await service.addEvidenceToIncident(context, 'incident-evidence', 'screenshot.png');

        const evidenceCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.incident.evidence.added');

        expect(evidenceCall?.[0]).toMatchObject({
            orgId: context.orgId,
            dataClassification: context.dataClassification,
            dataResidency: context.dataResidency,
            resourceId: 'incident-evidence',
            metadata: expect.objectContaining({ evidenceAdded: 'screenshot.png', addedBy: context.userId }),
        });
    });

    it('updates incident status and triggers cleanup when closed', async () => {
        const service = new SecurityIncidentResponseService();

        await service.updateIncidentStatus(context, 'incident-status', IncidentStatus.Closed, 'resolved');

        const lifecycleCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.incident.lifecycle');
        const cleanupCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.incident.cleanup');

        expect(lifecycleCall?.[0]).toMatchObject({
            orgId: context.orgId,
            metadata: expect.objectContaining({ status: IncidentStatus.Closed, changedBy: context.userId }),
        });
        expect(cleanupCall?.[0]).toMatchObject({
            eventType: 'security.incident.cleanup',
            dataClassification: context.dataClassification,
            dataResidency: context.dataResidency,
        });
    });
});
