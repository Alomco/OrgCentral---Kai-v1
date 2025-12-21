import { ValidationError } from '@/server/errors';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertTimeEntryActorOrPrivileged, assertValidTimeWindow } from '@/server/security/authorization';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import type { CreateTimeEntryPayload } from '@/server/types/hr-time-tracking-schemas';
import { toJsonValue } from '@/server/domain/absences/conversions';
import { normalizeString } from '@/server/use-cases/shared';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { invalidateTimeEntryCache } from './cache-helpers';
import { calculateTotalHours } from './utils';

// Use-case: create a time entry through time-tracking repositories with tenant authorization.

export interface CreateTimeEntryDependencies {
    timeEntryRepository: ITimeEntryRepository;
}

export interface CreateTimeEntryInput {
    authorization: RepositoryAuthorizationContext;
    payload: CreateTimeEntryPayload;
}

export interface CreateTimeEntryResult {
    entry: TimeEntry;
}

export async function createTimeEntry(
    deps: CreateTimeEntryDependencies,
    input: CreateTimeEntryInput,
): Promise<CreateTimeEntryResult> {
    const orgId = input.authorization.orgId;
    const payload = input.payload;

    assertTimeEntryActorOrPrivileged(input.authorization, payload.userId);

    const clockOut = payload.clockOut ?? undefined;
    assertValidTimeWindow(payload.clockIn, clockOut);

    const status = payload.status ?? (clockOut ? 'COMPLETED' : 'ACTIVE');
    if (status === 'APPROVED' || status === 'REJECTED') {
        throw new ValidationError('Time entries cannot be created directly in a decision state.');
    }
    if (status === 'COMPLETED' && !clockOut) {
        throw new ValidationError('Completed time entries require a clock-out time.');
    }
    if (status === 'ACTIVE' && clockOut) {
        throw new ValidationError('Active time entries cannot have a clock-out time.');
    }

    const breakDurationHours =
        typeof payload.breakDuration === 'number' ? payload.breakDuration : undefined;

    if (clockOut) {
        const shiftHours =
            (clockOut.getTime() - payload.clockIn.getTime()) / 1000 / 60 / 60;
        if (typeof breakDurationHours === 'number' && breakDurationHours > shiftHours) {
            throw new ValidationError('Break duration cannot exceed the shift duration.');
        }
        if (typeof payload.totalHours === 'number' && payload.totalHours > shiftHours) {
            throw new ValidationError('Total hours cannot exceed the shift duration.');
        }
    }

    const totalHours =
        typeof payload.totalHours === 'number'
            ? payload.totalHours
            : clockOut
                ? calculateTotalHours(payload.clockIn, clockOut, breakDurationHours)
                : undefined;

    const entry = await deps.timeEntryRepository.createTimeEntry(orgId, {
        orgId,
        userId: payload.userId,
        date: payload.date ?? payload.clockIn,
        clockIn: payload.clockIn,
        clockOut: clockOut ?? null,
        totalHours,
        breakDuration: breakDurationHours,
        project: normalizeString(payload.project ?? undefined) ?? null,
        tasks: payload.tasks ?? undefined,
        notes: normalizeString(payload.notes ?? undefined) ?? null,
        status,
        approvedByOrgId: null,
        approvedByUserId: null,
        approvedAt: null,
        dataClassification: input.authorization.dataClassification,
        residencyTag: input.authorization.dataResidency,
        metadata: toJsonValue(payload.metadata),
    });

    await emitHrNotification(
        {},
        {
            authorization: input.authorization,
            notification: {
                userId: payload.userId,
                title: 'New time entry recorded',
                message: `Time entry for ${formatDate(payload.date ?? payload.clockIn)} at ${formatTime(payload.clockIn)} created.${describeProject(payload.project)}`,
                type: 'time-entry',
                priority: 'medium',
                actionUrl: `/hr/time-tracking/${entry.id}`,
                metadata: {
                    entryId: entry.id,
                    status: entry.status,
                    project: entry.project,
                    totalHours: entry.totalHours ?? null,
                },
            },
        },
    );

    await invalidateTimeEntryCache(input.authorization);

    return { entry };
}

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function formatTime(date: Date): string {
    return date.toISOString().slice(11, 16);
}

function describeProject(project?: string | null): string {
    return project ? ` Project: ${project}.` : '';
}
