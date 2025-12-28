import { randomUUID } from 'node:crypto';

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export async function buildSystemAuthorizationContext(input: {
  organizationRepository: IOrganizationRepository;
  orgId: string;
  userId?: string | null;
  auditSource: string;
  correlationId?: string;
}): Promise<RepositoryAuthorizationContext> {
  const organization = await input.organizationRepository.getOrganization(input.orgId);
  const dataClassification: DataClassificationLevel =
    organization?.dataClassification ?? 'OFFICIAL';
  const dataResidency: DataResidencyZone = organization?.dataResidency ?? 'UK_ONLY';

  return {
    orgId: input.orgId,
    userId: input.userId ?? 'system',
    roleKey: 'custom',
    permissions: {},
    dataResidency,
    dataClassification,
    auditSource: input.auditSource,
    auditBatchId: undefined,
    correlationId: input.correlationId ?? randomUUID(),
    tenantScope: {
      orgId: input.orgId,
      dataResidency,
      dataClassification,
      auditSource: input.auditSource,
      auditBatchId: undefined,
    },
  };
}
