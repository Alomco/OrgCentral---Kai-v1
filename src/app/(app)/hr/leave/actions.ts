'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { resolveHoursPerDay } from '@/server/domain/leave/hours-per-day-resolver';
import { PrismaAbsenceSettingsRepository } from '@/server/repositories/prisma/hr/absences';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import type { LeaveRequest } from '@/server/types/leave-types';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

import { leaveRequestFormValuesSchema } from './schema';
import type { LeaveRequestFormState } from './form-state';

function readFormString(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
}

function parseIsoDateInput(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error('Date is required.');
    }

    const date = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid date.');
    }

    return date.toISOString();
}

const absenceSettingsRepository = new PrismaAbsenceSettingsRepository();

export async function submitLeaveRequestAction(
    previous: LeaveRequestFormState,
    formData: FormData,
): Promise<LeaveRequestFormState> {
    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();

        session = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: { organization: ['read'] },
                auditSource: 'ui:hr:leave:submit',
                action: HR_ACTION.CREATE,
                resourceType: HR_RESOURCE.HR_LEAVE,
            },
        );
    } catch {
        return {
            status: 'error',
            message: 'Not authorized to submit leave requests.',
            values: previous.values,
        };
    }

    const candidate = {
        leaveType: readFormString(formData, 'leaveType'),
        startDate: readFormString(formData, 'startDate'),
        endDate: readFormString(formData, 'endDate') || undefined,
        totalDays: formData.get('totalDays'),
        isHalfDay: formData.get('isHalfDay'),
        reason: readFormString(formData, 'reason') || undefined,
    };

    const parsed = leaveRequestFormValuesSchema.safeParse(candidate);
    if (!parsed.success) {
        return { status: 'error', message: 'Invalid form data.', values: previous.values };
    }

    try {
        const { userId } = requireSessionUser(session.session);

        const startDate = parseIsoDateInput(parsed.data.startDate);
        const endDate = parsed.data.endDate ? parseIsoDateInput(parsed.data.endDate) : startDate;

        const hoursPerDay = await resolveHoursPerDay(absenceSettingsRepository, session.authorization.orgId);

        const requestId = randomUUID();
        const employeeName = session.session.user.name.length > 0
            ? session.session.user.name
            : session.session.user.email;

        const request: Omit<LeaveRequest, 'createdAt'> & { hoursPerDay: number } = {
            id: requestId,
            orgId: session.authorization.orgId,
            employeeId: session.authorization.userId,
            userId: session.authorization.userId,
            employeeName,
            leaveType: parsed.data.leaveType,
            startDate,
            endDate,
            reason: parsed.data.reason,
            totalDays: parsed.data.totalDays,
            isHalfDay: parsed.data.isHalfDay ?? false,
            status: 'submitted',
            createdBy: userId,
            submittedAt: new Date().toISOString(),
            hoursPerDay,
        };

        const service = getLeaveService();
        await service.submitLeaveRequest({ authorization: session.authorization, request });

        return {
            status: 'success',
            message: 'Leave request submitted.',
            values: {
                ...parsed.data,
                reason: '',
            },
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to submit leave request.',
            values: previous.values,
        };
    }
}
