import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrgPermissionMap } from '@/server/security/access-control';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import { HR_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions/profiles';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import { AuthorizationError, EntityNotFoundError } from '@/server/errors';
import { createTimeEntry } from '@/server/use-cases/hr/time-tracking/create-time-entry';
import { updateTimeEntry } from '@/server/use-cases/hr/time-tracking/update-time-entry';
import { approveTimeEntry } from '@/server/use-cases/hr/time-tracking/approve-time-entry';
import { recordAuditEvent } from '@/server/logging/audit-logger';

const mocks = vi.hoisted(() => {
    const emitHrNotificationMock = vi.fn().mockResolvedValue({ id: 'notification-1' });
    const invalidateTimeEntryCacheMock = vi.fn().mockResolvedValue(undefined);

    return { emitHrNotificationMock, invalidateTimeEntryCacheMock };
});

const auditMocks = vi.hoisted(() => ({
    recordAuditEvent: vi.fn(),
    setAuditLogRepository: vi.fn(),
}));

vi.mock('@/server/use-cases/hr/notifications/notification-emitter', () => ({
    emitHrNotification: mocks.emitHrNotificationMock,
}));

vi.mock('@/server/use-cases/hr/time-tracking/cache-helpers', () => ({
    invalidateTimeEntryCache: mocks.invalidateTimeEntryCacheMock,
    registerTimeEntryCache: vi.fn(),
}));

vi.mock('@/server/logging/audit-logger', () => ({
    recordAuditEvent: auditMocks.recordAuditEvent,
    setAuditLogRepository: auditMocks.setAuditLogRepository,
}));

const recordAuditEventMock = vi.mocked(recordAuditEvent);

function buildAuthorization(
    permissions: OrgPermissionMap,
    overrides: Partial<RepositoryAuthorizationContext> = {},
): RepositoryAuthorizationContext {
    return {
        orgId: 'org-1',
        userId: 'user-1',
        dataClassification: 'OFFICIAL',
        dataResidency: 'UK_ONLY',
        auditSource: 'tests',
        tenantScope: {
            orgId: 'org-1',
            dataClassification: 'OFFICIAL',
            dataResidency: 'UK_ONLY',
            auditSource: 'tests',
        },
        roleKey: 'custom',
        permissions,
        ipAddress: '192.0.2.10',
        userAgent: 'vitest',
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

describe('time entry audit logging', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        recordAuditEventMock.mockClear();
    });

    it('records audit on create', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(async (orgId, input) => buildTimeEntry({ id: 'entry-10', orgId, ...input })),
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
                    clockIn: new Date('2026-02-10T09:00:00.000Z'),
                    clockOut: new Date('2026-02-10T17:00:00.000Z'),
                },
            },
        );

        expect(recordAuditEventMock).toHaveBeenCalledTimes(1);
        expect(recordAuditEventMock).toHaveBeenCalledWith(expect.objectContaining({
            orgId: authorization.orgId,
            userId: authorization.userId,
            action: HR_ACTION.CREATE,
            resource: HR_RESOURCE_TYPE.TIME_ENTRY,
            resourceId: 'entry-10',
            payload: expect.objectContaining({
                targetUserId: authorization.userId,
                status: 'COMPLETED',
                ipAddress: authorization.ipAddress,
                userAgent: authorization.userAgent,
            }),
        }));
    });

    it('records audit on update', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_UPDATE);
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (orgId, entryId, updates) => buildTimeEntry({
                id: entryId,
                orgId,
                ...updates,
            })),
            getTimeEntry: vi.fn(async () => buildTimeEntry({ userId: authorization.userId })),
            listTimeEntries: vi.fn(),
        };

        await updateTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-11',
                payload: {
                    notes: 'Updated notes',
                },
            },
        );

        expect(recordAuditEventMock).toHaveBeenCalledTimes(1);
        expect(recordAuditEventMock).toHaveBeenCalledWith(expect.objectContaining({
            orgId: authorization.orgId,
            userId: authorization.userId,
            action: HR_ACTION.UPDATE,
            resource: HR_RESOURCE_TYPE.TIME_ENTRY,
            resourceId: 'entry-11',
            payload: expect.objectContaining({
                targetUserId: authorization.userId,
                status: 'COMPLETED',
                updateKeys: expect.arrayContaining(['notes']),
                ipAddress: authorization.ipAddress,
                userAgent: authorization.userAgent,
            }),
        }));
    });

    it('records audit on approve', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE, { userId: 'approver-1' });
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (orgId, entryId, updates) => buildTimeEntry({
                id: entryId,
                orgId,
                ...updates,
            })),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                userId: 'user-2',
                status: 'COMPLETED',
                clockOut: new Date('2026-02-10T17:00:00.000Z'),
            })),
            listTimeEntries: vi.fn(),
        };

        await approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-12',
                payload: { status: 'APPROVED' },
            },
        );

        expect(recordAuditEventMock).toHaveBeenCalledTimes(1);
        expect(recordAuditEventMock).toHaveBeenCalledWith(expect.objectContaining({
            orgId: authorization.orgId,
            userId: authorization.userId,
            action: HR_ACTION.APPROVE,
            resource: HR_RESOURCE_TYPE.TIME_ENTRY,
            resourceId: 'entry-12',
            payload: expect.objectContaining({
                targetUserId: 'user-2',
                status: 'APPROVED',
                totalHours: 8,
                ipAddress: authorization.ipAddress,
                userAgent: authorization.userAgent,
            }),
        }));
    });

    it('records audit on rejected approval', async () => {
        const authorization = buildAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE, { userId: 'approver-2' });
        const repository: ITimeEntryRepository = {
            createTimeEntry: vi.fn(),
            updateTimeEntry: vi.fn(async (orgId, entryId, updates) => buildTimeEntry({
                id: entryId,
                orgId,
                ...updates,
            })),
            getTimeEntry: vi.fn(async () => buildTimeEntry({
                userId: 'user-3',
                status: 'COMPLETED',
                clockOut: new Date('2026-02-10T17:00:00.000Z'),
            })),
            listTimeEntries: vi.fn(),
        };

        await approveTimeEntry(
            { timeEntryRepository: repository },
            {
                authorization,
                entryId: 'entry-13',
                payload: { status: 'REJECTED' },
            },
        );

        expect(recordAuditEventMock).toHaveBeenCalledTimes(1);
        expect(recordAuditEventMock).toHaveBeenCalledWith(expect.objectContaining({
            orgId: authorization.orgId,
            userId: authorization.userId,
            action: HR_ACTION.APPROVE,
            resource: HR_RESOURCE_TYPE.TIME_ENTRY,
            resourceId: 'entry-13',
            payload: expect.objectContaining({
                targetUserId: 'user-3',
                status: 'REJECTED',
                totalHours: 8,
                ipAddress: authorization.ipAddress,
                userAgent: authorization.userAgent,
            }),
        }));
    });

    it('does not record audit when approval fails for missing entry', async () => {
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
                entryId: 'entry-missing',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(EntityNotFoundError);

        expect(recordAuditEventMock).not.toHaveBeenCalled();
    });

    it('does not record audit when approval fails for self-approval', async () => {
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
                entryId: 'entry-14',
                payload: { status: 'APPROVED' },
            },
        )).rejects.toThrow(AuthorizationError);

        expect(recordAuditEventMock).not.toHaveBeenCalled();
    });
});
