import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import {
  HR_PEOPLE_CACHE_SCOPES,
  invalidatePeopleContracts,
  invalidatePeopleProfiles,
  registerPeopleContractsTag,
  registerPeopleProfilesTag,
} from '@/server/lib/cache-tags/hr-people';

function toCacheContext(
  authorization: RepositoryAuthorizationContext,
  overrides?: { classification?: DataClassificationLevel; residency?: DataResidencyZone },
) {
  return {
    orgId: authorization.orgId,
    classification: overrides?.classification ?? authorization.dataClassification,
    residency: overrides?.residency ?? authorization.dataResidency,
  };
}

export type RegisterProfilesCacheHandler = (authorization: RepositoryAuthorizationContext) => void;
export type RegisterContractsCacheHandler = (authorization: RepositoryAuthorizationContext) => void;

export function registerProfilesCache(
  authorization: RepositoryAuthorizationContext,
  overrides?: { classification?: DataClassificationLevel; residency?: DataResidencyZone },
): void {
  registerPeopleProfilesTag(toCacheContext(authorization, overrides));
}

export function registerContractsCache(
  authorization: RepositoryAuthorizationContext,
  overrides?: { classification?: DataClassificationLevel; residency?: DataResidencyZone },
): void {
  registerPeopleContractsTag(toCacheContext(authorization, overrides));
}

export async function invalidateProfilesAfterMutation(
  authorization: RepositoryAuthorizationContext,
  overrides?: { classification?: DataClassificationLevel; residency?: DataResidencyZone },
): Promise<void> {
  await invalidatePeopleProfiles(toCacheContext(authorization, overrides));
}

export async function invalidateContractsAfterMutation(
  authorization: RepositoryAuthorizationContext,
  overrides?: { classification?: DataClassificationLevel; residency?: DataResidencyZone },
): Promise<void> {
  await invalidatePeopleContracts(toCacheContext(authorization, overrides));
}

export const PEOPLE_CACHE_METADATA = {
  profiles: { cacheScope: HR_PEOPLE_CACHE_SCOPES.profiles },
  contracts: { cacheScope: HR_PEOPLE_CACHE_SCOPES.contracts },
} as const;
