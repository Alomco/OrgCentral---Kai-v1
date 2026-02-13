import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { OrgPermissionMap } from '@/server/security/access-control';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import { AuthorizationError, EntityNotFoundError, ValidationError } from '@/server/errors';
import { HR_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions/profiles';
import { createTimeEntry } from '@/server/use-cases/hr/time-tracking/create-time-entry';
import { approveTimeEntry } from '@/server/use-cases/hr/time-tracking/approve-time-entry';
import { listTimeEntries } from '@/server/use-cases/hr/time-tracking/list-time-entries';
import { updateTimeEntry } from '@/server/use-cases/hr/time-tracking/update-time-entry';
import type { ApproveTimeEntryPayload } from '@/server/types/hr-time-tracking-schemas';

const mocks = vi.hoisted(() => {
    const emitHrNotificationMock = vi.fn().mockResolvedValue({
        id: 'notification-1',
        orgId: 'org-1',
        userId: 'user-1',
        title: 'Test notification',
        message: 'Test message',
        type: 'time-entry',
        priority: 'low',
        isRead: false,
        dataClassification: 'OFFICIAL',
        residencyTag: 'UK_ONLY',
        createdAt: new Date('2026-02-10T18:00:00.000Z'),
        updatedAt: new Date('2026-02-10T18:00:00.000Z'),
    });
    const invalidateTimeEntryCacheMock = vi.fn().mockResolvedValue(undefined);

    return { emitHrNotificationMock, invalidateTimeEntryCacheMock };
});

vi.mock('@/server/use-cases/hr/notifications/notification-emitter', () => ({
    emitHrNotification: mocks.emitHrNotificationMock,
}));

vi.mock('@/server/use-cases/hr/time-tracking/cache-helpers', () => ({
    invalidateTimeEntryCache: mocks.invalidateTimeEntryCacheMock,
    registerTimeEntryCache: vi.fn(),
}));

function buildAuthorization(
    permissions: OrgPermissionMap,
    overrides: Partial<RepositoryAuthorizationContext> = {},
): RepositoryAuthorizationContext {
    return {
        orgId: 'org-1',
        userId: 'user-1',
        dataClassification: 'OFFICIAL',
        dataResidency: 'UK_ONLY',
        auditSource: 'test',
        tenantScope: {
            orgId: 'org-1',
            dataClassification: 'OFFICIAL',
            dataResidency: 'UK_ONLY',
            auditSource: 'test',
        },
        roleKey: 'custom',
        permissions,
        ...overrides,
    };
}

function buildTimeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
    return {
        id: 'entry-1',
        orgId: 'org-1',
        userId: 'user-1',
        date: new Date('2026-02-10T00:00:00.000Z'),
        clockIn: new Date('2026-02-10T09:00:00.000Z'),
        clockOut: new Date('2026-02-10T17:00:00.000Z'),
        totalHours: 8,
        breakDuration: 0,
        project: null,
        tasks: null,
        notes: null,
        status: 'COMPLETED',
        approvedByOrgId: null,
        approvedByUserId: null,
        approvedAt: null,
        dataClassification: 'OFFICIAL',
        residencyTag: 'UK_ONLY',
        metadata: {},
        createdAt: new Date('2026-02-10T18:00:00.000Z'),
        updatedAt: new Date('2026-02-10T18:00:00.000Z'),
        ...overrides,
    };
}

