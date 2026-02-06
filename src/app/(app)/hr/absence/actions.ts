'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { invalidateAbsenceScopeCache } from '@/server/use-cases/hr/absences/cache-helpers';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { appLogger } from '@/server/logging/structured-logger';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getAbsenceService } from '@/server/services/hr/absences/absence-service.provider';

import type { CancelAbsenceFormState, ReportAbsenceFormState } from './form-state';
import { cancelAbsenceSchema } from './schema';
import { reportAbsenceAction as reportAbsenceActionImpl } from './report-absence-action';

type AuthorizationAuditContext = Pick<
    RepositoryAuthorizationContext,
    'orgId' | 'dataResidency' | 'dataClassification'
>;

const ABSENCES_PATH = '/hr/absence';

function formDataString(value: FormDataEntryValue | null): string {
    return typeof value === 'string' ? value : '';
}

export async function refreshAbsenceOverviewAction(): Promise<void> {
    const headerStore = await headers();
    const correlationId = headerStore.get('x-correlation-id') ?? undefined;
    let auditContext: AuthorizationAuditContext | null = null;

    try {
        const { authorization } = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredAnyPermissions: [
                    HR_PERMISSION_PROFILE.ABSENCE_READ,
                    HR_PERMISSION_PROFILE.PROFILE_READ,
                ],
                auditSource: 'ui:hr:absence:refresh',
                correlationId,
                action: HR_ACTION.READ,
                resourceType: HR_RESOURCE_TYPE.ABSENCE,
                resourceAttributes: {
                    scope: 'overview',
                    correlationId,
                },
            },
        );

        auditContext = {
            orgId: authorization.orgId,
            dataResidency: authorization.dataResidency,
            dataClassification: authorization.dataClassification,
        };

        await invalidateAbsenceScopeCache(authorization);
    } catch (error) {
        appLogger.error('hr.absence.refresh.failed', {
            error: error instanceof Error ? error.message : String(error),
            correlationId,
            orgId: auditContext?.orgId,
            dataResidency: auditContext?.dataResidency,
            dataClassification: auditContext?.dataClassification,
        });
    }
}

export async function reportAbsenceAction(
    authorization: RepositoryAuthorizationContext,
    previousState: ReportAbsenceFormState,
    formData: FormData,
): Promise<ReportAbsenceFormState> {
    return reportAbsenceActionImpl(authorization, previousState, formData);
}


export async function cancelAbsenceAction(
    authorization: RepositoryAuthorizationContext,
    absenceId: string,
    _previousState: CancelAbsenceFormState,
    formData: FormData,
): Promise<CancelAbsenceFormState> {
    const raw = { reason: formData.get('reason') };
    const parsed = cancelAbsenceSchema.safeParse(raw);

    if (!parsed.success) {
        const fieldErrors: Partial<Record<'reason', string>> = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as 'reason';
            fieldErrors[field] ??= issue.message;
        }
        return {
            status: 'error',
            message: 'Please provide a valid reason.',
            fieldErrors,
            values: { reason: formDataString(raw.reason) },
        };
    }

    try {
        const service = getAbsenceService();
        await service.cancelAbsence({
            authorization,
            absenceId,
            payload: { reason: parsed.data.reason },
        });

        revalidatePath(ABSENCES_PATH);

        return {
            status: 'success',
            message: 'Absence cancelled successfully.',
            values: { reason: '' },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to cancel absence.';
        return {
            status: 'error',
            message,
            values: parsed.data,
        };
    }
}

export async function approveAbsenceAction(
    authorization: RepositoryAuthorizationContext,
    absenceId: string,
    comments?: string,
): Promise<void> {
    const service = getAbsenceService();
    await service.approveAbsence({
        authorization,
        absenceId,
        payload: {
            status: 'APPROVED',
            reason: comments?.trim() ? comments.trim() : undefined,
        },
    });

    revalidatePath(ABSENCES_PATH);
}

export async function rejectAbsenceAction(
    authorization: RepositoryAuthorizationContext,
    absenceId: string,
    reason: string,
): Promise<void> {
    const service = getAbsenceService();
    await service.approveAbsence({
        authorization,
        absenceId,
        payload: {
            status: 'REJECTED',
            reason: reason.trim(),
        },
    });

    revalidatePath(ABSENCES_PATH);
}
