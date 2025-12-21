import { z, type ZodType } from 'zod';
import {
    CHECKLIST_TEMPLATE_TYPES,
    type ChecklistTemplateCreatePayload,
    type ChecklistTemplateItemInput,
    type ChecklistTemplateListFilters,
    type ChecklistTemplateUpdatePayload,
} from '@/server/types/onboarding-types';

export const checklistTemplateItemSchema: ZodType<ChecklistTemplateItemInput> = z.object({
    id: z.uuid().optional(),
    label: z.string().trim().min(1).max(200),
    description: z.string().trim().max(500).optional(),
    order: z.number().int().min(0).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const checklistTemplateCreateSchema: ZodType<ChecklistTemplateCreatePayload> = z.object({
    name: z.string().trim().min(1).max(150),
    type: z.enum(CHECKLIST_TEMPLATE_TYPES),
    items: z.array(checklistTemplateItemSchema).min(1),
});

export const checklistTemplateUpdateSchema: ZodType<ChecklistTemplateUpdatePayload> = z
    .object({
        name: z.string().trim().min(1).max(150).optional(),
        type: z.enum(CHECKLIST_TEMPLATE_TYPES).optional(),
        items: z.array(checklistTemplateItemSchema).min(1).optional(),
    })
    .refine((value) => (value.name ?? value.type ?? value.items) !== undefined, {
        message: 'At least one field must be provided to update a template.',
        path: ['name'],
    });

export const checklistTemplateIdSchema: ZodType<string> = z.uuid();

export const checklistTemplateListFilterSchema: ZodType<ChecklistTemplateListFilters> = z.object({
    type: z.enum(CHECKLIST_TEMPLATE_TYPES).optional(),
});

export function parseChecklistTemplateCreatePayload(input: unknown): ChecklistTemplateCreatePayload {
    return checklistTemplateCreateSchema.parse(input);
}

export function parseChecklistTemplateUpdatePayload(input: unknown): ChecklistTemplateUpdatePayload {
    return checklistTemplateUpdateSchema.parse(input);
}

export function parseChecklistTemplateIdentifier(input: unknown): string {
    return checklistTemplateIdSchema.parse(input);
}

export function parseChecklistTemplateListFilters(input: unknown): ChecklistTemplateListFilters {
    if (input instanceof URLSearchParams) {
        return checklistTemplateListFilterSchema.parse(Object.fromEntries(input.entries()));
    }

    if (input && typeof input === 'object') {
        return checklistTemplateListFilterSchema.parse(input);
    }

    return checklistTemplateListFilterSchema.parse({});
}

export { CHECKLIST_TEMPLATE_TYPES };
