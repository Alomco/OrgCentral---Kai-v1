'use server';

import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { resolveHoursPerDay } from '@/server/domain/leave/hours-per-day-resolver';
import { PrismaAbsenceSettingsRepository } from '@/server/repositories/prisma/hr/absences';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { checkUkDefaultLeavePolicy, loadUkBankHolidays } from '@/server/domain/leave/uk-leave-policy';

import {
    resolveJurisdictionFromOrg,
    resolvePolicyOverrides,
} from './lib/leave-request-helpers';
import type {
    BalanceCheck,
    ParsedDates,
    PolicyContext,
    SubmissionContextResult,
    SessionContext,
} from './submit-leave-types';
import type { LeaveRequestFormValues } from './schema';

const absenceSettingsRepository = new PrismaAbsenceSettingsRepository();

export async function buildSubmissionContext(
    session: SessionContext,
    parsedData: LeaveRequestFormValues,
    dates: ParsedDates,
): Promise<SubmissionContextResult> {
    const { userId } = requireSessionUser(session.session);
    const peopleService = getPeopleService();
    const profileResult = await peopleService.getEmployeeProfileByUser({
        authorization: session.authorization,
        payload: { userId },
    }).catch(() => null);
    const departmentId = profileResult?.profile?.departmentId ?? null;

    const leaveService = getLeaveService();
    const existingRequestsResult = await leaveService.listLeaveRequests({
        authorization: session.authorization,
        employeeId: session.authorization.userId,
    });

    const overrides = await resolvePolicyOverrides(parsedData.leaveType, session.authorization);
    const jurisdiction = overrides.jurisdiction
        ? resolveJurisdictionFromOrg(overrides.jurisdiction)
        : resolveJurisdictionFromOrg(session.authorization.dataResidency);
    const bankHolidays = await loadUkBankHolidays({ jurisdiction });
    const policyCheck = checkUkDefaultLeavePolicy({
        startDate: new Date(dates.startDate),
        endDate: new Date(dates.endDate),
        totalDays: parsedData.totalDays,
        existingRequests: existingRequestsResult.requests,
        jurisdiction,
        bankHolidays,
        overrides: {
            maxConsecutiveDays: overrides.maxConsecutiveDays ?? undefined,
            noticeMultiplier: overrides.noticeMultiplier ?? undefined,
        },
    });

    if (policyCheck.blocking.length > 0) {
        const first = policyCheck.blocking[0];
        const fieldErrors = first.field ? { [first.field]: first.message } : undefined;

        return {
            kind: 'error',
            state: {
                status: 'error',
                message: first.message,
                fieldErrors,
                values: parsedData,
            },
        };
    }

    const policy: PolicyContext = {
        hoursPerDay: await resolveHoursPerDay(absenceSettingsRepository, session.authorization),
        existingRequests: existingRequestsResult.requests,
        jurisdiction,
        bankHolidays,
        overrides,
        warnings: policyCheck.warnings,
    };

    return {
        kind: 'ok',
        context: {
            session,
            parsedData,
            dates,
            policy,
            departmentId,
        },
    };
}

export async function enforceBalance(
    policy: PolicyContext,
    parsedData: LeaveRequestFormValues,
    session: SessionContext,
): Promise<BalanceCheck> {
    const leaveService = getLeaveService();
    const balances = await leaveService.getLeaveBalance({ authorization: session.authorization, employeeId: session.authorization.userId });
    const matchingBalance = balances.balances.find((balance) => balance.leaveType === parsedData.leaveType);

    if (matchingBalance && parsedData.totalDays > matchingBalance.available && !policy.overrides.allowNegativeBalance) {
        return {
            kind: 'error',
            state: {
                status: 'error',
                message: 'Requested days exceed available balance.',
                fieldErrors: { totalDays: 'Exceeds available balance.' },
                values: parsedData,
            },
        };
    }

    const warning = matchingBalance && parsedData.totalDays > matchingBalance.available && policy.overrides.allowNegativeBalance
        ? 'Request exceeds balance but is allowed by policy overrides.'
        : null;

    return { kind: 'ok', warning };
}
