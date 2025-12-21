/**
 * Mappers for Membership entities
 * Converts between domain models and Prisma/client models
 */
import type { Membership } from '@/server/types/membership';
import type { Membership as PrismaMembership } from '@prisma/client';
import type { Organization } from '@prisma/client';

export interface MembershipMetadata {
    dataResidency?: string;
    dataClassification?: string;
    auditSource?: string;
    auditBatchId?: string | null;
}

export function mapPrismaMembershipToDomain(
    record: PrismaMembership & { org?: Organization | null; role?: { name: string } | null },
): Membership {
    const roleName = record.role?.name;

    return {
        organizationId: record.orgId,
        organizationName: record.org?.name ?? record.orgId,
        roles: roleName ? [roleName] : [],
        status: record.status,
    };
}

export function buildMembershipMetadata(scope?: {
    dataResidency?: string;
    dataClassification?: string;
    auditSource?: string;
    auditBatchId?: string | null;
}) {
    return {
        dataResidency: scope?.dataResidency,
        dataClassification: scope?.dataClassification,
        auditSource: scope?.auditSource,
        auditBatchId: scope?.auditBatchId ?? null,
    } as MembershipMetadata;
}
