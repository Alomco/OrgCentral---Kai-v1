/**
 * Contract for ABAC policy repository
 * Policies are tenant-scoped and stored (for now) under `organization.settings.abacPolicies`.
 */
import type { AbacPolicy } from '@/server/security/abac-types';

export interface IAbacPolicyRepository {
  /**
   * Load ABAC policies for a tenant. Implementations should fail closed (empty array) for missing orgs.
   */
  getPoliciesForOrg(orgId: string): Promise<AbacPolicy[]>;
  /**
   * Persist a complete policy set for a tenant. Callers are expected to provide already-validated policies.
   */
  setPoliciesForOrg(orgId: string, policies: AbacPolicy[]): Promise<void>;
}
