export const OTP_LENGTH = 6;

export interface StatusMessage {
    tone: 'info' | 'error' | 'success';
    message: string;
}

export interface PasswordStatusResponse {
    hasPassword: boolean;
    providers: string[];
    message?: string;
}

export function isPasswordStatusResponse(value: unknown): value is PasswordStatusResponse {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.hasPassword !== 'boolean') {
        return false;
    }
    if (!Array.isArray(record.providers)) {
        return false;
    }
    return record.providers.every((provider) => typeof provider === 'string');
}

export function resolveMessage(value: unknown): string | null {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const record = value as Record<string, unknown>;
    return typeof record.message === 'string' ? record.message : null;
}

export function normalizeOtp(value: string): string {
    return value.replace(/\s+/g, '');
}
