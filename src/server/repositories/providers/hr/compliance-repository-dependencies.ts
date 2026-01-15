import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import {
  PrismaComplianceItemRepository,
  PrismaComplianceTemplateRepository,
} from '@/server/repositories/prisma/hr/compliance';
import { PrismaComplianceCategoryRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-category-repository';
import type { IComplianceCategoryRepository } from '@/server/repositories/contracts/hr/compliance/compliance-category-repository-contract';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import type { IComplianceTemplateRepository } from '@/server/repositories/contracts/hr/compliance/compliance-template-repository-contract';

export interface ComplianceRepositoryDependencies {
  complianceItemRepository: IComplianceItemRepository;
  complianceCategoryRepository: IComplianceCategoryRepository;
  complianceTemplateRepository: IComplianceTemplateRepository;
}

export type Overrides = Partial<ComplianceRepositoryDependencies>;

export interface ComplianceRepositoryDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildComplianceRepositoryDependencies(
  options?: ComplianceRepositoryDependencyOptions,
): ComplianceRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    complianceItemRepository:
      options?.overrides?.complianceItemRepository ?? new PrismaComplianceItemRepository(repoOptions),
    complianceCategoryRepository:
      options?.overrides?.complianceCategoryRepository ?? new PrismaComplianceCategoryRepository(repoOptions),
    complianceTemplateRepository:
      options?.overrides?.complianceTemplateRepository ?? new PrismaComplianceTemplateRepository(repoOptions),
  };
}
