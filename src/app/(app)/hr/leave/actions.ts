'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { appLogger } from '@/server/logging/structured-logger';

import { readFormString } from './lib/leave-request-helpers';
import type { LeaveRequestFormState } from './form-state';
import { handleSubmitLeaveRequest } from './submit-leave-request';

type ActionResult = { status: 'success'; message?: string } | { status: 'error'; message: string };

type SessionOptions = Parameters<typeof getSessionContext>[1];

const REQUEST_ID_REQUIRED = 'Request id is required.';

export async function submitLeaveRequestAction(
    previous: LeaveRequestFormState,
    formData: FormData,
): Promise<LeaveRequestFormState> {
    return handleSubmitLeaveRequest(previous, formData);
}

export async function approveLeaveRequestAction(formData: FormData): Promise<ActionResult> {
    const requestId = readFormString(formData, 'requestId');
    if (!requestId) {
        return { status: 'error', message: REQUEST_ID_REQUIRED };
    }

    return runLeaveMutation({
        requestId,
        sessionOptions: {
            requiredAnyPermissions: [{ [HR_RESOURCE.HR_LEAVE]: ['approve'] }],
            auditSource: 'ui:hr:leave:approve',
            action: HR_ACTION.APPROVE,
        },
        mutate: async (service, authorization) => {
            await service.approveLeaveRequest({ authorization, requestId, approverId: authorization.userId });
        },
        successMessage: 'Request approved.',
        errorMessage: 'Unable to approve request.',
        logEvent: 'hr.leave.ui.approve.failed',
    });
}

export async function rejectLeaveRequestAction(formData: FormData): Promise<ActionResult> {
    const requestId = readFormString(formData, 'requestId');
    const reason = readFormString(formData, 'reason');
    if (!requestId) {
        return { status: 'error', message: REQUEST_ID_REQUIRED };
    }
    if (!reason || reason.trim().length < 5) {
        return { status: 'error', message: 'Provide a rejection reason (5+ chars).' };
    }

    return runLeaveMutation({
        requestId,
        sessionOptions: {
            requiredAnyPermissions: [{ [HR_RESOURCE.HR_LEAVE]: ['approve'] }],
            auditSource: 'ui:hr:leave:reject',
            action: HR_ACTION.APPROVE,
        },
        mutate: async (service, authorization) => {
            await service.rejectLeaveRequest({ authorization, requestId, rejectedBy: authorization.userId, reason });
        },
        successMessage: 'Request rejected.',
        errorMessage: 'Unable to reject request.',
        logEvent: 'hr.leave.ui.reject.failed',
    });
}

export async function cancelLeaveRequestAction(formData: FormData): Promise<ActionResult> {
    const requestId = readFormString(formData, 'requestId');
    const reason = readFormString(formData, 'reason');
    if (!requestId) {
        return { status: 'error', message: REQUEST_ID_REQUIRED };
    }

    return runLeaveMutation({
        requestId,
        sessionOptions: {
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:hr:leave:cancel',
            action: HR_ACTION.CANCEL,
        },
        mutate: async (service, authorization) => {
            await service.cancelLeaveRequest({ authorization, requestId, cancelledBy: authorization.userId, reason });
        },
        successMessage: 'Request cancelled.',
        errorMessage: 'Unable to cancel request.',
        logEvent: 'hr.leave.ui.cancel.failed',
    });
}

async function runLeaveMutation(params: {
    requestId: string;
    sessionOptions: Pick<SessionOptions, 'requiredAnyPermissions' | 'requiredPermissions' | 'auditSource' | 'action'>;
    mutate: (
        service: ReturnType<typeof getLeaveService>,
        authorization: Awaited<ReturnType<typeof getSessionContext>>['authorization'],
    ) => Promise<void>;
    successMessage: string;
    errorMessage: string;
    logEvent: string;
}): Promise<ActionResult> {
    const { requestId, sessionOptions, mutate, successMessage, errorMessage, logEvent } = params;

    try {
        const { authorization } = await getSessionContext({}, {
            headers: await headers(),
            ...sessionOptions,
            auditSource: sessionOptions.auditSource,
            action: sessionOptions.action,
            resourceType: HR_RESOURCE.HR_LEAVE,
            resourceAttributes: { requestId },
        });

        const service = getLeaveService();
        await mutate(service, authorization);
        return { status: 'success', message: successMessage };
    } catch (error) {
        appLogger.error(logEvent, {
            requestId,
            error: error instanceof Error ? error.message : String(error),
        });
        return { status: 'error', message: errorMessage };
    } finally {
        revalidatePath('/hr/leave');
        revalidatePath('/hr/leave/requests');
        revalidatePath('/hr/leave/balances');
    }
}
