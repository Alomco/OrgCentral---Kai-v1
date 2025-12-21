'use server';

import { PrismaHRSettingsRepository } from '@/server/repositories/prisma/hr/settings';
import type { HRSettings } from '@/server/types/hr-ops-types';
import { authAction } from '@/server/actions/auth-action';
import { toActionState, type ActionState } from '@/server/actions/action-state';
import { getHrSettings, type GetHrSettingsResult } from '@/server/use-cases/hr/settings/get-hr-settings';
import { invalidateHrSettingsCacheTag } from '@/server/use-cases/hr/settings/cache-helpers';
import {
    updateHRSettingsInputSchema,
    updateHrSettings,
    type UpdateHRSettingsInput,
    type UpdateHrSettingsResult,
} from '@/server/use-cases/hr/settings/update-hr-settings';

const hrSettingsRepository = new PrismaHRSettingsRepository();

export async function getOrganizationSettingsAction(): Promise<ActionState<HRSettings>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { organization: ['read'] },
                auditSource: 'action:hr:settings:get',
                action: 'read',
                resourceType: 'hr.settings',
                resourceAttributes: { scope: 'global' },
            },
            async ({ authorization }) => {
                const result: GetHrSettingsResult = await getHrSettings(
                    { hrSettingsRepository },
                    { authorization, orgId: authorization.orgId },
                );
                return result.settings;
            },
        ),
    );
}

export async function updateOrganizationSettingsAction(
    data: unknown,
): Promise<ActionState<HRSettings>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { organization: ['update'] },
                auditSource: 'action:hr:settings:update',
                action: 'update',
                resourceType: 'hr.settings',
                resourceAttributes: { scope: 'global' },
            },
            async ({ authorization }) => {
                const shaped: UpdateHRSettingsInput = updateHRSettingsInputSchema.parse({
                    ...(typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}),
                    orgId: authorization.orgId,
                });

                const result: UpdateHrSettingsResult = await updateHrSettings(
                    { hrSettingsRepository },
                    { authorization, payload: shaped },
                );

                await invalidateHrSettingsCacheTag(authorization);
                return result.settings;
            },
        ),
    );
}
