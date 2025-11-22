export interface ManagedOrganizationSummary {
    orgId: string;
    orgName: string;
    ownerEmail: string;
    planId: string;
    moduleAccess: Record<string, boolean>;
    metadata?: import('@prisma/client').Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
}
