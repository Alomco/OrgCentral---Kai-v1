import { getSecurityEventService } from '@/server/services/security/security-event-service.provider';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { JsonRecord } from '@/server/types/json';
import {
  IncidentSeverity,
  IncidentStatus,
  type ReportIncidentInput,
  type SecurityIncident,
} from './incident-types';

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export function mapIncidentSeverityToEventSeverity(
  incidentSeverity: IncidentSeverity,
): EventSeverity {
  switch (incidentSeverity) {
    case IncidentSeverity.Low:
      return 'low';
    case IncidentSeverity.Medium:
      return 'medium';
    case IncidentSeverity.High:
      return 'high';
    case IncidentSeverity.Critical:
      return 'critical';
    default:
      return 'medium';
  }
}

export async function logIncidentEvent(
  context: RepositoryAuthorizationContext,
  incident: SecurityIncident,
  details: { eventType: string; severity: EventSeverity; description: string; metadata?: JsonRecord },
): Promise<void> {
  await getSecurityEventService().logSecurityEvent({
    orgId: context.orgId,
    eventType: details.eventType,
    severity: details.severity,
    description: details.description,
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
      ...details.metadata,
    },
  });
}

export function createIncidentFromInput(input: ReportIncidentInput): SecurityIncident {
  const now = new Date();
  return {
    id: `incident-${String(now.getTime())}-${Math.random().toString(36).slice(2, 9)}`,
    orgId: input.orgId,
    title: input.title,
    description: input.description,
    severity: input.severity,
    status: IncidentStatus.Reported,
    reporterId: input.reporterId,
    createdAt: now,
    updatedAt: now,
    evidence: input.evidence ?? [],
    affectedSystems: input.affectedSystems ?? [],
    impactAssessment: '',
    containmentMeasures: [],
    eradicationSteps: [],
    recoveryPlan: [],
    metadata: input.metadata,
  };
}

export function createMockIncident(
  context: RepositoryAuthorizationContext,
  incidentId: string,
  overrides: Partial<SecurityIncident> = {},
): SecurityIncident {
  const now = new Date();
  return {
    id: incidentId,
    orgId: context.orgId,
    title: 'Mock Incident Title',
    description: 'Mock Incident Description',
    severity: IncidentSeverity.High,
    status: IncidentStatus.Investigating,
    reporterId: context.userId,
    createdAt: now,
    updatedAt: now,
    evidence: [],
    affectedSystems: [],
    impactAssessment: '',
    containmentMeasures: [],
    eradicationSteps: [],
    recoveryPlan: [],
    ...overrides,
  };
}
