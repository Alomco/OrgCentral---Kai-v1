// Use-case: retrieve organization details using org repositories under tenant authorization.

import { EntityNotFoundError, AuthorizationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { OrganizationData } from '@/server/types/leave-types';

export interface GetOrganizationDependencies {
    organizationRepository: IOrganizationRepository;
}

export interface GetOrganizationInput {
    authorization: RepositoryAuthorizationContext;
    orgId: string;
}

export interface GetOrganizationResult {
    organization: OrganizationData;
}

export async function getOrganization(
    deps: GetOrganizationDependencies,
    input: GetOrganizationInput,
): Promise<GetOrganizationResult> {
    if (input.orgId !== input.authorization.orgId) {
        throw new AuthorizationError('Cross-tenant organization access denied.');
    }

    const organization = await deps.organizationRepository.getOrganization(input.orgId);
    if (!organization) {
        throw new EntityNotFoundError('Organization', { orgId: input.orgId });
    }

    return { organization };
}
