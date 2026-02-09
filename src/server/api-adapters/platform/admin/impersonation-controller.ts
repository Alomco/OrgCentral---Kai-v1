import { authorizePlatformRequest } from '@/server/api-adapters/platform/admin/authorize-platform-request';
import {
    listImpersonationRequestsService,
    listImpersonationSessionsService,
    requestImpersonationService,
    approveImpersonationService,
    stopImpersonationService,
    startImpersonationService,
} from '@/server/services/platform/admin/impersonation-service';
import type { ImpersonationRequest, ImpersonationSession } from '@/server/types/platform/impersonation';
import {
    parseImpersonationRequest,
    parseImpersonationApprove,
    parseImpersonationStop,
    parseImpersonationStart,
} from '@/server/validators/platform/admin/impersonation-validators';

interface ImpersonationRequestListResponse {
    success: true;
    data: ImpersonationRequest[];
}

interface ImpersonationSessionListResponse {
    success: true;
    data: ImpersonationSession[];
}

interface ImpersonationRequestResponse {
    success: true;
    data: ImpersonationRequest;
}

interface ImpersonationSessionResponse {
    success: true;
    data: ImpersonationSession;
}

interface ImpersonationSessionStartResponse {
    success: true;
    data: ImpersonationSession;
    authHeaders: Headers;
}

export async function listImpersonationRequestsController(request: Request): Promise<ImpersonationRequestListResponse> {
    const authorization = await authorizePlatformRequest(request, {
        requiredPermissions: { platformImpersonation: ['read'] },
        auditSource: 'api:platform:impersonation:requests:list',
        action: 'list',
        resourceType: 'platformImpersonationRequest',
    });

    const data = await listImpersonationRequestsService(authorization);
    return { success: true, data };
}

export async function listImpersonationSessionsController(request: Request): Promise<ImpersonationSessionListResponse> {
    const authorization = await authorizePlatformRequest(request, {
        requiredPermissions: { platformImpersonation: ['read'] },
        auditSource: 'api:platform:impersonation:sessions:list',
        action: 'list',
        resourceType: 'platformImpersonationSession',
    });

    const data = await listImpersonationSessionsService(authorization);
    return { success: true, data };
}

export async function requestImpersonationController(request: Request): Promise<ImpersonationRequestResponse> {
    const authorization = await authorizePlatformRequest(request, {
        requiredPermissions: { platformImpersonation: ['request'] },
        auditSource: 'api:platform:impersonation:requests:create',
        action: 'create',
        resourceType: 'platformImpersonationRequest',
    });

    const payload = parseImpersonationRequest(await request.json());
    const data = await requestImpersonationService(authorization, payload);
    return { success: true, data };
}

export async function approveImpersonationController(request: Request): Promise<ImpersonationSessionResponse> {
    const authorization = await authorizePlatformRequest(request, {
        requiredPermissions: { platformImpersonation: ['approve'] },
        auditSource: 'api:platform:impersonation:requests:approve',
        action: 'approve',
        resourceType: 'platformImpersonationRequest',
    });

    const payload = parseImpersonationApprove(await request.json());
    const data = await approveImpersonationService(authorization, payload);
    return { success: true, data };
}

export async function stopImpersonationController(request: Request): Promise<ImpersonationSessionResponse> {
    const authorization = await authorizePlatformRequest(request, {
        requiredPermissions: { platformImpersonation: ['stop'] },
        auditSource: 'api:platform:impersonation:sessions:stop',
        action: 'stop',
        resourceType: 'platformImpersonationSession',
    });

    const payload = parseImpersonationStop(await request.json());
    const data = await stopImpersonationService(authorization, payload);
    return { success: true, data };
}

export async function startImpersonationController(request: Request): Promise<ImpersonationSessionStartResponse> {
    const authorization = await authorizePlatformRequest(request, {
        requiredPermissions: { platformImpersonation: ['start'] },
        auditSource: 'api:platform:impersonation:sessions:start',
        action: 'start',
        resourceType: 'platformImpersonationSession',
    });

    const payload = parseImpersonationStart(await request.json());
    const { session, authHeaders } = await startImpersonationService(authorization, request.headers, payload);
    return { success: true, data: session, authHeaders };
}
