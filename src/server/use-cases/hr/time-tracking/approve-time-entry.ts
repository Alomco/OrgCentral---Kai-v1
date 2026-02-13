import { AuthorizationError, EntityNotFoundError, ValidationError } from '@/server/errors';
import { toNumber } from '@/server/domain/absences/conversions';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgTimeEntryApprover, assertValidTimeWindow } from '@/server/security/authorization';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import type { ApproveTimeEntryPayload } from '@/server/types/hr-time-tracking-schemas';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { appLogger } from '@/server/logging/structured-logger';
import { recordNotificationFailure } from '@/server/services/security/notification-failure-monitor';
import { invalidateTimeEntryCache } from './cache-helpers';
import { appendDecision, calculateTotalHours } from './utils';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';

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
    assertPrivilegedOrgTimeEntryApprover(input.authorization);

    const orgId = input.authorization.orgId;
    const current = await deps.timeEntryRepository.getTimeEntry(orgId, input.entryId);

    if (!current) {
        throw new EntityNotFoundError('TimeEntry', { entryId: input.entryId });
    }

    if (current.userId === input.authorization.userId) {
        throw new AuthorizationError('You cannot approve or reject your own time entry.');
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

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: HR_ACTION.APPROVE,
        resource: HR_RESOURCE_TYPE.TIME_ENTRY,
        resourceId: input.entryId,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        correlationId: input.authorization.correlationId,
        payload: {
            targetUserId: current.userId,
            status: decision,
            totalHours,
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
    } catch (error) {
        appLogger.warn('hr.time-tracking.approve.notification.failed', {
            entryId: input.entryId,
            orgId: input.authorization.orgId,
            error: error instanceof Error ? error.message : 'unknown',
        });
        await recordNotificationFailure({
            authorization: input.authorization,
            eventType: 'hr.time-tracking.notification.failed',
            description: 'Time tracking notification dispatch failed.',
            resourceId: input.entryId,
            metadata: {
                action: 'approve',
                error: error instanceof Error ? error.message : 'unknown',
            },
        });
    }

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
