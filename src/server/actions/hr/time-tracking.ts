'use server';

import { z } from 'zod';

import { authAction } from '@/server/actions/auth-action';
import { toActionState, type ActionState } from '@/server/actions/action-state';
import { getTimeTrackingService } from '@/server/services/hr/time-tracking/time-tracking-service.provider';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import {
    approveTimeEntrySchema,
    createTimeEntrySchema,
    timeEntryFiltersSchema,
    updateTimeEntrySchema,
    type ApproveTimeEntryPayload,
    type CreateTimeEntryPayload,
    type TimeEntryFilters,
} from '@/server/types/hr-time-tracking-schemas';

const timeTrackingService = getTimeTrackingService();
const AUDIT_PREFIX = 'action:hr:time-tracking:';
const RESOURCE_TYPE = HR_RESOURCE.TIME_ENTRY;

export async function listTimeEntriesAction(
    filters: unknown,
): Promise<ActionState<TimeEntry[]>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { employeeProfile: ['read'] },
                auditSource: `${AUDIT_PREFIX}list`,
                action: HR_ACTION.READ,
                resourceType: RESOURCE_TYPE,
                resourceAttributes: buildFilterAttributes(normalizeFilters(filters)),
            },
            async ({ authorization }) => {
                const parsedFilters = timeEntryFiltersSchema.parse(filters ?? {});
                const normalized = normalizeParsedFilters(parsedFilters);
                const result = await timeTrackingService.listTimeEntries({
                    authorization,
                    filters: normalized,
                });
                return result.entries;
            },
        ),
    );
}

export async function getTimeEntryAction(entryId: string): Promise<ActionState<TimeEntry | null>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { employeeProfile: ['read'] },
                auditSource: `${AUDIT_PREFIX}get`,
                action: HR_ACTION.READ,
                resourceType: RESOURCE_TYPE,
                resourceAttributes: { entryId },
            },
            async ({ authorization }) => {
                const id = z.uuid().parse(entryId);
                const result = await timeTrackingService.getTimeEntry({ authorization, entryId: id });
                return result.entry;
            },
        ),
    );
}

export async function createTimeEntryAction(
    data: unknown,
): Promise<ActionState<TimeEntry>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { employeeProfile: ['read'] },
                auditSource: `${AUDIT_PREFIX}create`,
                action: HR_ACTION.CREATE,
                resourceType: RESOURCE_TYPE,
                resourceAttributes: buildCreateAttributes(data),
            },
            async ({ authorization }) => {
                const payload = createTimeEntrySchema.parse(data);
                const result = await timeTrackingService.createTimeEntry({ authorization, payload });
                return result.entry;
            },
        ),
    );
}

export async function updateTimeEntryAction(
    entryId: string,
    data: unknown,
): Promise<ActionState<TimeEntry>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { employeeProfile: ['read'] },
                auditSource: `${AUDIT_PREFIX}update`,
                action: HR_ACTION.UPDATE,
                resourceType: RESOURCE_TYPE,
                resourceAttributes: { entryId },
            },
            async ({ authorization }) => {
                const id = z.uuid().parse(entryId);
                const payload = updateTimeEntrySchema.parse(data);
                const result = await timeTrackingService.updateTimeEntry({
                    authorization,
                    entryId: id,
                    payload,
                });
                return result.entry;
            },
        ),
    );
}

export async function approveTimeEntryAction(
    entryId: string,
    data: unknown,
): Promise<ActionState<TimeEntry>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { employeeProfile: ['read'] },
                auditSource: `${AUDIT_PREFIX}approve`,
                action: HR_ACTION.UPDATE,
                resourceType: RESOURCE_TYPE,
                resourceAttributes: buildApproveAttributes(entryId, data),
            },
            async ({ authorization }) => {
                const id = z.uuid().parse(entryId);
                const payload = approveTimeEntrySchema.parse(data ?? {});
                const result = await timeTrackingService.approveTimeEntry({
                    authorization,
                    entryId: id,
                    payload,
                });
                return result.entry;
            },
        ),
    );
}

function normalizeFilters(filters: unknown): TimeEntryFilters | undefined {
    try {
        const parsed = timeEntryFiltersSchema.parse(filters ?? {});
        return normalizeParsedFilters(parsed);
    } catch {
        return undefined;
    }
}

function normalizeParsedFilters(filters: TimeEntryFilters): TimeEntryFilters | undefined {
    const hasValues =
        Boolean(filters.userId) || Boolean(filters.status) || Boolean(filters.from) || Boolean(filters.to);
    return hasValues ? filters : undefined;
}

function buildFilterAttributes(filters?: TimeEntryFilters): Record<string, unknown> | undefined {
    if (!filters) {
        return undefined;
    }

    return {
        userId: filters.userId ?? null,
        status: filters.status ?? null,
        from: filters.from?.toISOString() ?? null,
        to: filters.to?.toISOString() ?? null,
    };
}

function buildCreateAttributes(input: unknown): Record<string, unknown> | undefined {
    try {
        const payload = createTimeEntrySchema.parse(input);
        return buildCreatePayloadAttributes(payload);
    } catch {
        return undefined;
    }
}

function buildCreatePayloadAttributes(payload: CreateTimeEntryPayload): Record<string, unknown> {
    return {
        targetUserId: payload.userId,
        status: payload.status ?? null,
        hasClockOut: payload.clockOut !== null && payload.clockOut !== undefined,
    };
}

function buildApproveAttributes(
    entryId: string,
    input: unknown,
): Record<string, unknown> | undefined {
    try {
        const payload = approveTimeEntrySchema.parse(input ?? {});
        return buildApprovePayloadAttributes(entryId, payload);
    } catch {
        return { entryId };
    }
}

function buildApprovePayloadAttributes(
    entryId: string,
    payload: ApproveTimeEntryPayload,
): Record<string, unknown> {
    return {
        entryId,
        decision: payload.status ?? 'APPROVED',
    };
}
