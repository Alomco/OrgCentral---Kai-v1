import { randomUUID } from 'node:crypto';
import { APIError } from 'better-auth';

import type {
    LoginActionResult,
    LoginFieldErrors,
} from '@/features/auth/login/login-contracts';
import type { auth } from '@/server/lib/auth';
import { AbstractBaseService, type ServiceExecutionContext } from '@/server/services/abstract-base-service';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import { organizationToTenantScope } from '@/server/security/guards';
import type { OrganizationData } from '@/server/types/leave-types';

const LOGIN_OPERATION = 'auth.login.signInEmail';
const LOGIN_ACTION = 'auth.login' as const;

type LoginServiceFailureResult = Extract<LoginActionResult, { ok: false }>;

type AuthSignInEmailFunction = (typeof auth)['api']['signInEmail'];

interface BetterAuthSignInEmailSuccessPayload {
    user: { id: string };
    url?: string | null;
}

interface BetterAuthHeadersResponse {
    headers: Headers;
    response: BetterAuthSignInEmailSuccessPayload;
}

interface OrganizationLookupRepository {
    getOrganizationBySlug(slug: string): Promise<OrganizationData | null>;
}

export interface LoginServiceDependencies {
    readonly authClient: {
        api: {
            signInEmail: AuthSignInEmailFunction;
        };
    };
    readonly organizationRepository: IOrganizationRepository;
}

export interface LoginServiceInput {
    readonly credentials: {
        email: string;
        password: string;
        rememberMe?: boolean;
    };
    readonly tenant: {
        orgSlug: string;
    };
    readonly request: {
        headers: Headers;
        ipAddress?: string;
        userAgent?: string;
    };
}

export interface LoginServiceWithCookiesResult {
    result: LoginActionResult;
    headers: Headers | null;
}

export class LoginService extends AbstractBaseService {
    private readonly authClient: LoginServiceDependencies['authClient'];
    private readonly organizationRepository: OrganizationLookupRepository;

    constructor(dependencies: LoginServiceDependencies) {
        super();
        this.authClient = dependencies.authClient;
        this.organizationRepository = dependencies.organizationRepository;
    }

    async signIn(input: LoginServiceInput): Promise<LoginActionResult> {
        const { result } = await this.signInWithCookies(input);
        return result;
    }

    async signInWithCookies(input: LoginServiceInput): Promise<LoginServiceWithCookiesResult> {
        const rawOrganization: unknown = await this.organizationRepository.getOrganizationBySlug(
            input.tenant.orgSlug,
        );

        if (!rawOrganization || !isOrganizationData(rawOrganization)) {
            this.logger.warn('auth.login.organization_missing', {
                action: LOGIN_ACTION,
                event: 'organization_not_found',
                orgSlug: input.tenant.orgSlug,
                timestamp: new Date().toISOString(),
            });

            return {
                result: {
                    ok: false,
                    code: 'ORG_NOT_FOUND',
                    message: 'We could not find that organization. Double-check the slug or contact your administrator.',
                } satisfies LoginActionResult,
                headers: null,
            } satisfies LoginServiceWithCookiesResult;
        }

        const organization = rawOrganization;

        const { slug: orgSlug, id: orgId, dataResidency, dataClassification } = organization;
        const serviceContext = buildServiceContext({
            organization,
            requestHeaders: input.request.headers,
        });

        return this.executeInServiceContext(serviceContext, LOGIN_OPERATION, async () => {
            try {
                const { headers, response } = (await this.authClient.api.signInEmail({
                    headers: input.request.headers,
                    returnHeaders: true,
                    body: {
                        email: input.credentials.email,
                        password: input.credentials.password,
                        rememberMe: input.credentials.rememberMe ?? true,
                    },
                })) as BetterAuthHeadersResponse;

                const payload = response;
                const userId = payload.user.id;
                if (typeof userId !== 'string' || userId.length === 0) {
                    throw new Error('Auth provider returned an invalid login payload.');
                }

                this.logger.info('auth.login.success', {
                    action: LOGIN_ACTION,
                    event: 'login_success',
                    orgSlug,
                    orgId,
                    userId,
                    userEmail: input.credentials.email,
                    residency: dataResidency,
                    classification: dataClassification,
                    ipAddress: input.request.ipAddress ?? null,
                    userAgent: input.request.userAgent ?? null,
                    timestamp: new Date().toISOString(),
                });

                return {
                    result: {
                        ok: true,
                        message: 'Login successful. Redirecting you now…',
                        redirectUrl: payload.url ?? '/app',
                    } satisfies LoginActionResult,
                    headers,
                } satisfies LoginServiceWithCookiesResult;
            } catch (error) {
                const failure = normalizeAuthError(error);

                const reason = failure.code ?? 'UNKNOWN';

                this.logger.warn('auth.login.failure', {
                    action: LOGIN_ACTION,
                    event: 'login_failure',
                    orgSlug,
                    orgId,
                    userEmail: input.credentials.email,
                    residency: dataResidency,
                    classification: dataClassification,
                    ipAddress: input.request.ipAddress ?? null,
                    userAgent: input.request.userAgent ?? null,
                    timestamp: new Date().toISOString(),
                    reason,
                });

                return { result: failure, headers: null } satisfies LoginServiceWithCookiesResult;
            }
        });
    }
}

