import type { OrgBranding, OrgBrandingRecord } from '@/server/types/branding-types';

export function mapOrgBrandingRecordToDomain(record: OrgBrandingRecord | null): OrgBranding | null {
    if (!record) { return null; }
    return {
        ...(record.branding ?? {}),
        metadata: record.metadata ?? undefined,
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
