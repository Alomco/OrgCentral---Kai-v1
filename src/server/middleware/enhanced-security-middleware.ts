import type { NextApiRequest, NextApiResponse } from 'next';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { JsonValue } from '@/server/types/json';
import { assertEnhancedOrgAccess, type EnhancedOrgAccessInput } from '@/server/security/guards/enhanced-security-guards';
import { getSecurityEventService } from '@/server/services/security/security-event-service.provider';
import { appLogger } from '@/server/logging/structured-logger';
import {
  extractOrgIdFromSession,
  extractUserIdFromSession,
  getClientIpAddress,
  logSecurityEvent,
} from './enhanced-security-middleware.helpers';
import { checkDataResidency, checkPiiAccess } from './enhanced-security-middleware.validations';
export { withCsrfProtection } from './enhanced-security-middleware.csrf';

export interface SecurityMiddlewareOptions {
  requireMfa?: boolean;
  requirePiiAccess?: boolean;
  requireDataBreachCheck?: boolean;
  validateDataResidency?: boolean;
  logAccessEvents?: boolean;
  enforceCsrf?: boolean;
  rateLimiting?: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface SecurityMiddlewareResult {
  success: boolean;
  error?: string;
  context?: RepositoryAuthorizationContext;
  piiDetected?: boolean;
  dataResidencyViolations?: string[];
}

/**
 * Enhanced security middleware for API routes
 */
export function withEnhancedSecurityMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse, context: RepositoryAuthorizationContext) => Promise<void>,
  options: SecurityMiddlewareOptions = {}
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Extract orgId and userId from request (this could come from headers, session, or JWT)
      const orgId = (req.headers['x-org-id'] as string | undefined) ?? extractOrgIdFromSession(req);
      const userId = (req.headers['x-user-id'] as string | undefined) ?? extractUserIdFromSession(req);
      const requestUrl = req.url ?? 'unknown';
      const userAgent = req.headers['user-agent'] ?? '';

      if (!orgId || !userId) {
        res.status(401).json({ error: 'Missing organization or user identifier' }); return;
      }

      // Create enhanced access input
      const accessInput: EnhancedOrgAccessInput = {
        orgId,
        userId,
        requiresMfa: options.requireMfa,
        piiAccessRequired: options.requirePiiAccess,
        dataBreachRisk: options.requireDataBreachCheck,
        ipAddress: getClientIpAddress(req),
        userAgent,
        auditSource: 'api-middleware',
      };

      // Assert enhanced organization access
      const context = await assertEnhancedOrgAccess(accessInput);

      // Validate data residency if required
      if (options.validateDataResidency) {
        const violations = await checkDataResidency(context, req, requestUrl);
        if (violations) {
          res.status(403).json({
            error: 'Data residency requirements not met',
            violations,
          });
          return;
        }
      }

      // Check for PII in request if required
      if (options.requirePiiAccess || req.method !== 'GET') {
        const requestBody = req.body as JsonValue | undefined;
        const allowed = await checkPiiAccess(context, req, requestBody);
        if (!allowed) {
          res.status(403).json({ error: 'PII access not authorized' });
          return;
        }
      }

      // Log access event if required
      if (options.logAccessEvents) {
        await logSecurityEvent(
          context,
          'api.access.granted',
          'low',
          `API access granted to ${requestUrl} for user ${userId}`,
          req
        );
      }

      // Execute the original handler with the security context
      await handler(req, res, context);
    } catch (error) {
      appLogger.error('security.middleware.error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Log security event for the failure
      const orgId = (req.headers['x-org-id'] as string | undefined) ?? extractOrgIdFromSession(req);
      const userId = (req.headers['x-user-id'] as string | undefined) ?? extractUserIdFromSession(req);

      if (orgId && userId) {
        const metadata = {
          url: req.url ?? null,
          method: req.method ?? null,
          error: (error as Error).message,
          stack: (error as Error).stack ?? null,
        };
        await getSecurityEventService().logSecurityEvent({
          orgId,
          eventType: 'api.access.denied',
          severity: 'high',
          description: `API access denied: ${(error as Error).message}`,
          userId,
          ipAddress: getClientIpAddress(req),
          userAgent: req.headers['user-agent'] ?? '',
          metadata,
        });
      }

      // Return appropriate error response
      res.status(403).json({
        error: 'Access denied due to security validation failure',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }); return;
    }
  };
}

/**
 * Middleware specifically for protecting routes that handle PII
 */
export function withPiiProtectionMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse, context: RepositoryAuthorizationContext) => Promise<void>
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return withEnhancedSecurityMiddleware(handler, {
    requirePiiAccess: true,
    logAccessEvents: true,
  });
}

/**
 * Middleware for highly classified data access
 */
export function withClassifiedDataProtectionMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse, context: RepositoryAuthorizationContext) => Promise<void>,
  requiredClassification?: 'OFFICIAL' | 'OFFICIAL_SENSITIVE' | 'SECRET' | 'TOP_SECRET',
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const guardedHandler = async (
        innerRequest: NextApiRequest,
        innerResponse: NextApiResponse,
        context: RepositoryAuthorizationContext,
      ): Promise<void> => {
        if (requiredClassification && context.dataClassification !== requiredClassification) {
          await logSecurityEvent(
            context,
            'security.classification.denied',
            'high',
            `Classification ${context.dataClassification} does not meet required ${requiredClassification}`,
            innerRequest,
          );
          innerResponse.status(403).json({ error: 'Access to classified data denied' });
          return;
        }
        await handler(innerRequest, innerResponse, context);
      };

      const enhancedHandler = withEnhancedSecurityMiddleware(guardedHandler, {
        requireMfa: true,
        validateDataResidency: true,
        logAccessEvents: true,
      });

      await enhancedHandler(req, res);
    } catch (error) {
      appLogger.error('security.middleware.classified.error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(403).json({ error: 'Access to classified data denied' });
      return;
    }
  };
}
