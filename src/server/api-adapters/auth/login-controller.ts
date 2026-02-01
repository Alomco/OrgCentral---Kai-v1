import type {
    LoginActionResult,
} from '@/features/auth/login/login-contracts';
import { loginSchema, toFieldErrors } from '@/features/auth/login/login-contracts';
import { performLogin } from '@/server/use-cases/auth/login';
import { performLoginWithCookies } from '@/server/use-cases/auth/login';
import {
    buildLoginRateLimitKey,
    checkLoginRateLimit,
} from '@/server/lib/security/login-rate-limit';
import { SecurityConfigurationProvider } from '@/server/security/security-configuration-provider';

interface LoginControllerContext {
    headers: Headers;
}

export async function executeLogin(
    input: unknown,
    context: LoginControllerContext,
): Promise<LoginActionResult> {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false,
            code: 'VALIDATION_ERROR',
            message: 'Please review the highlighted fields.',
            fieldErrors: toFieldErrors(parsed.error),
        };
    }

    return performLogin({
        ...parsed.data,
        headers: context.headers,
    });
}

export interface ExecuteLoginWithCookiesResult {
    result: LoginActionResult;
    headers: Headers | null;
}

export async function executeLoginWithCookies(
    input: unknown,
    context: LoginControllerContext,
): Promise<ExecuteLoginWithCookiesResult> {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
        return {
            result: {
                ok: false,
                code: 'VALIDATION_ERROR',
                message: 'Please review the highlighted fields.',
                fieldErrors: toFieldErrors(parsed.error),
            },
            headers: null,
        } satisfies ExecuteLoginWithCookiesResult;
    }

    const securityConfig = SecurityConfigurationProvider.getInstance().getConfigSnapshot();
    const ipAddress = resolveIpAddress(context.headers);
    const key = buildLoginRateLimitKey({
        orgSlug: parsed.data.orgSlug,
        email: parsed.data.email,
        ipAddress,
    });

    const rateLimit = checkLoginRateLimit(key, 15 * 60 * 1000, securityConfig.maxLoginAttempts);
    if (!rateLimit.allowed) {
        return {
            result: {
                ok: false,
                code: 'RATE_LIMITED',
                message: 'Too many login attempts. Please try again later.',
            },
            headers: null,
        } satisfies ExecuteLoginWithCookiesResult;
    }

    const { result, headers } = await performLoginWithCookies({
        ...parsed.data,
        headers: context.headers,
    });

    return { result, headers };
}

function resolveIpAddress(headers: Headers): string | undefined {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        const [first] = forwarded.split(',');
        const trimmed = first.trim();
        return trimmed && trimmed.length > 0 ? trimmed : undefined;
    }

    const realIp = headers.get('x-real-ip');
    return realIp && realIp.trim().length > 0 ? realIp.trim() : undefined;
}
