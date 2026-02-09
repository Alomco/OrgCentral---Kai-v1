import {
    ComplianceTier,
    DataClassificationLevel,
    DataResidencyZone,
    OrganizationStatus,
} from '@/server/types/prisma';
import { syncBetterAuthUserToPrisma } from '@/server/lib/auth-sync';
import { AuthorizationError, ValidationError } from '@/server/errors';
import type { PlatformProvisioningConfig } from '@/server/repositories/contracts/platform';
import type { JsonRecord } from '@/server/types/json';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { appLogger } from '@/server/logging/structured-logger';
import { extractIpAddress, extractUserAgent } from '@/server/use-cases/shared/request-metadata';
import {
    BOOTSTRAP_SEED_SOURCE,
    assertUuid,
    constantTimeEquals,
    isBootstrapEnabled,
    requireBootstrapSecret,
    resolvePlatformConfig,
} from './admin-bootstrap.helpers';
import { buildAdminBootstrapDependencies, type AdminBootstrapOverrides } from './admin-bootstrap.dependencies';
import { seedAdminBootstrapData } from './admin-bootstrap.seed';
import { recordBootstrapAuditEvent } from './admin-bootstrap.audit';
import { provisionBootstrapOrganization } from './admin-bootstrap.provisioning';
import type { AuthSession } from '@/server/lib/auth';

export interface AdminBootstrapInput {
    token: string;
    requestHeaders: Headers;
}

export interface AdminBootstrapResult {
    orgId: string;
    role: string;
    redirectTo: string;
    setActiveHeaders: Headers;
}

export async function runAdminBootstrap(
    overrides: AdminBootstrapOverrides,
    input: AdminBootstrapInput,
): Promise<AdminBootstrapResult> {
    const deps = buildAdminBootstrapDependencies(overrides);
    const ipAddress = extractIpAddress(input.requestHeaders);
    const userAgent = extractUserAgent(input.requestHeaders);
    let auditOrgId: string | null = null;

    try {
        const { session, normalizedEmail, userId } = await resolveBootstrapSession(deps, input);

        const syncUser = deps.syncAuthUser ?? syncBetterAuthUserToPrisma;
        await syncUser({
            id: userId,
            email: normalizedEmail,
            name: typeof session.user.name === 'string' ? session.user.name : null,
            emailVerified: true,
            lastSignInAt: new Date(),
            updatedAt: new Date(),
        });

        const config = resolvePlatformConfig();
        const superAdminMetadata: JsonRecord = {
            seedSource: BOOTSTRAP_SEED_SOURCE,
            roles: [config.roleName],
            bootstrapProvider: 'oauth',
        };

        const provisioningConfig: PlatformProvisioningConfig = {
            slug: config.platformOrgSlug,
            name: config.platformOrgName,
            regionCode: config.platformRegionCode,
            tenantId: config.platformTenantId,
            status: OrganizationStatus.ACTIVE,
            complianceTier: ComplianceTier.GOV_SECURE,
            dataResidency: DataResidencyZone.UK_ONLY,
            dataClassification: DataClassificationLevel.OFFICIAL,
        };

        const { organization } = await provisionBootstrapOrganization({
            deps,
            provisioningConfig,
            roleName: config.roleName,
            userId,
            seedSource: BOOTSTRAP_SEED_SOURCE,
            superAdminMetadata,
        });
        auditOrgId = organization.id;

        const { headers: setActiveHeaders } = await deps.auth.api.setActiveOrganization({
            headers: input.requestHeaders,
            body: { organizationId: organization.id },
            returnHeaders: true,
        });

        await seedAdminBootstrapData({
            orgId: organization.id,
            userId,
            roleKey: config.roleName,
            dataResidency: organization.dataResidency,
            dataClassification: organization.dataClassification,
        });

        await recordBootstrapAuditEvent({
            orgId: organization.id,
            userId,
            eventType: 'SYSTEM',
            action: 'admin.bootstrap.completed',
            resource: 'platform.bootstrap',
            resourceId: organization.id,
            residencyZone: organization.dataResidency,
            classification: organization.dataClassification,
            auditSource: BOOTSTRAP_SEED_SOURCE,
            payload: {
                role: config.roleName,
                ipAddress,
                userAgent,
            },
        });

        return {
            orgId: organization.id,
            role: config.roleName,
            redirectTo: `/two-factor/setup?next=${encodeURIComponent('/admin/dashboard')}`,
            setActiveHeaders,
        };
    } catch (error) {
        if (auditOrgId) {
            try {
                await recordAuditEvent({
                    orgId: auditOrgId,
                    eventType: 'SYSTEM',
                    action: 'admin.bootstrap.failed',
                    resource: 'platform.bootstrap',
                    auditSource: BOOTSTRAP_SEED_SOURCE,
                    payload: {
                        errorType: error instanceof Error ? error.name : 'UnknownError',
                        ipAddress,
                        userAgent,
                    },
                });
            } catch (auditError) {
                appLogger.error('admin.bootstrap.audit.failed', {
                    error: auditError instanceof Error ? auditError.message : 'Unknown error',
                });
            }
        } else {
            appLogger.warn('admin.bootstrap.audit.skipped', {
                reason: 'platform-org-not-created',
                errorType: error instanceof Error ? error.name : 'UnknownError',
            });
        }
        throw error;
    }
}

async function resolveBootstrapSession(
    deps: ReturnType<typeof buildAdminBootstrapDependencies>,
    input: AdminBootstrapInput,
): Promise<{ session: NonNullable<AuthSession>; normalizedEmail: string; userId: string }> {
    if (!isBootstrapEnabled()) {
        throw new AuthorizationError('Admin bootstrap is disabled.');
    }

    const expectedSecret = requireBootstrapSecret();
    if (!constantTimeEquals(input.token, expectedSecret)) {
        throw new AuthorizationError('Invalid bootstrap secret.');
    }

    const session = await deps.auth.api.getSession({ headers: input.requestHeaders });
    if (!session?.session) {
        throw new AuthorizationError('Unauthenticated request.', { reason: 'unauthenticated' });
    }

    const activeSession = session as NonNullable<AuthSession>;

    const userEmail = activeSession.user.email;
    if (typeof userEmail !== 'string' || userEmail.trim().length === 0) {
        throw new ValidationError('Authenticated user is missing an email address.');
    }

    const normalizedEmail = userEmail.trim().toLowerCase();
    const userId = await deps.provisioningRepository.ensureAuthUserIdIsUuid(
        activeSession.user.id,
        normalizedEmail,
    );
    assertUuid(userId, 'User id');

    return { session: activeSession, normalizedEmail, userId };
}
