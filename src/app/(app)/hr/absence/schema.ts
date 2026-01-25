import { z } from 'zod';

const durationTypeValues = ['DAYS', 'HOURS'] as const;

function emptyToUndefined(value: unknown): unknown {
    if (typeof value !== 'string') {
        return value;
    }
    return value.trim().length === 0 ? undefined : value;
}

export const reportAbsenceSchema = z
    .object({
        typeId: z.string().min(1, 'Type is required'),
        durationType: z.enum(durationTypeValues),
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().optional(),
        startTime: z.preprocess(emptyToUndefined, z.string().optional()),
        endTime: z.preprocess(emptyToUndefined, z.string().optional()),
        hours: z
            .preprocess(emptyToUndefined, z.coerce.number().min(0.25, 'Hours must be at least 0.25'))
            .optional()
            .refine((value) => value === undefined || value <= 24, {
                message: 'Hours cannot exceed 24',
            }),
        reason: z.string().optional(),
    })
    .superRefine((value, context) => {
        if (value.durationType !== 'HOURS') {
            return;
        }

        if (!value.startTime) {
            context.addIssue({ code: 'custom', path: ['startTime'], message: 'Start time is required.' });
        }
        if (!value.endTime) {
            context.addIssue({ code: 'custom', path: ['endTime'], message: 'End time is required.' });
        }
        if (value.endDate && value.endDate !== value.startDate) {
            context.addIssue({
                code: 'custom',
                path: ['endDate'],
                message: 'End date must match start date for hourly absences.',
            });
        }
    });

export type ReportAbsenceFormValues = z.infer<typeof reportAbsenceSchema>;

/** Schema for cancelling an absence. */
export const cancelAbsenceSchema = z.object({
    reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

export type CancelAbsenceFormValues = z.infer<typeof cancelAbsenceSchema>;

