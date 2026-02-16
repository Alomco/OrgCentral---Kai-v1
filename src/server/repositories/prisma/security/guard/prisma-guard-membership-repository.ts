import type { IGuardMembershipRepository, GuardMembershipRecord } from '@/server/repositories/contracts/security/guard-membership-repository-contract';
import { mapPrismaGuardMembershipToRecord, guardMembershipInclude, type GuardMembershipWithOrg } from '@/server/repositories/mappers/security/guard/guard-membership-mapper';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { appLogger } from '@/server/logging/structured-logger';
import { z } from 'zod';

const uuidSchema = z.uuid();
const membershipLookupSchema = z.object({
    orgId: uuidSchema,
    userId: uuidSchema,
});

export class PrismaGuardMembershipRepository
    extends BasePrismaRepository
    implements IGuardMembershipRepository {
    async findMembership(orgId: string, userId: string): Promise<GuardMembershipRecord | null> {
        const parsedLookup = membershipLookupSchema.safeParse({ orgId, userId });
        if (!parsedLookup.success) {
            appLogger.warn('security.guard.invalid_membership_lookup', {
                orgIdValid: uuidSchema.safeParse(orgId).success,
                userIdValid: uuidSchema.safeParse(userId).success,
            });
            return null;
        }

        const membership = await getModelDelegate(this.prisma, 'membership').findUnique({
            where: { orgId_userId: parsedLookup.data },
            include: guardMembershipInclude,
        });

        if (!membership) {
            return null;
        }

        return mapPrismaGuardMembershipToRecord(membership as GuardMembershipWithOrg);
    }
}
