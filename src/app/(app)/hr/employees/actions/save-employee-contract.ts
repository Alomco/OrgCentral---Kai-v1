'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { normalizeContractChanges } from '@/server/services/hr/people/helpers/onboard-payload.helpers';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

import { toFieldErrors, type FieldErrors } from '../../_components/form-errors';
import {
    employeeContractFormSchema,
    type EmployeeContractFormValues,
} from '../schema';
import type { EmployeeContractFormState } from '../form-state';
import {
    FIELD_CHECK_MESSAGE,
    buildEmployeeContractCandidate,
    normalizeOptionalText,
    parseDateField,
    parseJsonField,
} from '../action-helpers';
import {
    CONTRACT_AUTH_ERROR_MESSAGE,
    REVALIDATE_EMPLOYEE_LIST_PATH,
} from './constants';

export async function saveEmployeeContractAction(
    previous: EmployeeContractFormState,
    formData: FormData,
): Promise<EmployeeContractFormState> {
    const candidate = buildEmployeeContractCandidate(formData);

    const parsed = employeeContractFormSchema.safeParse(candidate);
    if (!parsed.success) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: toFieldErrors(parsed.error),
            values: previous.values,
        };
    }

    const startDateParsed = parseDateField(parsed.data.startDate, true);
    const endDateParsed = parseDateField(parsed.data.endDate, false);
    const probationDateParsed = parseDateField(parsed.data.probationEndDate, false);
    const furloughStartParsed = parseDateField(parsed.data.furloughStartDate, false);
    const furloughEndParsed = parseDateField(parsed.data.furloughEndDate, false);
    const workingPatternParsed = parseJsonField(parsed.data.workingPattern);
    const benefitsParsed = parseJsonField(parsed.data.benefits);

    const contractFieldErrors: FieldErrors<EmployeeContractFormValues> = {};

    const validationErrors = [
        ['startDate', startDateParsed.error],
        ['endDate', endDateParsed.error],
        ['probationEndDate', probationDateParsed.error],
        ['furloughStartDate', furloughStartParsed.error],
        ['furloughEndDate', furloughEndParsed.error],
        ['workingPattern', workingPatternParsed.error],
        ['benefits', benefitsParsed.error],
    ] as const satisfies readonly (readonly [
        Extract<keyof EmployeeContractFormValues, string>,
        string | undefined
    ])[];

    for (const [key, error] of validationErrors) {
        if (error) {
            contractFieldErrors[key] = error;
        }
    }

    if (Object.keys(contractFieldErrors).length > 0) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: contractFieldErrors,
            values: parsed.data,
        };
    }

    const contractId = parsed.data.contractId.trim();
    const isCreate = contractId.length === 0;

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            requiredPermissions: {
                employmentContract: [isCreate ? 'create' : 'update'],
            },
            auditSource: isCreate
                ? 'ui:hr:employees:contract:create'
                : 'ui:hr:employees:contract:update',
            action: isCreate ? HR_ACTION.CREATE : HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
            resourceAttributes: isCreate
                ? { employeeId: parsed.data.userId }
                : { contractId },
        });
    } catch {
        return {
            status: 'error',
            message: CONTRACT_AUTH_ERROR_MESSAGE,
            values: previous.values,
        };
    }

    const startDate = startDateParsed.date;
    if (!startDate) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: { startDate: 'Date is required.' },
            values: parsed.data,
        };
    }

    const contractUpdates = normalizeContractChanges({
        contractType: parsed.data.contractType,
        jobTitle: parsed.data.jobTitle,
        departmentId: normalizeOptionalText(parsed.data.departmentId),
        location: normalizeOptionalText(parsed.data.location),
        startDate,
        endDate: endDateParsed.date,
        probationEndDate: probationDateParsed.date,
        furloughStartDate: furloughStartParsed.date,
        furloughEndDate: furloughEndParsed.date,
        terminationReason: normalizeOptionalText(parsed.data.terminationReason),
        terminationNotes: normalizeOptionalText(parsed.data.terminationNotes),
        workingPattern: workingPatternParsed.value,
        benefits: benefitsParsed.value,
    });

    try {
        const peopleService = getPeopleService();

        if (isCreate) {
            await peopleService.createEmploymentContract({
                authorization: session.authorization,
                payload: {
                    contractData: {
                        ...contractUpdates,
                        userId: parsed.data.userId,
                        contractType: parsed.data.contractType,
                        jobTitle: parsed.data.jobTitle,
                        startDate,
                    },
                },
            });
        } else {
            await peopleService.updateEmploymentContract({
                authorization: session.authorization,
                payload: {
                    contractId,
                    contractUpdates,
                },
            });
        }

        revalidatePath(REVALIDATE_EMPLOYEE_LIST_PATH);
        revalidatePath(`/hr/employees/${parsed.data.profileId}`);

        return {
            status: 'success',
            message: isCreate ? 'Employment contract created.' : 'Employment contract updated.',
            fieldErrors: undefined,
            values: parsed.data,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to update employment contract.',
            fieldErrors: undefined,
            values: parsed.data,
        };
    }
}
