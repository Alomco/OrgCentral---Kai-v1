import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { ILeaveAttachmentRepository } from '@/server/repositories/contracts/hr/leave/leave-attachment-repository-contract';
import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveAttachmentInput } from '@/server/types/leave-types';
import { normalizeString } from '@/server/use-cases/shared';
import { invalidateLeaveCacheScopes } from './shared';

export interface AddLeaveAttachmentsDependencies {
    leaveAttachmentRepository: ILeaveAttachmentRepository;
    leaveRequestRepository: ILeaveRequestRepository;
}

export interface AddLeaveAttachmentsInput {
    authorization: RepositoryAuthorizationContext;
    requestId: string;
    attachments: Omit<LeaveAttachmentInput, 'uploadedByUserId' | 'uploadedAt' | 'requestId' | 'orgId'>[];
}

export interface AddLeaveAttachmentsResult {
    success: true;
}

export async function addLeaveAttachments(
    deps: AddLeaveAttachmentsDependencies,
    input: AddLeaveAttachmentsInput,
): Promise<AddLeaveAttachmentsResult> {
    const request = await deps.leaveRequestRepository.getLeaveRequest(input.authorization.tenantScope, input.requestId);
    if (!request) {
        throw new EntityNotFoundError('Leave request', { requestId: input.requestId });
    }
    if (request.orgId !== input.authorization.orgId) {
        throw new ValidationError('Cross-tenant attachment attempt.');
    }

    const prepared: LeaveAttachmentInput[] = input.attachments.map((attachment) => {
        const fileName = normalizeString(attachment.fileName)?.trim();
        if (!fileName) {
            throw new ValidationError('Attachment names cannot be empty.');
        }
        return {
            ...attachment,
            fileName,
            requestId: input.requestId,
            orgId: input.authorization.orgId,
            uploadedByUserId: input.authorization.userId,
            uploadedAt: new Date().toISOString(),
        } satisfies LeaveAttachmentInput;
    });

    await deps.leaveAttachmentRepository.addAttachments(input.authorization.tenantScope, input.requestId, prepared);
    await invalidateLeaveCacheScopes(input.authorization, 'requests');
    return { success: true };
}
