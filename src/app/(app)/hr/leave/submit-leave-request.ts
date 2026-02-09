'use server';

import type { LeaveRequestFormState } from './form-state';
import { resolveSession } from './submit-leave-session';
import { validateForm, parseDates } from './submit-leave-validation';
import { buildSubmissionContext, enforceBalance } from './submit-leave-policy';
import { persistRequest } from './submit-leave-persist';

export async function handleSubmitLeaveRequest(previous: LeaveRequestFormState, formData: FormData): Promise<LeaveRequestFormState> {
    const sessionResult = await resolveSession(previous);
    if (sessionResult.kind === 'error') {
        return sessionResult.state;
    }

    const validation = validateForm(previous, formData);
    if (validation.kind === 'error') {
        return validation.state;
    }

    const dateResult = parseDates(validation.data);
    if (dateResult.kind === 'error') {
        return dateResult.state;
    }

    const submissionContext = await buildSubmissionContext(
        sessionResult.session,
        validation.data,
        dateResult.dates,
    );
    if (submissionContext.kind === 'error') {
        return submissionContext.state;
    }

    const balanceCheck = await enforceBalance(
        submissionContext.context.policy,
        submissionContext.context.parsedData,
        submissionContext.context.session,
        submissionContext.context.employeeNumber,
    );
    if (balanceCheck.kind === 'error') {
        return balanceCheck.state;
    }

    return persistRequest({
        session: submissionContext.context.session,
        employeeNumber: submissionContext.context.employeeNumber,
        policy: submissionContext.context.policy,
        parsedData: submissionContext.context.parsedData,
        dates: submissionContext.context.dates,
        departmentId: submissionContext.context.departmentId,
        balanceWarning: balanceCheck.warning,
        formData,
    });
}
