import type { PeopleSarExportDependencies } from './people-sar-exporter.types';
import { PeopleSarExporter } from './people-sar-exporter';
import type { PeopleRetentionSchedulerDeps, RetentionJobQueue } from './people-retention-scheduler';
import { PeopleRetentionScheduler } from './people-retention-scheduler';
import {
  createBullMqRetentionQueue,
  type BullMqRetentionQueueOptions,
} from './people-retention.queue';
import { getRetentionQueueClient } from './people-retention.queue-registry';
import { buildPeopleServiceDependencies, type PeopleServiceDependencyOptions } from '@/server/repositories/providers/hr/people-service-dependencies';

export interface PeopleSarProviderOptions {
  prismaOptions?: PeopleServiceDependencyOptions['prismaOptions'];
  queue?: RetentionJobQueue;
  bullQueueOptions?: BullMqRetentionQueueOptions;
}

export function getPeopleSarExporter(
  overrides?: Partial<PeopleSarExportDependencies>,
  options?: PeopleSarProviderOptions,
): PeopleSarExporter {
  const { profileRepo, contractRepo } = buildPeopleServiceDependencies({
    prismaOptions: options?.prismaOptions,
    overrides: {
      profileRepo: overrides?.profileRepo,
      contractRepo: overrides?.contractRepo,
    },
  });

  return new PeopleSarExporter({
    profileRepo,
    contractRepo,
    auditLogger: overrides?.auditLogger,
    now: overrides?.now,
    redactionFields: overrides?.redactionFields,
  });
}

export function getPeopleRetentionScheduler(
  overrides?: Partial<PeopleRetentionSchedulerDeps>,
  options?: PeopleSarProviderOptions,
): PeopleRetentionScheduler {
  const { profileRepo, contractRepo } = buildPeopleServiceDependencies({
    prismaOptions: options?.prismaOptions,
    overrides: {
      profileRepo: overrides?.profileRepo,
      contractRepo: overrides?.contractRepo,
    },
  });
  const queue =
    options?.queue ??
    overrides?.queue ??
    (options?.bullQueueOptions
      ? createBullMqRetentionQueue(options.bullQueueOptions)
      : getRetentionQueueClient().jobQueue);

  return new PeopleRetentionScheduler({
    profileRepo,
    contractRepo,
    queue,
    auditLogger: overrides?.auditLogger,
    now: overrides?.now,
  });
}
