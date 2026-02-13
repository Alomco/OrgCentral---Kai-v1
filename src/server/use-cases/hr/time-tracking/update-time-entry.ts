import { EntityNotFoundError } from '@/server/errors';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertTimeEntryActorOrPrivileged } from '@/server/security/authorization';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import type { UpdateTimeEntryPayload } from '@/server/types/hr-time-tracking-schemas';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { appLogger } from '@/server/logging/structured-logger';
import { recordNotificationFailure } from '@/server/services/security/notification-failure-monitor';
import { invalidateTimeEntryCache } from './cache-helpers';
import {
    assertEditableTimeEntry,
    buildTimeEntryUpdates,
    describeTimeEntryStatus,
    deriveUpdateContext,
    formatTimeEntryDate,
} from './update-time-entry.helpers';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';

// Use-case: update a time entry via time-tracking repositories with guard enforcement.

export interface UpdateTimeEntryDependencies {
    timeEntryRepository: ITimeEntryRepository;
}

export interface UpdateTimeEntryInput {
    authorization: RepositoryAuthorizationContext;
    entryId: string;
    payload: UpdateTimeEntryPayload;
}

export interface UpdateTimeEntryResult {
    entry: TimeEntry;
}

export async function updateTimeEntry(
    deps: UpdateTimeEntryDependencies,
    input: UpdateTimeEntryInput,
): Promise<UpdateTimeEntryResult> {
    const orgId = input.authorization.orgId;
    const current = await deps.timeEntryRepository.getTimeEntry(orgId, input.entryId);

    if (!current) {
        throw new EntityNotFoundError('TimeEntry', { entryId: input.entryId });
    }

    assertTimeEntryActorOrPrivileged(input.authorization, current.userId);
    assertEditableTimeEntry(current, input.payload);

    const context = deriveUpdateContext(current, input.payload);
    const updates = buildTimeEntryUpdates(current, input.payload, context);

    if (Object.keys(updates).length === 0) {
        return { entry: current };
    }

    const entry = await deps.timeEntryRepository.updateTimeEntry(orgId, input.entryId, updates);

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: HR_ACTION.UPDATE,
        resource: HR_RESOURCE_TYPE.TIME_ENTRY,
        resourceId: input.entryId,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        correlationId: input.authorization.correlationId,
        payload: {
            targetUserId: current.userId,
            status: entry.status,
            updateKeys: Object.keys(updates),
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
                    title: 'Time entry updated',
                    message: `Time entry for ${formatTimeEntryDate(current.date)} updated.${describeTimeEntryStatus(entry.status)}`,
                    type: 'time-entry',
                    priority: 'medium',
                    actionUrl: `/hr/time-tracking/${input.entryId}`,
                    metadata: {
                        entryId: input.entryId,
                        status: entry.status,
                        project: entry.project,
                        totalHours: entry.totalHours ?? null,
                    },
                },
            },
        );
    } catch (error) {
        appLogger.warn('hr.time-tracking.update.notification.failed', {
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
                action: 'update',
                error: error instanceof Error ? error.message : 'unknown',
            },
        });
    }

    await invalidateTimeEntryCache(input.authorization);

    return { entry };
}
