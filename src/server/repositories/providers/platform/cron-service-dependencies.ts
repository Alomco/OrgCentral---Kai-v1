import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import { PrismaCronTenantRepository } from '@/server/repositories/prisma/platform/cron/prisma-cron-tenant-repository';
import type { ICronTenantRepository } from '@/server/repositories/contracts/platform/cron/cron-tenant-repository-contract';
import type { PrismaClientInstance } from '@/server/types/prisma';

export interface PrismaOptions {
  prisma?: PrismaClientInstance;
  trace?: (spanName: string, function_: () => Promise<unknown>) => Promise<unknown>;
  onAfterWrite?: () => void;
}

export interface Overrides {
  prisma?: PrismaClientInstance;
  tenantRepository?: ICronTenantRepository;
}

export interface CronServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
  prisma?: PrismaClientInstance;
}

export interface CronServiceDependenciesContract {
  tenantRepository: ICronTenantRepository;
}

export function buildCronServiceDependencies(
  options?: CronServiceDependencyOptions,
): CronServiceDependenciesContract {
  const prismaClient = options?.prisma ?? options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const tenantRepository =
    options?.overrides?.tenantRepository ?? new PrismaCronTenantRepository(options?.overrides?.prisma ?? prismaClient);

  return {
    tenantRepository,
  };
}