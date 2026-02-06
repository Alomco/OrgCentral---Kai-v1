'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { headers } from 'next/headers';

import { authAction } from '@/server/actions/auth-action';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { buildHrAuthActionOptions } from '@/server/ui/auth/hr-session';
import { getTimeTrackingService } from '@/server/services/hr/time-tracking/time-tracking-service.provider';
import { calculateTotalHours } from '@/server/use-cases/hr/time-tracking/utils';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';

import type { TimeEntryFormState } from './form-state';
import { createTimeEntrySchema } from './schema';
import { buildPendingTimeEntries, type PendingTimeEntry } from './pending-entries';

const AUDIT_PREFIX = 'action:hr:time-tracking';
const RESOURCE_TYPE = HR_RESOURCE_TYPE.TIME_ENTRY;

function formDataString(value: FormDataEntryValue | null): string {
    return typeof value === 'string' ? value : '';
}

export async function createTimeEntryAction(
    _previousState: TimeEntryFormState,
    formData: FormData,
): Promise<TimeEntryFormState> {
    const raw = {
        date: formData.get('date'),
        clockIn: formData.get('clockIn'),
        clockOut: formData.get('clockOut'),
        breakDuration: formData.get('breakDuration'),
        project: formData.get('project'),
        projectCode: formData.get('projectCode'),
        tasks: formData.get('tasks'),
        billable: formData.get('billable'),
        overtimeReason: formData.get('overtimeReason'),
        notes: formData.get('notes'),
    };

    const parsed = createTimeEntrySchema.safeParse(raw);

    if (!parsed.success) {
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
                date: formDataString(raw.date),
                clockIn: formDataString(raw.clockIn),
                clockOut: formDataString(raw.clockOut),
                breakDuration: Number(raw.breakDuration ?? 0),
                project: formDataString(raw.project),
                projectCode: formDataString(raw.projectCode),
                tasks: formDataString(raw.tasks),
                billable: formDataString(raw.billable) === 'on' ? 'on' : 'off',
                overtimeReason: formDataString(raw.overtimeReason),
                notes: formDataString(raw.notes),
            },
        };
    }

    try {
        const service = getTimeTrackingService();
        const dateString = parsed.data.date;
        const clockInTime = new Date(`${dateString}T${parsed.data.clockIn}:00`);
        const clockOutTime = parsed.data.clockOut
            ? new Date(`${dateString}T${parsed.data.clockOut}:00`)
            : undefined;
        const tasks = parsed.data.tasks
            ? parsed.data.tasks
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean)
            : undefined;
        const breakDurationHours = parsed.data.breakDuration ?? 0;
        const totalHours = clockOutTime
            ? calculateTotalHours(clockInTime, clockOutTime, breakDurationHours)
            : undefined;
        const overtimeHours = totalHours ? Math.max(0, totalHours - 8) : 0;

        await authAction(
            buildHrAuthActionOptions({
                requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE,
                auditSource: `${AUDIT_PREFIX}:create`,
                action: HR_ACTION.CREATE,
                resourceType: RESOURCE_TYPE,
            }),
            async ({ authorization }) => {
                await service.createTimeEntry({
                    authorization,
                    payload: {
                        userId: authorization.userId,
                        date: new Date(dateString),
                        clockIn: clockInTime,
                        clockOut: clockOutTime,
                        breakDuration: breakDurationHours,
                        totalHours,
                        project: parsed.data.project,
                        tasks,
                        notes: parsed.data.notes,
                        metadata: {
                            billable: parsed.data.billable === 'on',
                            projectCode: parsed.data.projectCode ?? null,
                            overtimeHours: overtimeHours > 0 ? Number(overtimeHours.toFixed(2)) : null,
                            overtimeReason: parsed.data.overtimeReason ?? null,
                        },
                    },
                });
            },
        );

        return {
            status: 'success',
            message: 'Time entry created successfully.',
            values: {
                date: new Date().toISOString().slice(0, 10),
                clockIn: new Date().toTimeString().slice(0, 5),
                clockOut: '',
                breakDuration: 0,
                project: '',
                projectCode: '',
                tasks: '',
                billable: 'off',
                overtimeReason: '',
                notes: '',
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create time entry.';
        return {
            status: 'error',
            message,
            values: parsed.data,
        };
    }
}

export async function getPendingTimeEntriesAction(): Promise<PendingTimeEntry[]> {
    const headerStore = await headers();

    try {
        const { authorization } = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_LIST,
                auditSource: `${AUDIT_PREFIX}:pending`,
                action: HR_ACTION.LIST,
                resourceType: RESOURCE_TYPE,
                resourceAttributes: { view: 'team' },
            },
        );

        return await buildPendingTimeEntries(authorization);
    } catch {
        return [];
    }
}

export async function approveTimeEntryAction(
    entryId: string,
    comments?: string,
): Promise<void> {
    const service = getTimeTrackingService();
    await authAction(
        buildHrAuthActionOptions({
            requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE,
            auditSource: `${AUDIT_PREFIX}:approve`,
            action: HR_ACTION.UPDATE,
            resourceType: RESOURCE_TYPE,
            resourceAttributes: { entryId },
        }),
        async ({ authorization }) => {
            await service.approveTimeEntry({
                authorization,
                entryId,
                payload: {
                    status: 'APPROVED',
                    comments: comments?.trim() ? comments.trim() : undefined,
                },
            });
        },
    );

    after(() => {
        revalidatePath('/hr/time-tracking');
    });
}

export async function rejectTimeEntryAction(
    entryId: string,
    comments?: string,
): Promise<void> {
    const service = getTimeTrackingService();
    await authAction(
        buildHrAuthActionOptions({
            requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE,
            auditSource: `${AUDIT_PREFIX}:reject`,
            action: HR_ACTION.UPDATE,
            resourceType: RESOURCE_TYPE,
            resourceAttributes: { entryId },
        }),
        async ({ authorization }) => {
            await service.approveTimeEntry({
                authorization,
                entryId,
                payload: {
                    status: 'REJECTED',
                    comments: comments?.trim() ? comments.trim() : undefined,
                },
            });
        },
    );

    after(() => {
        revalidatePath('/hr/time-tracking');
    });
}
