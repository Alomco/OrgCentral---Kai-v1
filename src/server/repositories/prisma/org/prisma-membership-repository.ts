import type { MembershipStatus, Prisma } from '@prisma/client';
import {
    OrgScopedPrismaRepository,
} from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type {
    EmployeeProfilePayload,
    IMembershipRepository,
    MembershipCreationInput,
    MembershipCreationResult,
    UserActivationPayload,
} from '@/server/repositories/contracts/org/membership';
import type { Membership } from '@/server/types/membership';
import { mapPrismaMembershipToDomain } from '@/server/repositories/mappers/org/membership/membership-mapper';
import { buildMembershipMetadataJson, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { resolveIdentityCacheScopes } from '@/server/lib/cache-tags/identity';

const MEMBERSHIP_STATUSES = ['INVITED', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'] as const;
type SafeMembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN'] as const;
type SafeEmploymentType = (typeof EMPLOYMENT_TYPES)[number];

const ACTIVE_MEMBERSHIP_STATUS: SafeMembershipStatus = 'ACTIVE';
const DEFAULT_EMPLOYMENT_TYPE: SafeEmploymentType = 'FULL_TIME';

export class PrismaMembershipRepository extends OrgScopedPrismaRepository implements IMembershipRepository {


    async findMembership(context: RepositoryAuthorizationContext, userId: string): Promise<Membership | null> {
        const membership = await getMembershipDelegate(this.prisma).findUnique({
            where: { orgId_userId: { orgId: context.orgId, userId } },
            include: { org: true },
        });

        if (!membership) {
            return null;
        }

        return mapPrismaMembershipToDomain(membership as Prisma.MembershipGetPayload<{ include: { org: true } }>);
    }

    async createMembershipWithProfile(
        scope: RepositoryAuthorizationContext,
        input: MembershipCreationInput,
    ): Promise<MembershipCreationResult> {
        const tenantOrgWhere = { orgId: scope.orgId, userId: input.userId } as const;
        const profileData = this.mapProfilePayload(input.profile);
        const membershipMetadata = buildMembershipMetadataJson(scope, input.roles);

        await runTransaction(this.prisma, async (tx: Prisma.TransactionClient) => {
            await getMembershipDelegate(tx).create({
                data: {
                    orgId: scope.orgId,
                    userId: input.userId,
                    status: ACTIVE_MEMBERSHIP_STATUS,
                    invitedBy: input.invitedByUserId,
                    invitedAt: new Date(),
                    activatedAt: new Date(),
                    metadata: toPrismaInputJson(membershipMetadata) as Prisma.InputJsonValue,
                },
            });

            await getEmployeeProfileDelegate(tx).upsert({
                where: { orgId_userId: tenantOrgWhere },
                create: profileData,
                update: profileData,
            });

            await getUserDelegate(tx).update({
                where: { id: input.userId },
                data: input.userUpdate,
            });
        });

        await this.invalidateAfterWrite(scope.orgId, resolveIdentityCacheScopes());

        return {
            organizationId: scope.orgId,
            roles: input.roles,
        };
    }

    async updateMembershipStatus(context: RepositoryAuthorizationContext, userId: string, status: MembershipStatus): Promise<void> {
        const statusInput = typeof status === 'string' ? status : null;
        const nextStatus = coerceMembershipStatus(statusInput);
        await getMembershipDelegate(this.prisma).update({
            where: { orgId_userId: { orgId: context.orgId, userId } },
            data: { status: nextStatus },
        });

        await this.invalidateAfterWrite(context.orgId, resolveIdentityCacheScopes());
    }

    private mapProfilePayload(payload: EmployeeProfilePayload): EmployeeProfilePersistence {
        const employmentTypeInput =
            typeof payload.employmentType === 'string' ? payload.employmentType : null;
        const employmentType = coerceEmploymentType(employmentTypeInput);
        return {
            orgId: payload.orgId,
            userId: payload.userId,
            employeeNumber: payload.employeeNumber,
            jobTitle: payload.jobTitle ?? null,
            employmentType,
            startDate: payload.startDate ?? null,
            metadata: toPrismaInputJson(payload.metadata) as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput,
        };
    }

}

interface EmployeeProfilePersistence {
    orgId: string;
    userId: string;
    employeeNumber: string;
    jobTitle: string | null;
    employmentType: SafeEmploymentType;
    startDate: Date | null;
    metadata: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}

interface MembershipRecord {
    orgId: string;
    metadata: Prisma.JsonValue | null;
    org: { name: string | null } | null;
}

interface MembershipDelegate {
    findUnique(args: {
        where: { orgId_userId: { orgId: string; userId: string } };
        include: { org: true };
    }): Promise<MembershipRecord | null>;
    create(args: {
        data: {
            orgId: string;
            userId: string;
            status: SafeMembershipStatus;
            invitedBy?: string | null;
            invitedAt: Date;
            activatedAt: Date;
            metadata: Prisma.InputJsonValue | typeof Prisma.JsonNull;
        };
    }): Promise<void>;
    update(args: {
        where: { orgId_userId: { orgId: string; userId: string } };
        data: { status: SafeMembershipStatus };
    }): Promise<void>;
}

interface EmployeeProfileDelegate {
    upsert(args: {
        where: { orgId_userId: { orgId: string; userId: string } };
        create: EmployeeProfilePersistence;
        update: EmployeeProfilePersistence;
    }): Promise<void>;
}

interface UserDelegate {
    update(args: {
        where: { id: string };
        data: UserActivationPayload;
    }): Promise<void>;
}

interface TransactionCapableClient {
    $transaction<R>(handler: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R>;
}

function getMembershipDelegate(client: unknown): MembershipDelegate {
    const delegateHolder = client as { membership?: unknown };
    const delegate = delegateHolder.membership;
    if (!delegate || typeof delegate !== 'object') {
        throw new Error('Membership delegate is not available on the Prisma client.');
    }

    const candidate = delegate as Partial<MembershipDelegate>;
    if (
        typeof candidate.findUnique !== 'function' ||
        typeof candidate.create !== 'function' ||
        typeof candidate.update !== 'function'
    ) {
        throw new Error('Membership delegate is missing required methods.');
    }

    return candidate as MembershipDelegate;
}

function getEmployeeProfileDelegate(client: unknown): EmployeeProfileDelegate {
    const delegateHolder = client as { employeeProfile?: unknown };
    const delegate = delegateHolder.employeeProfile;
    if (!delegate || typeof delegate !== 'object') {
        throw new Error('EmployeeProfile delegate is not available on the Prisma client.');
    }

    const candidate = delegate as Partial<EmployeeProfileDelegate>;
    if (typeof candidate.upsert !== 'function') {
        throw new Error('EmployeeProfile delegate is missing required methods.');
    }

    return candidate as EmployeeProfileDelegate;
}

function getUserDelegate(client: unknown): UserDelegate {
    const delegateHolder = client as { user?: unknown };
    const delegate = delegateHolder.user;
    if (!delegate || typeof delegate !== 'object') {
        throw new Error('User delegate is not available on the Prisma client.');
    }

    const candidate = delegate as Partial<UserDelegate>;
    if (typeof candidate.update !== 'function') {
        throw new Error('User delegate is missing required methods.');
    }

    return candidate as UserDelegate;
}

function runTransaction<R>(client: unknown, handler: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R> {
    const candidate = client as Partial<TransactionCapableClient>;
    if (typeof candidate.$transaction !== 'function') {
        throw new Error('Prisma client is missing $transaction support.');
    }

    return candidate.$transaction(handler);
}

function coerceMembershipStatus(value: string | null): SafeMembershipStatus {
    if (value) {
        const candidate = value as SafeMembershipStatus;
        if (MEMBERSHIP_STATUSES.includes(candidate)) {
            return candidate;
        }
    }

    throw new Error('Invalid membership status value received.');
}

function coerceEmploymentType(value: string | null): SafeEmploymentType {
    if (value) {
        const candidate = value as SafeEmploymentType;
        if (EMPLOYMENT_TYPES.includes(candidate)) {
            return candidate;
        }
    }

    return DEFAULT_EMPLOYMENT_TYPE;
}
