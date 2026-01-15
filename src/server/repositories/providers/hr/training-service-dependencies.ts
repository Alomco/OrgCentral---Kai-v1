import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaTrainingRecordRepository } from '@/server/repositories/prisma/hr/training';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { ITrainingRecordRepository } from '@/server/repositories/contracts/hr/training/training-record-repository-contract';

export interface TrainingRepositoryDependencies {
  trainingRepository: ITrainingRecordRepository;
}

export type Overrides = Partial<TrainingRepositoryDependencies>;

export interface TrainingServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildTrainingServiceDependencies(
  options?: TrainingServiceDependencyOptions,
): TrainingRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    trainingRepository:
      options?.overrides?.trainingRepository ?? new PrismaTrainingRecordRepository(repoOptions),
  };
}
