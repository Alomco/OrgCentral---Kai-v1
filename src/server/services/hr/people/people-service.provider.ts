import { PrismaEmployeeProfileRepository, PrismaEmploymentContractRepository } from '@/server/repositories/prisma/hr/people';
import { PeopleService } from './people-service';
import type { PeopleServiceDependencies } from './people-service.types';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';

export interface PeopleServiceProviderOptions {
  prismaOptions?: Pick<BasePrismaRepositoryOptions, 'trace' | 'onAfterWrite'>;
}

const defaultPrismaOptions: Pick<BasePrismaRepositoryOptions, 'trace' | 'onAfterWrite'> = {};
const profileRepo = new PrismaEmployeeProfileRepository(defaultPrismaOptions);
const contractRepo = new PrismaEmploymentContractRepository(defaultPrismaOptions);

const defaultPeopleDependencies: PeopleServiceDependencies = {
  profileRepo,
  contractRepo,
};

const sharedPeopleService = new PeopleService(defaultPeopleDependencies);

export function getPeopleService(
  overrides?: Partial<PeopleServiceDependencies>,
  options?: PeopleServiceProviderOptions,
): PeopleService {
  if (!overrides || Object.keys(overrides).length === 0) {
    return sharedPeopleService;
  }

  const prismaOptions = options?.prismaOptions ?? defaultPrismaOptions;

  return new PeopleService({
    profileRepo: overrides.profileRepo ?? new PrismaEmployeeProfileRepository(prismaOptions),
    contractRepo: overrides.contractRepo ?? new PrismaEmploymentContractRepository(prismaOptions),
    ...overrides,
  });
}

export type PeopleServiceContract = Pick<
  PeopleService,
  | 'getEmployeeProfile'
  | 'getEmployeeProfileByUser'
  | 'listEmployeeProfiles'
  | 'createEmployeeProfile'
  | 'updateEmployeeProfile'
  | 'deleteEmployeeProfile'
  | 'getEmploymentContract'
  | 'getEmploymentContractByEmployee'
  | 'listEmploymentContracts'
  | 'createEmploymentContract'
  | 'updateEmploymentContract'
  | 'deleteEmploymentContract'
>;
