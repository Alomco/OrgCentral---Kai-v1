import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { enforcePermission } from '@/server/repositories/security';
import type { IAppPermissionRepository } from '@/server/repositories/contracts/platform/permissions/app-permission-repository-contract';
import type { AppPermission } from '@/server/types/platform-types';

export interface GetAppPermissionsInput {
    authorization: RepositoryAuthorizationContext;
}

export interface GetAppPermissionsDependencies {
    appPermissionRepository: IAppPermissionRepository;
}

export interface GetAppPermissionsResult {
    permissions: AppPermission[];
}

export async function getAppPermissions(
    deps: GetAppPermissionsDependencies,
    input: GetAppPermissionsInput,
): Promise<GetAppPermissionsResult> {

    // Authorization: Only global admins can list app permissions.
    enforcePermission(input.authorization, 'platformPermissions', 'read');

    const permissions = await deps.appPermissionRepository.listPermissions();
    return { permissions };
}
