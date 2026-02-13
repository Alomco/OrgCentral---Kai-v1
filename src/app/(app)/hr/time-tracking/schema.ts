import { z } from 'zod';

import { HR_TIME_TRACKING_LIMITS } from '@/server/constants/hr-limits';

function buildCharLimitMessage(label: string, limit: number): string {
    return label + ' must be ' + String(limit) + ' characters or less';
}

const tasksInputSchema = z
    .string()
    .optional()
    .superRefine((value, context) => {
        if (!value) {
            return;
        }

        const tasks = value
            .split(/[,\n]/)
            .map((task) => task.trim())
            .filter(Boolean);

        if (tasks.length > HR_TIME_TRACKING_LIMITS.TASKS_MAX_COUNT) {
            context.addIssue({
                code: 'custom',
                message: 'Tasks must be ' + String(HR_TIME_TRACKING_LIMITS.TASKS_MAX_COUNT) + ' items or less.',
            });
            return;
        }

        const overlongTask = tasks.find((task) => task.length > HR_TIME_TRACKING_LIMITS.TASKS_MAX_LENGTH);
        if (overlongTask) {
            context.addIssue({
                code: 'custom',
                message: 'Each task must be ' + String(HR_TIME_TRACKING_LIMITS.TASKS_MAX_LENGTH) + ' characters or less.',
            });
        }
    });

export const createTimeEntrySchema = z.object({
    date: z.string().min(1, 'Date is required'),
    clockIn: z.string().min(1, 'Clock in time is required'),
    clockOut: z.string().optional(),
    breakDuration: z.coerce
        .number()
        .min(0, 'Break duration must be positive')
        .max(
            HR_TIME_TRACKING_LIMITS.BREAK_DURATION_MAX_HOURS,
            'Break duration must be ' + String(HR_TIME_TRACKING_LIMITS.BREAK_DURATION_MAX_HOURS) + ' hours or less',
        )
        .optional(),
    project: z
        .string()
        .max(
            HR_TIME_TRACKING_LIMITS.PROJECT_MAX_LENGTH,
            buildCharLimitMessage('Project', HR_TIME_TRACKING_LIMITS.PROJECT_MAX_LENGTH),
        )
        .optional(),
    projectCode: z
        .string()
        .max(
            HR_TIME_TRACKING_LIMITS.PROJECT_CODE_MAX_LENGTH,
            buildCharLimitMessage('Project code', HR_TIME_TRACKING_LIMITS.PROJECT_CODE_MAX_LENGTH),
        )
        .optional(),
    tasks: tasksInputSchema,
    billable: z.enum(['on', 'off']).optional(),
    overtimeReason: z
        .string()
        .max(
            HR_TIME_TRACKING_LIMITS.OVERTIME_REASON_MAX_LENGTH,
            buildCharLimitMessage('Overtime reason', HR_TIME_TRACKING_LIMITS.OVERTIME_REASON_MAX_LENGTH),
        )
        .optional(),
    notes: z
        .string()
        .max(
            HR_TIME_TRACKING_LIMITS.NOTES_MAX_LENGTH,
            buildCharLimitMessage('Notes', HR_TIME_TRACKING_LIMITS.NOTES_MAX_LENGTH),
        )
        .optional(),
});

export type CreateTimeEntryFormValues = z.infer<typeof createTimeEntrySchema>;
