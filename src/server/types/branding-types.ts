import type { PrismaJsonValue } from '@/server/types/prisma';

export interface OrgBranding {
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    companyName?: string | null;
    faviconUrl?: string | null;
    customCss?: string | null;
    metadata?: PrismaJsonValue;
    updatedAt?: Date | null;
}

export interface OrgBrandingRecord {
    orgId: string;
    branding: OrgBranding | null;
    updatedAt?: Date | string | null;
    metadata?: PrismaJsonValue | null;
}

export interface PlatformBranding {
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    companyName?: string | null;
    customCss?: string | null;
    faviconUrl?: string | null;
    metadata?: PrismaJsonValue;
    updatedAt?: Date | null;
}
