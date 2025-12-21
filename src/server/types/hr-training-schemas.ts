import { z } from 'zod';

const TRAINING_STATUS_MAX_LENGTH = 50;
const TRAINING_TEXT_MAX_LENGTH = 200;
const nullableDate = z.coerce.date().optional().nullable();
const nullableString = (length: number) =>
    z.string().trim().max(length).optional().nullable();

export const trainingRecordFiltersSchema = z.object({
    status: z.string().trim().max(TRAINING_STATUS_MAX_LENGTH).optional(),
    trainingTitle: z.string().trim().max(TRAINING_TEXT_MAX_LENGTH).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    expiryBefore: z.coerce.date().optional(),
    expiryAfter: z.coerce.date().optional(),
    employeeId: z.uuid().optional(),
    userId: z.uuid().optional(),
});

export const enrollTrainingSchema = z
    .object({
        userId: z.uuid(),
        courseName: z.string().trim().min(1).max(TRAINING_TEXT_MAX_LENGTH),
        provider: z.string().trim().min(1).max(TRAINING_TEXT_MAX_LENGTH),
        startDate: z.coerce.date(),
        endDate: nullableDate,
        expiryDate: nullableDate,
        renewalDate: nullableDate,
        status: z.string().trim().max(TRAINING_STATUS_MAX_LENGTH).optional(),
        certificate: nullableString(500),
        competency: z.record(z.string(), z.unknown()).optional().nullable(),
        cost: z.coerce.number().nonnegative().max(1_000_000).optional().nullable(),
        approved: z.boolean().optional(),
        metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    })
    .refine(
        (value) => !value.endDate || value.endDate.getTime() >= value.startDate.getTime(),
        { message: 'endDate must be on or after startDate.', path: ['endDate'] },
    );

export const updateTrainingRecordSchema = z
    .object({
        courseName: z.string().trim().min(1).max(TRAINING_TEXT_MAX_LENGTH).optional(),
        provider: z.string().trim().min(1).max(TRAINING_TEXT_MAX_LENGTH).optional(),
        startDate: z.coerce.date().optional(),
        endDate: nullableDate,
        expiryDate: nullableDate,
        renewalDate: nullableDate,
        status: z.string().trim().max(TRAINING_STATUS_MAX_LENGTH).optional(),
        certificate: nullableString(500),
        competency: z.record(z.string(), z.unknown()).optional().nullable(),
        cost: z.coerce.number().nonnegative().max(1_000_000).optional().nullable(),
        approved: z.boolean().optional(),
        approvedAt: z.coerce.date().optional().nullable(),
        approvedBy: z.uuid().optional().nullable(),
        metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    })
    .refine(
        (value) =>
            !value.startDate ||
            !value.endDate ||
            value.endDate.getTime() >= value.startDate.getTime(),
        { message: 'endDate must be on or after startDate.', path: ['endDate'] },
    )
    .strict();

export const completeTrainingSchema = z
    .object({
        completionDate: z.coerce.date().optional(),
        certificate: nullableString(500),
        competency: z.record(z.string(), z.unknown()).optional().nullable(),
        cost: z.coerce.number().nonnegative().max(1_000_000).optional().nullable(),
        status: z.string().trim().max(TRAINING_STATUS_MAX_LENGTH).optional(),
        expiryDate: nullableDate,
        renewalDate: nullableDate,
        approved: z.boolean().optional(),
        metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    })
    .strict();

export type TrainingRecordFilters = z.infer<typeof trainingRecordFiltersSchema>;
export type EnrollTrainingPayload = z.infer<typeof enrollTrainingSchema>;
export type UpdateTrainingRecordPayload = z.infer<typeof updateTrainingRecordSchema>;
export type CompleteTrainingPayload = z.infer<typeof completeTrainingSchema>;
