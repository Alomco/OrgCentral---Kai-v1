import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaTimeEntryRepository } from '@/server/repositories/prisma/hr/time-tracking';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';

export interface TimeTrackingRepositoryDependencies {
  timeEntryRepository: ITimeEntryRepository;
}

export type Overrides = Partial<TimeTrackingRepositoryDependencies>;

export interface TimeTrackingServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildTimeTrackingServiceDependencies(
  options?: TimeTrackingServiceDependencyOptions,
): TimeTrackingRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    timeEntryRepository:
      options?.overrides?.timeEntryRepository ?? new PrismaTimeEntryRepository(repoOptions),
  };
}
