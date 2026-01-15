import { getModelDelegate, type PrismaClientBase } from '@/server/repositories/prisma/helpers/prisma-utils';
import type { UserListFilters, UserSortInput } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { Prisma } from '@/server/types/prisma';

export async function resolvePrimaryRoleId(
    prisma: PrismaClientBase,
    orgId: string,
    roles: string[],
): Promise<string | null> {
    if (!roles.length) {
        return null;
    }
    const roleName = roles[0];
    const role = await getModelDelegate(prisma, 'role').findUnique({
        where: { orgId_name: { orgId, name: roleName } },
        select: { id: true },
    });
    return role?.id ?? null;
}

export function buildUserMembershipWhere(
    organizationId: string,
    filters?: UserListFilters,
): Prisma.MembershipWhereInput {
    const searchValue = filters?.search?.trim() ?? '';
    const roleValue = filters?.role?.trim() ?? '';
    const whereClause: Prisma.MembershipWhereInput = {
        orgId: organizationId,
    };

    if (filters?.status) {
        whereClause.status = filters.status;
    }

    if (roleValue) {
        whereClause.role = { name: roleValue };
    }

    if (searchValue) {
        whereClause.user = {
            OR: [
                { email: { contains: searchValue, mode: 'insensitive' } },
                { displayName: { contains: searchValue, mode: 'insensitive' } },
            ],
        };
    }

    return whereClause;
}

export function buildUserMembershipOrderBy(
    sort?: UserSortInput,
): Prisma.MembershipOrderByWithRelationInput[] {
    const direction = sort?.direction ?? 'asc';

    if (!sort) {
        return [{ user: { email: 'asc' } }];
    }

    switch (sort.key) {
        case 'name':
            return [
                { user: { displayName: direction } },
                { user: { email: 'asc' } },
            ];
        case 'email':
            return [{ user: { email: direction } }];
        case 'status':
            return [
                { status: direction },
                { user: { email: 'asc' } },
            ];
        case 'role':
            return [
                { role: { name: direction } },
                { user: { email: 'asc' } },
            ];
        default:
            return [{ user: { email: 'asc' } }];
    }
}
