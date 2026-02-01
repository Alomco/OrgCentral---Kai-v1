'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { PrismaAbsenceSettingsRepository } from '@/server/repositories/prisma/hr/absences';
import { updateAbsenceSettings } from '@/server/use-cases/hr/absences/update-absence-settings';
import { updateAbsenceSettingsSchema } from '@/server/types/hr-absence-schemas';

import { toFieldErrors } from '../_components/form-errors';
import { absenceSettingsFormSchema } from './absence-settings-schema';
import type { AbsenceSettingsFormState } from './absence-settings-form-state';

const FIELD_CHECK_MESSAGE = 'Check the highlighted fields and try again.';

function readFormString(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
}

export async function updateAbsenceSettingsAction(
    previous: AbsenceSettingsFormState,
    formData: FormData,
): Promise<AbsenceSettingsFormState> {
    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();

        session = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: { organization: ['update'] },
                auditSource: 'ui:hr-settings:absence:update',
                action: HR_ACTION.UPDATE,
                resourceType: HR_RESOURCE.HR_ABSENCE,
                resourceAttributes: { scope: 'settings' },
            },
        );
    } catch {
        return {
            status: 'error',
            message: 'Not authorized to update absence settings.',
            values: previous.values,
        };
    }

    const candidate = {
        hoursInWorkDay: formData.get('hoursInWorkDay'),
        roundingRule: readFormString(formData, 'roundingRule'),
    };

    const parsed = absenceSettingsFormSchema.safeParse(candidate);
    if (!parsed.success) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: toFieldErrors(parsed.error),
            values: previous.values,
        };
    }

    const payloadParsed = updateAbsenceSettingsSchema.safeParse({
        hoursInWorkDay: parsed.data.hoursInWorkDay,
        roundingRule: parsed.data.roundingRule.trim() || null,
    });

    if (!payloadParsed.success) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: toFieldErrors(payloadParsed.error),
            values: parsed.data,
        };
    }

    try {
        const absenceSettingsRepository = new PrismaAbsenceSettingsRepository();

        await updateAbsenceSettings(
            { absenceSettingsRepository },
            {
                authorization: session.authorization,
                payload: payloadParsed.data,
            },
        );

        revalidatePath('/hr/settings');
        revalidatePath('/hr/absence');

        return {
            status: 'success',
            message: 'Saved absence settings.',
            values: parsed.data,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to save absence settings.',
            values: previous.values,
        };
    }
}
