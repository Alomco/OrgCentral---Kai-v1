import type { LeaveRequest } from '@/server/types/leave-types';
import type { checkUkDefaultLeavePolicy } from '@/server/domain/leave/uk-leave-policy';
import type { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';

import type { LeaveRequestFormState } from './form-state';
import type { LeaveRequestFormValues } from './schema';
import type { resolveJurisdictionFromOrg, resolvePolicyOverrides } from './lib/leave-request-helpers';

export type SessionContext = Awaited<ReturnType<typeof getSessionContext>>;
export type PolicyWarnings = ReturnType<typeof checkUkDefaultLeavePolicy>['warnings'];

export interface ValidationOk {
    kind: 'ok';
    data: LeaveRequestFormValues;
}

export interface ValidationError {
    kind: 'error';
    state: LeaveRequestFormState;
}

export type ValidationResult = ValidationOk | ValidationError;

export interface ParsedDates {
    startDate: string;
    endDate: string;
}

export interface ParsedDatesOk {
    kind: 'ok';
    dates: ParsedDates;
}

export interface ParsedDatesError {
    kind: 'error';
    state: LeaveRequestFormState;
}

export type ParsedDatesResult = ParsedDatesOk | ParsedDatesError;

export interface PolicyContext {
    hoursPerDay: number;
    existingRequests: LeaveRequest[];
    jurisdiction: ReturnType<typeof resolveJurisdictionFromOrg>;
    bankHolidays: string[];
    overrides: Awaited<ReturnType<typeof resolvePolicyOverrides>>;
    warnings: PolicyWarnings;
}

export interface SubmissionContext {
    session: SessionContext;
    employeeNumber: string;
    parsedData: LeaveRequestFormValues;
    dates: ParsedDates;
    policy: PolicyContext;
    departmentId: string | null;
}

export interface SubmissionContextOk {
    kind: 'ok';
    context: SubmissionContext;
}

export interface SubmissionContextError {
    kind: 'error';
    state: LeaveRequestFormState;
}

export type SubmissionContextResult = SubmissionContextOk | SubmissionContextError;

export interface BalanceCheckOk {
    kind: 'ok';
    warning: string | null;
}

export interface BalanceCheckError {
    kind: 'error';
    state: LeaveRequestFormState;
}

export type BalanceCheck = BalanceCheckOk | BalanceCheckError;
