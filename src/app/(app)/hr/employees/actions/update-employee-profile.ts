'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { normalizeProfileChanges } from '@/server/services/hr/people/helpers/onboard-payload.helpers';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

import { toFieldErrors, type FieldErrors } from '../../_components/form-errors';
import {
    employeeProfileFormSchema,
    type EmployeeProfileFormValues,
} from '../schema';
import type { EmployeeProfileFormState } from '../form-state';
import {
    FIELD_CHECK_MESSAGE,
    buildEmergencyContact,
    buildPhoneNumbers,
    buildPostalAddress,
    buildEmployeeProfileCandidate,
    normalizeOptionalText,
    parseDateField,
    parseJsonField,
    parseOptionalNumberField,
} from '../action-helpers';
import {
    REVALIDATE_EMPLOYEE_LIST_PATH,
    UNAUTHORIZED_PROFILE_MESSAGE,
    UPDATE_PROFILE_ERROR_MESSAGE,
} from './constants';

export async function updateEmployeeProfileAction(
    previous: EmployeeProfileFormState,
    formData: FormData,
): Promise<EmployeeProfileFormState> {
    const candidate = buildEmployeeProfileCandidate(formData);

    const parsed = employeeProfileFormSchema.safeParse(candidate);
    if (!parsed.success) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: toFieldErrors(parsed.error),
            values: previous.values,
        };
    }

    const startDateParsed = parseDateField(parsed.data.startDate, false);
    const endDateParsed = parseDateField(parsed.data.endDate, false);
    const annualSalaryParsed = parseOptionalNumberField(parsed.data.annualSalary);
    const hourlyRateParsed = parseOptionalNumberField(parsed.data.hourlyRate);
    const salaryAmountParsed = parseOptionalNumberField(parsed.data.salaryAmount);
    const metadataParsed = parseJsonField(parsed.data.metadata);

    const fieldErrors: FieldErrors<EmployeeProfileFormValues> = {};
    if (startDateParsed.error) {
        fieldErrors.startDate = startDateParsed.error;
    }
    if (endDateParsed.error) {
        fieldErrors.endDate = endDateParsed.error;
    }
    if (annualSalaryParsed.error) {
        fieldErrors.annualSalary = annualSalaryParsed.error;
    }
    if (hourlyRateParsed.error) {
        fieldErrors.hourlyRate = hourlyRateParsed.error;
    }
    if (salaryAmountParsed.error) {
        fieldErrors.salaryAmount = salaryAmountParsed.error;
    }
    if (metadataParsed.error) {
        fieldErrors.metadata = metadataParsed.error;
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors,
            values: parsed.data,
        };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            requiredPermissions: { employeeProfile: ['update'] },
            auditSource: 'ui:hr:employees:profile:update',
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
            resourceAttributes: { profileId: parsed.data.profileId },
        });
    } catch {
        return {
            status: 'error',
            message: UNAUTHORIZED_PROFILE_MESSAGE,
            values: previous.values,
        };
    }

    const salaryFrequency = parsed.data.salaryFrequency
        ? (parsed.data.salaryFrequency)
        : null;
    const salaryBasis = parsed.data.salaryBasis
        ? (parsed.data.salaryBasis)
        : null;
    const paySchedule = parsed.data.paySchedule
        ? (parsed.data.paySchedule)
        : null;

    const profileUpdates = normalizeProfileChanges({
        displayName: normalizeOptionalText(parsed.data.displayName),
        firstName: normalizeOptionalText(parsed.data.firstName),
        lastName: normalizeOptionalText(parsed.data.lastName),
        email: normalizeOptionalText(parsed.data.email),
        personalEmail: normalizeOptionalText(parsed.data.personalEmail),
        phone: buildPhoneNumbers(
            parsed.data.phoneWork,
            parsed.data.phoneMobile,
            parsed.data.phoneHome,
        ),
        jobTitle: normalizeOptionalText(parsed.data.jobTitle),
        departmentId: normalizeOptionalText(parsed.data.departmentId),
        costCenter: normalizeOptionalText(parsed.data.costCenter),
        managerUserId: normalizeOptionalText(parsed.data.managerUserId),
        employmentType: parsed.data.employmentType,
        employmentStatus: parsed.data.employmentStatus,
        startDate: startDateParsed.date,
        endDate: endDateParsed.date,
        address: buildPostalAddress(
            parsed.data.addressStreet,
            parsed.data.addressCity,
            parsed.data.addressState,
            parsed.data.addressPostalCode,
            parsed.data.addressCountry,
        ),
        emergencyContact: buildEmergencyContact(
            parsed.data.emergencyContactName,
            parsed.data.emergencyContactRelationship,
            parsed.data.emergencyContactPhone,
            parsed.data.emergencyContactEmail,
        ),
        annualSalary: annualSalaryParsed.value,
        hourlyRate: hourlyRateParsed.value,
        salaryAmount: salaryAmountParsed.value,
        salaryCurrency: normalizeOptionalText(parsed.data.salaryCurrency),
        salaryFrequency,
        salaryBasis,
        paySchedule,
        metadata: metadataParsed.value,
    });

    try {
        const peopleService = getPeopleService();
        await peopleService.updateEmployeeProfile({
            authorization: session.authorization,
            payload: {
                profileId: parsed.data.profileId,
                profileUpdates,
            },
        });

        revalidatePath(REVALIDATE_EMPLOYEE_LIST_PATH);
        revalidatePath(`/hr/employees/${parsed.data.profileId}`);

        return {
            status: 'success',
            message: 'Employee profile updated.',
            fieldErrors: undefined,
            values: parsed.data,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : UPDATE_PROFILE_ERROR_MESSAGE,
            fieldErrors: undefined,
            values: parsed.data,
        };
    }
}
