import { z } from 'zod';
import type { WorkerJobEnvelope, WorkerJobMetadata, WorkerJobAuthorization } from '@/server/workers/abstract-org-worker';

export type RoleActionType = 'created' | 'updated' | 'deleted';

export interface RoleUpdatePayload {
    roleId: string;
    roleName: string;
    action: RoleActionType;
}

export type RoleUpdateEnvelope = WorkerJobEnvelope<RoleUpdatePayload>;

export const roleUpdateSchema = z.object({
    orgId: z.string(),
    payload: z.object({
        roleId: z.string(),
        roleName: z.string(),
        action: z.enum(['created', 'updated', 'deleted']),
    }),
    authorization: z.custom<WorkerJobAuthorization>(),
    metadata: z.custom<WorkerJobMetadata>().optional(),
});
