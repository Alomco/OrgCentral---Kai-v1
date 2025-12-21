import { z } from 'zod';

import {
    createLeavePolicyInputSchema,
} from '@/server/use-cases/hr/leave-policies/create-leave-policy';
import {
    updateLeavePolicyPatchSchema,
} from '@/server/use-cases/hr/leave-policies/update-leave-policy';

export const createLeavePolicyPayloadSchema = z.object({
    policy: createLeavePolicyInputSchema,
});

export const listLeavePoliciesPayloadSchema = z.object({
    orgId: z.uuid(),
});

export const updateLeavePolicyPayloadSchema = z
    .object({
        orgId: z.uuid(),
        patch: updateLeavePolicyPatchSchema,
    })
    .superRefine((value, context) => {
        if (Object.keys(value.patch).length === 0) {
            context.addIssue({
                code: 'custom',
                path: ['patch'],
                message: 'At least one update field is required.',
            });
        }
    });

export const deleteLeavePolicyPayloadSchema = z.object({
    orgId: z.uuid(),
});

export type CreateLeavePolicyPayload = z.infer<typeof createLeavePolicyPayloadSchema>;
export type ListLeavePoliciesPayload = z.infer<typeof listLeavePoliciesPayloadSchema>;
export type UpdateLeavePolicyPayload = z.infer<typeof updateLeavePolicyPayloadSchema>;
export type DeleteLeavePolicyPayload = z.infer<typeof deleteLeavePolicyPayloadSchema>;
