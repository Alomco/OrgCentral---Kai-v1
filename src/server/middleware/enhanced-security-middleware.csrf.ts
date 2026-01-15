import type { NextApiRequest, NextApiResponse } from 'next';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { getSecurityEventService } from '@/server/services/security/security-event-service.provider';
import { getClientIpAddress } from './enhanced-security-middleware.helpers';

export function withCsrfProtection(
  handler: (req: NextApiRequest, res: NextApiResponse, context?: RepositoryAuthorizationContext) => Promise<void>,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      const csrfToken = req.headers['x-csrf-token'] as string;

      if (!csrfToken) {
        await getSecurityEventService().logSecurityEvent({
          orgId: (req.headers['x-org-id'] as string | undefined) ?? 'unknown',
          eventType: 'security.csrf.protection.failed',
          severity: 'high',
          description: 'CSRF token missing from request',
          userId: (req.headers['x-user-id'] as string | undefined) ?? 'unknown',
          ipAddress: getClientIpAddress(req),
          userAgent: req.headers['user-agent'] ?? '',
        });

        res.status(403).json({ error: 'CSRF token required' });
        return;
      }
    }

    return handler(req, res, undefined);
  };
}
