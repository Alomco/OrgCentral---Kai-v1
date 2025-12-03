import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { EmployeeProfile, EmploymentContract } from '@/server/types/hr-types';
import type {
  ContractListFilters,
  ContractMutationPayload,
  ContractTypeCode,
  PeopleListFilters,
  ProfileMutationPayload,
} from '@/server/types/hr/people';
import type {
  ContractCreatedEventHandler,
  ContractUpdatedEventHandler,
  ProfileCreatedEventHandler,
  ProfileUpdatedEventHandler,
} from '@/server/use-cases/hr/people/shared/notification-helpers';
import type {
  RegisterContractsCacheHandler,
  RegisterProfilesCacheHandler,
} from '@/server/use-cases/hr/people/shared/cache-helpers';
import type { PeoplePlatformAdapters } from './people-service.adapters';

export type PeopleServicePayload = Record<string, unknown>;

export interface GetEmployeeProfilePayload extends PeopleServicePayload {
  profileId: string;
}

export interface GetEmployeeProfileByUserPayload extends PeopleServicePayload {
  userId: string;
}

export interface ListEmployeeProfilesPayload extends PeopleServicePayload {
  filters?: PeopleListFilters;
}

export interface CreateEmployeeProfilePayload extends PeopleServicePayload {
  profileData: ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string };
}

export interface UpdateEmployeeProfilePayload extends PeopleServicePayload {
  profileId: string;
  profileUpdates: ProfileMutationPayload['changes'];
}

export interface DeleteEmployeeProfilePayload extends PeopleServicePayload {
  profileId: string;
}

export interface GetEmploymentContractPayload extends PeopleServicePayload {
  contractId: string;
}

export interface GetEmploymentContractByEmployeePayload extends PeopleServicePayload {
  employeeId: string;
}

export interface ListEmploymentContractsPayload extends PeopleServicePayload {
  filters?: ContractListFilters;
}

export interface CreateEmploymentContractPayload extends PeopleServicePayload {
  contractData: ContractMutationPayload['changes'] & {
    userId: string;
    contractType: ContractTypeCode;
    jobTitle: string;
    startDate: Date | string;
  };
}

export interface UpdateEmploymentContractPayload extends PeopleServicePayload {
  contractId: string;
  contractUpdates: ContractMutationPayload['changes'];
}

export interface DeleteEmploymentContractPayload extends PeopleServicePayload {
  contractId: string;
}

export interface PeopleServiceInput<TPayload extends PeopleServicePayload> {
  authorization: RepositoryAuthorizationContext;
  payload: TPayload;
  correlationId?: string;
}

export interface GetEmployeeProfileResult {
  profile: EmployeeProfile | null;
}

export interface GetEmployeeProfileByUserResult {
  profile: EmployeeProfile | null;
}

export interface ListEmployeeProfilesResult {
  profiles: EmployeeProfile[];
}

export interface CreateEmployeeProfileResult {
  profileId: string;
}

export interface UpdateEmployeeProfileResult {
  profileId: string;
}

export interface DeleteEmployeeProfileResult {
  success: true;
}

export interface GetEmploymentContractResult {
  contract: EmploymentContract | null;
}

export interface GetEmploymentContractByEmployeeResult {
  contract: EmploymentContract | null;
}

export interface ListEmploymentContractsResult {
  contracts: EmploymentContract[];
}

export interface CreateEmploymentContractResult {
  contractId: string;
}

export interface UpdateEmploymentContractResult {
  contractId: string;
}

export interface DeleteEmploymentContractResult {
  success: true;
}

export interface PeopleServiceNotifications {
  profileCreated: ProfileCreatedEventHandler;
  profileUpdated: ProfileUpdatedEventHandler;
  contractCreated: ContractCreatedEventHandler;
  contractUpdated: ContractUpdatedEventHandler;
}

export interface PeopleServiceCacheHandlers {
  registerProfiles: RegisterProfilesCacheHandler;
  registerContracts: RegisterContractsCacheHandler;
}

export interface PeopleServiceDependencies {
  profileRepo: IEmployeeProfileRepository;
  contractRepo: IEmploymentContractRepository;
  notifications?: Partial<PeopleServiceNotifications>;
  cache?: Partial<PeopleServiceCacheHandlers>;
  adapters?: Partial<PeoplePlatformAdapters>;
}
