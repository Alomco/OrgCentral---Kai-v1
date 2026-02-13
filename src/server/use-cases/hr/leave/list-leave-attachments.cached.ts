import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { LeaveAttachment } from '@/server/types/leave-types';
import { listLeaveAttachments } from './list-leave-attachments';
import {
    createLeaveAttachmentRepository,
    createLeaveRequestRepository,
} from '@/server/services/hr/leave/leave-repository.factory';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface ListLeaveAttachmentsForUiInput {
    authorization: RepositoryAuthorizationContext;
    requestId: string;
}

export interface ListLeaveAttachmentsForUiResult {
    attachments: LeaveAttachment[];
}

export async function listLeaveAttachmentsForUi(
    input: ListLeaveAttachmentsForUiInput,
): Promise<ListLeaveAttachmentsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.ABSENCE_ATTACHMENT,
        resourceId: input.requestId,
    });
    const dependencies = {
        leaveAttachmentRepository: createLeaveAttachmentRepository(),
        leaveRequestRepository: createLeaveRequestRepository(),
    };
    async function listAttachmentsCached(
        cachedInput: ListLeaveAttachmentsForUiInput,
    ): Promise<ListLeaveAttachmentsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await listLeaveAttachments(dependencies, cachedInput);
        return { attachments: result.attachments };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await listLeaveAttachments(dependencies, input);
        return { attachments: result.attachments };
    }

    return listAttachmentsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
