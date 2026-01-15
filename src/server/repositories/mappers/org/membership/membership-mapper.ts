/**
 * Mappers for Membership entities
 * Converts between domain models and Prisma/client models
 */
import type { Membership } from '@/server/types/membership';
import type { MembershipRecord } from '@/server/types/membership';

export interface MembershipMetadata {
    dataResidency?: string;
    dataClassification?: string;
    auditSource?: string;
    auditBatchId?: string | null;
}

export function mapPrismaMembershipToDomain(
    record: MembershipRecord,
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
