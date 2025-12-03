import { okAsync, type ResultAsync } from 'neverthrow';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfile, EmploymentContract } from '@/server/types/hr-types';

export type PeopleEntityAction = 'created' | 'updated' | 'deleted';

export interface ProfileEventPayload {
  authorization: RepositoryAuthorizationContext;
  profile: EmployeeProfile;
  action: PeopleEntityAction;
  updatedFields?: string[];
}

export interface ContractEventPayload {
  authorization: RepositoryAuthorizationContext;
  contract: EmploymentContract;
  action: PeopleEntityAction;
  updatedFields?: string[];
}

export interface PlatformBrandingPayload {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  sidebarThemeColor?: string | null;
}

export interface BrandingPort {
  getBranding: (orgId: string) => ResultAsync<PlatformBrandingPayload | null, Error>;
  publishBrandingChange: (
    orgId: string,
    branding: PlatformBrandingPayload,
  ) => ResultAsync<void, Error>;
}

export interface WorkflowPort {
  handleProfileEvent: (event: ProfileEventPayload) => ResultAsync<void, Error>;
  handleContractEvent: (event: ContractEventPayload) => ResultAsync<void, Error>;
}

export interface ReportingPort {
  recordProfileEvent: (event: ProfileEventPayload) => ResultAsync<void, Error>;
  recordContractEvent: (event: ContractEventPayload) => ResultAsync<void, Error>;
}

export interface PeoplePlatformAdapters {
  branding: BrandingPort;
  workflow: WorkflowPort;
  reporting: ReportingPort;
}

const noopBranding: BrandingPort = {
  getBranding: () => okAsync(null),
  publishBrandingChange: () => okAsync(undefined),
};

const noopWorkflow: WorkflowPort = {
  handleProfileEvent: () => okAsync(undefined),
  handleContractEvent: () => okAsync(undefined),
};

const noopReporting: ReportingPort = {
  recordProfileEvent: () => okAsync(undefined),
  recordContractEvent: () => okAsync(undefined),
};

export function createPeoplePlatformAdapters(
  overrides?: Partial<PeoplePlatformAdapters>,
): PeoplePlatformAdapters {
  return {
    branding: overrides?.branding ?? noopBranding,
    workflow: overrides?.workflow ?? noopWorkflow,
    reporting: overrides?.reporting ?? noopReporting,
  };
}
