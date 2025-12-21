import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { UserData } from '@/server/types/leave-types';

export interface GetUserDependencies {
    userRepository: IUserRepository;
}

export interface GetUserInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
}

export interface GetUserResult {
    user: UserData | null;
}

export async function getUser(deps: GetUserDependencies, input: GetUserInput): Promise<GetUserResult> {
    const user = await deps.userRepository.getUser(input.authorization.orgId, input.userId);
    return { user };
}
