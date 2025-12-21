import { AuthorizationError } from '@/server/errors';
import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { UserData } from '@/server/types/leave-types';

export interface GetUsersInOrganizationDependencies {
    userRepository: IUserRepository;
}

export interface GetUsersInOrganizationInput {
    authorization: RepositoryAuthorizationContext;
    orgId: string;
}

export interface GetUsersInOrganizationResult {
    users: UserData[];
}

export async function getUsersInOrganization(
    deps: GetUsersInOrganizationDependencies,
    input: GetUsersInOrganizationInput,
): Promise<GetUsersInOrganizationResult> {
    if (input.orgId !== input.authorization.orgId) {
        throw new AuthorizationError('Cross-tenant user listing denied.');
    }

    const users = await deps.userRepository.getUsersInOrganization(input.authorization, input.orgId);
    return { users };
}
