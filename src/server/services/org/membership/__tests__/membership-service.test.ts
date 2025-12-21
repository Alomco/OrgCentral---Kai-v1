import { describe, it, expect, beforeEach } from 'vitest';
import { MembershipService } from '../membership-service';
import type { IInvitationRepository, InvitationCreateInput, InvitationRecord, InvitationStatusUpdate } from '@/server/repositories/contracts/auth/invitations';
import type { IMembershipRepository, MembershipCreationInput, MembershipCreationResult } from '@/server/repositories/contracts/org/membership';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { CreateOrganizationInput, OrganizationProfileUpdate } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { EntityNotFoundError } from '@/server/errors';
import type { OrganizationData, UserData } from '@/server/types/leave-types';
import { normalizeLeaveYearStartDate, type LeaveYearStartDate } from '@/server/types/org/leave-year-start-date';
import type { Membership } from '@/server/types/membership';
import type { MembershipStatus } from '@prisma/client';

class FakeInvitationRepository implements IInvitationRepository {
    constructor(private readonly records: Map<string, InvitationRecord>) { }

    async findByToken(token: string): Promise<InvitationRecord | null> {
        return this.records.get(token) ?? null;
    }

    async updateStatus(token: string, update: InvitationStatusUpdate): Promise<void> {
        const record = this.records.get(token);
        if (record) {
            this.records.set(token, { ...record, status: update.status });
        }
    }

    async getActiveInvitationByEmail(): Promise<InvitationRecord | null> {
        return null;
    }

    async createInvitation(input: InvitationCreateInput): Promise<InvitationRecord> {
        const record: InvitationRecord = {
            token: input.orgId,
            status: 'pending',
            targetEmail: input.targetEmail,
            organizationId: input.orgId,
            organizationName: input.organizationName,
            invitedByUid: input.invitedByUserId,
            onboardingData: input.onboardingData,
            invitedByUserId: input.invitedByUserId,
        };
        this.records.set(record.token, record);
        return record;
    }
}

class FakeMembershipRepository implements IMembershipRepository {
    public createdInput: MembershipCreationInput | null = null;
    public context: RepositoryAuthorizationContext | null = null;

    constructor(private readonly result: MembershipCreationResult) { }

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
    constructor(private readonly user?: UserData | null) { }

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
        _context: RepositoryAuthorizationContext,
        _userId: string,
        _memberships: Membership[],
    ): Promise<void> {
        return Promise.resolve();
    }

    async addUserToOrganization(
        _context: RepositoryAuthorizationContext,
        _userId: string,
        _organizationId: string,
        _organizationName: string,
        _roles: string[],
    ): Promise<void> {
        return Promise.resolve();
    }

    async removeUserFromOrganization(
        _context: RepositoryAuthorizationContext,
        _userId: string,
        _organizationId: string,
    ): Promise<void> {
        return Promise.resolve();
    }

    async getUsersInOrganization(
        _context: RepositoryAuthorizationContext,
        _organizationId: string,
    ): Promise<UserData[]> {
        return [];
    }
}

class FakeOrganizationRepository implements IOrganizationRepository {
    async getOrganization(orgId: string): Promise<OrganizationData | null> {
        return {
            id: orgId,
            slug: `slug-${orgId}`,
            regionCode: 'UK-LON',
            dataResidency: 'UK_ONLY' as const,
            dataClassification: 'OFFICIAL' as const,
            auditSource: 'test',
            auditBatchId: undefined,
            name: 'Org One',
            leaveEntitlements: { annual: 25 },
            primaryLeaveType: 'annual',
            leaveYearStartDate: normalizeLeaveYearStartDate('2025-01-01'),
            leaveRoundingRule: 'full_day' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    async getOrganizationBySlug(slug: string): Promise<OrganizationData | null> {
        const orgId = slug.replace('slug-', '') || 'org-1';
        return this.getOrganization(orgId);
    }

    async getLeaveEntitlements(_orgId: string): Promise<Record<string, number>> {
        return {};
    }

    async updateLeaveSettings(
        _orgId: string,
        _settings: {
            leaveEntitlements: Record<string, number>;
            primaryLeaveType: string;
            leaveYearStartDate: LeaveYearStartDate;
            leaveRoundingRule: string;
        },
    ): Promise<void> {
        return Promise.resolve();
    }

    async updateOrganizationProfile(orgId: string, updates: OrganizationProfileUpdate): Promise<OrganizationData> {
        const org = await this.getOrganization(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }
        return {
            ...org,
            name: updates.name ?? org.name,
            address: updates.address === null ? undefined : (updates.address ?? org.address),
            phone: updates.phone === null ? undefined : (updates.phone ?? org.phone),
            website: updates.website === null ? undefined : (updates.website ?? org.website),
            companyType: updates.companyType === null ? undefined : (updates.companyType ?? org.companyType),
            industry: updates.industry === null ? undefined : (updates.industry ?? org.industry),
            employeeCountRange:
                updates.employeeCountRange === null
                    ? undefined
                    : (updates.employeeCountRange ?? org.employeeCountRange),
            incorporationDate:
                updates.incorporationDate === null
                    ? undefined
                    : (updates.incorporationDate ?? org.incorporationDate),
            registeredOfficeAddress:
                updates.registeredOfficeAddress === null
                    ? undefined
                    : (updates.registeredOfficeAddress ?? org.registeredOfficeAddress),
        };
    }

    async createOrganization(input: CreateOrganizationInput): Promise<OrganizationData> {
        return {
            id: 'org-created',
            slug: input.slug,
            name: input.name,
            regionCode: 'UK-LON',
            dataResidency: input.dataResidency ?? 'UK_ONLY',
            dataClassification: input.dataClassification ?? 'OFFICIAL',
            auditSource: 'test',
            auditBatchId: undefined,
            leaveEntitlements: { annual: 25 },
            primaryLeaveType: 'annual',
            leaveYearStartDate: normalizeLeaveYearStartDate('2025-01-01'),
            leaveRoundingRule: 'full_day' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    async addCustomLeaveType(_orgId: string, _leaveType: string): Promise<void> {
        return Promise.resolve();
    }

    async removeLeaveType(_orgId: string, _leaveTypeKey: string): Promise<void> {
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
