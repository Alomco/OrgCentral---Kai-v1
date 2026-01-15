import { PeopleService } from './people-service';
import type { PeopleServiceDependencies } from './people-service.types';
import { buildPeopleServiceDependencies, type PeopleServiceDependencyOptions } from '@/server/repositories/providers/hr/people-service-dependencies';

export interface PeopleServiceProviderOptions {
  prismaOptions?: PeopleServiceDependencyOptions['prismaOptions'];
}

const sharedPeopleService = (() => {
  const dependencies = buildPeopleServiceDependencies();
  return new PeopleService(dependencies);
})();

export function getPeopleService(
  overrides?: Partial<PeopleServiceDependencies>,
  options?: PeopleServiceDependencyOptions,
): PeopleService {
  if (!overrides || Object.keys(overrides).length === 0) {
    return sharedPeopleService;
  }

  const dependencies = buildPeopleServiceDependencies({
    prismaOptions: options?.prismaOptions,
    overrides,
  });

  return new PeopleService(dependencies);
}

export type PeopleServiceContract = Pick<
  PeopleService,
  | 'getEmployeeProfile'
  | 'getEmployeeProfileByUser'
  | 'listEmployeeProfiles'
  | 'countEmployeeProfiles'
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
