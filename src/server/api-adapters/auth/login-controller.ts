import type {
    LoginActionResult,
} from '@/features/auth/login/login-contracts';
import { loginSchema, toFieldErrors } from '@/features/auth/login/login-contracts';
import { performLogin } from '@/server/use-cases/auth/login';
import { performLoginWithCookies } from '@/server/use-cases/auth/login';

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

    const { result, headers } = await performLoginWithCookies({
        ...parsed.data,
        headers: context.headers,
    });

    return { result, headers };
}
