import type { PrismaJsonValue } from '@/server/types/prisma';

export interface ManagedOrganizationSummary {
    orgId: string;
    orgName: string;
    ownerEmail: string;
    planId: string;
    moduleAccess: Record<string, boolean>;
    metadata?: PrismaJsonValue;
    createdAt: Date;
    updatedAt: Date;
}

export interface ManagedOrganizationRecord {
    orgId: string;
    orgName: string;
    ownerEmail: string;
    planId: string;
    moduleAccess: Record<string, boolean> | PrismaJsonValue | null | undefined;
    metadata?: PrismaJsonValue | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}
