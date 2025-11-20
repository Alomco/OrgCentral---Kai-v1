import type { IGuardMembershipRepository, GuardMembershipRecord } from '@/server/repositories/contracts/security/guard-membership-repository-contract';
import { mapPrismaGuardMembershipToRecord, guardMembershipInclude, type GuardMembershipWithOrg } from '@/server/repositories/mappers/security/guard/guard-membership-mapper';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';

export class PrismaGuardMembershipRepository
    extends BasePrismaRepository
    implements IGuardMembershipRepository {
    async findMembership(orgId: string, userId: string): Promise<GuardMembershipRecord | null> {
        const membership = await getModelDelegate(this.prisma, 'membership').findUnique({
            where: { orgId_userId: { orgId, userId } },
            include: guardMembershipInclude,
        });

        if (!membership) {
            return null;
        }

        return mapPrismaGuardMembershipToRecord(membership as GuardMembershipWithOrg);
    }
}
