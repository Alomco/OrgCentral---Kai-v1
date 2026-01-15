import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { getSecurityEventService } from '../services/security/security-event-service.provider';
import type {
  PolicyEvaluationResult,
  SecurityAction,
  SecurityPolicy,
} from './security-policy.types';

export async function handleMatchedPolicy(params: {
  policy: SecurityPolicy;
  context: RepositoryAuthorizationContext;
  operation: string;
  resourceType: string;
  resourceId?: string;
  decisionLog: string[];
  matchedPolicies: SecurityPolicy[];
  allActions: SecurityAction[];
  logPolicyEvaluations: boolean;
}): Promise<PolicyEvaluationResult | null> {
  const {
    policy,
    context,
    operation,
    resourceType,
    resourceId,
    decisionLog,
    matchedPolicies,
    allActions,
    logPolicyEvaluations,
  } = params;

  decisionLog.push(
    `Policy "${policy.name}" matched for operation "${operation}" on ${resourceType} ${resourceId ?? ''}`,
  );
  matchedPolicies.push(policy);
  allActions.push(...policy.actions);

  if (!policy.actions.some(action => action.type === 'deny')) {
    return null;
  }

  const result: PolicyEvaluationResult = {
    allowed: false,
    actions: allActions,
    matchedPolicies,
    decisionLog,
  };

  if (logPolicyEvaluations) {
    const matchedConditions = policy.conditions.map(condition => ({
      type: condition.type,
      operator: condition.operator,
      value: condition.value,
      attribute: condition.attribute ?? null,
    }));
    const actionsTaken = policy.actions.map(action => ({
      type: action.type,
      parameters: action.parameters ?? {},
    }));
    await getSecurityEventService().logSecurityEvent({
      orgId: context.orgId,
      eventType: 'security.policy.denied',
      severity: 'high',
      description: `Security policy denied access: ${policy.name}`,
      userId: context.userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      resourceId,
      resourceType,
      metadata: {
        policyId: policy.id,
        policyName: policy.name,
        operation,
        matchedConditions,
        actionsTaken,
      },
    });
  }

  return result;
}

export async function logPolicyEvaluationResult(params: {
  context: RepositoryAuthorizationContext;
  operation: string;
  resourceType: string;
  resourceId?: string;
  result: PolicyEvaluationResult;
}): Promise<void> {
  const { context, operation, resourceType, resourceId, result } = params;
  const actionsTaken = result.actions.map(action => ({
    type: action.type,
    parameters: action.parameters ?? {},
  }));
  await getSecurityEventService().logSecurityEvent({
    orgId: context.orgId,
    eventType: result.allowed ? 'security.policy.allowed' : 'security.policy.denied',
    severity: result.allowed ? 'info' : 'high',
    description: `Security policy evaluation: ${result.allowed ? 'ALLOWED' : 'DENIED'} for operation "${operation}"`,
    userId: context.userId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    resourceId,
    resourceType,
    metadata: {
      operation,
      resourceType,
      resourceId: resourceId ?? null,
      matchedPolicyCount: result.matchedPolicies.length,
      actionsTaken,
      allowed: result.allowed,
    },
  });
}
