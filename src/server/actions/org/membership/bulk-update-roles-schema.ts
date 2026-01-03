import { z } from 'zod';

export const bulkUpdateRolesSchema = z.object({
    targetUserIds: z.array(z.string().min(1)).min(1, 'At least one user must be selected'),
    roles: z.array(z.string()).min(1, 'At least one role must be assigned'),
});

export type BulkUpdateRolesInput = z.infer<typeof bulkUpdateRolesSchema>;
