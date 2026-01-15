import { z } from 'zod';
import type {
    WorkerJobAuthorization,
    WorkerJobEnvelope,
    WorkerJobMetadata,
} from '@/server/workers/abstract-org-worker';
import type { RoleUpdatePayload } from '@/server/types/role-updates';

export type { RoleUpdatePayload };
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
