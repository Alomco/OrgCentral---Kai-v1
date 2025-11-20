import type { Prisma } from '@prisma/client';
import type { GuardMembershipRecord } from '@/server/repositories/contracts/security';
import { isJsonObject } from '@/server/repositories/prisma/helpers/prisma-utils';

export const guardMembershipInclude = {
    org: {
        select: {
            id: true,
            name: true,
            dataResidency: true,
            dataClassification: true,
        },
    },
    role: { select: { name: true } },
} satisfies Prisma.MembershipInclude;

export type GuardMembershipWithOrg = Prisma.MembershipGetPayload<{
    include: typeof guardMembershipInclude;
}>;

export function mapPrismaGuardMembershipToRecord(record: GuardMembershipWithOrg): GuardMembershipRecord {
    const metadata = isJsonObject(record.metadata)
        ? (record.metadata as Record<string, unknown>)
        : null;

    return {
        orgId: record.orgId,
        userId: record.userId,
        roleName: record.role?.name ?? null,
        metadata,
        organization: {
            id: record.org.id,
            name: record.org.name,
            dataResidency: record.org.dataResidency,
            dataClassification: record.org.dataClassification,
        },
    };
}
