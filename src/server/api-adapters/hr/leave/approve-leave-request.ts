import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import type { ApproveLeaveRequestResult } from '@/server/use-cases/hr/leave/approve-leave-request';
import {
    approveLeaveRequestSchema,
    type ApproveLeaveRequestPayload,
} from '@/server/types/hr-leave-schemas';
import {
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
    type LeaveControllerDependencies,
    readJson,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

interface ControllerInput {
    request: Request;
    requestId: string;
}

export interface ApproveLeaveRequestControllerResult extends ApproveLeaveRequestResult {
    success: true;
}

export async function approveLeaveRequestController(
    { request, requestId }: ControllerInput,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<ApproveLeaveRequestControllerResult> {
    const payload = approveLeaveRequestSchema.parse(await readJson<ApproveLeaveRequestPayload>(request));
    const { session, service } = resolveLeaveControllerDependencies(dependencies);

    const { session: authSession, authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: 'api:hr:leave:approve',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_LEAVE,
        resourceAttributes: { requestId, decision: 'approved' },
    });

    const { userId } = requireSessionUser(authSession);
    const result = await service.approveLeaveRequest({
        authorization,
        requestId,
        approverId: userId,
        comments: payload.comments,
    });

    return {
        ...result,
        success: true,
    };
}
