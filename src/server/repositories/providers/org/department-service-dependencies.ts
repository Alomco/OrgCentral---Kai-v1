import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaDepartmentRepository } from '@/server/repositories/prisma/org/departments/prisma-department-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IDepartmentRepository } from '@/server/repositories/contracts/org/departments/department-repository-contract';

export interface DepartmentRepositoryDependencies {
  departmentRepository: IDepartmentRepository;
}

export type Overrides = Partial<DepartmentRepositoryDependencies>;

export interface DepartmentServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildDepartmentServiceDependencies(
  options?: DepartmentServiceDependencyOptions,
): DepartmentRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    departmentRepository: options?.overrides?.departmentRepository ?? new PrismaDepartmentRepository(repoOptions),
  };
}
