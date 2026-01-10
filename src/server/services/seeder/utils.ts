import { type Prisma, MembershipStatus } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';

export const SEEDED_METADATA_KEY = 'devSeeded';
export const PLATFORM_ORG_SLUG = 'orgcentral-platform';
export const UNKNOWN_ERROR_MESSAGE = 'Unknown error';

export interface SeedResult {
    success: boolean;
    message: string;
    count?: number;
}

export async function getDefaultOrg() {
    let org = await prisma.organization.findFirst({
        where: { slug: PLATFORM_ORG_SLUG },
    });
    // Fallback for dev: Just take the first org we find
    org ??= await prisma.organization.findFirst();
    if (!org) { throw new Error('No organizations found. Please bootstrap an org first.'); }
    return org;
}

export async function getActiveMembers(orgId: string, limit = 50) {
    return prisma.membership.findMany({
        where: { orgId, status: MembershipStatus.ACTIVE },
        take: limit,
    });
}

export function getSeededMetadata(extra: Record<string, unknown> = {}): Prisma.InputJsonValue {
    return {
        [SEEDED_METADATA_KEY]: true,
        seededAt: new Date().toISOString(),
        ...extra,
    } as Prisma.InputJsonValue;
}
