import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { LeaveAttachment } from '@/server/types/leave-types';
import { getLeaveAttachment } from './get-leave-attachment';
import { createLeaveAttachmentRepository } from '@/server/services/hr/leave/leave-repository.factory';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetLeaveAttachmentForUiInput {
    authorization: RepositoryAuthorizationContext;
    attachmentId: string;
}

export interface GetLeaveAttachmentForUiResult {
    attachment: LeaveAttachment;
}

export async function getLeaveAttachmentForUi(
    input: GetLeaveAttachmentForUiInput,
): Promise<GetLeaveAttachmentForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.READ,
        resource: HR_RESOURCE_TYPE.ABSENCE_ATTACHMENT,
        resourceId: input.attachmentId,
    });
    async function getAttachmentCached(
        cachedInput: GetLeaveAttachmentForUiInput,
    ): Promise<GetLeaveAttachmentForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await getLeaveAttachment(
            { leaveAttachmentRepository: createLeaveAttachmentRepository() },
            cachedInput,
        );

        return { attachment: result.attachment };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await getLeaveAttachment(
            { leaveAttachmentRepository: createLeaveAttachmentRepository() },
            input,
        );

        return { attachment: result.attachment };
    }

    return getAttachmentCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
