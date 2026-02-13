import type { TimeEntry } from '@/server/types/hr-ops-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { OrgPermissionMap } from '@/server/security/access-control';

const ORG_ID = 'org-test-001';
const USER_ID = 'user-test-001';
const DATA_CLASSIFICATION = 'OFFICIAL';
const DATA_RESIDENCY = 'UK_ONLY';
const AUDIT_SOURCE = 'test';

/**
 * Test fixture factory for TimeEntry objects
 * Usage: buildMockTimeEntry({ status: 'APPROVED' })
 */
export function buildMockTimeEntry(overrides?: Partial<TimeEntry>): TimeEntry {
    return {
        id: 'entry-test-001',
        orgId: ORG_ID,
        userId: USER_ID,
        date: new Date('2026-02-11T00:00:00Z'),
        clockIn: new Date('2026-02-11T09:00:00Z'),
        clockOut: new Date('2026-02-11T17:00:00Z'),
        totalHours: 8,
        breakDuration: 0,
        project: null,
        tasks: null,
        notes: null,
        status: 'COMPLETED',
        approvedByOrgId: null,
        approvedByUserId: null,
        approvedAt: null,
        dataClassification: DATA_CLASSIFICATION,
        residencyTag: DATA_RESIDENCY,
        metadata: {},
        createdAt: new Date('2026-02-11T10:00:00Z'),
        updatedAt: new Date('2026-02-11T10:00:00Z'),
        ...overrides,
    };
}

/**
 * Test fixture factory for RepositoryAuthorizationContext
 * Usage: buildMockAuthorization(HR_PERMISSION_PROFILE.TIME_ENTRY_CREATE)
 */
export function buildMockAuthorization(
    permissions: OrgPermissionMap,
    overrides?: Partial<RepositoryAuthorizationContext>,
): RepositoryAuthorizationContext {
    return {
        orgId: ORG_ID,
        userId: USER_ID,
        dataClassification: DATA_CLASSIFICATION,
        dataResidency: DATA_RESIDENCY,
        auditSource: AUDIT_SOURCE,
        tenantScope: {
            orgId: ORG_ID,
            dataClassification: DATA_CLASSIFICATION,
            dataResidency: DATA_RESIDENCY,
            auditSource: AUDIT_SOURCE,
        },
        roleKey: 'custom',
        permissions,
        ...overrides,
    };
}

/**
 * Factory for multiple time entries with sequential IDs
 * Usage: buildMockTimeEntryBatch(3, { orgId: 'org-123' })
 */
export function buildMockTimeEntryBatch(
    count: number,
    baseOverrides?: Partial<TimeEntry>,
): TimeEntry[] {
    return Array.from({ length: count }, (_, index) =>
        buildMockTimeEntry({
            id: `entry-test-${String(index + 1).padStart(3, '0')}`,
            ...baseOverrides,
        }),
    );
}
