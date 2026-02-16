import { z } from 'zod';
import { COMPLIANCE_ITEM_STATUSES } from '@/server/types/compliance-types';
import { COMPLIANCE_STANDARD_KEYS } from '@/server/types/hr/compliance-standards';
import { complianceAttachmentsSchema } from '@/server/validators/hr/compliance/compliance-validators';
import { jsonValueSchema } from '@/server/types/notification-dispatch';

const complianceStatusValues = [...COMPLIANCE_ITEM_STATUSES] as [
    (typeof COMPLIANCE_ITEM_STATUSES)[number],
    ...(typeof COMPLIANCE_ITEM_STATUSES)[number][],
];

const MAX_COMPLIANCE_ASSIGN_USERS = 500;
const MAX_COMPLIANCE_TEMPLATE_ITEMS = 200;

function hasDuplicateIds(values: readonly string[]): boolean {
    return new Set(values).size !== values.length;
}

export const assignComplianceItemsSchema = z.object({
    userIds: z.array(z.uuid()).min(1).max(MAX_COMPLIANCE_ASSIGN_USERS),
    templateId: z.uuid(),
    templateItemIds: z.array(z.string().min(1)).min(1).max(MAX_COMPLIANCE_TEMPLATE_ITEMS),
}).superRefine((value, context) => {
    if (hasDuplicateIds(value.userIds)) {
        context.addIssue({
            code: 'custom',
            path: ['userIds'],
            message: 'userIds must not contain duplicates.',
        });
    }

    if (hasDuplicateIds(value.templateItemIds)) {
        context.addIssue({
            code: 'custom',
            path: ['templateItemIds'],
            message: 'templateItemIds must not contain duplicates.',
        });
    }
});

export type AssignComplianceItemsPayload = z.infer<typeof assignComplianceItemsSchema>;

export const updateComplianceItemSchema = z.object({
    userId: z.uuid(),
    itemId: z.string().min(1),
    updates: z
        .object({
            status: z.enum(complianceStatusValues).optional(),
            notes: z.string().max(4000).nullable().optional(),
            attachments: complianceAttachmentsSchema.max(10).nullable().optional(),
            completedAt: z.coerce.date().nullable().optional(),
            dueDate: z.coerce.date().nullable().optional(),
            metadata: jsonValueSchema.optional(),
        })
        .refine((value) => Object.keys(value).length > 0, {
            message: 'At least one field must be provided in updates.',
            path: ['updates'],
        }),
});

export type UpdateComplianceItemPayload = z.infer<typeof updateComplianceItemSchema>;

export const listComplianceItemsQuerySchema = z.object({
    userId: z.uuid().optional(),
});

export type ListComplianceItemsQuery = z.infer<typeof listComplianceItemsQuerySchema>;

export const listComplianceItemsGroupedQuerySchema = listComplianceItemsQuerySchema;

export type ListComplianceItemsGroupedQuery = z.infer<typeof listComplianceItemsGroupedQuerySchema>;

export const listPendingReviewComplianceItemsQuerySchema = z.object({
    take: z.coerce.number().int().min(1).max(500).optional(),
});

export type ListPendingReviewComplianceItemsQuery = z.infer<typeof listPendingReviewComplianceItemsQuerySchema>;

export const seedComplianceTemplatesQuerySchema = z.object({
    force: z
        .union([z.literal('1'), z.literal('true'), z.literal('0'), z.literal('false')])
        .optional()
        .transform((value) => (value ? value === '1' || value === 'true' : undefined)),
});

export type SeedComplianceTemplatesQuery = z.infer<typeof seedComplianceTemplatesQuerySchema>;

export const upsertComplianceCategorySchema = z.object({
    key: z.string().min(1).max(64),
    label: z.string().min(1).max(80),
    sortOrder: z.coerce.number().int().min(0).max(10000).optional(),
    regulatoryRefs: z.array(z.enum(COMPLIANCE_STANDARD_KEYS)).max(10).optional(),
});

export type UpsertComplianceCategoryPayload = z.infer<typeof upsertComplianceCategorySchema>;

export const complianceReminderSettingsSchema = z.object({
    windowDays: z.coerce.number().int().min(1).max(180),
    escalationDays: z.array(z.coerce.number().int().min(1).max(180)).max(10),
    notifyOnComplete: z.coerce.boolean(),
});

export type ComplianceReminderSettingsPayload = z.infer<typeof complianceReminderSettingsSchema>;
