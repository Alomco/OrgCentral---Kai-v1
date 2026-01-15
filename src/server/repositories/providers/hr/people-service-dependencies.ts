import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaEmployeeProfileRepository, PrismaEmploymentContractRepository } from '@/server/repositories/prisma/hr/people';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';

export interface PeopleRepositoryDependencies {
  profileRepo: IEmployeeProfileRepository;
  contractRepo: IEmploymentContractRepository;
}

export type Overrides = Partial<PeopleRepositoryDependencies>;

export interface PeopleServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildPeopleServiceDependencies(
  options?: PeopleServiceDependencyOptions,
): PeopleRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    profileRepo: options?.overrides?.profileRepo ?? new PrismaEmployeeProfileRepository(repoOptions),
    contractRepo: options?.overrides?.contractRepo ?? new PrismaEmploymentContractRepository(repoOptions),
  };
}
