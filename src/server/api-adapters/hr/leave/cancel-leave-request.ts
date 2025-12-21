import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import type { CancelLeaveRequestResult } from '@/server/use-cases/hr/leave/cancel-leave-request';
import {
    cancelLeaveRequestSchema,
    type CancelLeaveRequestPayload,
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

export interface CancelLeaveRequestControllerResult extends CancelLeaveRequestResult {
    success: true;
}

export async function cancelLeaveRequestController(
    { request, requestId }: ControllerInput,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<CancelLeaveRequestControllerResult> {
    const payload = cancelLeaveRequestSchema.parse(await readJson<CancelLeaveRequestPayload>(request));
    const { session, service } = resolveLeaveControllerDependencies(dependencies);

    const { session: authSession, authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: 'api:hr:leave:cancel',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_LEAVE,
        resourceAttributes: { requestId, decision: 'cancelled' },
    });

    const { userId } = requireSessionUser(authSession);
    const result = await service.cancelLeaveRequest({
        authorization,
        requestId,
        cancelledBy: payload.cancelledBy ?? userId,
        reason: payload.reason,
    });

    return {
        ...result,
        success: true,
    };
}
