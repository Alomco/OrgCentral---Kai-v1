import { EntityNotFoundError, ValidationError } from '@/server/errors';
import { toNumber } from '@/server/domain/absences/conversions';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgTimeEntryActor, assertValidTimeWindow } from '@/server/security/authorization';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import type { ApproveTimeEntryPayload } from '@/server/types/hr-time-tracking-schemas';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { invalidateTimeEntryCache } from './cache-helpers';
import { appendDecision, calculateTotalHours } from './utils';

// Use-case: approve a time entry using time-tracking repositories and guard validation.

export interface ApproveTimeEntryDependencies {
    timeEntryRepository: ITimeEntryRepository;
}

export interface ApproveTimeEntryInput {
    authorization: RepositoryAuthorizationContext;
    entryId: string;
    payload: ApproveTimeEntryPayload;
}

export interface ApproveTimeEntryResult {
    entry: TimeEntry;
    approvedAt: Date;
}

export async function approveTimeEntry(
    deps: ApproveTimeEntryDependencies,
    input: ApproveTimeEntryInput,
): Promise<ApproveTimeEntryResult> {
    assertPrivilegedOrgTimeEntryActor(input.authorization);

    const orgId = input.authorization.orgId;
    const current = await deps.timeEntryRepository.getTimeEntry(orgId, input.entryId);

    if (!current) {
        throw new EntityNotFoundError('TimeEntry', { entryId: input.entryId });
    }

    if (current.status === 'APPROVED' || current.status === 'REJECTED') {
        throw new ValidationError('Time entry has already been approved or rejected.');
    }

    if (current.status !== 'COMPLETED') {
        throw new ValidationError('Only completed time entries can be approved or rejected.');
    }

    const clockOut = current.clockOut ?? null;
    if (!clockOut) {
        throw new ValidationError('Completed time entries require a clock-out time.');
    }

    assertValidTimeWindow(current.clockIn, clockOut);

    const decision = input.payload.status ?? 'APPROVED';
    const approvedAt = new Date();

    const breakDurationHours = toNullableNumber(current.breakDuration);
    const existingTotalHours = toNullableNumber(current.totalHours);
    const totalHours = existingTotalHours ?? calculateTotalHours(current.clockIn, clockOut, breakDurationHours);

    const metadata = appendDecision(
        current.metadata,
        {
            status: decision,
            decidedAt: approvedAt.toISOString(),
            decidedByOrgId: orgId,
            decidedByUserId: input.authorization.userId,
            comments: input.payload.comments ?? null,
        },
        input.payload.metadata ?? undefined,
    );

    const entry = await deps.timeEntryRepository.updateTimeEntry(orgId, input.entryId, {
        status: decision,
        approvedByOrgId: orgId,
        approvedByUserId: input.authorization.userId,
        approvedAt,
        totalHours,
        metadata,
    });

    await emitHrNotification(
        {},
        {
            authorization: input.authorization,
            notification: {
                userId: current.userId,
                title: 'Time entry decision',
                message: `Your time entry on ${current.date.toISOString().slice(0, 10)} was ${decision.toLowerCase()}.`,
                type: 'time-entry',
                priority: 'medium',
                actionUrl: `/hr/time-tracking/${input.entryId}`,
                metadata: {
                    entryId: input.entryId,
                    status: decision,
                    totalHours,
                },
            },
        },
    );

    await invalidateTimeEntryCache(input.authorization);

    return { entry, approvedAt };
}

function toNullableNumber(
    value: number | { toNumber(): number } | null | undefined,
): number | null {
    if (value === null || value === undefined) {
        return null;
    }
    return toNumber(value);
}
