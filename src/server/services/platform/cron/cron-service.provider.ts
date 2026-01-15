import { CronService, type CronServiceDependencies } from './cron-service';
import { buildCronServiceDependencies, type CronServiceDependencyOptions } from '@/server/repositories/providers/platform/cron-service-dependencies';

let sharedCronService: CronService | null = null;

export function getCronService(
  overrides?: Partial<CronServiceDependencies>,
  options?: CronServiceDependencyOptions,
): CronService {
  if (!overrides || Object.keys(overrides).length === 0) {
    sharedCronService ??= new CronService(buildCronServiceDependencies(options));
    return sharedCronService;
  }

  const dependencies = buildCronServiceDependencies({
    prisma: options?.prisma,
    overrides,
  });

  return new CronService(dependencies);
}

export type CronServiceContract = Pick<
  CronService,
  'resolveOrgActors'
>;
