import type { Prisma } from '@prisma/client';

export interface ManagedOrganizationSummary {
    orgId: string;
    orgName: string;
    ownerEmail: string;
    planId: string;
    moduleAccess: Record<string, boolean>;
    metadata?: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
}
