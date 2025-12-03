import { describe, it, expect } from 'vitest';
import type { IGuardMembershipRepository, GuardMembershipRecord } from '@/server/repositories/contracts/security/guard-membership-repository-contract';
import { requireActiveMembership } from '../membership-status';

class FakeGuardMembershipRepository implements IGuardMembershipRepository {
    constructor(private readonly record: GuardMembershipRecord | null) {}

    async findMembership(): Promise<GuardMembershipRecord | null> {
        return this.record;
    }
}

function buildMembership(metadata?: Record<string, unknown>): GuardMembershipRecord {
    return {
        orgId: 'org-1',
        userId: 'user-1',
        roleName: 'orgAdmin',
        metadata: metadata ?? null,
        organization: {
            id: 'org-1',
            name: 'Org One',
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
        },
    };
}

describe('requireActiveMembership', () => {
    it('allows active membership with status flag', async () => {
        const repo = new FakeGuardMembershipRepository(buildMembership({ status: 'ACTIVE' }));
        const result = await requireActiveMembership('org-1', 'user-1', { repository: repo });

        expect(result.status).toBe('ACTIVE');
        expect(result.correlationId).toBeTypeOf('string');
    });

    it('allows membership when status is missing', async () => {
        const repo = new FakeGuardMembershipRepository(buildMembership());
        const result = await requireActiveMembership('org-1', 'user-1', { repository: repo });

        expect(result.status).toBeUndefined();
    });

    it('blocks membership when status is not allowed', async () => {
        const repo = new FakeGuardMembershipRepository(buildMembership({ status: 'SUSPENDED' }));

        await expect(
            requireActiveMembership('org-1', 'user-1', { repository: repo }),
        ).rejects.toThrow('Membership is not active for this operation.');
    });
});
