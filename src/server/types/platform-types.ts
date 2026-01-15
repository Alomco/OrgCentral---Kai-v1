import type { PrismaJsonValue } from '@/server/types/prisma';

export interface AppPermission {
    id: string;
    name: string;
    description?: string;
    category: string;
    isGlobal: boolean;
    metadata?: PrismaJsonValue;
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
