import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { ILeaveAttachmentRepository } from '@/server/repositories/contracts/hr/leave/leave-attachment-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveAttachment } from '@/server/types/leave-types';

export interface GetLeaveAttachmentDependencies {
    leaveAttachmentRepository: ILeaveAttachmentRepository;
}

export interface GetLeaveAttachmentInput {
    authorization: RepositoryAuthorizationContext;
    attachmentId: string;
}

export interface GetLeaveAttachmentResult {
    attachment: LeaveAttachment;
}

export async function getLeaveAttachment(
    deps: GetLeaveAttachmentDependencies,
    input: GetLeaveAttachmentInput,
): Promise<GetLeaveAttachmentResult> {
    const attachment = await deps.leaveAttachmentRepository.getAttachment(input.authorization.tenantScope, input.attachmentId);
    if (!attachment) {
        throw new EntityNotFoundError('Leave attachment', { attachmentId: input.attachmentId });
    }
    if (attachment.orgId !== input.authorization.orgId) {
        throw new ValidationError('Cross-tenant attachment access.');
    }

    return { attachment };
}