'use server';

import { revalidatePath } from 'next/cache';

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getAbsenceService } from '@/server/services/hr/absences/absence-service.provider';

import type { CancelAbsenceFormState, ReportAbsenceFormState } from '../absence/form-state';
import { cancelAbsenceSchema, reportAbsenceSchema } from '../absence/schema';

const ABSENCES_PATH = '/hr/absence';

function formDataString(value: FormDataEntryValue | null): string {
    return typeof value === 'string' ? value : '';
}

function parseTimeToMinutes(value: string): number | null {
    const [hourPart, minutePart] = value.split(':');
    const hours = Number(hourPart);
    const minutes = Number(minutePart);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        return null;
    }
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }
    return hours * 60 + minutes;
}

function roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
}

export async function reportAbsenceAction(
    authorization: RepositoryAuthorizationContext,
    _previousState: ReportAbsenceFormState,
    formData: FormData,
): Promise<ReportAbsenceFormState> {
    const raw = {
        typeId: formData.get('typeId'),
        durationType: formData.get('durationType'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        hours: formData.get('hours'),
        reason: formData.get('reason'),
    };

    const parsed = reportAbsenceSchema.safeParse(raw);

    if (!parsed.success) {
        const durationValue = formDataString(raw.durationType);
        const durationTypeValue: 'DAYS' | 'HOURS' = durationValue === 'HOURS' ? 'HOURS' : 'DAYS';
        const fieldErrors: Partial<Record<keyof typeof raw, string>> = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as keyof typeof raw;
            fieldErrors[field] ??= issue.message;
        }
        return {
            status: 'error',
            message: 'Please fix the errors below.',
            fieldErrors,
            values: {
                typeId: formDataString(raw.typeId),
                durationType: durationTypeValue,
                startDate: formDataString(raw.startDate),
                endDate: formDataString(raw.endDate),
                startTime: formDataString(raw.startTime),
                endTime: formDataString(raw.endTime),
                hours: Number(raw.hours ?? 0),
                reason: formDataString(raw.reason),
            },
        };
    }

    let computedHours = parsed.data.hours;
    let endDateValue = parsed.data.endDate ?? parsed.data.startDate;
    const durationType = parsed.data.durationType;

    if (durationType === 'HOURS') {
        const startTime = parsed.data.startTime ?? '';
        const endTime = parsed.data.endTime ?? '';
        const startMinutes = parseTimeToMinutes(startTime);
        const endMinutes = parseTimeToMinutes(endTime);
        if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
            return {
                status: 'error',
                message: 'Please fix the errors below.',
                fieldErrors: {
                    endTime: 'End time must be after start time.',
                },
                values: {
                    ...parsed.data,
                    startDate: parsed.data.startDate,
                    endDate: parsed.data.endDate ?? '',
                },
            };
        }
        computedHours = roundToTwoDecimals((endMinutes - startMinutes) / 60);
        endDateValue = parsed.data.startDate;
    }

    try {
        const service = getAbsenceService();
        await service.reportAbsence({
            authorization,
            payload: {
                userId: authorization.userId,
                typeId: parsed.data.typeId,
                startDate: new Date(parsed.data.startDate),
                endDate: new Date(endDateValue),
                hours: computedHours,
                reason: parsed.data.reason,
                metadata: {
                    durationType,
                    startTime: parsed.data.startTime ?? undefined,
                    endTime: parsed.data.endTime ?? undefined,
                },
            },
        });

        revalidatePath(ABSENCES_PATH);

        return {
            status: 'success',
            message: 'Absence reported successfully.',
            values: {
                typeId: '',
                durationType: 'DAYS',
                startDate: new Date().toISOString().slice(0, 10),
                endDate: '',
                startTime: '',
                endTime: '',
                hours: 8,
                reason: '',
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to report absence.';
        return {
            status: 'error',
            message,
            values: parsed.data,
        };
    }
}

/** Cancel an absence with reason validation. */
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
