import { describe, it, expect, vi, beforeEach } from 'vitest';

import { LoginService, type LoginServiceInput } from '../login-service';
import type { LoginServiceDependencies } from '../login-service';
import type { OrganizationData } from '@/server/types/leave-types';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import { normalizeLeaveYearStartDate } from '@/server/types/org/leave-year-start-date';

function buildOrganization(overrides?: Partial<OrganizationData>): OrganizationData {
    return {
        id: 'org-123',
        slug: 'org-central',
        name: 'Org Central',
        regionCode: 'UK-LON',
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test-suite',
        auditBatchId: 'batch-1',
        leaveEntitlements: { annual: 25 },
        primaryLeaveType: 'annual',
        leaveYearStartDate: normalizeLeaveYearStartDate('01-01'),
        leaveRoundingRule: 'full_day',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    } satisfies OrganizationData;
}

function buildRepository(): {
    repository: IOrganizationRepository;
    getOrganizationBySlug: ReturnType<typeof vi.fn>;
} {
    const getOrganizationBySlug = vi.fn();
    const repository: IOrganizationRepository = {
        getOrganization: vi.fn(),
        getOrganizationBySlug,
        getLeaveEntitlements: vi.fn(async () => ({})),
        updateLeaveSettings: vi.fn(async () => undefined),
        updateOrganizationProfile: vi.fn(async () => buildOrganization()),
        createOrganization: vi.fn(async (input) =>
            buildOrganization({ slug: input.slug, name: input.name, dataResidency: input.dataResidency ?? 'UK_ONLY', dataClassification: input.dataClassification ?? 'OFFICIAL' }),
        ),
        addCustomLeaveType: vi.fn(async () => undefined),
        removeLeaveType: vi.fn(async () => undefined),
    };

    return { repository, getOrganizationBySlug };
}

type SignInEmailFunction = LoginServiceDependencies['authClient']['api']['signInEmail'];

function buildAuthClient(): {
    client: LoginServiceDependencies['authClient'];
    signInEmail: ReturnType<typeof vi.fn>;
} {
    const signInEmail = vi.fn();
    const client: LoginServiceDependencies['authClient'] = {
        api: {
            signInEmail: signInEmail as unknown as SignInEmailFunction,
        },
    };

    return { client, signInEmail };
}

function buildInput(overrides?: Partial<LoginServiceInput>): LoginServiceInput {
    return {
        credentials: {
            email: 'user@example.com',
            password: 'password',
            rememberMe: true,
        },
        tenant: {
            orgSlug: 'org-central',
        },
        request: {
            headers: new Headers(),
            ipAddress: '127.0.0.1',
            userAgent: 'vitest',
        },
        ...overrides,
    } satisfies LoginServiceInput;
}

describe('LoginService', () => {
    let authClient: LoginServiceDependencies['authClient'];
    let signInEmail: ReturnType<typeof vi.fn>;
    let organizationRepository: IOrganizationRepository;
    let getOrganizationBySlug: ReturnType<typeof vi.fn>;
    let service: LoginService;

    beforeEach(() => {
        const authClientFactory = buildAuthClient();
        authClient = authClientFactory.client;
        signInEmail = authClientFactory.signInEmail;
        const repository = buildRepository();
        organizationRepository = repository.repository;
        getOrganizationBySlug = repository.getOrganizationBySlug;
        service = new LoginService({ authClient, organizationRepository });
    });

    it('returns an organization not found error when slug lookup fails', async () => {
        getOrganizationBySlug.mockResolvedValueOnce(null);

        const result = await service.signIn(buildInput());

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.code).toBe('ORG_NOT_FOUND');
        }
        expect(signInEmail).not.toHaveBeenCalled();
    });

    it('delegates to Better Auth when organization exists', async () => {
        getOrganizationBySlug.mockResolvedValueOnce(buildOrganization());
        const signInResult = {
            user: { id: 'user-1' },
            url: '/app',
        } as const;
        const input = buildInput();
        const authHeaders = new Headers({ 'set-cookie': 'better-auth.session=abc; Path=/; HttpOnly' });
        signInEmail.mockResolvedValueOnce({ headers: authHeaders, response: signInResult });

        const result = await service.signIn(input);

        expect(signInEmail).toHaveBeenCalledWith({
            headers: input.request.headers,
            returnHeaders: true,
            body: {
                email: input.credentials.email,
                password: input.credentials.password,
                rememberMe: input.credentials.rememberMe,
            },
        });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.redirectUrl).toBe(signInResult.url);
        }
    });
});
