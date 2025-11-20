/**
 * Contract for ABAC policy repository
 * Policies are tenant-scoped and stored (for now) under `organization.settings.abacPolicies`.
 */
import type { AbacPolicy } from '@/server/security/abac-types';

export interface IAbacPolicyRepository {
  getPoliciesForOrg(orgId: string): Promise<AbacPolicy[]>;
  setPoliciesForOrg(orgId: string, policies: AbacPolicy[]): Promise<void>;
}
