import { type Prisma } from '@prisma/client';

export interface AppPermission {
    id: string;
    name: string;
    description?: string;
    category: string;
    isGlobal: boolean;
    metadata?: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
}

export interface EnterpriseSettings {
    allowSignups: boolean;
    maintenanceMode: boolean;
    defaultTrialDays: number;
    supportEmail: string;
    termsUrl?: string;
    privacyUrl?: string;
}
