import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { getTimeEntryForUi } from '@/server/use-cases/hr/time-tracking/get-time-entry.cached';
import { getTimeEntriesForUi } from '@/server/use-cases/hr/time-tracking/get-time-entries.cached';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';

const mocks = vi.hoisted(() => ({
    cacheLifeMock: vi.fn(),
    noStoreMock: vi.fn(),
    recordHrCachedReadAuditMock: vi.fn().mockResolvedValue(undefined),
    getTimeEntryMock: vi.fn(),
    listTimeEntriesMock: vi.fn(),
}));

vi.mock('next/cache', () => ({
    cacheLife: mocks.cacheLifeMock,
    unstable_noStore: mocks.noStoreMock,
}));

vi.mock('@/server/use-cases/hr/audit/record-hr-cached-read-audit', () => ({
    recordHrCachedReadAudit: mocks.recordHrCachedReadAuditMock,
}));

vi.mock('@/server/services/hr/time-tracking/time-tracking-service.provider', () => ({
    getTimeTrackingService: () => ({
        getTimeEntry: mocks.getTimeEntryMock,
        listTimeEntries: mocks.listTimeEntriesMock,
    }),
}));

function buildAuthorization(
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
        permissions: {},
        ...overrides,
    };
}

describe('time entry cached reads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('records audit for time entry read', async () => {
        mocks.getTimeEntryMock.mockResolvedValue({ entry: null });

        const authorization = buildAuthorization();
        const result = await getTimeEntryForUi({ authorization, entryId: 'entry-1' });

        expect(result.entry).toBeNull();
        expect(mocks.recordHrCachedReadAuditMock).toHaveBeenCalledWith({
            authorization,
            action: HR_ACTION.READ,
            resource: HR_RESOURCE_TYPE.TIME_ENTRY,
            resourceId: 'entry-1',
        });
        expect(mocks.noStoreMock).not.toHaveBeenCalled();
        expect(mocks.getTimeEntryMock).toHaveBeenCalledTimes(1);
    });

    it('uses no-store for non-official time entry lists', async () => {
        mocks.listTimeEntriesMock.mockResolvedValue({ entries: [] });

        const authorization = buildAuthorization({ dataClassification: 'SECRET' });
        const result = await getTimeEntriesForUi({ authorization, userId: 'user-1' });

        expect(result.entries).toEqual([]);
        expect(mocks.recordHrCachedReadAuditMock).toHaveBeenCalledWith({
            authorization,
            action: HR_ACTION.LIST,
            resource: HR_RESOURCE_TYPE.TIME_ENTRY,
            payload: { userId: 'user-1' },
        });
        expect(mocks.noStoreMock).toHaveBeenCalledTimes(1);
        expect(mocks.listTimeEntriesMock).toHaveBeenCalledTimes(1);
    });

    it('uses no-store for non-official time entry reads', async () => {
        mocks.getTimeEntryMock.mockResolvedValue({ entry: null });

        const authorization = buildAuthorization({ dataClassification: 'SECRET' });
        const result = await getTimeEntryForUi({ authorization, entryId: 'entry-1' });

        expect(result.entry).toBeNull();
        expect(mocks.noStoreMock).toHaveBeenCalledTimes(1);
        expect(mocks.getTimeEntryMock).toHaveBeenCalledTimes(1);
    });

    it('uses cacheLife for official time entry lists', async () => {
        mocks.listTimeEntriesMock.mockResolvedValue({ entries: [] });

        const authorization = buildAuthorization({ dataClassification: 'OFFICIAL' });
        const result = await getTimeEntriesForUi({ authorization, userId: 'user-1' });

        expect(result.entries).toEqual([]);
        expect(mocks.cacheLifeMock).toHaveBeenCalledTimes(1);
        expect(mocks.noStoreMock).not.toHaveBeenCalled();
    });
});
