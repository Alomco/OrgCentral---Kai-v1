import { z, type ZodType } from 'zod';
import {
    type ChecklistInstanceItemsUpdate,
    type ChecklistItemProgress,
} from '@/server/types/onboarding-types';

export const checklistItemProgressSchema: ZodType<ChecklistItemProgress> = z.object({
    task: z.string(),
    completed: z.boolean(),
    completedAt: z.coerce.date().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export const checklistInstanceUpdateSchema: ZodType<ChecklistInstanceItemsUpdate> = z.object({
    items: z.array(checklistItemProgressSchema).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
}).refine((data) => data.items !== undefined || data.metadata !== undefined, {
    message: "At least one field (items or metadata) must be provided for update",
});

export const checklistInstanceIdSchema: ZodType<string> = z.uuid();

export function parseChecklistInstanceUpdatePayload(input: unknown): ChecklistInstanceItemsUpdate {
    return checklistInstanceUpdateSchema.parse(input);
}

export function parseChecklistInstanceIdentifier(input: unknown): string {
    return checklistInstanceIdSchema.parse(input);
}
