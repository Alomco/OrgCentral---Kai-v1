import { z } from 'zod';
import type { WorkerJobAuthorization, WorkerJobEnvelope, WorkerJobMetadata } from '@/server/workers/abstract-org-worker';
import { DATA_CLASSIFICATION_LEVELS, DATA_RESIDENCY_ZONES } from '@/server/types/tenant';

export const LEAVE_ACCRUAL_JOB_NAME = 'hr.leave.accrual';

export const leaveAccrualJobAuthorizationSchema: z.ZodType<WorkerJobAuthorization> = z.object({
    userId: z.uuid(),
    requiredPermissions: z.record(z.string().min(1), z.array(z.string().min(1))).optional(),
    requiredAnyPermissions: z
        .array(z.record(z.string().min(1), z.array(z.string().min(1))))
        .optional(),
    expectedClassification: z.enum(DATA_CLASSIFICATION_LEVELS).optional(),
    expectedResidency: z.enum(DATA_RESIDENCY_ZONES).optional(),
    auditSource: z.string().min(3).default('worker:hr:leave:accrual'),
    correlationId: z.uuid().optional(),
}) as z.ZodType<WorkerJobAuthorization>;

export const leaveAccrualJobMetadataSchema: z.ZodType<WorkerJobMetadata | undefined> = z
    .object({
        correlationId: z.uuid().optional(),
        cacheScopes: z.array(z.string()).optional(),
        attributes: z.record(z.string(), z.unknown()).optional(),
    })
    .partial()
    .optional();

export const leaveAccrualPayloadSchema = z.object({
    referenceDate: z.coerce.date().optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    employeeIds: z.array(z.uuid()).optional(),
    leaveTypes: z.array(z.string().min(1)).optional(),
    dryRun: z.boolean().optional(),
});

export type LeaveAccrualPayload = z.input<typeof leaveAccrualPayloadSchema>;

export const leaveAccrualEnvelopeSchema = z.object({
    orgId: z.uuid(),
    payload: leaveAccrualPayloadSchema,
    authorization: leaveAccrualJobAuthorizationSchema,
    metadata: leaveAccrualJobMetadataSchema,
});

export type LeaveAccrualEnvelope = WorkerJobEnvelope<LeaveAccrualPayload>;
export type LeaveAccrualJobAuthorization = WorkerJobAuthorization;
