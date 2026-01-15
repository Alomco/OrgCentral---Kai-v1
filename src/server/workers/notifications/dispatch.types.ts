import { z } from 'zod';
import type {
    WorkerJobAuthorization,
    WorkerJobEnvelope,
    WorkerJobMetadata,
} from '@/server/workers/abstract-org-worker';
import { DATA_CLASSIFICATION_LEVELS, DATA_RESIDENCY_ZONES } from '@/server/types/tenant';
import {
    jsonValueSchema,
    notificationDispatchPayloadSchema,
    type NotificationDispatchPayload,
} from '@/server/types/notification-dispatch';

export const NOTIFICATION_DISPATCH_JOB_NAME = 'notifications.dispatch';

export const notificationDispatchJobAuthorizationSchema: z.ZodType<WorkerJobAuthorization> = z
    .object({
        userId: z.uuid(),
        requiredPermissions: z.record(z.string().min(1), z.array(z.string().min(1))).optional(),
        requiredAnyPermissions: z
            .array(z.record(z.string().min(1), z.array(z.string().min(1))))
            .optional(),
        expectedClassification: z.enum(DATA_CLASSIFICATION_LEVELS).optional(),
        expectedResidency: z.enum(DATA_RESIDENCY_ZONES).optional(),
        auditSource: z.string().min(3).default('worker:notifications:dispatch'),
        correlationId: z.uuid().optional(),
    }) as z.ZodType<WorkerJobAuthorization>;

export const notificationDispatchJobMetadataSchema: z.ZodType<WorkerJobMetadata | undefined> = z
    .object({
        correlationId: z.uuid().optional(),
        cacheScopes: z.array(z.string().min(1)).optional(),
        attributes: z.record(z.string().min(1), jsonValueSchema).optional(),
    })
    .partial()
    .optional();

export const notificationDispatchEnvelopeSchema = z.object({
    orgId: z.uuid(),
    payload: notificationDispatchPayloadSchema,
    authorization: notificationDispatchJobAuthorizationSchema,
    metadata: notificationDispatchJobMetadataSchema,
});

export type NotificationDispatchEnvelope = WorkerJobEnvelope<NotificationDispatchPayload>;

export type { NotificationDispatchPayload };
