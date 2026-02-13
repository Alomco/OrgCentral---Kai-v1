import { ValidationError } from '@/server/errors';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertTimeEntryActorOrPrivileged, assertValidTimeWindow } from '@/server/security/authorization';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import type { CreateTimeEntryPayload } from '@/server/types/hr-time-tracking-schemas';
import { normalizeString } from '@/server/use-cases/shared';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { appLogger } from '@/server/logging/structured-logger';
import { recordNotificationFailure } from '@/server/services/security/notification-failure-monitor';
import { invalidateTimeEntryCache } from './cache-helpers';
import { calculateTotalHours, mergeMetadata, mutateTimeEntryMetadata } from './utils';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';

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

    const status = resolveCreateStatus(payload, clockOut);

    const breakDurationHours =
        typeof payload.breakDuration === 'number' ? payload.breakDuration : undefined;

    assertShiftConstraints(payload.clockIn, clockOut, breakDurationHours, payload.totalHours);

    const totalHours = resolveTotalHours(payload, clockOut, breakDurationHours);

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
        metadata: buildTimeEntryMetadata(payload),
    });

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: HR_ACTION.CREATE,
        resource: HR_RESOURCE_TYPE.TIME_ENTRY,
        resourceId: entry.id,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        correlationId: input.authorization.correlationId,
        payload: {
            targetUserId: entry.userId,
            status: entry.status,
            ipAddress: input.authorization.ipAddress ?? null,
            userAgent: input.authorization.userAgent ?? null,
        },
    });

    try {
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
    } catch (error) {
        appLogger.warn('hr.time-tracking.create.notification.failed', {
            entryId: entry.id,
            orgId: input.authorization.orgId,
            error: error instanceof Error ? error.message : 'unknown',
        });
        await recordNotificationFailure({
            authorization: input.authorization,
            eventType: 'hr.time-tracking.notification.failed',
            description: 'Time tracking notification dispatch failed.',
            resourceId: entry.id,
            metadata: {
                action: 'create',
                error: error instanceof Error ? error.message : 'unknown',
            },
        });
    }

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

function resolveCreateStatus(
    payload: CreateTimeEntryPayload,
    clockOut: Date | undefined,
): TimeEntry['status'] {
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

    return status;
}

function assertShiftConstraints(
    clockIn: Date,
    clockOut: Date | undefined,
    breakDurationHours: number | undefined,
    totalHours: number | null | undefined,
): void {
    if (!clockOut) {
        return;
    }

    const shiftHours =
        (clockOut.getTime() - clockIn.getTime()) / 1000 / 60 / 60;

    if (typeof breakDurationHours === 'number' && breakDurationHours > shiftHours) {
        throw new ValidationError('Break duration cannot exceed the shift duration.');
    }
    if (typeof totalHours === 'number' && totalHours > shiftHours) {
        throw new ValidationError('Total hours cannot exceed the shift duration.');
    }
}

function resolveTotalHours(
    payload: CreateTimeEntryPayload,
    clockOut: Date | undefined,
    breakDurationHours: number | undefined,
): number | undefined {
    if (typeof payload.totalHours === 'number') {
        return payload.totalHours;
    }
    if (!clockOut) {
        return undefined;
    }
    return calculateTotalHours(payload.clockIn, clockOut, breakDurationHours);
}

function buildTimeEntryMetadata(payload: CreateTimeEntryPayload) {
    const metadata = mutateTimeEntryMetadata(null, (next) => {
        mergeMetadata(next, payload.metadata);
        if (payload.billable !== undefined) {
            next.billable = payload.billable;
        }
        if (payload.projectCode !== undefined) {
            next.projectCode = normalizeString(payload.projectCode ?? undefined) ?? null;
        }
        if (payload.overtimeReason !== undefined) {
            next.overtimeReason = normalizeString(payload.overtimeReason ?? undefined) ?? null;
        }
    });

    return metadata;
}
