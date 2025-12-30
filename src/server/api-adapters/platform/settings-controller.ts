import { PrismaEnterpriseSettingsRepository } from '@/server/repositories/prisma/platform/settings/prisma-enterprise-settings-repository';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getEnterpriseSettings } from '@/server/use-cases/platform/settings/get-enterprise-settings';
import { updateEnterpriseSettings } from '@/server/use-cases/platform/settings/update-enterprise-settings';
import type { EnterpriseSettings } from '@/server/types/platform-types';

interface GetEnterpriseSettingsResult {
    success: true;
    data: { settings: EnterpriseSettings };
}

interface UpdateEnterpriseSettingsResult {
    success: true;
    data: { settings: EnterpriseSettings };
}

const enterpriseSettingsRepository = new PrismaEnterpriseSettingsRepository();

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

    const result = await getEnterpriseSettings(
        { enterpriseSettingsRepository },
        { authorization },
    );

    return { success: true, data: { settings: result.settings } };
}

export async function updateEnterpriseSettingsController(request: Request): Promise<UpdateEnterpriseSettingsResult> {
    const authorization = await authorizeRequest(request, 'api:platform:settings:update', 'update');
    const raw = await readJson(request, {});

    const result = await updateEnterpriseSettings(
        { enterpriseSettingsRepository },
        { authorization, updates: raw },
    );

    return { success: true, data: { settings: result.settings } };
}
