import type { LoginActionResult, LoginFieldErrors } from '@/features/auth/login/login-contracts';

type UnknownRecord = Record<string, unknown>;

function isRecord(candidate: unknown): candidate is UnknownRecord {
    return typeof candidate === 'object' && candidate !== null;
}

export function isLoginActionResult(payload: unknown): payload is LoginActionResult {
    if (!isRecord(payload)) {
        return false;
    }

    return typeof payload.ok === 'boolean' && typeof payload.message === 'string';
}

export function normalizeFieldErrors(fieldErrors?: LoginFieldErrors): LoginFieldErrors {
    if (!fieldErrors) {
        return {};
    }

    return Object.entries(fieldErrors).reduce<LoginFieldErrors>((accumulator, [key, value]) => {
        if (typeof value === 'string') {
            accumulator[key] = value;
        }
        return accumulator;
    }, {});
}

export type { LoginFieldErrors } from '@/features/auth/login/login-contracts';

