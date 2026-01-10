'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { normalizeProfileChanges } from '@/server/services/hr/people/helpers/onboard-payload.helpers';

import { toFieldErrors } from '../_components/form-errors';
import {
    FIELD_CHECK_MESSAGE,
    buildEmergencyContact,
    buildPhoneNumbers,
    buildPostalAddress,
    normalizeOptionalText,
    readFormString,
} from '../employees/action-helpers';
import type { SelfProfileFormState } from './form-state';
import { selfProfileFormSchema } from './schema';

const UPDATE_PROFILE_ERROR = 'Unable to update your profile.';
const UNAUTHORIZED_MESSAGE = 'Not authorized to update your profile.';

function buildSelfProfileCandidate(formData: FormData) {
    return {
        profileId: readFormString(formData, 'profileId'),
        displayName: readFormString(formData, 'displayName'),
        firstName: readFormString(formData, 'firstName'),
        lastName: readFormString(formData, 'lastName'),
        personalEmail: readFormString(formData, 'personalEmail'),
        phoneWork: readFormString(formData, 'phoneWork'),
        phoneMobile: readFormString(formData, 'phoneMobile'),
        phoneHome: readFormString(formData, 'phoneHome'),
        addressStreet: readFormString(formData, 'addressStreet'),
        addressCity: readFormString(formData, 'addressCity'),
        addressState: readFormString(formData, 'addressState'),
        addressPostalCode: readFormString(formData, 'addressPostalCode'),
        addressCountry: readFormString(formData, 'addressCountry'),
        emergencyContactName: readFormString(formData, 'emergencyContactName'),
        emergencyContactRelationship: readFormString(formData, 'emergencyContactRelationship'),
        emergencyContactPhone: readFormString(formData, 'emergencyContactPhone'),
        emergencyContactEmail: readFormString(formData, 'emergencyContactEmail'),
        photoUrl: readFormString(formData, 'photoUrl'),
        skills: readFormString(formData, 'skills'),
        certifications: readFormString(formData, 'certifications'),
    };
}

function parseSkillsInput(value: string): string[] {
    return Array.from(
        new Set(
            value
                .split(/[\n,]/)
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0),
        ),
    );
}

interface CertificationInput {
    name: string;
    issuer: string;
    dateObtained: string;
    expiryDate?: string;
}

function parseCertificationsInput(value: string): {
    certifications: CertificationInput[];
    error?: string;
} {
    const lines = value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length === 0) {
        return { certifications: [] };
    }

    const certifications: CertificationInput[] = [];
    const invalidLines: number[] = [];

    lines.forEach((line, index) => {
        const parts = line.split('|').map((part) => part.trim());
        const name = parts[0] ?? '';
        const issuer = parts[1] ?? '';
        const dateObtained = parts[2] ?? '';
        const expiryDate = parts[3] ?? '';

        if (!name || !issuer || !dateObtained) {
            invalidLines.push(index + 1);
            return;
        }

        const record: CertificationInput = {
            name,
            issuer,
            dateObtained,
        };

        if (expiryDate) {
            record.expiryDate = expiryDate;
        }

        certifications.push(record);
    });

    if (invalidLines.length > 0) {
        return {
            certifications: [],
            error: 'Each certification needs name, issuer, and date obtained (one per line).',
        };
    }

    return { certifications };
}

export async function updateSelfProfileAction(
    previous: SelfProfileFormState,
    formData: FormData,
): Promise<SelfProfileFormState> {
    const candidate = buildSelfProfileCandidate(formData);
    const parsed = selfProfileFormSchema.safeParse(candidate);

    if (!parsed.success) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: toFieldErrors(parsed.error),
            values: previous.values,
        };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            // We rely on the service layer to enforce ownership/ABAC for self-profile updates
            // rather than a global "update all profiles" permission check here.
            auditSource: 'ui:hr:profile:update',
        });
    } catch {
        return {
            status: 'error',
            message: UNAUTHORIZED_MESSAGE,
            values: previous.values,
        };
    }

    const parsedSkills = parseSkillsInput(parsed.data.skills);
    const certificationsResult = parseCertificationsInput(parsed.data.certifications);
    if (certificationsResult.error) {
        return {
            status: 'error',
            message: FIELD_CHECK_MESSAGE,
            fieldErrors: {
                certifications: certificationsResult.error,
            },
            values: parsed.data,
        };
    }

    const profileUpdates = normalizeProfileChanges({
        displayName: normalizeOptionalText(parsed.data.displayName),
        firstName: normalizeOptionalText(parsed.data.firstName),
        lastName: normalizeOptionalText(parsed.data.lastName),
        personalEmail: normalizeOptionalText(parsed.data.personalEmail),
        phone: buildPhoneNumbers(
            parsed.data.phoneWork,
            parsed.data.phoneMobile,
            parsed.data.phoneHome,
        ),
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
        photoUrl: normalizeOptionalText(parsed.data.photoUrl),
        skills: parsedSkills,
        certifications: certificationsResult.certifications,
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

        revalidatePath('/hr/profile');

        return {
            status: 'success',
            message: 'Profile updated.',
            fieldErrors: undefined,
            values: parsed.data,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : UPDATE_PROFILE_ERROR,
            fieldErrors: undefined,
            values: parsed.data,
        };
    }
}
