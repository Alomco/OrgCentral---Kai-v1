'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { PrismaThemeRepository } from '@/server/repositories/prisma/org/theme/prisma-theme-repository';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updateOrgUiStyle } from '@/server/use-cases/org/theme/update-org-ui-style';
import { isUiStyleKey, uiStylePresets } from '@/server/theme/ui-style-presets';
import { appLogger } from '@/server/logging/structured-logger';
import type { UpdateOrgThemeState } from './actions.state';

const uiStyleSchema = z
    .object({
        uiStyleId: z.string().trim().min(1),
    })
    .strict();

function getThemeRepository(): PrismaThemeRepository {
    return new PrismaThemeRepository();
}

export async function updateOrgUiStyleAction(
    orgId: string,
    _previousState: UpdateOrgThemeState,
    formData: FormData,
): Promise<UpdateOrgThemeState> {
    void _previousState;
    try {
        const parsed = uiStyleSchema.safeParse({
            uiStyleId: formData.get('uiStyleId') ?? '',
        });

        if (!parsed.success) {
            return { status: 'error', message: 'UI style is required.' };
        }

        const headerStore = await headers();
        const { authorization } = await getSessionContext(
            {},
            {
                headers: headerStore,
                orgId,
                requiredPermissions: { organization: ['manage'] },
                auditSource: 'ui:admin:theme:update-ui-style',
            },
        );

        if (authorization.orgId !== orgId) {
            return { status: 'error', message: 'Cross-tenant ui style update denied.' };
        }

        const uiStyleId = parsed.data.uiStyleId;
        if (!isUiStyleKey(uiStyleId)) {
            return { status: 'error', message: 'Invalid ui style.' };
        }

        const preset = uiStylePresets[uiStyleId];
        await updateOrgUiStyle(
            { themeRepository: getThemeRepository() },
            {
                authorization,
                orgId,
                uiStyleId,
            },
        );

        return { status: 'success', message: `UI style updated to ${preset.name}` };
    } catch (error) {
        appLogger.error('theme.updateUiStyle.failed', {
            orgId,
            error: error instanceof Error ? error.message : String(error),
        });
        return { status: 'error', message: 'Failed to update ui style' };
    }
}
