import { z } from 'zod';

export const createTimeEntrySchema = z.object({
    date: z.string().min(1, 'Date is required'),
    clockIn: z.string().min(1, 'Clock in time is required'),
    clockOut: z.string().optional(),
    breakDuration: z.coerce.number().min(0, 'Break duration must be positive').optional(),
    project: z.string().optional(),
    projectCode: z.string().max(120, 'Project code must be 120 characters or less').optional(),
    tasks: z.string().max(500, 'Tasks must be 500 characters or less').optional(),
    billable: z.enum(['on', 'off']).optional(),
    overtimeReason: z.string().max(500, 'Overtime reason must be 500 characters or less').optional(),
    notes: z.string().optional(),
});

export type CreateTimeEntryFormValues = z.infer<typeof createTimeEntrySchema>;
