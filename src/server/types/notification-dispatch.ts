import { z } from 'zod';
import type { JsonValue } from '@/server/types/json';

export type { JsonValue } from '@/server/types/json';

export const NOTIFICATION_DISPATCH_CHANNELS = ['EMAIL', 'IN_APP', 'SMS'] as const;

export type NotificationDispatchChannel = (typeof NOTIFICATION_DISPATCH_CHANNELS)[number];

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
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
    context: z.record(z.string().min(1), jsonValueSchema).optional(),
});

export type NotificationDispatchPayload = z.input<typeof notificationDispatchPayloadSchema>;
