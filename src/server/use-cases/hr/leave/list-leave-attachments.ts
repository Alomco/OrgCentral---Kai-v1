import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { ILeaveAttachmentRepository } from '@/server/repositories/contracts/hr/leave/leave-attachment-repository-contract';
import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveAttachment } from '@/server/types/leave-types';

export interface ListLeaveAttachmentsDependencies {
    leaveAttachmentRepository: ILeaveAttachmentRepository;
    leaveRequestRepository: ILeaveRequestRepository;
}

export interface ListLeaveAttachmentsInput {
    authorization: RepositoryAuthorizationContext;
    requestId: string;
}

export interface ListLeaveAttachmentsResult {
    attachments: LeaveAttachment[];
}

export async function listLeaveAttachments(
    deps: ListLeaveAttachmentsDependencies,
    input: ListLeaveAttachmentsInput,
): Promise<ListLeaveAttachmentsResult> {
    const request = await deps.leaveRequestRepository.getLeaveRequest(input.authorization.tenantScope, input.requestId);
    if (!request) {
        throw new EntityNotFoundError('Leave request', { requestId: input.requestId });
    }
    if (request.orgId !== input.authorization.orgId) {
        throw new ValidationError('Cross-tenant attachment access.');
    }

    const attachments = await deps.leaveAttachmentRepository.listAttachments(
        input.authorization.tenantScope,
        input.requestId,
    );

    return { attachments };
}