import type { ContractTypeCode, EmploymentTypeCode, JsonValue, ProfileMutationPayload, SalaryBasisCode } from '@/server/types/hr/people';
import { CONTRACT_TYPE_VALUES, EMPLOYMENT_TYPE_VALUES, SALARY_BASIS_VALUES } from '@/server/types/hr/people';

export function resolveEmploymentType(value?: string): EmploymentTypeCode {
    if (!value) {
        return 'FULL_TIME';
    }
    const normalizedValue = value.replace(/[-\s]/g, '_').toUpperCase();
    const normalized =
        normalizedValue === 'CONTRACT'
            ? 'CONTRACTOR'
            : normalizedValue === 'TEMPORARY'
                ? 'FIXED_TERM'
                : normalizedValue;
    return (EMPLOYMENT_TYPE_VALUES.includes(normalized as EmploymentTypeCode)
        ? normalized
        : 'FULL_TIME') as EmploymentTypeCode;
}

export function resolveContractType(
    value: string | undefined,
    employmentType: string | undefined,
): ContractTypeCode | null {
    if (value) {
        const normalized = value.replace(/[-\s]/g, '_').toUpperCase();
        if (CONTRACT_TYPE_VALUES.includes(normalized as ContractTypeCode)) {
            return normalized as ContractTypeCode;
        }
    }
    const fallback = employmentType?.replace(/[-\s]/g, '_').toUpperCase();
    if (fallback === 'CONTRACTOR') {
        return 'AGENCY';
    }
    if (fallback === 'INTERN' || fallback === 'APPRENTICE') {
        return 'APPRENTICESHIP';
    }
    return 'PERMANENT';
}

export function normalizePaySchedule(
    value?: string,
): ProfileMutationPayload['changes']['paySchedule'] {
    if (!value) {
        return undefined;
    }
    const normalizedValue = value.replace(/[-\s]/g, '_').toUpperCase();
    const normalized = normalizedValue === 'BIWEEKLY' ? 'BI_WEEKLY' : normalizedValue;
    if (normalized === 'MONTHLY') {
        return 'MONTHLY';
    }
    if (normalized === 'BI_WEEKLY') {
        return 'BI_WEEKLY';
    }
    return undefined;
}

export function normalizeSalaryBasis(value?: string): SalaryBasisCode | undefined {
    if (!value) {
        return undefined;
    }
    const normalized = value.replace(/[-\s]/g, '_').toUpperCase();
    return SALARY_BASIS_VALUES.includes(normalized as SalaryBasisCode)
        ? (normalized as SalaryBasisCode)
        : undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function extractStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    const next = value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    return next.length > 0 ? next : undefined;
}

export function coerceString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export function coerceNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

export function isJsonValue(value: unknown): value is JsonValue {
    if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every(isJsonValue);
    }
    if (isRecord(value)) {
        return Object.values(value).every(isJsonValue);
    }
    return false;
}
