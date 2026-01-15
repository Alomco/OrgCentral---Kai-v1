import { TimeEntryStatus } from '@/server/types/prisma';
import { z } from 'zod';

const TIME_ENTRY_STATUS_VALUES = Object.values(TimeEntryStatus) as [
    TimeEntryStatus,
    ...TimeEntryStatus[],
];

const TIME_ENTRY_DECISION_VALUES = [
    TimeEntryStatus.APPROVED,
    TimeEntryStatus.REJECTED,
] as const;

const taskListSchema = z
    .array(z.string().trim().min(1).max(200))
    .min(0)
    .max(200);

export const timeEntryFiltersSchema = z.object({
    userId: z.uuid().optional(),
    status: z.enum(TIME_ENTRY_STATUS_VALUES).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
});

export const createTimeEntrySchema = z
    .object({
        userId: z.uuid(),
        date: z.coerce.date().optional(),
        clockIn: z.coerce.date(),
        clockOut: z.coerce.date().optional().nullable(),
        totalHours: z.coerce.number().nonnegative().max(24).optional().nullable(),
        breakDuration: z.coerce.number().nonnegative().max(24).optional().nullable(),
        project: z.string().trim().max(200).optional().nullable(),
        tasks: taskListSchema.optional().nullable(),
        notes: z.string().trim().max(2000).optional().nullable(),
        status: z.enum(TIME_ENTRY_STATUS_VALUES).optional(),
        metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    })
    .refine((value) => !value.clockOut || value.clockOut.getTime() > value.clockIn.getTime(), {
        message: 'Clock-out time must be after clock-in time.',
        path: ['clockOut'],
    });

export const updateTimeEntrySchema = z
    .object({
        clockIn: z.coerce.date().optional(),
        clockOut: z.coerce.date().optional().nullable(),
        totalHours: z.coerce.number().nonnegative().max(24).optional().nullable(),
        breakDuration: z.coerce.number().nonnegative().max(24).optional().nullable(),
        project: z.string().trim().max(200).optional().nullable(),
        tasks: taskListSchema.optional().nullable(),
        notes: z.string().trim().max(2000).optional().nullable(),
        status: z.enum(TIME_ENTRY_STATUS_VALUES).optional(),
        metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    })
    .refine((value) => {
        if (!value.clockIn || value.clockOut === undefined || value.clockOut === null) {
            return true;
        }
        return value.clockOut.getTime() > value.clockIn.getTime();
    }, {
        message: 'Clock-out time must be after clock-in time.',
        path: ['clockOut'],
    })
    .strict();

export const approveTimeEntrySchema = z.object({
    status: z.enum(TIME_ENTRY_DECISION_VALUES).optional(),
    comments: z.string().trim().max(2000).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type TimeEntryFilters = z.infer<typeof timeEntryFiltersSchema>;
export type CreateTimeEntryPayload = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryPayload = z.infer<typeof updateTimeEntrySchema>;
export type ApproveTimeEntryPayload = z.infer<typeof approveTimeEntrySchema>;
