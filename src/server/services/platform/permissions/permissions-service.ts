import type { AppPermissionCreateInput } from '@/server/repositories/contracts/platform/permissions/app-permission-repository-contract';
import { buildAppPermissionServiceDependencies, type AppPermissionServiceDependencies } from '@/server/repositories/providers/platform/permissions/app-permission-service-dependencies';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { createAppPermission } from '@/server/use-cases/platform/permissions/create-app-permission';
import { getAppPermissions } from '@/server/use-cases/platform/permissions/get-app-permissions';

const defaultDependencies = buildAppPermissionServiceDependencies();

function resolveDependencies(overrides?: Partial<AppPermissionServiceDependencies>): AppPermissionServiceDependencies {
    if (!overrides) {
        return defaultDependencies;
    }
    return { ...defaultDependencies, ...overrides };
}

export async function listPlatformPermissions(
    authorization: RepositoryAuthorizationContext,
    overrides?: Partial<AppPermissionServiceDependencies>,
) {
    const dependencies = resolveDependencies(overrides);
    return getAppPermissions(dependencies, { authorization });
}

export async function createPlatformPermission(
    authorization: RepositoryAuthorizationContext,
    data: AppPermissionCreateInput,
    overrides?: Partial<AppPermissionServiceDependencies>,
) {
    const dependencies = resolveDependencies(overrides);
    return createAppPermission(dependencies, { authorization, data });
}

export type { AppPermissionCreateInput };