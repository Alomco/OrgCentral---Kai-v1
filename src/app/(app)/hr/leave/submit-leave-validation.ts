import { parseIsoDateInput, readFormString, toDateFieldError } from './lib/leave-request-helpers';
import { leaveRequestFormValuesSchema } from './schema';
import type { LeaveRequestFormState } from './form-state';
import { toFieldErrors } from '../_components/form-errors';
import type { LeaveRequestFormValues } from './schema';
import type { ParsedDatesResult, ValidationResult } from './submit-leave-types';

const FIELD_CHECK_MESSAGE = 'Check the highlighted fields and try again.';

export function validateForm(previous: LeaveRequestFormState, formData: FormData): ValidationResult {
    const candidate: Record<string, unknown> = {
        leaveType: readFormString(formData, 'leaveType'),
        startDate: readFormString(formData, 'startDate'),
        endDate: readFormString(formData, 'endDate') || undefined,
        totalDays: formData.get('totalDays'),
        isHalfDay: formData.get('isHalfDay'),
        reason: readFormString(formData, 'reason') || undefined,
    };

    const parsed = leaveRequestFormValuesSchema.safeParse(candidate);
    if (!parsed.success) {
        return {
            kind: 'error',
            state: {
                status: 'error',
                message: FIELD_CHECK_MESSAGE,
                fieldErrors: toFieldErrors(parsed.error),
                values: {
                    ...previous.values,
                    leaveType: typeof candidate.leaveType === 'string' ? candidate.leaveType : previous.values.leaveType,
                    startDate: typeof candidate.startDate === 'string' ? candidate.startDate : previous.values.startDate,
                    endDate: typeof candidate.endDate === 'string' ? candidate.endDate : previous.values.endDate,
                    reason: typeof candidate.reason === 'string' ? candidate.reason : previous.values.reason,
                    totalDays: previous.values.totalDays,
                    isHalfDay: previous.values.isHalfDay,
                },
            },
        };
    }

    return { kind: 'ok', data: parsed.data };
}

export function parseDates(parsedData: LeaveRequestFormValues): ParsedDatesResult {
    try {
        const startDate = parseIsoDateInput(parsedData.startDate);
        const today = getTodayDateInputValue();
        if (parsedData.startDate < today) {
            return {
                kind: 'error',
                state: {
                    status: 'error',
                    message: FIELD_CHECK_MESSAGE,
                    fieldErrors: { startDate: 'Start date cannot be in the past.' },
                    values: parsedData,
                },
            };
        }

        if (parsedData.endDate) {
            try {
                const endDate = parseIsoDateInput(parsedData.endDate);
                if (parsedData.endDate < parsedData.startDate) {
                    return {
                        kind: 'error',
                        state: {
                            status: 'error',
                            message: FIELD_CHECK_MESSAGE,
                            fieldErrors: { endDate: 'End date must be on or after the start date.' },
                            values: parsedData,
                        },
                    };
                }
                return { kind: 'ok', dates: { startDate, endDate } };
            } catch (error) {
                return {
                    kind: 'error',
                    state: {
                        ...toDateFieldError('endDate', error, FIELD_CHECK_MESSAGE),
                        values: parsedData,
                    },
                };
            }
        }

        return { kind: 'ok', dates: { startDate, endDate: startDate } };
    } catch (error) {
        return {
            kind: 'error',
            state: {
                ...toDateFieldError('startDate', error, FIELD_CHECK_MESSAGE),
                values: parsedData,
            },
        };
    }
}

function getTodayDateInputValue(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year.toString()}-${month}-${day}`;
}
