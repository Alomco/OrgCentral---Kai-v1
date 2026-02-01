import { z } from 'zod';
import type { AbsenceSettings } from '@/server/types/hr-ops-types';

export const absenceSettingsFormSchema = z
    .object({
        hoursInWorkDay: z.coerce
            .number({ message: 'Enter a valid number of hours.' })
            .min(1, { message: 'Hours per day must be at least 1.' })
            .max(24, { message: 'Hours per day must be 24 or less.' }),
        roundingRule: z.string().trim().max(64).optional().default(''),
    })
    .strict();

export type AbsenceSettingsFormValues = z.infer<typeof absenceSettingsFormSchema>;

export function deriveAbsenceSettingsDefaults(settings: AbsenceSettings): AbsenceSettingsFormValues {
    const hours = typeof settings.hoursInWorkDay === 'number'
        ? settings.hoursInWorkDay
        : Number(settings.hoursInWorkDay);

    return {
        hoursInWorkDay: Number.isFinite(hours) && hours > 0 ? hours : 8,
        roundingRule: settings.roundingRule ?? '',
    };
}
