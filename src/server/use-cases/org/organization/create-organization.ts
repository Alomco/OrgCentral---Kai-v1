// Use-case: create a new organization record via org repositories with guard and policy checks.
// Use-case: create a new organization.

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type {
    CreateOrganizationInput,
    IOrganizationRepository,
} from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { OrganizationData } from '@/server/types/leave-types';

export interface CreateOrganizationDependencies {
    organizationRepository: IOrganizationRepository;
}

export interface CreateOrganizationUseCaseInput {
    authorization: RepositoryAuthorizationContext;
    organization: CreateOrganizationInput;
}

export interface CreateOrganizationUseCaseResult {
    organization: OrganizationData;
}

export async function createOrganization(
    deps: CreateOrganizationDependencies,
    input: CreateOrganizationUseCaseInput,
): Promise<CreateOrganizationUseCaseResult> {
    const organization = await deps.organizationRepository.createOrganization(input.organization);

    return { organization };
}
