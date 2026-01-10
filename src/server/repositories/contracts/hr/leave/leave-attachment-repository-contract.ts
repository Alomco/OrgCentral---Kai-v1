/**
 * Repository contract for Leave Attachments
 */
import type { LeaveAttachment, LeaveAttachmentInput } from '@/server/types/leave-types';
import type { TenantScope } from '@/server/types/tenant';

export interface ILeaveAttachmentRepository {
  addAttachments(
    tenant: TenantScope,
    requestId: string,
    attachments: LeaveAttachmentInput[],
  ): Promise<void>;

  listAttachments(
    tenant: TenantScope,
    requestId: string,
  ): Promise<LeaveAttachment[]>;

  getAttachment(
    tenant: TenantScope,
    attachmentId: string,
  ): Promise<LeaveAttachment | null>;

  deleteAttachment(
    tenant: TenantScope,
    attachmentId: string,
  ): Promise<void>;
}
