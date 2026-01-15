import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type {
  PolicyEvaluationResult,
  SecurityAction,
  SecurityPolicy,
  SecurityPolicyEngineOptions,
} from './security-policy.types';
import { securityConfigProvider } from './security-configuration-provider';
import { buildPolicyCacheKey } from './security-policy-engine.cache';
import { executePolicyAction } from './security-policy-engine.actions';
import { evaluatePolicyConditions } from './security-policy-engine.conditions';
import { buildDefaultSecurityPolicies } from './security-policy-engine.defaults';
import {
  handleMatchedPolicy,
  logPolicyEvaluationResult,
} from './security-policy-engine.evaluation';

export type {
  PolicyEvaluationResult,
  SecurityAction,
  SecurityCondition,
  SecurityPolicy,
  SecurityPolicyEngineOptions,
} from './security-policy.types';

export class SecurityPolicyEngine {
  private readonly enableCaching: boolean;
  private readonly cacheTtlMs: number;
  private readonly logPolicyEvaluations: boolean;
  private policyCache = new Map<string, { result: PolicyEvaluationResult; timestamp: number }>();
  private policies: SecurityPolicy[] = [];

  constructor(options: SecurityPolicyEngineOptions = {}) {
    this.enableCaching = options.enableCaching ?? true;
    this.cacheTtlMs = options.cacheTtlMs ?? 5 * 60 * 1000; // 5 minutes
    this.logPolicyEvaluations = options.logPolicyEvaluations ?? true;
  }

  /**
   * Adds a security policy to the engine
   */
  public addPolicy(policy: SecurityPolicy): void {
    this.policies.push(policy);
    // Sort policies by priority (lower numbers = higher priority)
    this.policies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Removes a security policy from the engine
   */
  public removePolicy(policyId: string): void {
    this.policies = this.policies.filter(policy => policy.id !== policyId);
  }

  /**
   * Evaluates security policies against the provided context
   */
  public async evaluatePolicies(
    context: RepositoryAuthorizationContext,
    operation: string,
    resourceType: string,
    resourceId?: string
  ): Promise<PolicyEvaluationResult> {
    const cacheKey = buildPolicyCacheKey(context, operation, resourceType, resourceId);
    
    // Check cache if enabled
    if (this.enableCaching) {
      const cached = this.policyCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
        return cached.result;
      }
    }

    const decisionLog: string[] = [];
    const matchedPolicies: SecurityPolicy[] = [];
    const allActions: SecurityAction[] = [];

    // Evaluate policies in priority order
    for (const policy of this.policies) {
      if (!policy.enabled) {
        continue;
      }

      const matches = evaluatePolicyConditions(policy, context);
      
      if (matches) {
        const denialResult = await handleMatchedPolicy({
          policy,
          context,
          operation,
          resourceType,
          resourceId,
          decisionLog,
          matchedPolicies,
          allActions,
          logPolicyEvaluations: this.logPolicyEvaluations,
        });
        if (denialResult) {
          if (this.enableCaching) {
            this.policyCache.set(cacheKey, { result: denialResult, timestamp: Date.now() });
          }
          return denialResult;
        }
      }
    }

    // Determine if access is allowed based on policies
    // Default to allowing access if no explicit deny policies matched
    const allowed = !matchedPolicies.some(policy => 
      policy.actions.some(action => action.type === 'deny')
    );

    const result: PolicyEvaluationResult = {
      allowed,
      actions: allActions,
      matchedPolicies,
      decisionLog,
    };

    if (this.enableCaching) {
      this.policyCache.set(cacheKey, { result, timestamp: Date.now() });
    }

    if (this.logPolicyEvaluations) {
      await logPolicyEvaluationResult({
        context,
        operation,
        resourceType,
        resourceId,
        result,
      });
    }

    return result;
  }

  /**
   * Enforces security policies by evaluating them and applying required actions
   */
  public async enforcePolicies(
    context: RepositoryAuthorizationContext,
    operation: string,
    resourceType: string,
    resourceId?: string
  ): Promise<void> {
    const evaluationResult = await this.evaluatePolicies(context, operation, resourceType, resourceId);

    // Apply actions based on policy evaluation
    for (const action of evaluationResult.actions) {
      await executePolicyAction(
        action,
        context,
        operation,
        resourceType,
        resourceId,
        evaluationResult,
      );
    }

    // If access is not allowed, throw an error
    if (!evaluationResult.allowed) {
      throw new Error(`Access denied by security policy for operation "${operation}" on ${resourceType} ${resourceId ?? ''}`);
    }
  }

  /**
   * Clears the policy evaluation cache
   */
  public clearCache(): void {
    this.policyCache.clear();
  }

  /**
   * Gets all registered policies
   */
  public getPolicies(): SecurityPolicy[] {
    return [...this.policies];
  }

  /**
   * Creates a default set of security policies based on organization configuration
   */
  public initializeDefaultPolicies(orgId: string): void {
    const config = securityConfigProvider.getOrgConfig(orgId);
    const policies = buildDefaultSecurityPolicies(orgId, config);
    policies.forEach(policy => this.addPolicy(policy));
  }
}

// Export a singleton instance
export const securityPolicyEngine = new SecurityPolicyEngine({
  enableCaching: true,
  logPolicyEvaluations: true,
});
