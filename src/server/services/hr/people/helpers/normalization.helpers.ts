import type {
    Certification,
    EmploymentStatusCode,
    EmploymentTypeCode,
    JsonValue,
    SalaryDetail,
} from '@/server/types/hr/people';
import {
    CONTRACT_TYPE_VALUES,
    EMPLOYMENT_STATUS_VALUES,
    EMPLOYMENT_TYPE_VALUES,
} from '@/server/types/hr/people';

export function normalizeContractType(
    value: unknown,
): typeof CONTRACT_TYPE_VALUES[number] | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim().replace(/[-\s]/g, '_').toUpperCase();
    if (CONTRACT_TYPE_VALUES.includes(normalized as typeof CONTRACT_TYPE_VALUES[number])) {
        return normalized as typeof CONTRACT_TYPE_VALUES[number];
    }

    const map: Record<string, typeof CONTRACT_TYPE_VALUES[number]> = {
        contractor: 'AGENCY',
        contract: 'AGENCY',
        agency: 'AGENCY',
        consultant: 'CONSULTANT',
        consultancy: 'CONSULTANT',
        intern: 'INTERNSHIP',
        internship: 'INTERNSHIP',
        apprentice: 'APPRENTICESHIP',
        apprenticeship: 'APPRENTICESHIP',
        'fixed-term': 'FIXED_TERM',
        fixed_term: 'FIXED_TERM',
        'fixed term': 'FIXED_TERM',
        permanent: 'PERMANENT',
    };

    return map[value.trim().toLowerCase()];
}

export function normalizeContractPayload(
    raw: Record<string, unknown>,
): Record<string, unknown> {
    const contractType = normalizeContractType(raw.contractType);
    return contractType ? { ...raw, contractType } : raw;
}

export function normalizeEmploymentType(
    value: unknown,
): EmploymentTypeCode | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim().replace(/[-\s]/g, '_').toUpperCase();
    if (EMPLOYMENT_TYPE_VALUES.includes(normalized as EmploymentTypeCode)) {
        return normalized as EmploymentTypeCode;
    }

    const map: Record<string, EmploymentTypeCode> = {
        'full-time': 'FULL_TIME',
        full_time: 'FULL_TIME',
        'full time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        part_time: 'PART_TIME',
        'part time': 'PART_TIME',
        contract: 'CONTRACTOR',
        contractor: 'CONTRACTOR',
        intern: 'INTERN',
        internship: 'INTERN',
        apprentice: 'APPRENTICE',
        apprenticeship: 'APPRENTICE',
        'fixed-term': 'FIXED_TERM',
        fixed_term: 'FIXED_TERM',
        'fixed term': 'FIXED_TERM',
        casual: 'CASUAL',
    };

    return map[value.trim().toLowerCase()];
}

export function normalizeEmploymentStatus(
    value: unknown,
): EmploymentStatusCode | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim().replace(/[-\s]/g, '_').toUpperCase();
    if (EMPLOYMENT_STATUS_VALUES.includes(normalized as EmploymentStatusCode)) {
        return normalized as EmploymentStatusCode;
    }

    const map: Record<string, EmploymentStatusCode> = {
        active: 'ACTIVE',
        'on-leave': 'ON_LEAVE',
        on_leave: 'ON_LEAVE',
        'on leave': 'ON_LEAVE',
        terminated: 'TERMINATED',
        inactive: 'INACTIVE',
        offboarding: 'OFFBOARDING',
        archived: 'ARCHIVED',
    };

    return map[value.trim().toLowerCase()];
}

export function normalizeJsonValue(value: unknown): JsonValue | null | undefined {
    if (value === null || value === undefined) {
        return value === null ? null : undefined;
    }
    if (isJsonValue(value)) {
        return value;
    }
    return undefined;
}

export function normalizeSalaryDetail(value: unknown): SalaryDetail | null | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
    }

    const candidate = value as Record<string, unknown>;
    const detail: SalaryDetail = {};
    let hasValue = false;

    if (typeof candidate.amount === 'number' && Number.isFinite(candidate.amount)) {
        detail.amount = candidate.amount;
        hasValue = true;
    }
    if (typeof candidate.currency === 'string' && candidate.currency.trim().length > 0) {
        detail.currency = candidate.currency.trim();
        hasValue = true;
    }

    const frequency = coerceSalaryFrequency(candidate.frequency);
    if (frequency) {
        detail.frequency = frequency;
        hasValue = true;
    }

    const paySchedule = coercePaySchedule(candidate.paySchedule);
    if (paySchedule) {
        detail.paySchedule = paySchedule;
        hasValue = true;
    }

    return hasValue ? detail : undefined;
}

export function normalizeCertifications(value: unknown): Certification[] | null | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (!Array.isArray(value)) {
        return undefined;
    }

    if (value.length === 0) {
        return [];
    }

    const normalized = value
        .map((entry) => normalizeCertificationEntry(entry))
        .filter((entry): entry is Certification => entry !== null);

    return normalized.length > 0 ? normalized : undefined;
}

const SALARY_DETAIL_FREQUENCIES = new Set<NonNullable<SalaryDetail['frequency']>>([
    'hourly',
    'monthly',
    'annually',
]);

const PAY_SCHEDULE_DETAIL_VALUES = new Set<NonNullable<SalaryDetail['paySchedule']>>([
    'monthly',
    'bi-weekly',
]);

function normalizeCertificationEntry(entry: unknown): Certification | null {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
    }

    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.name !== 'string' || typeof candidate.issuer !== 'string') {
        return null;
    }

    const dateObtained = coerceDateInput(candidate.dateObtained);
    if (!dateObtained) {
        return null;
    }

    const certification: Certification = {
        name: candidate.name,
        issuer: candidate.issuer,
        dateObtained,
    };

    const expiryDate = coerceDateInput(candidate.expiryDate);
    if (expiryDate) {
        certification.expiryDate = expiryDate;
    }

    return certification;
}

function coerceSalaryFrequency(value: unknown): NonNullable<SalaryDetail['frequency']> | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }
    const normalized = value.toLowerCase() as NonNullable<SalaryDetail['frequency']>;
    return SALARY_DETAIL_FREQUENCIES.has(normalized) ? normalized : undefined;
}

function coercePaySchedule(value: unknown): NonNullable<SalaryDetail['paySchedule']> | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }
    const normalized = value.toLowerCase() as NonNullable<SalaryDetail['paySchedule']>;
    return PAY_SCHEDULE_DETAIL_VALUES.has(normalized) ? normalized : undefined;
}

function coerceDateInput(value: unknown): Date | string | undefined {
    if (value instanceof Date) {
        return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }
    return undefined;
}

function isJsonValue(value: unknown): value is JsonValue {
    if (value === null) {
        return true;
    }
    const valueType = typeof value;
    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every(isJsonValue);
    }
    if (valueType === 'object') {
        return Object.values(value as Record<string, unknown>).every(isJsonValue);
    }
    return false;
}
