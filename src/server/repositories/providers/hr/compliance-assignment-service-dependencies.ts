import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaComplianceItemRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-item-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';

export interface ComplianceAssignmentRepositoryDependencies {
  complianceItemRepository: IComplianceItemRepository;
}

export type Overrides = Partial<ComplianceAssignmentRepositoryDependencies>;

export interface ComplianceAssignmentServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildComplianceAssignmentServiceDependencies(
  options?: ComplianceAssignmentServiceDependencyOptions,
): ComplianceAssignmentRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    complianceItemRepository:
      options?.overrides?.complianceItemRepository ?? new PrismaComplianceItemRepository(repoOptions),
  };
}
