import type { LoginActionInput, LoginActionResult } from '@/features/auth/login/login-contracts';
import { auth } from '@/server/lib/auth';
import { LoginService, type LoginServiceWithCookiesResult } from '@/server/services/auth/login-service';
import { buildOrganizationServiceDependencies } from '@/server/repositories/providers/org/organization-service-dependencies';
import { buildUserServiceDependencies } from '@/server/repositories/providers/org/user-service-dependencies';

export interface LoginUseCaseInput extends LoginActionInput {
    readonly headers: Headers;
}

let loginServiceInstance: LoginService | null = null;

function getLoginService(): LoginService {
    return (
        loginServiceInstance ??=
        new LoginService({
            authClient: auth,
            organizationRepository:
                buildOrganizationServiceDependencies().organizationRepository,
            userRepository: buildUserServiceDependencies().userRepository,
        })
    );
}

export function __setLoginServiceForTests(service: LoginService | null): void {
    loginServiceInstance = service;
}

export async function performLogin(input: LoginUseCaseInput): Promise<LoginActionResult> {
    const headers = input.headers;
    const ipAddress = extractIpAddress(headers.get('x-forwarded-for')) ?? headers.get('x-real-ip') ?? undefined;
    const userAgent = input.userAgent ?? headers.get('user-agent') ?? undefined;

    const loginService = getLoginService();
    return loginService.signIn({
        credentials: {
            email: input.email,
            password: input.password,
            rememberMe: input.rememberMe,
        },
        tenant: {
            orgSlug: input.orgSlug,
        },
        request: {
            headers,
            ipAddress,
            userAgent,
        },
    });
}

export interface LoginWithCookiesUseCaseInput extends LoginActionInput {
    readonly headers: Headers;
}

export async function performLoginWithCookies(
    input: LoginWithCookiesUseCaseInput,
): Promise<LoginServiceWithCookiesResult> {
    const headers = input.headers;
    const ipAddress = extractIpAddress(headers.get('x-forwarded-for')) ?? headers.get('x-real-ip') ?? undefined;
    const userAgent = input.userAgent ?? headers.get('user-agent') ?? undefined;

    const loginService = getLoginService();
    return loginService.signInWithCookies({
        credentials: {
            email: input.email,
            password: input.password,
            rememberMe: input.rememberMe,
        },
        tenant: {
            orgSlug: input.orgSlug,
        },
        request: {
            headers,
            ipAddress,
            userAgent,
        },
    });
}

function extractIpAddress(headerValue: string | null): string | undefined {
    if (!headerValue) {
        return undefined;
    }

    const [first] = headerValue.split(',');
    if (!first) {
        return undefined;
    }

    const trimmed = first.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

