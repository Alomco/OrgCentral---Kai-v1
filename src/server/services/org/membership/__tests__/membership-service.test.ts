import { describe, it, expect, beforeEach } from 'vitest';
import { MembershipService } from '../membership-service';
import type { IInvitationRepository, InvitationRecord, InvitationStatusUpdate } from '@/server/repositories/contracts/auth/invitations';
import type { IMembershipRepository, MembershipCreationInput, MembershipCreationResult } from '@/server/repositories/contracts/org/membership';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { EntityNotFoundError } from '@/server/errors';
import type { UserData } from '@/server/types/leave-types';
import type { Membership } from '@/server/types/membership';
import type { MembershipStatus } from '@prisma/client';

class FakeInvitationRepository implements IInvitationRepository {
    constructor(private readonly records: Map<string, InvitationRecord>) {}

    async findByToken(token: string): Promise<InvitationRecord | null> {
        return this.records.get(token) ?? null;
    }

    async updateStatus(token: string, update: InvitationStatusUpdate): Promise<void> {
        const record = this.records.get(token);
        if (record) {
            this.records.set(token, { ...record, status: update.status });
        }
    }
}

class FakeMembershipRepository implements IMembershipRepository {
    public createdInput: MembershipCreationInput | null = null;
    public context: RepositoryAuthorizationContext | null = null;

    constructor(private readonly result: MembershipCreationResult) {}

    async findMembership(
        _context: RepositoryAuthorizationContext,
        _userId: string,
    ): Promise<Membership | null> {
        return null;
    }

    async createMembershipWithProfile(
        context: RepositoryAuthorizationContext,
        input: MembershipCreationInput,
    ): Promise<MembershipCreationResult> {
        this.createdInput = input;
        this.context = context;
        return this.result;
    }

    async updateMembershipStatus(
        _context: RepositoryAuthorizationContext,
        _userId: string,
        _status: MembershipStatus,
    ): Promise<void> {
        return Promise.resolve();
    }
}

class FakeUserRepository implements IUserRepository {
    constructor(private readonly user?: UserData | null) {}

    async findById(): Promise<null> {
        return null;
    }

    async findByEmail(): Promise<null> {
        return null;
    }

    async userExistsByEmail(): Promise<boolean> {
        return false;
    }

    async getUser(): Promise<UserData | null> {
        return this.user ?? null;
    }

    async updateUserMemberships(
        _tenantId: string,
        _userId: string,
        _memberships: Membership[],
    ): Promise<void> {
        return Promise.resolve();
    }

    async addUserToOrganization(
        _tenantId: string,
        _userId: string,
        _organizationId: string,
        _organizationName: string,
        _roles: string[],
    ): Promise<void> {
        return Promise.resolve();
    }

    async removeUserFromOrganization(): Promise<void> {
        return Promise.resolve();
    }

    async getUsersInOrganization(): Promise<UserData[]> {
        return [];
    }
}

class FakeOrganizationRepository implements IOrganizationRepository {
    async getOrganization(orgId: string) {
        return {
            id: orgId,
            dataResidency: 'UK_ONLY' as const,
            dataClassification: 'OFFICIAL' as const,
            auditSource: 'test',
            auditBatchId: undefined,
            name: 'Org One',
            leaveEntitlements: { annual: 25 },
            primaryLeaveType: 'annual',
            leaveYearStartDate: '2025-01-01',
            leaveRoundingRule: 'full_day' as const,
            timezone: 'UTC',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    async getLeaveEntitlements(): Promise<Record<string, number>> {
        return {};
    }

    async updateLeaveSettings(): Promise<void> {
        return Promise.resolve();
    }

    async addCustomLeaveType(): Promise<void> {
        return Promise.resolve();
    }

    async removeLeaveType(): Promise<void> {
        return Promise.resolve();
    }
}

function buildInvitation(token: string): InvitationRecord {
    return {
        token,
        organizationId: 'org-1',
        organizationName: 'Org One',
        targetEmail: 'user@example.com',
        status: 'pending',
        onboardingData: {
            email: 'user@example.com',
            displayName: 'User One',
            roles: ['user'],
        },
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    };
}

describe('MembershipService', () => {
    let invitationRepository: FakeInvitationRepository;
    let membershipRepository: FakeMembershipRepository;
    let userRepository: FakeUserRepository;
    let organizationRepository: FakeOrganizationRepository;

    beforeEach(() => {
        invitationRepository = new FakeInvitationRepository(new Map([['token-1', buildInvitation('token-1')]]));
        membershipRepository = new FakeMembershipRepository({
            organizationId: 'org-1',
            roles: ['user'],
        });
        userRepository = new FakeUserRepository();
        organizationRepository = new FakeOrganizationRepository();
    });

    it('accepts invitation and creates membership/profile', async () => {
        const service = new MembershipService({
            invitationRepository,
            membershipRepository,
            userRepository,
            organizationRepository,
        });

        const result = await service.acceptInvitation({
            token: 'token-1',
            actor: { userId: 'user-1', email: 'user@example.com' },
        });

        expect(result.success).toBe(true);
        expect(result.organizationId).toBe('org-1');
        expect(membershipRepository.createdInput?.userId).toBe('user-1');
        expect(membershipRepository.context?.orgId).toBe('org-1');
    });

    it('throws when invitation is not found', async () => {
        const service = new MembershipService({
            invitationRepository: new FakeInvitationRepository(new Map()),
            membershipRepository,
            userRepository,
            organizationRepository,
        });

        await expect(
            service.acceptInvitation({
                token: 'missing',
                actor: { userId: 'user-1', email: 'user@example.com' },
            }),
        ).rejects.toBeInstanceOf(EntityNotFoundError);
    });
});
