import { HR_TIME_TRACKING_LIMITS } from '@/server/constants/hr-limits';
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
    .array(z.string().trim().min(1).max(HR_TIME_TRACKING_LIMITS.TASKS_MAX_LENGTH))
    .min(0)
    .max(HR_TIME_TRACKING_LIMITS.TASKS_MAX_COUNT);

function optionalBoundedNumber(max: number) {
    return z.preprocess(
        (value) => {
            if (value === undefined || value === '') {
                return undefined;
            }
            if (value === null) {
                return null;
            }
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if (!trimmed) {
                    return undefined;
                }
                return Number(trimmed);
            }
            return value;
        },
        z.union([z.number().nonnegative().max(max), z.null()]).optional(),
    );
}

const timeEntryMetadataPatchSchema = z
    .object({
        billable: z.boolean().optional().nullable(),
        projectCode: z.string().trim().max(HR_TIME_TRACKING_LIMITS.PROJECT_CODE_MAX_LENGTH).optional().nullable(),
        overtimeReason: z.string().trim().max(HR_TIME_TRACKING_LIMITS.OVERTIME_REASON_MAX_LENGTH).optional().nullable(),
        overtimeHours: optionalBoundedNumber(HR_TIME_TRACKING_LIMITS.MAX_HOURS_PER_DAY),
    })
    .strict();

export const timeEntryFiltersSchema = z.object({
    userId: z.uuid().optional(),
    status: z.enum(TIME_ENTRY_STATUS_VALUES).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
}).strict();

export const createTimeEntrySchema = z
    .object({
        userId: z.uuid(),
        date: z.coerce.date().optional(),
        clockIn: z.coerce.date(),
        clockOut: z.coerce.date().optional().nullable(),
        totalHours: optionalBoundedNumber(HR_TIME_TRACKING_LIMITS.MAX_HOURS_PER_DAY),
        breakDuration: optionalBoundedNumber(HR_TIME_TRACKING_LIMITS.BREAK_DURATION_MAX_HOURS),
        project: z.string().trim().max(HR_TIME_TRACKING_LIMITS.PROJECT_MAX_LENGTH).optional().nullable(),
        projectCode: z.string().trim().max(HR_TIME_TRACKING_LIMITS.PROJECT_CODE_MAX_LENGTH).optional().nullable(),
        tasks: taskListSchema.optional().nullable(),
        billable: z.boolean().optional().nullable(),
        overtimeReason: z.string().trim().max(HR_TIME_TRACKING_LIMITS.OVERTIME_REASON_MAX_LENGTH).optional().nullable(),
        notes: z.string().trim().max(HR_TIME_TRACKING_LIMITS.NOTES_MAX_LENGTH).optional().nullable(),
        status: z.enum(TIME_ENTRY_STATUS_VALUES).optional(),
        metadata: timeEntryMetadataPatchSchema.optional().nullable(),
    })
    .refine((value) => !value.clockOut || value.clockOut.getTime() > value.clockIn.getTime(), {
        message: 'Clock-out time must be after clock-in time.',
        path: ['clockOut'],
    })
    .strict();

export const updateTimeEntrySchema = z
    .object({
        clockIn: z.coerce.date().optional(),
        clockOut: z.coerce.date().optional().nullable(),
        totalHours: optionalBoundedNumber(HR_TIME_TRACKING_LIMITS.MAX_HOURS_PER_DAY),
        breakDuration: optionalBoundedNumber(HR_TIME_TRACKING_LIMITS.BREAK_DURATION_MAX_HOURS),
        project: z.string().trim().max(HR_TIME_TRACKING_LIMITS.PROJECT_MAX_LENGTH).optional().nullable(),
        projectCode: z.string().trim().max(HR_TIME_TRACKING_LIMITS.PROJECT_CODE_MAX_LENGTH).optional().nullable(),
        tasks: taskListSchema.optional().nullable(),
        billable: z.boolean().optional().nullable(),
        overtimeReason: z.string().trim().max(HR_TIME_TRACKING_LIMITS.OVERTIME_REASON_MAX_LENGTH).optional().nullable(),
        notes: z.string().trim().max(HR_TIME_TRACKING_LIMITS.NOTES_MAX_LENGTH).optional().nullable(),
        status: z.enum(TIME_ENTRY_STATUS_VALUES).optional(),
        metadata: timeEntryMetadataPatchSchema.optional().nullable(),
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
    comments: z.string().trim().max(HR_TIME_TRACKING_LIMITS.NOTES_MAX_LENGTH).optional().nullable(),
    metadata: timeEntryMetadataPatchSchema.optional().nullable(),
}).strict();

export type TimeEntryFilters = z.infer<typeof timeEntryFiltersSchema>;
export type TimeEntryMetadataPatch = z.infer<typeof timeEntryMetadataPatchSchema>;
export type CreateTimeEntryPayload = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryPayload = z.infer<typeof updateTimeEntrySchema>;
export type ApproveTimeEntryPayload = z.infer<typeof approveTimeEntrySchema>;
