import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { BasePrismaRepositoryOptions, PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { IAbsenceTypeConfigRepository } from '@/server/repositories/contracts/hr/absences/absence-type-config-repository-contract';
import type { ISeederCleanupRepository } from '@/server/repositories/contracts/seeder/seeder-cleanup-repository-contract';
import type { ISeederStatsRepository } from '@/server/repositories/contracts/seeder/seeder-stats-repository-contract';
import { PrismaAbsenceTypeConfigRepository } from '@/server/repositories/prisma/hr/absences/prisma-absence-type-config-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaSeederCleanupRepository } from '@/server/repositories/prisma/seeder/prisma-seeder-cleanup-repository';
import { PrismaSeederStatsRepository } from '@/server/repositories/prisma/seeder/prisma-seeder-stats-repository';

export interface Overrides {
  absenceTypeConfigRepository?: IAbsenceTypeConfigRepository;
  seederCleanupRepository?: ISeederCleanupRepository;
  seederStatsRepository?: ISeederStatsRepository;
}

export interface SeederServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export interface SeederServiceDependenciesContract {
  absenceTypeConfigRepository: IAbsenceTypeConfigRepository;
  seederCleanupRepository: ISeederCleanupRepository;
  seederStatsRepository: ISeederStatsRepository;
}

export function buildSeederServiceDependencies(
  options?: SeederServiceDependencyOptions,
): SeederServiceDependenciesContract {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };
  const baseOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  } satisfies BasePrismaRepositoryOptions;

  return {
    absenceTypeConfigRepository:
      options?.overrides?.absenceTypeConfigRepository ?? new PrismaAbsenceTypeConfigRepository(repoOptions),
    seederCleanupRepository:
      options?.overrides?.seederCleanupRepository ?? new PrismaSeederCleanupRepository(baseOptions),
    seederStatsRepository:
      options?.overrides?.seederStatsRepository ?? new PrismaSeederStatsRepository(baseOptions),
  };
}
