import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { ValidationError } from '@/server/errors';

interface RouteParams {
    params: { requestId: string };
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const requestId = params.requestId;
        if (!requestId) {
            throw new ValidationError('Request id is required.');
        }

        const { authorization } = await getSessionContext({}, {
            headers: request.headers,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'api:hr:leave:attachments:list',
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_LEAVE,
            resourceAttributes: { requestId },
        });

        const service = getLeaveService();
        const result = await service.listLeaveAttachments({ authorization, requestId });

        return NextResponse.json({ attachments: result.attachments }, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}