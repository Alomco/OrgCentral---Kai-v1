import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { PrismaLeaveAttachmentRepository } from '@/server/repositories/prisma/hr/leave';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveAttachment } from '@/server/types/leave-types';
import { getLeaveAttachment } from './get-leave-attachment';

export interface GetLeaveAttachmentForUiInput {
    authorization: RepositoryAuthorizationContext;
    attachmentId: string;
}

export interface GetLeaveAttachmentForUiResult {
    attachment: LeaveAttachment;
}

function resolveLeaveAttachmentRepository(): PrismaLeaveAttachmentRepository {
    return new PrismaLeaveAttachmentRepository();
}

export async function getLeaveAttachmentForUi(
    input: GetLeaveAttachmentForUiInput,
): Promise<GetLeaveAttachmentForUiResult> {
    async function getAttachmentCached(
        cachedInput: GetLeaveAttachmentForUiInput,
    ): Promise<GetLeaveAttachmentForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await getLeaveAttachment(
            { leaveAttachmentRepository: resolveLeaveAttachmentRepository() },
            cachedInput,
        );

        return { attachment: result.attachment };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await getLeaveAttachment(
            { leaveAttachmentRepository: resolveLeaveAttachmentRepository() },
            input,
        );

        return { attachment: result.attachment };
    }

    return getAttachmentCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
