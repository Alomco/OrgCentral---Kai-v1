import type { Prisma, Membership as PrismaMembership, Organization } from '@prisma/client';
import { MembershipStatus } from '@prisma/client';
import { OrgScopedPrismaRepository } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import type {
  IUserRepository,
  UserListFilters,
  UserPagedQuery,
} from '@/server/repositories/contracts/org/users/user-repository-contract';
import { mapPrismaUserToDomain } from '@/server/repositories/mappers/org/users/user-mapper';
import { mapPrismaMembershipToDomain } from '@/server/repositories/mappers/org/membership/membership-mapper';
import type { UserData } from '@/server/types/leave-types';
import type { User } from '@/server/types/hr-types';
import type { Membership } from '@/server/types/membership';
import type { UserFilters, UserCreationData, UserUpdateData } from './prisma-user-repository.types';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
  addUserToOrganization as addUserToOrganizationTx,
  countUsersInOrganization as countUsersInOrganizationTx,
  getUsersInOrganization as getUsersInOrganizationTx,
  getUsersInOrganizationPaged as getUsersInOrganizationPagedTx,
  removeUserFromOrganization as removeUserFromOrganizationTx,
  upsertUserMemberships as upsertUserMembershipsTx,
} from './prisma-user-repository.memberships';

export class PrismaUserRepository extends OrgScopedPrismaRepository implements IUserRepository {

  async findById(id: string): Promise<User | null> {
    const rec = await getModelDelegate(this.prisma, 'user').findUnique({ where: { id } });
    if (!rec) { return null; }
    return mapPrismaUserToDomain(rec);
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();
    const rec = await getModelDelegate(this.prisma, 'user').findUnique({ where: { email: normalizedEmail } });
    if (!rec) { return null; }
    return mapPrismaUserToDomain(rec);
  }

  async userExistsByEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase();
    const rec = await getModelDelegate(this.prisma, 'user').findFirst({ where: { email: normalizedEmail } });
    return Boolean(rec);
  }

  async findAll(filters?: UserFilters): Promise<User[]> {
    const whereClause: Prisma.UserWhereInput = {};

    if (filters?.email) {
      whereClause.email = { contains: filters.email, mode: 'insensitive' };
    }

    if (filters?.status) {
      whereClause.status = { equals: filters.status };
    }

    const records = await getModelDelegate(this.prisma, 'user').findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    return records.map((r) => mapPrismaUserToDomain(r));
  }

  async create(data: UserCreationData): Promise<User> {
    const rec = await getModelDelegate(this.prisma, 'user').create({ data: { ...data, status: MembershipStatus.INVITED } });
    return mapPrismaUserToDomain(rec);
  }

  async update(id: string, data: UserUpdateData): Promise<User> {
    const rec = await getModelDelegate(this.prisma, 'user').update({
      where: { id },
      data,
    });
    return mapPrismaUserToDomain(rec);
  }

  async delete(id: string): Promise<User> {
    const rec = await getModelDelegate(this.prisma, 'user').delete({
      where: { id },
    });
    return mapPrismaUserToDomain(rec);
  }

  async incrementFailedLogin(id: string): Promise<User> {
    return getModelDelegate(this.prisma, 'user').update({
      where: { id },
      data: {
        failedLoginCount: {
          increment: 1
        }
      }
    });
  }

  async resetFailedLogin(id: string): Promise<User> {
    return getModelDelegate(this.prisma, 'user').update({
      where: { id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null
      }
    });
  }

  // --- IUserRepository implementation ---
  async getUser(tenantId: string, userId: string): Promise<UserData | null> {
    const user = await getModelDelegate(this.prisma, 'user').findUnique({ where: { id: userId } });
    if (!user) { return null; }

    // Find memberships for the user that belong to the tenant
    const memberships = await getModelDelegate(this.prisma, 'membership').findMany({
      where: { userId, orgId: tenantId },
      include: { org: true, role: { select: { name: true } } },
    });

    const domainUser = mapPrismaUserToDomain(user);

    const domainMemberships = memberships.map((m) => mapPrismaMembershipToDomain(m as PrismaMembership & { org?: Organization | null }));

    const rolesByOrg: Record<string, string[]> = {};
    const memberOf: string[] = [];
    for (const mem of domainMemberships) {
      memberOf.push(mem.organizationId);
      rolesByOrg[mem.organizationId] = mem.roles;
    }

    return {
      id: domainUser.id,
      email: domainUser.email,
      displayName: domainUser.displayName ?? '',
      roles: [],
      memberships: domainMemberships,
      memberOf,
      rolesByOrg,
      createdAt: domainUser.createdAt.toISOString(),
      updatedAt: domainUser.updatedAt.toISOString(),
    };
  }

  async updateUserMemberships(context: RepositoryAuthorizationContext, userId: string, memberships: Membership[]): Promise<void> {
    await upsertUserMembershipsTx(this.prisma, context, userId, memberships);
  }

  async addUserToOrganization(
    context: RepositoryAuthorizationContext,
    userId: string,
    organizationId: string,
    organizationName: string,
    roles: string[],
  ): Promise<void> {
    await addUserToOrganizationTx(this.prisma, context, userId, organizationId, organizationName, roles);
  }

  async removeUserFromOrganization(context: RepositoryAuthorizationContext, userId: string, organizationId: string): Promise<void> {
    await removeUserFromOrganizationTx(this.prisma, context, userId, organizationId);
  }

  async getUsersInOrganization(context: RepositoryAuthorizationContext, organizationId: string): Promise<UserData[]> {
    return getUsersInOrganizationTx(this.prisma, context, organizationId);
  }

  async countUsersInOrganization(
    context: RepositoryAuthorizationContext,
    organizationId: string,
    filters?: UserListFilters,
  ): Promise<number> {
    return countUsersInOrganizationTx(this.prisma, context, organizationId, filters);
  }

  async getUsersInOrganizationPaged(
    context: RepositoryAuthorizationContext,
    organizationId: string,
    query: UserPagedQuery,
  ): Promise<UserData[]> {
    return getUsersInOrganizationPagedTx(this.prisma, context, organizationId, query);
  }
}

