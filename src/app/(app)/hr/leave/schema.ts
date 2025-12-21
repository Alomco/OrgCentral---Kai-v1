import { z } from 'zod';

export const leaveRequestFormValuesSchema = z.object({
    leaveType: z.string().trim().min(2).max(64),
    startDate: z.string().trim().min(10).max(10),
    endDate: z.string().trim().min(10).max(10).optional(),
    totalDays: z.coerce.number().positive().max(365),
    isHalfDay: z.coerce.boolean().optional(),
    reason: z.string().trim().max(2000).optional(),
});

export type LeaveRequestFormValues = z.infer<typeof leaveRequestFormValuesSchema>;
