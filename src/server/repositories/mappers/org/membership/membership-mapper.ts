/**
 * Mappers for Membership entities
 * Converts between domain models and Prisma/client models
 */
import type { Membership } from '@/server/types/membership';
import type { Membership as PrismaMembership } from '@prisma/client';
import type { Organization } from '@prisma/client';

export interface MembershipMetadata {
    roles?: string[];
    dataResidency?: string;
    dataClassification?: string;
    auditSource?: string;
    auditBatchId?: string | null;
}

export function mapPrismaMembershipToDomain(record: PrismaMembership & { org?: Organization | null }): Membership {
    const metadata = (record.metadata as MembershipMetadata | null) ?? {};

    return {
        organizationId: record.orgId,
        organizationName: record.org?.name ?? record.orgId,
        roles: metadata.roles ?? [],
    };
}

export function buildMembershipMetadata(roles: string[], scope?: { dataResidency?: string; dataClassification?: string; auditSource?: string; auditBatchId?: string | null; }) {
    return {
        roles: [...roles],
        dataResidency: scope?.dataResidency,
        dataClassification: scope?.dataClassification,
        auditSource: scope?.auditSource,
        auditBatchId: scope?.auditBatchId ?? null,
    } as MembershipMetadata;
}
