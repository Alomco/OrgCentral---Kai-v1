import { z, type ZodType } from 'zod';
import type { EnterpriseSettings } from '@/server/types/platform-types';

export const enterpriseSettingsUpdateSchema: ZodType<Partial<EnterpriseSettings>> = z.object({
    allowSignups: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
    defaultTrialDays: z.number().int().min(1).max(365).optional(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    supportEmail: z.string().email().optional(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    termsUrl: z.string().url().optional(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    privacyUrl: z.string().url().optional(),
}).strict();

export const enterpriseSettingsSchema: ZodType<EnterpriseSettings> = z.object({
    allowSignups: z.boolean(),
    maintenanceMode: z.boolean(),
    defaultTrialDays: z.number().int().min(1).max(365),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    supportEmail: z.string().email(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    termsUrl: z.string().url().optional(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    privacyUrl: z.string().url().optional(),
});

export function parseEnterpriseSettingsUpdate(input: unknown): Partial<EnterpriseSettings> {
    return enterpriseSettingsUpdateSchema.parse(input);
}
