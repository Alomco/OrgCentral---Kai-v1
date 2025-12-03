// Use-case: log a security event using the security-event repository for audit/compliance.

import { withRepositoryAuthorization } from '@/server/repositories/security';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ISecurityEventRepository } from '@/server/repositories/contracts/auth/security/security-event-repository-contract';
import type { SecurityEvent } from '@/server/types/hr-types';
import type { LogSecurityEventInput, LogSecurityEventOutput, SecurityEventCreatePayload } from '@/server/types';

// Use the contract type so callers/tests can replace this concrete implementation
// with a different repository implementation without changing this use-case.
// For better reusability and easier testing we accept an injected repository
// and fall back to the Prisma implementation when omitted.

// types now imported from ./types

export async function logSecurityEvent(
  input: LogSecurityEventInput,
  repository: ISecurityEventRepository,
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
      const baseMetadata: Record<string, unknown> | undefined = input.metadata ? { ...input.metadata } : undefined;
      const additionalInfo: Record<string, unknown> | undefined = input.resourceId || baseMetadata
        ? { ...(baseMetadata ?? {}), ...(input.resourceId ? { resourceId: input.resourceId } : {}) }
        : undefined;

      const securityEventData: SecurityEventCreatePayload = {
        orgId: input.orgId,
        userId: input.userId,
        eventType: input.eventType,
        severity: input.severity,
        description: input.description,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        additionalInfo: additionalInfo as SecurityEvent['additionalInfo'],
        resolved: false,
        resolvedAt: null,
        resolvedBy: null,
      };

      // Persist via repository contract — use injected repository when provided
      // so tests and callers can substitute alternate implementations.
      await repository.createSecurityEvent(context.orgId, securityEventData);

      // As the contract does not return the created entity, return a simple success flag.
      return { success: true };
    },
  );
}
