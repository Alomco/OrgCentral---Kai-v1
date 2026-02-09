import type { NextApiRequest } from 'next';
import type { IncomingHttpHeaders } from 'node:http';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { AuthSession } from '@/server/lib/auth';
import { auth } from '@/server/lib/auth';
import { getSecurityEventService } from '@/server/services/security/security-event-service.provider';

/**
 * Utility function to extract organization ID from session/request
 */
export async function extractOrgIdFromSession(req: NextApiRequest): Promise<string | undefined> {
  const session = await getAuthSession(req);
  if (!session?.session) {
    return undefined;
  }

  const sessionInfo = session.session as { activeOrganizationId?: string; organizationId?: string };
  return sessionInfo.activeOrganizationId ?? sessionInfo.organizationId;
}

/**
 * Utility function to extract user ID from session/request
 */
export async function extractUserIdFromSession(req: NextApiRequest): Promise<string | undefined> {
  const session = await getAuthSession(req);
  if (!session?.session) {
    return undefined;
  }

  const user = session.user as { id?: string } | undefined;
  if (user?.id) {
    return user.id;
  }

  const sessionUser = (session.session as { user?: { id?: string } }).user;
  return sessionUser?.id;
}

function getAuthSession(req: NextApiRequest): Promise<AuthSession | null> {
  const headers = normalizeRequestHeaders(req.headers);
  return auth.api.getSession({ headers });
}

function normalizeRequestHeaders(headers: IncomingHttpHeaders): Headers {
  const entries: [string, string][] = [];

  for (const [key, value] of Object.entries(headers)) {
    if (!value) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.length > 0) {
          entries.push([key, item]);
        }
      }
      continue;
    }

    if (typeof value === 'string') {
      entries.push([key, value]);
    }
  }

  return new Headers(entries);
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
