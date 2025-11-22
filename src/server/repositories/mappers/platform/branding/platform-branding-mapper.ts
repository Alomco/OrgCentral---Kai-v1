import type { PlatformBranding } from '@/server/types/branding-types';
import type { JsonValue } from '@/server/repositories/prisma/helpers/prisma-utils';
import { normalizeMetadata } from '@/server/repositories/mappers/metadata';

export type PlatformBrandingRecord = {
    branding: PlatformBranding | null;
    updatedAt?: Date | string | null;
    metadata?: JsonValue | null;
};

export function mapPlatformBrandingRecordToDomain(record: PlatformBrandingRecord | null): PlatformBranding | null {
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

export function mapPlatformBrandingUpdateToRecord(
    updates: Partial<PlatformBranding>,
): Partial<PlatformBrandingRecord> {
    return { branding: updates };
}
