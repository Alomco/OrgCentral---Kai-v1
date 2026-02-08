import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import type { ListLeaveAttachmentsResult } from '@/server/use-cases/hr/leave/list-leave-attachments';
import {
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
    type LeaveControllerDependencies,
} from './common';

const requestIdSchema = z.string().trim().min(1);

interface ControllerInput {
    request: Request;
    requestId: string;
}

export async function listLeaveAttachmentsController(
    { request, requestId }: ControllerInput,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<ListLeaveAttachmentsResult> {
    const normalizedRequestId = requestIdSchema.parse(requestId);
    const { session, service } = resolveLeaveControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:leave:attachments:list',
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_LEAVE,
        resourceAttributes: { requestId: normalizedRequestId },
    });

    return service.listLeaveAttachments({ authorization, requestId: normalizedRequestId });
}
