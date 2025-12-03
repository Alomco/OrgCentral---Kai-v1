import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type {
  PeopleSarExportDependencies,
  PeopleSarExportOptions,
  PeopleSarExportResponse,
} from './people-sar-exporter.types';
import { getPeopleSarExporter, getPeopleRetentionScheduler, type PeopleSarProviderOptions } from './people-sar.provider';
import type { PeopleRetentionSchedulerDeps, RetentionScheduleResult } from './people-retention-scheduler';

export async function runPeopleSarExportJob(
  authorization: RepositoryAuthorizationContext,
  options?: PeopleSarExportOptions,
  overrides?: Partial<PeopleSarExportDependencies>,
  providerOptions?: PeopleSarProviderOptions,
): Promise<PeopleSarExportResponse> {
  const exporter = getPeopleSarExporter(overrides, providerOptions);
  return exporter.exportPeople(authorization, options);
}

export async function runPeopleRetentionSweepJob(
  authorization: RepositoryAuthorizationContext,
  correlationId?: string,
  overrides?: Partial<PeopleRetentionSchedulerDeps>,
  providerOptions?: PeopleSarProviderOptions,
): Promise<RetentionScheduleResult> {
  const scheduler = getPeopleRetentionScheduler(overrides, providerOptions);
  return scheduler.sweepExpired(authorization, correlationId);
}
