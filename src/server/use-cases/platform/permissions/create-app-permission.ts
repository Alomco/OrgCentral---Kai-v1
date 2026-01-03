import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { enforcePermission } from '@/server/repositories/security';
import type { IAppPermissionRepository, AppPermissionCreateInput } from '@/server/repositories/contracts/platform/permissions/app-permission-repository-contract';
import type { AppPermission } from '@/server/types/platform-types';

export interface CreateAppPermissionInput {
    authorization: RepositoryAuthorizationContext;
    data: AppPermissionCreateInput;
}

export interface CreateAppPermissionDependencies {
    appPermissionRepository: IAppPermissionRepository;
}

export interface CreateAppPermissionResult {
    permission: AppPermission;
}

export async function createAppPermission(
    deps: CreateAppPermissionDependencies,
    input: CreateAppPermissionInput,
): Promise<CreateAppPermissionResult> {

    // Authorization: Only global admins can create app permissions.
    enforcePermission(input.authorization, 'platformPermissions', 'create');

    const permission = await deps.appPermissionRepository.createPermission(input.data);
    return { permission };
}
