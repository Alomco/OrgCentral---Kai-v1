import { z } from 'zod';
import type {
    WorkerJobAuthorization,
    WorkerJobEnvelope,
    WorkerJobMetadata,
} from '@/server/workers/abstract-org-worker';
import { DATA_CLASSIFICATION_LEVELS, DATA_RESIDENCY_ZONES } from '@/server/types/tenant';

export const NOTIFICATION_DISPATCH_JOB_NAME = 'notifications.dispatch';

export const NOTIFICATION_DISPATCH_CHANNELS = ['EMAIL', 'IN_APP', 'SMS'] as const;

export type NotificationDispatchChannel = (typeof NOTIFICATION_DISPATCH_CHANNELS)[number];

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
    z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(jsonValueSchema),
        z.record(z.string().min(1), jsonValueSchema),
    ]),
);

export const notificationRecipientSchema = z
    .object({
        userId: z.uuid().optional(),
        email: z.email().optional(),
        phone: z
            .string()
            .min(6)
            .max(64)
            .optional(),
    })
    .refine(
        (recipient) => Boolean(recipient.userId ?? recipient.email ?? recipient.phone),
        'Recipient must include at least one identifier.',
    );

export const notificationDispatchPayloadSchema = z.object({
    templateKey: z.string().min(1),
    channel: z.enum(NOTIFICATION_DISPATCH_CHANNELS),
    recipient: notificationRecipientSchema,
    data: z.record(z.string().min(1), jsonValueSchema).optional(),
    context: z.record(z.string().min(1), z.unknown()).optional(),
});

export type NotificationDispatchPayload = z.input<typeof notificationDispatchPayloadSchema>;

export const notificationDispatchJobAuthorizationSchema: z.ZodType<WorkerJobAuthorization> = z.object({
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
        attributes: z.record(z.string().min(1), z.unknown()).optional(),
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
