import type { JobsOptions } from 'bullmq';
import type { RoleUpdatePayload } from '@/server/types/role-updates';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export interface RoleQueueInput {
    orgId: string;
    authorization: RepositoryAuthorizationContext;
    payload: RoleUpdatePayload;
}

export interface RoleQueueContract {
    enqueueRoleUpdate(input: RoleQueueInput, options?: JobsOptions): Promise<void>;
}
