import { MembershipStatus } from '@prisma/client';
import type { Prisma, PrismaClient } from '@prisma/client';
import { getModelDelegate, buildMembershipMetadataJson, runTransaction } from '@/server/repositories/prisma/helpers/prisma-utils';
import { mapPrismaUserToDomain } from '@/server/repositories/mappers/org/users/user-mapper';
import { mapPrismaMembershipToDomain } from '@/server/repositories/mappers/org/membership/membership-mapper';
import type { UserData } from '@/server/types/leave-types';
import type { Membership } from '@/server/types/membership';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { UserListFilters, UserPagedQuery } from '@/server/repositories/contracts/org/users/user-repository-contract';
import {
  buildUserMembershipOrderBy,
  buildUserMembershipWhere,
  resolvePrimaryRoleId,
} from './prisma-user-repository.helpers';
export type PrismaUserClient = PrismaClient;

function getMembershipDelegate(client: PrismaClient | Prisma.TransactionClient) {
  return getModelDelegate(client, 'membership');
}
type MembershipRecord = Prisma.MembershipGetPayload<{ include: { user: true; role: { select: { name: true } } } }>;

function mapMembershipToUserData(record: MembershipRecord): UserData {
  const domainUser = mapPrismaUserToDomain(record.user);
  const domainMembership = mapPrismaMembershipToDomain(record);
  return {
    id: domainUser.id,
    email: domainUser.email,
    displayName: domainUser.displayName ?? '',
    roles: [],
    memberships: [domainMembership],
    memberOf: [domainMembership.organizationId],
    rolesByOrg: { [domainMembership.organizationId]: domainMembership.roles },
    createdAt: domainUser.createdAt.toISOString(),
    updatedAt: domainUser.updatedAt.toISOString(),
  };
}

export async function upsertUserMemberships(
  prisma: PrismaUserClient,
  context: RepositoryAuthorizationContext,
  userId: string,
  memberships: Membership[],
): Promise<void> {
  await runTransaction(prisma, async (tx) => {
    const membershipDelegate = getMembershipDelegate(tx);
    for (const mem of memberships) {
      if (mem.organizationId !== context.orgId) {
        continue;
      }

      const primaryRoleId = await resolvePrimaryRoleId(tx, context.orgId, mem.roles);
      const now = new Date();

      await membershipDelegate.upsert({
        where: { orgId_userId: { orgId: context.orgId, userId } as Prisma.MembershipOrgIdUserIdCompoundUniqueInput },
        update: {
          roleId: primaryRoleId ?? undefined,
          metadata: buildMembershipMetadataJson(context.tenantScope),
          updatedBy: context.userId,
        },
        create: {
          orgId: context.orgId,
          userId,
          status: MembershipStatus.ACTIVE,
          roleId: primaryRoleId ?? undefined,
          metadata: buildMembershipMetadataJson(context.tenantScope),
          invitedBy: null,
          invitedAt: now,
          activatedAt: now,
          createdBy: context.userId,
          updatedBy: context.userId,
        },
      });
    }
  });
}

export async function addUserToOrganization(
  prisma: PrismaUserClient,
  context: RepositoryAuthorizationContext,
  userId: string,
  organizationId: string,
  _organizationName: string,
  roles: string[],
): Promise<void> {
  if (organizationId !== context.orgId) {
    return;
  }
  const primaryRoleId = await resolvePrimaryRoleId(prisma, organizationId, roles);
  const membershipDelegate = getMembershipDelegate(prisma);
  await membershipDelegate.upsert({
    where: { orgId_userId: { orgId: organizationId, userId } as Prisma.MembershipOrgIdUserIdCompoundUniqueInput },
    create: {
      orgId: organizationId,
      userId,
      status: MembershipStatus.ACTIVE,
      roleId: primaryRoleId ?? undefined,
      metadata: buildMembershipMetadataJson(context.tenantScope),
      createdBy: context.userId,
    },
    update: {
      roleId: primaryRoleId ?? undefined,
      metadata: buildMembershipMetadataJson(context.tenantScope),
      updatedBy: context.userId,
    },
  });
}

export async function removeUserFromOrganization(
  prisma: PrismaUserClient,
  context: RepositoryAuthorizationContext,
  userId: string,
  organizationId: string,
): Promise<void> {
  if (organizationId !== context.orgId) {
    return;
  }
  const membershipDelegate = getMembershipDelegate(prisma);
  await membershipDelegate.delete({
    where: { orgId_userId: { orgId: organizationId, userId } as Prisma.MembershipOrgIdUserIdCompoundUniqueInput },
  });
}

export async function getUsersInOrganization(
  prisma: PrismaUserClient,
  context: RepositoryAuthorizationContext,
  organizationId: string,
): Promise<UserData[]> {
  if (organizationId !== context.orgId) {
    return [];
  }
  const membershipDelegate = getMembershipDelegate(prisma);
  const memberships = await membershipDelegate.findMany({
    where: { orgId: organizationId },
    include: { user: true, role: { select: { name: true } } },
  });
  return memberships.map(mapMembershipToUserData);
}

export async function countUsersInOrganization(
  prisma: PrismaUserClient,
  context: RepositoryAuthorizationContext,
  organizationId: string,
  filters?: UserListFilters,
): Promise<number> {
  if (organizationId !== context.orgId) {
    return 0;
  }
  const whereClause = buildUserMembershipWhere(organizationId, filters);
  const membershipDelegate = getMembershipDelegate(prisma);
  return membershipDelegate.count({ where: whereClause });
}

export async function getUsersInOrganizationPaged(
  prisma: PrismaUserClient,
  context: RepositoryAuthorizationContext,
  organizationId: string,
  query: UserPagedQuery,
): Promise<UserData[]> {
  if (organizationId !== context.orgId) {
    return [];
  }

  const safePage = Math.max(1, Math.floor(query.page));
  const safePageSize = Math.max(1, Math.floor(query.pageSize));
  const skip = (safePage - 1) * safePageSize;

  const membershipDelegate = getMembershipDelegate(prisma);
  const memberships = await membershipDelegate.findMany({
    where: buildUserMembershipWhere(organizationId, query),
    include: { user: true, role: { select: { name: true } } },
    orderBy: buildUserMembershipOrderBy(query.sort),
    skip,
    take: safePageSize,
  });

  return memberships.map(mapMembershipToUserData);
}
