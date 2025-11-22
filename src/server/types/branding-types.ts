import type { Prisma } from '@prisma/client';

export interface OrgBranding {
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    companyName?: string | null;
    faviconUrl?: string | null;
    customCss?: string | null;
    metadata?: Prisma.JsonValue;
    updatedAt?: Date | null;
}

export interface PlatformBranding {
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    companyName?: string | null;
    customCss?: string | null;
    faviconUrl?: string | null;
    metadata?: Prisma.JsonValue;
    updatedAt?: Date | null;
}
