import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { appLogger } from '@/server/logging/structured-logger';
import { getSecurityEventService } from '../services/security/security-event-service.provider';
import type {
  PolicyEvaluationResult,
  SecurityAction,
} from './security-policy.types';

export async function executePolicyAction(
  action: SecurityAction,
  context: RepositoryAuthorizationContext,
  operation: string,
  resourceType: string,
  resourceId: string | undefined,
  evaluationResult: PolicyEvaluationResult,
): Promise<void> {
  switch (action.type) {
    case 'require_mfa':
      if (!context.mfaVerified) {
        throw new Error('MFA authentication required by security policy');
      }
      break;

    case 'log_event': {
      const evaluationMetadata = {
        allowed: evaluationResult.allowed,
        actionCount: evaluationResult.actions.length,
        matchedPolicyIds: evaluationResult.matchedPolicies.map(policy => policy.id),
        decisionLog: evaluationResult.decisionLog,
      };
      await getSecurityEventService().logSecurityEvent({
        orgId: context.orgId,
        eventType: 'security.policy.action.executed',
        severity: 'info',
        description: `Security policy action executed: ${action.type}`,
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        resourceId,
        resourceType,
        metadata: {
          action: {
            type: action.type,
            parameters: action.parameters ?? {},
          },
          operation,
          evaluationResult: evaluationMetadata,
        },
      });
      break;
    }

    case 'notify_admin':
      appLogger.info('security.policy.notify_admin', {
        operation,
        resourceType,
        resourceId: resourceId ?? null,
      });
      break;

    case 'restrict_access':
      if (action.parameters?.sessionTimeout) {
        // Extend session timeout logic would go here.
      }
      break;

    case 'quarantine_data':
      appLogger.warn('security.policy.quarantine', {
        resourceId: resourceId ?? null,
        resourceType,
        operation,
      });
      break;

    case 'allow':
    case 'deny':
      break;

    default:
      appLogger.warn('security.policy.unknown_action', {
        actionType: action.type,
      });
      break;
  }
}
