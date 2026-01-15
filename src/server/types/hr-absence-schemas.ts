import { AbsenceStatus, HealthStatus } from '@/server/types/prisma';
import { z } from 'zod';

const ABSENCE_STATUS_VALUES = Object.values(AbsenceStatus) as [AbsenceStatus, ...AbsenceStatus[]];
const HEALTH_STATUS_VALUES = Object.values(HealthStatus) as [HealthStatus, ...HealthStatus[]];
const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024; // 50MB guard per DSPT guidelines

const DECISION_STATUSES = new Set<AbsenceStatus>([
    AbsenceStatus.APPROVED,
    AbsenceStatus.REJECTED,
    AbsenceStatus.CANCELLED,
]);

export const absenceFiltersSchema = z.object({
    userId: z.uuid().optional(),
    status: z.enum(ABSENCE_STATUS_VALUES).optional(),
    includeClosed: z.coerce.boolean().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
});

export const reportUnplannedAbsenceSchema = z
    .object({
        userId: z.uuid(),
        typeId: z.uuid().optional(),
        typeKey: z.string().min(1).max(64).optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        hours: z.coerce.number().positive().max(1000).optional(),
        reason: z.string().max(2000).optional(),
        healthStatus: z.enum(HEALTH_STATUS_VALUES).optional().nullable(),
        metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    })
    .refine((value) => Boolean(value.typeId ?? value.typeKey), {
        message: 'Either typeId or typeKey must be provided.',
        path: ['typeId'],
    });

export const approveAbsenceSchema = z.object({
    status: z
        .enum(ABSENCE_STATUS_VALUES)
        .optional()
        .refine((value) => !value || DECISION_STATUSES.has(value), {
            message: 'Status must be APPROVED, REJECTED, or CANCELLED.',
        }),
    reason: z.string().max(2000).optional().nullable(),
    healthStatus: z.enum(HEALTH_STATUS_VALUES).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateAbsenceSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    hours: z.coerce.number().positive().max(1000).optional(),
    reason: z.string().max(2000).optional().nullable(),
    healthStatus: z.enum(HEALTH_STATUS_VALUES).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const returnToWorkSchema = z.object({
    returnDate: z.coerce.date(),
    comments: z.string().max(2000).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const deleteAbsenceSchema = z.object({
    reason: z.string().trim().min(10).max(2000),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

const attachmentMetadataSchema = z.object({
    fileName: z.string().min(1).max(255),
    storageKey: z.string().min(1).max(512),
    contentType: z.string().min(3).max(255),
    fileSize: z.coerce.number().int().positive().max(MAX_ATTACHMENT_BYTES),
    checksum: z.string().min(6).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const addAbsenceAttachmentSchema = z.object({
    attachments: z.array(attachmentMetadataSchema).min(1).max(5),
});

export const removeAbsenceAttachmentSchema = z.object({
    attachmentId: z.uuid(),
});

export const acknowledgeAbsenceSchema = z.object({
    note: z.string().max(2000).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const cancelAbsenceSchema = z.object({
    reason: z.string().trim().min(5).max(2000),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const absenceTypeInputSchema = z.object({
    label: z.string().trim().min(2).max(120),
    key: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Keys must be lower-case kebab-case.')
        .optional(),
    tracksBalance: z.boolean().default(true),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const absenceTypeRemovalSchema = z
    .object({
        typeId: z.uuid().optional(),
        key: z
            .string()
            .trim()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .optional(),
    })
    .refine((value) => Boolean(value.typeId ?? value.key), {
        message: 'Provide typeId or key to identify the absence type.',
        path: ['typeId'],
    });

export const updateAbsenceSettingsSchema = z.object({
    hoursInWorkDay: z.coerce.number().positive().max(24),
    roundingRule: z.string().trim().max(64).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const absenceAiValidationSchema = z.object({
    status: z.enum(['PENDING', 'VERIFIED', 'MISMATCH', 'ERROR']),
    summary: z.string().max(2000).optional().nullable(),
    issues: z.array(z.string().max(500)).optional().default([]),
    confidence: z.number().min(0).max(1).optional().nullable(),
    attachmentId: z.uuid().optional(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const analyzeAbsenceAttachmentSchema = z
    .object({
        attachmentId: z.uuid().optional(),
        force: z.coerce.boolean().optional().default(false),
    })
    .refine((value) => typeof value.force === 'boolean', {
        message: 'Force flag must be a boolean.',
        path: ['force'],
    });

export type AbsenceQueryFilters = z.infer<typeof absenceFiltersSchema>;
export type ReportUnplannedAbsencePayload = z.infer<typeof reportUnplannedAbsenceSchema>;
export type ApproveUnplannedAbsencePayload = z.infer<typeof approveAbsenceSchema>;
export type UpdateUnplannedAbsencePayload = z.infer<typeof updateAbsenceSchema>;
export type ReturnToWorkPayload = z.infer<typeof returnToWorkSchema>;
export type DeleteUnplannedAbsencePayload = z.infer<typeof deleteAbsenceSchema>;
export type AbsenceAttachmentPayload = z.infer<typeof attachmentMetadataSchema>;
export type AddAbsenceAttachmentPayload = z.infer<typeof addAbsenceAttachmentSchema>;
export type RemoveAbsenceAttachmentPayload = z.infer<typeof removeAbsenceAttachmentSchema>;
export type AcknowledgeAbsencePayload = z.infer<typeof acknowledgeAbsenceSchema>;
export type CancelAbsencePayload = z.infer<typeof cancelAbsenceSchema>;
export type AbsenceTypeInputPayload = z.infer<typeof absenceTypeInputSchema>;
export type AbsenceTypeRemovalPayload = z.infer<typeof absenceTypeRemovalSchema>;
export type UpdateAbsenceSettingsPayload = z.infer<typeof updateAbsenceSettingsSchema>;
export type AbsenceAiValidationPayload = z.infer<typeof absenceAiValidationSchema>;
export type AnalyzeAbsenceAttachmentPayload = z.infer<typeof analyzeAbsenceAttachmentSchema>;
