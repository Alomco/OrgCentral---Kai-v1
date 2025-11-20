// Use-case: log a security event using the security-event repository for audit/compliance.

import { withRepositoryAuthorization } from '@/server/repositories/security';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { securityEventRepository } from '@/server/repositories';
import type { SecurityEvent } from '@/server/types/security';

export interface LogSecurityEventInput {
  orgId: string;
  userId: string; // The user associated with the event (can be the acting user or affected user)
  eventType: string; // e.g., 'login', 'failed_login', 'permission_denied', 'data_access', 'config_change'
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string; // Optional resource ID related to the event
  metadata?: Record<string, unknown>; // Additional contextual information
}

export interface LogSecurityEventOutput {
  eventId: string;
  timestamp: Date;
  success: true;
}

export async function logSecurityEvent(
  input: LogSecurityEventInput,
): Promise<LogSecurityEventOutput> {
  // This use-case doesn't require specific permissions since it's for logging security events
  // We'll use a special context that allows security logging
  return withRepositoryAuthorization(
    {
      orgId: input.orgId,
      userId: input.userId,
      requiredRoles: ['member'], // Any member can potentially trigger a security event log
      action: 'create',
      resourceType: 'security_event',
    },
    async (context: RepositoryAuthorizationContext) => {
      // Prepare the security event data
      const securityEventData: Omit<SecurityEvent, 'id'> = {
        orgId: input.orgId,
        userId: input.userId,
        eventType: input.eventType,
        severity: input.severity,
        description: input.description,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        resourceId: input.resourceId,
        metadata: input.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use the repository to create the security event
      const createdEvent = await securityEventRepository.createSecurityEvent(context, securityEventData);

      return {
        eventId: createdEvent.id,
        timestamp: createdEvent.createdAt,
        success: true,
      };
    },
  );
}