describe('time entry use-cases', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates a completed time entry with calculated hours', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE);
        const clockIn = new Date('2026-02-10T09:00:00.000Z');
        const clockOut = new Date('2026-02-10T17:00:00.000Z');
        let capturedInput: {
            status?: TimeEntry['status'];
            totalHours?: number | null;
        } | null = null;

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(async (orgId, input) => {
                capturedInput = input;
                return buildTimeEntry({
                    id: 'entry-1',
                    orgId,
                    ...input,
                    createdAt: new Date('2026-02-10T18:00:00.000Z'),
                    updatedAt: new Date('2026-02-10T18:00:00.000Z'),
                });
            }),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(),
            listTimeEntries: vi.fn(),
        };

        const result = await createTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                payload: {
                    userId: authorization.userId,
                    clockIn,
                    clockOut,
                    breakDuration: 1,
                    date: new Date('2026-02-10T00:00:00.000Z'),
                },
            },
        );

        const safeInput = capturedInput as {
            status?: TimeEntry['status'];
            totalHours?: number | null;
        } | null;

        expect(safeInput?.status).toBe('COMPLETED');
        expect(safeInput?.totalHours).toBe(7);
        expect(result.entry.totalHours).toBe(7);
    });

    it('rejects create payloads that attempt to set a decision status', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(),
            listTimeEntries: vi.fn(),
        };

        await expect(createTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                payload: {
                    userId: authorization.userId,
                    clockIn: new Date('2026-02-10T09:00:00.000Z'),
                    status: 'APPROVED',
                },
            },
        )).rejects.toThrow(ValidationError);
    });

    it('rejects create payloads with invalid time windows', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(),
            listTimeEntries: vi.fn(),
        };

        await expect(createTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                payload: {
                    userId: authorization.userId,
                    clockIn: new Date('2026-02-10T09:00:00.000Z'),
                    clockOut: new Date('2026-02-10T08:30:00.000Z'),
                },
            },
        )).rejects.toThrow(ValidationError);
    });

    it('emits notifications and invalidates cache on create', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE);
        const clockIn = new Date('2026-02-10T09:00:00.000Z');
        const clockOut = new Date('2026-02-10T17:00:00.000Z');

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(async (orgId, input) => buildTimeEntry({
                id: 'entry-1',
                orgId,
                ...input,
                createdAt: new Date('2026-02-10T18:00:00.000Z'),
                updatedAt: new Date('2026-02-10T18:00:00.000Z'),
            })),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(),
            listTimeEntries: vi.fn(),
        };

        await createTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                payload: {
                    userId: authorization.userId,
                    clockIn,
                    clockOut,
                },
            },
        );

        expect(mocks.emitHrNotificationMock).toHaveBeenCalledTimes(1);
        expect(mocks.invalidateTimeEntryCacheMock).toHaveBeenCalledWith(authorization);
    });

    it('continues create flow when notification emission fails', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE);
        const clockIn = new Date('2026-02-10T09:00:00.000Z');
        const clockOut = new Date('2026-02-10T17:00:00.000Z');
        mocks.emitHrNotificationMock.mockRejectedValueOnce(new Error('notification failed'));

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(async (orgId, input) => buildTimeEntry({
                id: 'entry-1',
                orgId,
                ...input,
                createdAt: new Date('2026-02-10T18:00:00.000Z'),
                updatedAt: new Date('2026-02-10T18:00:00.000Z'),
            })),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(),
            listTimeEntries: vi.fn(),
        };

        const result = await createTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                payload: {
                    userId: authorization.userId,
                    clockIn,
                    clockOut,
                },
            },
        );

        expect(result.entry.id).toBe('entry-1');
        expect(repository.createTimeEntry).toHaveBeenCalledTimes(1);
        expect(mocks.emitHrNotificationMock).toHaveBeenCalledTimes(1);
        expect(mocks.invalidateTimeEntryCacheMock).toHaveBeenCalledWith(authorization);
    });

    it('blocks approvals for non-completed entries', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                userId: 'user-2',
                status: 'ACTIVE',
                clockOut: null,
            })),
            listTimeEntries: vi.fn(),
        };

        await expect(approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(ValidationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
        expect(mocks.emitHrNotificationMock).not.toHaveBeenCalled();
        expect(mocks.invalidateTimeEntryCacheMock).not.toHaveBeenCalled();
    });

    it('rejects approvals for missing entries', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => null),
            listTimeEntries: vi.fn(),
        };

        await expect(approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(EntityNotFoundError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
        expect(mocks.emitHrNotificationMock).not.toHaveBeenCalled();
        expect(mocks.invalidateTimeEntryCacheMock).not.toHaveBeenCalled();
    });

    it('rejects self-approval attempts', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({ userId: authorization.userId })),
            listTimeEntries: vi.fn(),
        };

        await expect(approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(AuthorizationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
        expect(mocks.emitHrNotificationMock).not.toHaveBeenCalled();
        expect(mocks.invalidateTimeEntryCacheMock).not.toHaveBeenCalled();
    });

    it('rejects approvals for already decided entries', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                userId: 'user-2',
                status: 'APPROVED',
            })),
            listTimeEntries: vi.fn(),
        };

        await expect(approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(ValidationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
        expect(mocks.emitHrNotificationMock).not.toHaveBeenCalled();
        expect(mocks.invalidateTimeEntryCacheMock).not.toHaveBeenCalled();
    });

    it('rejects approvals for completed entries missing clock-out', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                userId: 'user-2',
                status: 'COMPLETED',
                clockOut: null,
            })),
            listTimeEntries: vi.fn(),
        };

        await expect(approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(ValidationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
        expect(mocks.emitHrNotificationMock).not.toHaveBeenCalled();
        expect(mocks.invalidateTimeEntryCacheMock).not.toHaveBeenCalled();
    });

    it('rejects approvals for invalid time windows', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                userId: 'user-2',
                status: 'COMPLETED',
                clockIn: new Date('2026-02-10T10:00:00.000Z'),
                clockOut: new Date('2026-02-10T09:00:00.000Z'),
            })),
            listTimeEntries: vi.fn(),
        };

        await expect(approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(ValidationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
        expect(mocks.emitHrNotificationMock).not.toHaveBeenCalled();
        expect(mocks.invalidateTimeEntryCacheMock).not.toHaveBeenCalled();
    });

    it('emits notifications and invalidates cache on approve', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const existing = buildTimeEntry({ userId: 'user-2', status: 'COMPLETED' });

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (_orgId, _id, updates) => ({ ...existing, ...updates })),
            getTimeEntry: vi.fn(async () => existing),
            listTimeEntries: vi.fn(),
        };

        await approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        );

        expect(mocks.emitHrNotificationMock).toHaveBeenCalledTimes(1);
        expect(mocks.invalidateTimeEntryCacheMock).toHaveBeenCalledWith(authorization);
    });

    it('defaults approval decision to APPROVED when status is omitted', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const existing = buildTimeEntry({ userId: 'user-2', status: 'COMPLETED' });

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (_orgId, _id, updates) => ({ ...existing, ...updates })),
            getTimeEntry: vi.fn(async () => existing),
            listTimeEntries: vi.fn(),
        };

        const result = await approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: {} as ApproveTimeEntryPayload,
            },
        );

        expect(result.entry.status).toBe('APPROVED');
    });

    it('supports rejected decisions', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const existing = buildTimeEntry({ userId: 'user-2', status: 'COMPLETED' });

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (_orgId, _id, updates) => ({ ...existing, ...updates })),
            getTimeEntry: vi.fn(async () => existing),
            listTimeEntries: vi.fn(),
        };

        const result = await approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'REJECTED' },
            },
        );

        expect(result.entry.status).toBe('REJECTED');
        expect(mocks.emitHrNotificationMock).toHaveBeenCalledTimes(1);
        expect(mocks.invalidateTimeEntryCacheMock).toHaveBeenCalledWith(authorization);
    });

    it('continues approve flow when notification emission fails', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE);
        const existing = buildTimeEntry({ userId: 'user-2', status: 'COMPLETED' });
        mocks.emitHrNotificationMock.mockRejectedValueOnce(new Error('notification failed'));

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (_orgId, _id, updates) => ({ ...existing, ...updates })),
            getTimeEntry: vi.fn(async () => existing),
            listTimeEntries: vi.fn(),
        };

        const result = await approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        );

        expect(result.entry.status).toBe('APPROVED');
        expect(repository.updateTimeEntry).toHaveBeenCalledTimes(1);
        expect(mocks.emitHrNotificationMock).toHaveBeenCalledTimes(1);
        expect(mocks.invalidateTimeEntryCacheMock).toHaveBeenCalledWith(authorization);
    });

    it('rejects approvals without permission', async () => {
        const authorization = buildAuthorization({});
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                userId: 'user-2',
                status: 'COMPLETED',
            })),
            listTimeEntries: vi.fn(),
        };

        await expect(approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(AuthorizationError);
    });

    it('scopes list filters to the requesting user when not privileged', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_READ);
        let capturedFilters: Parameters<ITimeEntryRepository['listTimeEntries']>[1] | undefined;

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(),
            listTimeEntries: vi.fn(async (_orgId, filters) => {
                capturedFilters = filters;
                return [buildTimeEntry({ userId: authorization.userId })];
            }),
        };

        await listTimeEntries(
            { timeEntryRepository: repository },
            { authorization },
        );

        expect(capturedFilters?.userId).toBe(authorization.userId);
    });

    it('rejects list results that include other users for non-privileged viewers', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_READ);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(),
            listTimeEntries: vi.fn(async () => [
                buildTimeEntry({ userId: 'user-1' }),
                buildTimeEntry({ id: 'entry-2', userId: 'user-2' }),
            ]),
        };

        await expect(listTimeEntries(
            { timeEntryRepository: repository },
            { authorization },
        )).rejects.toThrow(AuthorizationError);
    });

    it('rejects updates that set completed status without a clock-out', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({ status: 'ACTIVE', clockOut: null })),
            listTimeEntries: vi.fn(),
        };

        await expect(updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { status: 'COMPLETED' },
            },
        )).rejects.toThrow(ValidationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
    });

    it('rejects updates with invalid clock-out time', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                clockIn: new Date('2026-02-10T10:00:00.000Z'),
                clockOut: null,
                status: 'ACTIVE',
            })),
            listTimeEntries: vi.fn(),
        };

        await expect(updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { clockOut: new Date('2026-02-10T09:00:00.000Z') },
            },
        )).rejects.toThrow(ValidationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
    });

    it('rejects updates when break duration exceeds shift hours', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                clockIn: new Date('2026-02-10T09:00:00.000Z'),
                clockOut: new Date('2026-02-10T10:00:00.000Z'),
                status: 'COMPLETED',
            })),
            listTimeEntries: vi.fn(),
        };

        await expect(updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { breakDuration: 2 },
            },
        )).rejects.toThrow(ValidationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
    });

    it('rejects updates when total hours exceed shift hours', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                clockIn: new Date('2026-02-10T09:00:00.000Z'),
                clockOut: new Date('2026-02-10T10:00:00.000Z'),
                status: 'COMPLETED',
            })),
            listTimeEntries: vi.fn(),
        };

        await expect(updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { totalHours: 2 },
            },
        )).rejects.toThrow(ValidationError);

        expect(repository.updateTimeEntry).not.toHaveBeenCalled();
    });

    it('completes an active entry when clock-out is provided', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const existing = buildTimeEntry({
            status: 'ACTIVE',
            clockOut: null,
            totalHours: null,
            breakDuration: 0,
        });
        let capturedUpdates: Parameters<ITimeEntryRepository['updateTimeEntry']>[2] | null = null;

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (_orgId, _id, updates) => {
                capturedUpdates = updates;
                return { ...existing, ...updates };
            }),
            getTimeEntry: vi.fn(async () => existing),
            listTimeEntries: vi.fn(),
        };

        const result = await updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { clockOut: new Date('2026-02-10T17:00:00.000Z') },
            },
        );

        const safeUpdates = capturedUpdates as {
            status?: TimeEntry['status'];
        } | null;

        expect(safeUpdates?.status).toBe('COMPLETED');
        expect(result.entry.status).toBe('COMPLETED');
        expect(result.entry.clockOut).toBeInstanceOf(Date);
    });

    it('merges metadata updates into the time entry record', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const existing = buildTimeEntry({
            metadata: { billable: false, projectCode: 'A-1' },
        });
        let capturedUpdates: Parameters<ITimeEntryRepository['updateTimeEntry']>[2] | null = null;

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (_orgId, _id, updates) => {
                capturedUpdates = updates;
                return { ...existing, ...updates };
            }),
            getTimeEntry: vi.fn(async () => existing),
            listTimeEntries: vi.fn(),
        };

        await updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: {
                    metadata: { billable: true, overtimeReason: 'Client deadline' },
                },
            },
        );

        const safeMetadata = (capturedUpdates as { metadata?: Record<string, unknown> } | null)?.metadata;

        expect(safeMetadata).toMatchObject({
            billable: true,
            projectCode: 'A-1',
            overtimeReason: 'Client deadline',
        });
    });

    it('emits notifications and invalidates cache on update', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const existing = buildTimeEntry({ status: 'ACTIVE', clockOut: null });

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (_orgId, _id, updates) => ({ ...existing, ...updates })),
            getTimeEntry: vi.fn(async () => existing),
            listTimeEntries: vi.fn(),
        };

        await updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { clockOut: new Date('2026-02-10T17:00:00.000Z') },
            },
        );

        expect(mocks.emitHrNotificationMock).toHaveBeenCalledTimes(1);
        expect(mocks.invalidateTimeEntryCacheMock).toHaveBeenCalledWith(authorization);
    });

    it('continues update flow when notification emission fails', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const existing = buildTimeEntry({ status: 'ACTIVE', clockOut: null });
        mocks.emitHrNotificationMock.mockRejectedValueOnce(new Error('notification failed'));

        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (_orgId, _id, updates) => ({ ...existing, ...updates })),
            getTimeEntry: vi.fn(async () => existing),
            listTimeEntries: vi.fn(),
        };

        const result = await updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-1',
                payload: { clockOut: new Date('2026-02-10T17:00:00.000Z') },
            },
        );

        expect(result.entry.status).toBe('COMPLETED');
        expect(repository.updateTimeEntry).toHaveBeenCalledTimes(1);
        expect(mocks.emitHrNotificationMock).toHaveBeenCalledTimes(1);
        expect(mocks.invalidateTimeEntryCacheMock).toHaveBeenCalledWith(authorization);
    });
});