interface ServiceContextInput {
    organization: OrganizationData;
    requestHeaders: Headers;
}

function buildServiceContext(input: ServiceContextInput): ServiceExecutionContext {
    const tenantScope = organizationToTenantScope(input.organization);

    const correlationId = input.requestHeaders.get('x-correlation-id') ?? randomUUID();

    const authorization: RepositoryAuthorizationContext = {
        orgId: tenantScope.orgId,
        userId: 'anonymous',
        roleKey: 'custom',
        permissions: {},
        dataResidency: tenantScope.dataResidency,
        dataClassification: tenantScope.dataClassification,
        auditSource: tenantScope.auditSource,
        auditBatchId: tenantScope.auditBatchId,
        correlationId,
        tenantScope,
    };

    return {
        authorization,
        correlationId,
        metadata: {
            orgSlug: input.organization.slug,
            residency: tenantScope.dataResidency,
            classification: tenantScope.dataClassification,
        },
    } satisfies ServiceExecutionContext;
}

function normalizeAuthError(error: unknown): LoginServiceFailureResult {
    if (error instanceof APIError) {
        const message = error.body?.message ?? 'We could not sign you in with those credentials.';
        const fieldErrors = coerceFieldErrors(error.body?.errors);
        return {
            ok: false,
            code: error.body?.code ?? 'AUTH_ERROR',
            message,
            fieldErrors,
        } satisfies LoginActionResult;
    }

    return {
        ok: false,
        code: 'UNKNOWN',
        message: 'An unexpected error occurred while signing you in.',
    } satisfies LoginActionResult;
}

function coerceFieldErrors(value: unknown): LoginFieldErrors | undefined {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    const normalized = entries.reduce<LoginFieldErrors>((accumulator, [field, entry]) => {
        if (typeof entry === 'string') {
            accumulator[field] = entry;
            return accumulator;
        }

        if (Array.isArray(entry)) {
            const firstMessage = entry.find((item): item is string => typeof item === 'string');
            if (firstMessage) {
                accumulator[field] = firstMessage;
            }
            return accumulator;
        }

        if (entry && typeof entry === 'object') {
            const nested = (entry as { _errors?: unknown[] })._errors;
            if (Array.isArray(nested)) {
                const nestedMessage = nested.find((item): item is string => typeof item === 'string');
                if (nestedMessage) {
                    accumulator[field] = nestedMessage;
                }
            }
        }

        return accumulator;
    }, {});

    return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function isOrganizationData(value: unknown): value is OrganizationData {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<OrganizationData>;
    return (
        typeof candidate.id === 'string' &&
        typeof candidate.slug === 'string' &&
        typeof candidate.dataResidency === 'string' &&
        typeof candidate.dataClassification === 'string'
    );
}
