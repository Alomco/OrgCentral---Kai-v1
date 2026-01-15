import type { IInvitationRepository, InvitationCreateInput, InvitationRecord, InvitationStatusUpdate } from '@/server/repositories/contracts/auth/invitations';
import type { IMembershipRepository, MembershipCreationInput, MembershipCreationResult } from '@/server/repositories/contracts/org/membership';
import type { IUserRepository, UserCreationInput, UserListFilters } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { User } from '@/server/types/hr-types';
import type { UserData } from '@/server/types/leave-types';
import type { Membership } from '@/server/types/membership';
import type { MembershipStatus } from '@/server/types/prisma';

export { FakeOrganizationRepository } from './membership-organization.fixture';

const resolveValue = <T>(value: T): Promise<T> => Promise.resolve(value);
const resolveVoid = (): Promise<void> => Promise.resolve();

export class FakeInvitationRepository implements IInvitationRepository {
    constructor(private readonly records: Map<string, InvitationRecord>) { }

    findByToken(token: string): Promise<InvitationRecord | null> {
        return resolveValue(this.records.get(token) ?? null);
    }

    updateStatus(token: string, update: InvitationStatusUpdate): Promise<void> {
        const record = this.records.get(token);
        if (record) {
            this.records.set(token, { ...record, status: update.status });
        }
        return resolveVoid();
    }

    getActiveInvitationByEmail(): Promise<InvitationRecord | null> {
        return resolveValue(null);
    }

    listInvitationsByOrg(orgId: string): Promise<InvitationRecord[]> {
        return resolveValue(Array.from(this.records.values()).filter((record) => record.organizationId === orgId));
    }

    createInvitation(input: InvitationCreateInput): Promise<InvitationRecord> {
        const record: InvitationRecord = {
            token: input.orgId,
            status: 'pending',
            targetEmail: input.targetEmail,
            organizationId: input.orgId,
            organizationName: input.organizationName,
            invitedByUid: input.invitedByUserId,
            onboardingData: input.onboardingData,
            invitedByUserId: input.invitedByUserId,
            createdAt: new Date(),
        };
        this.records.set(record.token, record);
        return resolveValue(record);
    }

    revokeInvitation(orgId: string, token: string, revokedByUserId: string): Promise<void> {
        const record = this.records.get(token);
        if (record?.organizationId !== orgId) {
            return Promise.reject(new Error('Invitation not found for this organization.'));
        }
        this.records.set(token, {
            ...record,
            status: 'revoked',
            revokedAt: new Date(),
            revokedByUserId,
        });
        return resolveVoid();
    }
}

export class FakeMembershipRepository implements IMembershipRepository {
    public createdInput: MembershipCreationInput | null = null;
    public context: RepositoryAuthorizationContext | null = null;

    constructor(private readonly result: MembershipCreationResult) { }

    findMembership(
        context: RepositoryAuthorizationContext,
        userId: string,
    ): Promise<Membership | null> {
        void context;
        void userId;
        return resolveValue<Membership | null>(null);
    }

    createMembershipWithProfile(
        context: RepositoryAuthorizationContext,
        input: MembershipCreationInput,
    ): Promise<MembershipCreationResult> {
        this.createdInput = input;
        this.context = context;
        return resolveValue(this.result);
    }

    updateMembershipStatus(
        context: RepositoryAuthorizationContext,
        userId: string,
        status: MembershipStatus,
    ): Promise<void> {
        void context;
        void userId;
        void status;
        return resolveVoid();
    }

    countActiveMemberships(context: RepositoryAuthorizationContext): Promise<number> {
        void context;
        return resolveValue(0);
    }
}

export class FakeUserRepository implements IUserRepository {
    constructor(private readonly user?: UserData | null) { }

    create(input: UserCreationInput): Promise<User> {
        const now = new Date();
        return resolveValue({
            id: 'user-1',
            email: input.email,
            displayName: input.displayName ?? null,
            status: 'INVITED',
            authProvider: input.authProvider ?? 'better-auth',
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: null,
            lastPasswordChange: now,
            createdAt: now,
            updatedAt: now,
        });
    }

    findById(): Promise<null> {
        return resolveValue(null);
    }

    findByEmail(): Promise<null> {
        return resolveValue(null);
    }

    userExistsByEmail(): Promise<boolean> {
        return resolveValue(false);
    }

    getUser(): Promise<UserData | null> {
        return resolveValue(this.user ?? null);
    }

    updateUserMemberships(
        context: RepositoryAuthorizationContext,
        userId: string,
        memberships: Membership[],
    ): Promise<void> {
        void context;
        void userId;
        void memberships;
        return resolveVoid();
    }

    addUserToOrganization(
        context: RepositoryAuthorizationContext,
        userId: string,
        organizationId: string,
        organizationName: string,
        roles: string[],
    ): Promise<void> {
        void context;
        void userId;
        void organizationId;
        void organizationName;
        void roles;
        return resolveVoid();
    }

    removeUserFromOrganization(
        context: RepositoryAuthorizationContext,
        userId: string,
        organizationId: string,
    ): Promise<void> {
        void context;
        void userId;
        void organizationId;
        return resolveVoid();
    }

    getUsersInOrganization(
        context: RepositoryAuthorizationContext,
        organizationId: string,
    ): Promise<UserData[]> {
        void context;
        void organizationId;
        return resolveValue([]);
    }

    countUsersInOrganization(
        context: RepositoryAuthorizationContext,
        organizationId: string,
        filters?: UserListFilters,
    ): Promise<number> {
        void context;
        void organizationId;
        void filters;
        return resolveValue(0);
    }

    getUsersInOrganizationPaged(
        context: RepositoryAuthorizationContext,
        organizationId: string,
        query: { page: number; pageSize: number },
    ): Promise<UserData[]> {
        void context;
        void organizationId;
        void query;
        return resolveValue([]);
    }
}

export function buildInvitation(token: string): InvitationRecord {
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
