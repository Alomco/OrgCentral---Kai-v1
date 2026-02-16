import { describe, expect, it, vi } from 'vitest';

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { searchOrgTopbar } from './search-org-topbar';

function buildAuthorizationContext(orgId: string): RepositoryAuthorizationContext {
    const tenantScope = {
        orgId,
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test:org:search',
    } as const;

    return {
        ...tenantScope,
        tenantScope,
        permissions: {},
        roleKey: 'owner',
        userId: 'user-1',
    };
}

function buildProfile(overrides: Partial<EmployeeProfile>): EmployeeProfile {
    const now = new Date('2026-01-01T00:00:00.000Z');

    return {
        id: 'profile-1',
        orgId: 'org-1',
        userId: 'user-1',
        employeeNumber: 'EMP-001',
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        healthStatus: 'UNDEFINED',
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}

describe('searchOrgTopbar', () => {
    it('filters by tenant and returns least-privilege result fields', async () => {
        const authorization = buildAuthorizationContext('org-1');
        const listEmployeeProfiles = vi.fn().mockResolvedValue({
            profiles: [
                buildProfile({
                    id: 'profile-ada',
                    orgId: 'org-1',
                    displayName: 'Ada Lovelace',
                    employeeNumber: 'EMP-007',
                    email: 'ada@org.example',
                    departmentId: 'Engineering',
                    jobTitle: 'Staff Engineer',
                }),
                buildProfile({
                    id: 'profile-outside',
                    orgId: 'org-2',
                    displayName: 'External User',
                    employeeNumber: 'EMP-999',
                    email: 'external@other.example',
                }),
            ],
        });

        const result = await searchOrgTopbar(
            {
                peopleService: { listEmployeeProfiles },
            },
            {
                authorization,
                query: 'ada',
                limit: 8,
            },
        );

        expect(listEmployeeProfiles).toHaveBeenCalledWith(
            expect.objectContaining({
                authorization,
                payload: { filters: { search: 'ada' }, limit: 40 },
            }),
        );
        expect(result.results).toHaveLength(1);
        expect(result.results[0]).toMatchObject({
            title: 'Ada Lovelace',
            type: 'employee',
            href: '/hr/employees/profile-ada',
        });
        expect(result.results[0].subtitle).toContain('EMP-007');
        expect(result.results[0].subtitle).toContain('ada@org.example');
        expect(Object.keys(result.results[0]).sort()).toEqual(['href', 'rank', 'subtitle', 'title', 'type']);
    });

    it('sorts by rank and applies the configured limit', async () => {
        const authorization = buildAuthorizationContext('org-1');
        const listEmployeeProfiles = vi.fn().mockResolvedValue({
            profiles: [
                buildProfile({
                    id: 'profile-exact',
                    displayName: 'Ada',
                    employeeNumber: 'EMP-001',
                }),
                buildProfile({
                    id: 'profile-partial',
                    displayName: 'Ada Lovelace',
                    employeeNumber: 'EMP-002',
                }),
                buildProfile({
                    id: 'profile-third',
                    displayName: 'Adaline Smith',
                    employeeNumber: 'EMP-003',
                }),
            ],
        });

        const result = await searchOrgTopbar(
            {
                peopleService: { listEmployeeProfiles },
            },
            {
                authorization,
                query: 'ada',
                limit: 2,
            },
        );

        expect(result.results).toHaveLength(2);
        expect(result.results[0].title).toBe('Ada');
        expect(result.results[0].rank).toBeGreaterThanOrEqual(result.results[1].rank);
    });
});
