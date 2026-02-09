'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { appLogger } from '@/server/logging/structured-logger';

import { parseClientAttachments, readFormString } from './lib/leave-request-helpers';
import type { LeaveRequestFormState } from './form-state';
import type { LeaveRequestFormValues } from './schema';
import type { PolicyContext, SessionContext } from './submit-leave-types';
import type { LeaveRequest } from '@/server/types/leave-types';

export async function persistRequest(params: {
    session: SessionContext;
    employeeNumber: string;
    policy: PolicyContext;
    parsedData: LeaveRequestFormValues;
    dates: { startDate: string; endDate: string };
    departmentId: string | null;
    balanceWarning: string | null;
    formData: FormData;
}): Promise<LeaveRequestFormState> {
    const { session, employeeNumber, policy, parsedData, dates, departmentId, balanceWarning, formData } = params;
    const { userId } = requireSessionUser(session.session);
    const requestId = readFormString(formData, 'requestId') || randomUUID();
    const employeeName = session.session.user.name.length > 0
        ? session.session.user.name
        : session.session.user.email;

    const request: Omit<LeaveRequest, 'createdAt'> & { hoursPerDay: number } = {
        id: requestId,
        orgId: session.authorization.orgId,
        employeeId: employeeNumber,
        userId: session.authorization.userId,
        employeeName,
        departmentId,
        leaveType: parsedData.leaveType,
        startDate: dates.startDate,
        endDate: dates.endDate,
        reason: parsedData.reason,
        totalDays: parsedData.totalDays,
        isHalfDay: Boolean(parsedData.isHalfDay),
        status: 'submitted',
        createdBy: userId,
        submittedAt: new Date().toISOString(),
        hoursPerDay: policy.hoursPerDay,
        dataResidency: session.authorization.dataResidency,
        dataClassification: session.authorization.dataClassification,
        auditSource: session.authorization.auditSource || 'ui:hr:leave:submit',
    };

    const leaveService = getLeaveService();
    try {
        await leaveService.submitLeaveRequest({ authorization: session.authorization, request });
    } catch (error) {
        const message = toErrorMessage(error);
        appLogger.error('hr.leave.submit.failed', {
            orgId: session.authorization.orgId,
            requestId,
            error: message,
        });
        return {
            status: 'error',
            message,
            fieldErrors: undefined,
            values: parsedData,
        };
    }

    const attachments = parseClientAttachments(readFormString(formData, 'attachments'));
    if (attachments.length > 0) {
        await leaveService.addLeaveAttachments({
            authorization: session.authorization,
            requestId,
            attachments,
        });
    }

    const notes = [
        ...policy.warnings.map((warning) => warning.message),
        ...(balanceWarning ? [balanceWarning] : []),
    ];

    revalidatePath('/hr/leave');
    revalidatePath('/hr/leave/requests');
    revalidatePath('/hr/leave/balances');

    return {
        status: 'success',
        message: notes.length > 0
            ? `Leave request submitted. Note: ${notes.join(' ')}`
            : 'Leave request submitted.',
        fieldErrors: undefined,
        values: {
            ...parsedData,
            reason: '',
        },
    };
}

function toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }
    if (error && typeof error === 'object') {
        const record = error as Record<string, unknown>;
        if (typeof record.message === 'string' && record.message.trim().length > 0) {
            return record.message;
        }
        if (record.error && typeof record.error === 'object') {
            const nested = record.error as Record<string, unknown>;
            if (typeof nested.message === 'string' && nested.message.trim().length > 0) {
                return nested.message;
            }
        }
        try {
            const serialized = JSON.stringify(record);
            if (serialized && serialized !== '{}' && serialized !== '[]') {
                return `Unknown error: ${serialized}`;
            }
        } catch {
            // Ignore serialization failures and fall through.
        }
    }
    return 'Unable to submit leave request.';
}
