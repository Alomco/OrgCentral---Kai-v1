import type { EmploymentType, MembershipStatus, Prisma } from '@prisma/client';
import type { Membership } from '@/server/types/membership';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { AbacSubjectAttributes } from '@/server/types/abac-subject-attributes';

export interface EmployeeProfilePayload {
    orgId: string;
    userId: string;
    employeeNumber: string;
    jobTitle?: string | null;
    employmentType?: EmploymentType;
    startDate?: Date | null;
    metadata?: Prisma.JsonValue | null;
}

export interface UserActivationPayload {
    displayName?: string;
    email: string;
    status: MembershipStatus;
}

export interface MembershipCreationInput {
    userId: string;
    invitedByUserId?: string;
    roles: string[];
    profile: EmployeeProfilePayload;
    userUpdate: UserActivationPayload;
    /** Optional ABAC subject attributes to persist on membership.metadata. */
    abacSubjectAttributes?: AbacSubjectAttributes;
}

export interface MembershipCreationResult {
    organizationId: string;
    roles: string[];
}

export interface IMembershipRepository {
    findMembership(context: RepositoryAuthorizationContext, userId: string): Promise<Membership | null>;

    createMembershipWithProfile(
        context: RepositoryAuthorizationContext,
        input: MembershipCreationInput,
    ): Promise<MembershipCreationResult>;

    updateMembershipStatus(
        context: RepositoryAuthorizationContext,
        userId: string,
        status: MembershipStatus,
    ): Promise<void>;
}
