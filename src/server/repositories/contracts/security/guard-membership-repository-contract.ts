/**
 * Contract for repositories that provide guard-facing membership lookups.
 * Guards use it to enforce zero-trust access without touching Prisma directly.
 */
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface GuardMembershipRecord {
    orgId: string;
    userId: string;
    roleName?: string | null;
    metadata?: Record<string, unknown> | null;
    organization: {
        id: string;
        name?: string | null;
        dataResidency: DataResidencyZone;
        dataClassification: DataClassificationLevel;
    };
}

export interface IGuardMembershipRepository {
    findMembership(orgId: string, userId: string): Promise<GuardMembershipRecord | null>;
}
