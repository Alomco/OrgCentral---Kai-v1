import type { NextApiRequest } from 'next';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { getSecurityEventService } from '@/server/services/security/security-event-service.provider';

/**
 * Utility function to extract organization ID from session/request
 */
export function extractOrgIdFromSession(req: NextApiRequest): string | undefined {
  // This would typically extract from JWT, session cookie, or other auth mechanism
  // Implementation depends on your authentication system
  return req.headers.authorization?.split(' ')[1]; // Example: Bearer token
}

/**
 * Utility function to extract user ID from session/request
 */
export function extractUserIdFromSession(req: NextApiRequest): string | undefined {
  // This would typically extract from JWT, session cookie, or other auth mechanism
  // Implementation depends on your authentication system
  return req.headers.authorization?.split(' ')[1]; // Example: Bearer token
}

/**
 * Utility function to get client IP address
 */
export function getClientIpAddress(req: NextApiRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string | undefined) ??
    (req.headers['x-real-ip'] as string | undefined) ??
    req.socket.remoteAddress ??
    ''
  ).split(',')[0].trim();
}

export function mapHttpMethodToOperation(method?: string): 'read' | 'write' | 'delete' | 'update' {
  if (!method) {
    return 'read';
  }
  const normalized = method.toUpperCase();
  if (normalized === 'GET' || normalized === 'HEAD' || normalized === 'OPTIONS') {
    return 'read';
  }
  if (normalized === 'DELETE') {
    return 'delete';
  }
  if (normalized === 'PATCH' || normalized === 'PUT') {
    return 'update';
  }
  return 'write';
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  context: RepositoryAuthorizationContext,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  req: NextApiRequest,
): Promise<void> {
  const metadata = {
    url: req.url ?? null,
    method: req.method ?? null,
    sessionId: context.sessionId ?? null,
    role: context.roleKey,
    mfaVerified: context.mfaVerified ?? null,
  };
  await getSecurityEventService().logSecurityEvent({
    orgId: context.orgId,
    eventType,
    severity,
    description,
    userId: context.userId,
    ipAddress: getClientIpAddress(req),
    userAgent: req.headers['user-agent'] ?? '',
    metadata,
  });
}
