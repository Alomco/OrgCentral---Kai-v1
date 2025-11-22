import type { OrgBranding } from '@/server/types/branding-types';
import type { JsonValue } from '@/server/repositories/prisma/helpers/prisma-utils';
import { normalizeMetadata } from '@/server/repositories/mappers/metadata';

export type OrgBrandingRecord = {
    orgId: string;
    branding: OrgBranding | null;
    updatedAt?: Date | string | null;
    metadata?: JsonValue | null;
};

export function mapOrgBrandingRecordToDomain(record: OrgBrandingRecord | null): OrgBranding | null {
    if (!record) return null;
    return {
        ...(record.branding ?? {}),
        metadata: normalizeMetadata(record.metadata),
        updatedAt:
            record.updatedAt === undefined || record.updatedAt === null
                ? null
                : record.updatedAt instanceof Date
                    ? record.updatedAt
                    : new Date(record.updatedAt),
    };
}

export function mapOrgBrandingUpdateToRecord(updates: Partial<OrgBranding>): Partial<OrgBrandingRecord> {
    return { branding: updates };
}
