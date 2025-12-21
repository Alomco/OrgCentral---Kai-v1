// Use-case: update organization profile data via repositories under tenant guard enforcement.
// Use-case: update an organization's profile fields.

import { AuthorizationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type {
    IOrganizationRepository,
    OrganizationProfileUpdate,
} from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { OrganizationData } from '@/server/types/leave-types';

export interface UpdateOrganizationProfileDependencies {
    organizationRepository: IOrganizationRepository;
}

export interface UpdateOrganizationProfileInput {
    authorization: RepositoryAuthorizationContext;
    orgId: string;
    updates: OrganizationProfileUpdate;
}

export interface UpdateOrganizationProfileResult {
    organization: OrganizationData;
}

export async function updateOrganizationProfile(
    deps: UpdateOrganizationProfileDependencies,
    input: UpdateOrganizationProfileInput,
): Promise<UpdateOrganizationProfileResult> {
    if (input.orgId !== input.authorization.orgId) {
        throw new AuthorizationError('Cross-tenant organization update denied.');
    }

    const organization = await deps.organizationRepository.updateOrganizationProfile(input.orgId, input.updates);
    return { organization };
}
