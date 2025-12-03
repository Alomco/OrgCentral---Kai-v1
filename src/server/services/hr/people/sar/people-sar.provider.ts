import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaEmployeeProfileRepository, PrismaEmploymentContractRepository } from '@/server/repositories/prisma/hr/people';
import type { PeopleSarExportDependencies } from './people-sar-exporter.types';
import { PeopleSarExporter } from './people-sar-exporter';
import type { PeopleRetentionSchedulerDeps, RetentionJobQueue } from './people-retention-scheduler';
import { PeopleRetentionScheduler } from './people-retention-scheduler';
import {
  createBullMqRetentionQueue,
  type BullMqRetentionQueueOptions,
} from './people-retention.queue';
import { getRetentionQueueClient } from './people-retention.queue-registry';

export interface PeopleSarProviderOptions {
  prismaOptions?: Pick<BasePrismaRepositoryOptions, 'trace' | 'onAfterWrite'>;
  queue?: RetentionJobQueue;
  bullQueueOptions?: BullMqRetentionQueueOptions;
}

const defaultPrismaOptions: Pick<BasePrismaRepositoryOptions, 'trace' | 'onAfterWrite'> = {};
export function getPeopleSarExporter(
  overrides?: Partial<PeopleSarExportDependencies>,
  options?: PeopleSarProviderOptions,
): PeopleSarExporter {
  const prismaOptions = options?.prismaOptions ?? defaultPrismaOptions;

  return new PeopleSarExporter({
    profileRepo: overrides?.profileRepo ?? new PrismaEmployeeProfileRepository(prismaOptions),
    contractRepo: overrides?.contractRepo ?? new PrismaEmploymentContractRepository(prismaOptions),
    auditLogger: overrides?.auditLogger,
    now: overrides?.now,
    redactionFields: overrides?.redactionFields,
  });
}

export function getPeopleRetentionScheduler(
  overrides?: Partial<PeopleRetentionSchedulerDeps>,
  options?: PeopleSarProviderOptions,
): PeopleRetentionScheduler {
  const prismaOptions = options?.prismaOptions ?? defaultPrismaOptions;
  const queue =
    options?.queue ??
    overrides?.queue ??
    (options?.bullQueueOptions
      ? createBullMqRetentionQueue(options.bullQueueOptions)
      : getRetentionQueueClient().jobQueue);

  return new PeopleRetentionScheduler({
    profileRepo: overrides?.profileRepo ?? new PrismaEmployeeProfileRepository(prismaOptions),
    contractRepo: overrides?.contractRepo ?? new PrismaEmploymentContractRepository(prismaOptions),
    queue,
    auditLogger: overrides?.auditLogger,
    now: overrides?.now,
  });
}
