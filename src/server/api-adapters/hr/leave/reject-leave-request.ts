import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import type { RejectLeaveRequestResult } from '@/server/use-cases/hr/leave/reject-leave-request';
import {
    rejectLeaveRequestSchema,
    type RejectLeaveRequestPayload,
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

export interface RejectLeaveRequestControllerResult extends RejectLeaveRequestResult {
    success: true;
}

export async function rejectLeaveRequestController(
    { request, requestId }: ControllerInput,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<RejectLeaveRequestControllerResult> {
    const payload = rejectLeaveRequestSchema.parse(await readJson<RejectLeaveRequestPayload>(request));
    const { session, service } = resolveLeaveControllerDependencies(dependencies);

    const { session: authSession, authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: 'api:hr:leave:reject',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_LEAVE,
        resourceAttributes: { requestId, decision: 'rejected' },
    });

    const { userId } = requireSessionUser(authSession);

    const result = await service.rejectLeaveRequest({
        authorization,
        requestId,
        rejectedBy: payload.rejectedBy ?? userId,
        reason: payload.reason,
        comments: payload.comments,
    });

    return {
        ...result,
        success: true,
    };
}
