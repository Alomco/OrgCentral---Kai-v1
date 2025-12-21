export interface ApiErrorResponseBody {
    error: {
        code?: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

export type FieldErrorMap = Record<string, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponseBody {
    if (!isRecord(value)) {
        return false;
    }

    const errorCandidate = value.error;
    if (!isRecord(errorCandidate)) {
        return false;
    }

    return typeof errorCandidate.message === 'string';
}

function hasErrorsArray(value: unknown): value is Record<string, unknown> & { _errors: unknown[] } {
    if (!isRecord(value)) {
        return false;
    }

    return Array.isArray(value._errors);
}

export function parseFieldErrors(details: unknown): FieldErrorMap {
    if (!isRecord(details)) {
        return {};
    }

    const parsed: FieldErrorMap = {};
    const entries = Object.entries(details);

    for (const [key, entryCandidate] of entries) {
        if (!hasErrorsArray(entryCandidate) || entryCandidate._errors.length === 0) {
            continue;
        }

        const firstMessage = entryCandidate._errors.find((item): item is string => typeof item === 'string');
        if (firstMessage) {
            parsed[key] = firstMessage;
        }
    }

    return parsed;
}
