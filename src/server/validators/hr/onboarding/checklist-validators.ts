import { z } from 'zod';

const jsonSchema = z.record(z.string(), z.any()).optional().nullable();

export const checklistTemplateItemSchema = z.object({
    id: z.string().optional(),
    label: z.string().min(1),
    description: z.string().optional(),
    order: z.number().optional(),
    metadata: jsonSchema,
});

export const checklistInstanceItemSchema = z.object({
    task: z.string().min(1),
    completed: z.boolean(),
    completedAt: z.union([z.date(), z.string()]).optional().nullable().transform(value => value ? new Date(value) : null),
    notes: z.string().optional().nullable(),
});

export const checklistInstanceMetadataSchema = jsonSchema;
