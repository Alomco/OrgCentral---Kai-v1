import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import { PrismaAbacPolicyRepository } from '@/server/repositories/prisma/org/abac/prisma-abac-policy-repository';
import type { AbacPolicy, AbacCondition } from './abac-types';

let abacPolicyRepository: IAbacPolicyRepository | null = null;

function getAbacPolicyRepository(): IAbacPolicyRepository {
  if (!abacPolicyRepository) {
    abacPolicyRepository = new PrismaAbacPolicyRepository();
  }
  return abacPolicyRepository!;
}

export function setAbacPolicyRepository(repository: IAbacPolicyRepository): void {
  abacPolicyRepository = repository;
}

// Simple ABAC evaluator that reads policies from Organization.settings.abacPolicies
export async function getTenantAbacPolicies(orgId: string): Promise<AbacPolicy[]> {
  const policies = await getAbacPolicyRepository().getPoliciesForOrg(orgId);
  return policies.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

function evaluateCondition(condition: AbacCondition | undefined, subject: Record<string, unknown>, resource: Record<string, unknown>): boolean {
  if (!condition) { return true; }
  // Simple structure: exact match for keys. Support subject placeholders via templating using '$subject.' or '$resource.'
  if (condition.subject) {
    for (const [k, v] of Object.entries(condition.subject)) {
      const sVal = subject[k];
      if (v === undefined) { continue; }
      // Compare arrays and strings
      if (Array.isArray(v)) {
        if (!Array.isArray(sVal)) { return false; }
        for (const el of v) {
          if (!((sVal as unknown[]).includes(el))) { return false; }
        }
      } else {
        if (sVal !== v) { return false; }
      }
    }
  }

  if (condition.resource) {
    for (const [k, v] of Object.entries(condition.resource)) {
      const rVal = resource[k];
      if (v === undefined) { continue; }
      if (typeof v === 'string' && v.startsWith('$subject.')) {
        const subKey = v.replace('$subject.', '');
        const subVal = subject[subKey];
        if (rVal !== subVal) { return false; }
      } else if (Array.isArray(v)) {
        if (!Array.isArray(rVal)) { return false; }
        for (const el of v) {
          if (!((rVal as unknown[]).includes(el))) { return false; }
        }
      } else {
        if (rVal !== v) { return false; }
      }
    }
  }

  return true;
}

export async function evaluateAbac(
  orgId: string,
  action: string,
  resourceType: string,
  subjectAttrs: Record<string, unknown>,
  resourceAttrs: Record<string, unknown>,
): Promise<boolean> {
  const policies = await getTenantAbacPolicies(orgId);
  let allowed = false;
  for (const policy of policies) {
    if (!policy.actions.includes(action)) { continue; }
    if (!policy.resources.includes(resourceType)) { continue; }
    const matches = evaluateCondition(policy.condition, subjectAttrs, resourceAttrs);
    if (!matches) { continue; }
    if (policy.effect === 'deny') { return false; }
    if (policy.effect === 'allow') { allowed = true; }
  }
  return allowed;
}

// A convenience wrapper for generating a subject object (roles & attributes) for evaluation
export function makeSubject(orgId: string, userId: string, roles?: string[], attributes?: Record<string, unknown>): Record<string, unknown> {
  return { orgId, userId, roles: roles ?? [], ...attributes };
}

export function makeResource(attributes?: Record<string, unknown>): Record<string, unknown> {
  return attributes ?? {};
}
