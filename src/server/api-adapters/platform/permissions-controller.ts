import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listPlatformPermissions, createPlatformPermission, type AppPermissionCreateInput } from '@/server/services/platform/permissions/permissions-service';
import type { AppPermission } from '@/server/types/platform-types';

interface GetAppPermissionsResult {
    success: true;
    data: { permissions: AppPermission[] };
}

interface CreateAppPermissionResult {
    success: true;
    data: { permission: AppPermission };
}

async function authorizeRequest(
    request: Request,
    auditSource: string,
    action: 'read' | 'create',
) {
    return getSessionContext({}, {
        headers: request.headers,
        requiredPermissions: { platformPermissions: [action] },
        auditSource,
        action,
        resourceType: 'appPermission',
    }).then(context => context.authorization);
}

async function readJson<T = unknown>(request: Request, fallback: T): Promise<T> {
    try {
        return (await request.json()) as T;
    } catch {
        return fallback;
    }
}

export async function getAppPermissionsController(request: Request): Promise<GetAppPermissionsResult> {
    const authorization = await authorizeRequest(request, 'api:platform:permissions:list', 'read');

    const result = await listPlatformPermissions(authorization);

    return { success: true, data: { permissions: result.permissions } };
}

export async function createAppPermissionController(request: Request): Promise<CreateAppPermissionResult> {
    const authorization = await authorizeRequest(request, 'api:platform:permissions:create', 'create');
    const raw = await readJson<AppPermissionCreateInput>(request, {} as AppPermissionCreateInput);

    const result = await createPlatformPermission(authorization, raw);

    return { success: true, data: { permission: result.permission } };
}
