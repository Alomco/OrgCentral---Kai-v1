import { z } from 'zod';
import { MembershipStatus, OrganizationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { OrgRoleKey } from '@/server/security/access-control';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import { prisma } from '@/server/lib/prisma';
import { appLogger } from '@/server/logging/structured-logger';

const CRON_SECRET = process.env.CRON_SECRET;
const CRON_HEADER = 'x-cron-secret';
const BOOLEAN_TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const UUID_ARRAY_SCHEMA = z.array(z.uuid());

export interface CronRequestOptions {
    orgIds?: string[];
    dryRun: boolean;
}

export type OrgActorSkipReason = 'org-not-found' | 'no-actor';

export interface OrgActor {
    orgId: string;
    userId: string;
    role: OrgRoleKey;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
}

export interface OrgActorSkip {
    orgId: string;
    reason: OrgActorSkipReason;
}

export interface OrgActorResolution {
    actors: OrgActor[];
    skipped: OrgActorSkip[];
}

export interface CronTriggerSummary {
    dryRun: boolean;
    totalOrganizations: number;
    jobsEnqueued: number;
    skipped: OrgActorSkip[];
    metadata?: Record<string, unknown>;
}

export function assertCronSecret(request: Request): void {
    if (!CRON_SECRET) {
        throw new Error('Cron secret is not configured. Set CRON_SECRET in the environment.');
    }

    const provided = request.headers.get(CRON_HEADER);
    if (!provided || provided !== CRON_SECRET) {
        const error = new Error('Unauthorized cron request.');
        error.name = 'CronAuthorizationError';
        throw error;
    }
}

export function parseCronRequestOptions(request: Request): CronRequestOptions {
    const url = new URL(request.url);
    const rawOrgIds = url.searchParams.getAll('orgId').map((value) => value.trim()).filter(Boolean);

    let orgIds: string[] | undefined;
    if (rawOrgIds.length > 0) {
        const parsed = UUID_ARRAY_SCHEMA.safeParse(rawOrgIds);
        if (!parsed.success) {
            throw new Error('Invalid orgId parameter. All orgId values must be valid UUIDs.');
        }
        orgIds = Array.from(new Set(parsed.data));
    }

    const dryRunParameter = url.searchParams.get('dryRun');
    return {
        orgIds,
        dryRun: parseBooleanFlag(dryRunParameter),
    } satisfies CronRequestOptions;
}

export async function resolveOrgActors(
    orgIds: string[] | undefined,
    rolePriority: OrgRoleKey[],
): Promise<OrgActorResolution> {
    const uniqueOrgIds = orgIds?.length ? Array.from(new Set(orgIds)) : undefined;

    const organizationWhere: Prisma.OrganizationWhereInput = {
        status: OrganizationStatus.ACTIVE,
    };

    if (uniqueOrgIds?.length) {
        organizationWhere.id = { in: uniqueOrgIds };
    }

    const organizations = await prisma.organization.findMany({
        where: organizationWhere,
        select: {
            id: true,
            dataResidency: true,
            dataClassification: true,
        },
    });

    const orgMap = new Map(
        organizations.map((org) => [org.id, { dataResidency: org.dataResidency, dataClassification: org.dataClassification }]),
    );

    const skipped: OrgActorSkip[] = [];

    if (uniqueOrgIds?.length) {
        for (const requestedOrgId of uniqueOrgIds) {
            if (!orgMap.has(requestedOrgId)) {
                skipped.push({ orgId: requestedOrgId, reason: 'org-not-found' });
                appLogger.warn('cron.org.actor.unavailable', {
                    orgId: requestedOrgId,
                    reason: 'org-not-found',
                });
            }
        }
    }

    if (orgMap.size === 0) {
        return { actors: [], skipped };
    }

    const membershipOrgIds = Array.from(orgMap.keys());

    const memberships = await prisma.membership.findMany({
        where: {
            orgId: { in: membershipOrgIds },
            status: MembershipStatus.ACTIVE,
            role: { name: { in: rolePriority } },
        },
        select: {
            orgId: true,
            userId: true,
            role: { select: { name: true } },
        },
    });

    const rolePriorityMap = new Map(rolePriority.map((role, index) => [role, index]));
    const grouped = new Map<string, { userId: string; role: OrgRoleKey }[]>();

    for (const membership of memberships) {
        const roleName = membership.role?.name;
        if (!isOrgRoleKey(roleName) || !rolePriorityMap.has(roleName)) {
            continue;
        }
        const candidates = grouped.get(membership.orgId) ?? [];
        candidates.push({ userId: membership.userId, role: roleName });
        grouped.set(membership.orgId, candidates);
    }

    const actors: OrgActor[] = [];

    for (const [orgId, orgMetadata] of orgMap.entries()) {
        const candidates = grouped.get(orgId);
        if (!candidates || candidates.length === 0) {
            skipped.push({ orgId, reason: 'no-actor' });
            appLogger.warn('cron.org.actor.unavailable', {
                orgId,
                reason: 'no-actor',
            });
            continue;
        }

        const preferred = [...candidates].sort((a, b) => {
            const aRank = rolePriorityMap.get(a.role) ?? Number.POSITIVE_INFINITY;
            const bRank = rolePriorityMap.get(b.role) ?? Number.POSITIVE_INFINITY;
            return aRank - bRank;
        })[0];

        actors.push({
            orgId,
            userId: preferred.userId,
            role: preferred.role,
            dataResidency: orgMetadata.dataResidency,
            dataClassification: orgMetadata.dataClassification,
        });
    }

    return { actors, skipped };
}

function parseBooleanFlag(value: string | null): boolean {
    if (!value) {
        return false;
    }
    return BOOLEAN_TRUE_VALUES.has(value.trim().toLowerCase());
}

function isOrgRoleKey(value: string | null | undefined): value is OrgRoleKey {
    return value === 'owner' || value === 'orgAdmin' || value === 'compliance' || value === 'member';
}
