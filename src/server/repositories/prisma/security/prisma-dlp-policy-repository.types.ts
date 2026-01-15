import type { DlpPolicy, DlpRule } from '@/server/types/enhanced-security-types';
import type { PrismaBatchPayload } from '@/server/types/prisma';

export interface DlpRuleRecord extends DlpRule {
  policyId: string;
}

export interface DlpPolicyRecord extends Omit<DlpPolicy, 'rules'> {
  rules: DlpRuleRecord[];
}

export interface DlpPolicyCreateInput {
  orgId: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DlpPolicyUpdateInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  updatedAt?: Date;
}

export interface DlpRuleCreateInput {
  policyId: string;
  pattern: string;
  dataType: DlpRule['dataType'];
  action: DlpRule['action'];
  severity: DlpRule['severity'];
  exceptions: string[];
}

export interface DlpPolicyDelegate {
  create: (args: { data: DlpPolicyCreateInput }) => Promise<DlpPolicyRecord>;
  findUnique: (args: { where: { id: string }; include?: { rules: true } }) => Promise<DlpPolicyRecord | null>;
  findMany: (args: {
    where: { orgId: string; enabled?: boolean };
    include?: { rules: true };
    orderBy?: { createdAt: 'desc' };
  }) => Promise<DlpPolicyRecord[]>;
  update: (args: { where: { id: string }; data: DlpPolicyUpdateInput }) => Promise<DlpPolicyRecord>;
  delete: (args: { where: { id: string } }) => Promise<DlpPolicyRecord>;
}

export interface DlpRuleDelegate {
  createMany: (args: { data: DlpRuleCreateInput[] }) => Promise<PrismaBatchPayload>;
  deleteMany: (args: { where: { policyId: string } }) => Promise<PrismaBatchPayload>;
}
