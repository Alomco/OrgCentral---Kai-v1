import { randomUUID } from 'node:crypto';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import { resolveIdentityCacheScopes } from '@/server/lib/cache-tags/identity';
import { invalidateCache } from '@/server/lib/cache-tags';

export async function buildAuthorizationContext(input: {
    organizationRepository?: IOrganizationRepository;
    orgId: string;
    userId: string;
    correlationId?: string;
}): Promise<RepositoryAuthorizationContext> {
    const organization = await input.organizationRepository?.getOrganization(input.orgId);
    const dataClassification: DataClassificationLevel =
        organization?.dataClassification ?? 'OFFICIAL';
    const dataResidency: DataResidencyZone = organization?.dataResidency ?? 'UK_ONLY';
    const auditSource = 'identity.accept-invitation';
    const correlation = input.correlationId ?? randomUUID();
    const now = new Date();

    return {
        orgId: input.orgId,
        userId: input.userId,
        roleKey: 'custom',
        dataResidency,
        dataClassification,
        auditSource,
        auditBatchId: undefined,
        correlationId: correlation,
        roleName: null,
        roleId: null,
        roleScope: null,
        sessionId: correlation,
        roles: ['custom'],
        permissions: {},
        mfaVerified: false,
        ipAddress: 'unknown',
        userAgent: 'unknown',
        authenticatedAt: now,
        sessionExpiresAt: new Date(now.getTime() + 30 * 60 * 1000),
        lastActivityAt: now,
        requiresMfa: false,
        piiAccessRequired: false,
        dataBreachRisk: false,
        sessionToken: correlation,
        authorizedAt: now,
        authorizationReason: 'identity.accept-invitation',
        tenantScope: {
            orgId: input.orgId,
            dataResidency,
            dataClassification,
            auditSource,
            auditBatchId: undefined,
        },
    };
}

export async function invalidateIdentityCache(authorization: RepositoryAuthorizationContext): Promise<void> {
    const scopes = resolveIdentityCacheScopes();
    await Promise.all(
        scopes.map((scope) =>
            invalidateCache({
                orgId: authorization.orgId,
                scope,
                classification: authorization.dataClassification,
                residency: authorization.dataResidency,
            }),
        ),
    );
}
