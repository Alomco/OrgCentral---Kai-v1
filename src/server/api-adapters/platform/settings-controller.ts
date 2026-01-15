import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { fetchEnterpriseSettings, saveEnterpriseSettings } from '@/server/services/platform/settings/enterprise-settings-service';
import type { EnterpriseSettings } from '@/server/types/platform-types';

interface GetEnterpriseSettingsResult {
    success: true;
    data: { settings: EnterpriseSettings };
}

interface UpdateEnterpriseSettingsResult {
    success: true;
    data: { settings: EnterpriseSettings };
}

async function authorizeRequest(
    request: Request,
    auditSource: string,
    action: 'read' | 'update',
) {
    // Requires platform-level permissions.
    // We request 'platformSettings' resource permission.
    return getSessionContext({}, {
        headers: request.headers,
        requiredPermissions: { platformSettings: [action] },
        auditSource,
        action,
        resourceType: 'enterpriseSettings',
    }).then(context => context.authorization);
}

async function readJson<T = unknown>(request: Request, fallback: T): Promise<T> {
    try {
        return (await request.json()) as T;
    } catch {
        return fallback;
    }
}

export async function getEnterpriseSettingsController(request: Request): Promise<GetEnterpriseSettingsResult> {
    const authorization = await authorizeRequest(request, 'api:platform:settings:get', 'read');

    const result = await fetchEnterpriseSettings(authorization);

    return { success: true, data: { settings: result.settings } };
}

export async function updateEnterpriseSettingsController(request: Request): Promise<UpdateEnterpriseSettingsResult> {
    const authorization = await authorizeRequest(request, 'api:platform:settings:update', 'update');
    const raw = await readJson(request, {});

    const result = await saveEnterpriseSettings(authorization, raw as Partial<EnterpriseSettings>);

    return { success: true, data: { settings: result.settings } };
}
