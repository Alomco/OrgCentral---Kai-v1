import type { PolicyAcknowledgment } from '@/server/types/hr-ops-types';

export interface IPolicyAcknowledgmentRepository {
  acknowledgePolicy(orgId: string, input: Omit<PolicyAcknowledgment, 'id'>): Promise<PolicyAcknowledgment>;
  getAcknowledgment(orgId: string, policyId: string, userId: string, version: string): Promise<PolicyAcknowledgment | null>;
  listAcknowledgments(orgId: string, policyId: string, version?: string): Promise<PolicyAcknowledgment[]>;
}
