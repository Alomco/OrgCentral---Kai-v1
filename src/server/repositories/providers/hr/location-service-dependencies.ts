import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { ILocationRepository } from '@/server/repositories/contracts/hr/locations/location-repository-contract';
import { PrismaLocationRepository } from '@/server/repositories/prisma/hr/locations/prisma-location-repository';

export interface LocationRepositoryDependencies {
  locationRepository: ILocationRepository;
}

export type Overrides = Partial<LocationRepositoryDependencies>;

export interface LocationServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildLocationServiceDependencies(
  options?: LocationServiceDependencyOptions,
): LocationRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    locationRepository:
      options?.overrides?.locationRepository ?? new PrismaLocationRepository(repoOptions),
  };
}
