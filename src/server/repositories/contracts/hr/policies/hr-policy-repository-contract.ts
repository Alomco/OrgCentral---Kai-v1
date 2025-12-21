import type { HRPolicy } from '@/server/types/hr-ops-types';

export interface IHRPolicyRepository {
  createPolicy(
    orgId: string,
    input: Omit<HRPolicy, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orgId'> & { status?: HRPolicy['status'] }
  ): Promise<HRPolicy>;
  updatePolicy(
    orgId: string,
    policyId: string,
    updates: Partial<Pick<HRPolicy, 'title' | 'content' | 'category' | 'version' | 'effectiveDate' | 'expiryDate' | 'applicableRoles' | 'applicableDepartments' | 'requiresAcknowledgment' | 'status' | 'dataClassification' | 'residencyTag' | 'metadata'>>
  ): Promise<HRPolicy>;
  getPolicy(orgId: string, policyId: string): Promise<HRPolicy | null>;
  listPolicies(orgId: string, filters?: { status?: string; category?: HRPolicy['category'] }): Promise<HRPolicy[]>;
}
