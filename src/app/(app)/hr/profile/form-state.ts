import type { EmployeeProfile } from '@/server/types/hr-types';
import type { Certification } from '@/server/types/hr/people';

import type { FieldErrors } from '../_components/form-errors';
import type { SelfProfileFormValues } from './schema';

export interface SelfProfileFormState {
    status: 'idle' | 'success' | 'error';
    message?: string;
    fieldErrors?: FieldErrors<SelfProfileFormValues>;
    values: SelfProfileFormValues;
}

function formatText(value: string | null | undefined): string {
    return value ?? '';
}

function formatDate(value: Date | string | null | undefined): string {
    if (!value) {
        return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
    }
    return typeof value === 'string' ? value : '';
}

function formatSkills(skills: string[] | null | undefined): string {
    if (!skills || skills.length === 0) {
        return '';
    }
    return skills.join(', ');
}

function formatCertifications(certifications: Certification[] | null | undefined): string {
    if (!certifications || certifications.length === 0) {
        return '';
    }
    return certifications
        .map((certification) => {
            const parts = [
                certification.name,
                certification.issuer,
                formatDate(certification.dateObtained),
                formatDate(certification.expiryDate),
            ].filter((part) => part && part.trim().length > 0);
            return parts.join(' | ');
        })
        .join('\n');
}

export function buildInitialSelfProfileFormState(profile: EmployeeProfile): SelfProfileFormState {
    return {
        status: 'idle',
        fieldErrors: undefined,
        values: {
            profileId: profile.id,
            displayName: formatText(profile.displayName),
            firstName: formatText(profile.firstName),
            lastName: formatText(profile.lastName),
            personalEmail: formatText(profile.personalEmail),
            phoneWork: formatText(profile.phone?.work),
            phoneMobile: formatText(profile.phone?.mobile),
            phoneHome: formatText(profile.phone?.home),
            addressStreet: formatText(profile.address?.street),
            addressCity: formatText(profile.address?.city),
            addressState: formatText(profile.address?.state),
            addressPostalCode: formatText(profile.address?.postalCode),
            addressCountry: formatText(profile.address?.country),
            emergencyContactName: formatText(profile.emergencyContact?.name),
            emergencyContactRelationship: formatText(profile.emergencyContact?.relationship),
            emergencyContactPhone: formatText(profile.emergencyContact?.phone),
            emergencyContactEmail: formatText(profile.emergencyContact?.email ?? undefined),
            photoUrl: formatText(profile.photoUrl),
            skills: formatSkills(profile.skills ?? null),
            certifications: formatCertifications(profile.certifications ?? null),
        },
    };
}
