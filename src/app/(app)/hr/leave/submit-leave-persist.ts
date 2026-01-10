'use server';

import { randomUUID } from 'node:crypto';

import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';

import { parseClientAttachments, readFormString } from './lib/leave-request-helpers';
import type { LeaveRequestFormState } from './form-state';
import type { LeaveRequestFormValues } from './schema';
import type { PolicyContext, SessionContext } from './submit-leave-types';
import type { LeaveRequest } from '@/server/types/leave-types';

export async function persistRequest(params: {
    session: SessionContext;
    policy: PolicyContext;
    parsedData: LeaveRequestFormValues;
    dates: { startDate: string; endDate: string };
    departmentId: string | null;
    balanceWarning: string | null;
    formData: FormData;
}): Promise<LeaveRequestFormState> {
    const { session, policy, parsedData, dates, departmentId, balanceWarning, formData } = params;
    const { userId } = requireSessionUser(session.session);
    const requestId = readFormString(formData, 'requestId') || randomUUID();
    const employeeName = session.session.user.name.length > 0
        ? session.session.user.name
        : session.session.user.email;

    const request: Omit<LeaveRequest, 'createdAt'> & { hoursPerDay: number } = {
        id: requestId,
        orgId: session.authorization.orgId,
        employeeId: session.authorization.userId,
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
    await leaveService.submitLeaveRequest({ authorization: session.authorization, request });

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
