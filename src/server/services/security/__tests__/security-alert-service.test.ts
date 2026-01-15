import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SecurityAlertService } from '@/server/services/security/security-alert-service';
import type { SecurityAlert } from '@/server/types/enhanced-security-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { ISecurityAlertRepository } from '@/server/repositories/contracts/security/enhanced-security-repository-contracts';

const logSecurityEvent = vi.fn();

vi.mock('@/server/services/security/security-event-service.provider', () => ({
  getSecurityEventService: () => ({ logSecurityEvent }),
}));

class FakeAlertRepository implements ISecurityAlertRepository {
  private readonly alerts = new Map<string, SecurityAlert>();

  async createAlert(
    _context: RepositoryAuthorizationContext,
    alert: Omit<SecurityAlert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<SecurityAlert> {
    const created: SecurityAlert = {
      ...alert,
      id: `alert-${this.alerts.size + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.alerts.set(created.id, created);
    return created;
  }

  async getAlert(_context: RepositoryAuthorizationContext, alertId: string): Promise<SecurityAlert | null> {
    return this.alerts.get(alertId) ?? null;
  }

  async getAlertsByOrg(
    context: RepositoryAuthorizationContext,
    _filters?: {
      status?: string;
      priority?: string;
      severity?: string;
      assignedTo?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<SecurityAlert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.orgId === context.orgId);
  }

  async updateAlert(
    _context: RepositoryAuthorizationContext,
    alertId: string,
    updates: Partial<Omit<SecurityAlert, 'id' | 'orgId' | 'createdAt'>>,
  ): Promise<void> {
    const existing = this.alerts.get(alertId);
    if (!existing) {
      throw new Error('Security alert not found');
    }
    const updated: SecurityAlert = { ...existing, ...updates, updatedAt: updates.updatedAt ?? new Date() };
    this.alerts.set(alertId, updated);
  }

  async countAlertsByOrg(
    context: RepositoryAuthorizationContext,
    _filters?: {
      status?: string;
      priority?: string;
      severity?: string;
      assignedTo?: string;
    },
  ): Promise<number> {
    return (await this.getAlertsByOrg(context)).length;
  }
}

describe('SecurityAlertService logging and notifications', () => {
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

  let repository: FakeAlertRepository;
  let service: SecurityAlertService;

  beforeEach(() => {
    logSecurityEvent.mockClear();
    repository = new FakeAlertRepository();
    service = new SecurityAlertService({ securityAlertRepository: repository, guard: async () => undefined });
  });

  it('creates alert with tenant-aware event logging and notification metadata', async () => {
    const created = await service.createAlert(context, {
      orgId: context.orgId,
      alertType: 'anomaly',
      severity: 'warning',
      title: 'Suspicious login',
      description: 'Multiple failed logins detected',
      priority: 'high',
      assignedTo: 'analyst-1',
    });

    const creationCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.alert.created');
    const notificationCall = logSecurityEvent.mock.calls.find(
      ([payload]) => payload.eventType === 'security.notification.sent',
    );

    expect(created.orgId).toBe(context.orgId);
    expect(creationCall?.[0]).toMatchObject({
      orgId: context.orgId,
      dataClassification: context.dataClassification,
      dataResidency: context.dataResidency,
      severity: 'medium',
      resourceType: 'security_alert',
      metadata: expect.objectContaining({ alertType: 'anomaly', priority: 'high', assignedTo: 'analyst-1' }),
    });
    expect(notificationCall?.[0]).toMatchObject({
      eventType: 'security.notification.sent',
      dataClassification: context.dataClassification,
      dataResidency: context.dataResidency,
      metadata: expect.objectContaining({ notificationType: 'alert' }),
    });
  });

  it('escalates alert and emits escalation notification with tenant metadata', async () => {
    const alert = await repository.createAlert(context, {
      orgId: context.orgId,
      alertType: 'breach',
      severity: 'critical',
      title: 'DB Breach',
      description: 'Data exfiltration suspected',
      status: 'new',
      priority: 'critical',
    });

    await service.escalateAlert(context, alert.id);

    const escalationCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.alert.escalated');
    const escalationNotificationCall = logSecurityEvent.mock.calls.find(
      ([payload]) => payload.eventType === 'security.escalation.notification.sent',
    );

    expect(escalationCall?.[0]).toMatchObject({
      orgId: context.orgId,
      dataClassification: context.dataClassification,
      dataResidency: context.dataResidency,
      metadata: expect.objectContaining({ escalatedBy: context.userId }),
    });
    expect(escalationNotificationCall?.[0]).toMatchObject({
      metadata: expect.objectContaining({ notificationType: 'escalation' }),
    });
  });

  it('resolves alert and logs resolution details', async () => {
    const alert = await repository.createAlert(context, {
      orgId: context.orgId,
      alertType: 'phishing',
      severity: 'warning',
      title: 'Phishing email',
      description: 'Suspicious email reported',
      status: 'new',
      priority: 'medium',
    });

    await service.resolveAlert(context, {
      alertId: alert.id,
      resolvedBy: 'analyst-2',
      resolutionNotes: 'User educated and email quarantined',
    });

    const resolutionCall = logSecurityEvent.mock.calls.find(([payload]) => payload.eventType === 'security.alert.resolved');

    expect(resolutionCall?.[0]).toMatchObject({
      orgId: context.orgId,
      dataClassification: context.dataClassification,
      dataResidency: context.dataResidency,
      metadata: expect.objectContaining({ resolvedBy: 'analyst-2', resolutionNotes: 'User educated and email quarantined' }),
    });
  });
});
