import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { ValidationError } from '@/server/errors';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { readJson } from '../../http/request-utils';
import { organizationProfileUpdateSchema } from '../../../validators/org/organization-profile';
import {
    organizationCreateSchema,
    type OrganizationCreateInput,
} from '../../../validators/org/organization-create';
import { createOrganizationWithOwner } from '@/server/services/org/organization/organization-service';
import type { CreateOrganizationWithOwnerResult } from '@/server/use-cases/org/organization/create-organization-with-owner';
import { fetchOrganization, updateOrganizationProfile } from '@/server/services/org/organization/organization-service';
import type { GetOrganizationResult } from '@/server/use-cases/org/organization/get-organization';
import type {
    UpdateOrganizationProfileResult,
} from '@/server/use-cases/org/organization/update-profile';


const AUDIT_SOURCE = {
    get: 'api:org:organization:get',
    updateProfile: 'api:org:organization:update-profile',
    create: 'api:org:organization:create',
} as const;

const ORG_ID_REQUIRED_MESSAGE = 'Organization id is required.';

const ORG_ORGANIZATION_RESOURCE_TYPE = 'org.organization';


export async function getOrganizationController(
    request: Request,
    orgId: string,
): Promise<GetOrganizationResult> {
    const normalizedOrgId = orgId.trim();
    if (!normalizedOrgId) {
        throw new ValidationError(ORG_ID_REQUIRED_MESSAGE);
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { organization: ['read'] },
            auditSource: AUDIT_SOURCE.get,
            action: 'org.organization.read',
            resourceType: ORG_ORGANIZATION_RESOURCE_TYPE,
            resourceAttributes: { orgId: normalizedOrgId },
        },
    );

    return fetchOrganization(authorization, normalizedOrgId);
}

export async function updateOrganizationProfileController(
    request: Request,
    orgId: string,
): Promise<UpdateOrganizationProfileResult> {
    const normalizedOrgId = orgId.trim();
    if (!normalizedOrgId) {
        throw new ValidationError(ORG_ID_REQUIRED_MESSAGE);
    }

    const body = await readJson(request);
    const updates = organizationProfileUpdateSchema.parse(body);

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { organization: ['update'] },
            auditSource: AUDIT_SOURCE.updateProfile,
            action: 'org.organization.update',
            resourceType: ORG_ORGANIZATION_RESOURCE_TYPE,
            resourceAttributes: { orgId: normalizedOrgId },
        },
    );

    return updateOrganizationProfile(authorization, normalizedOrgId, updates);
}

export async function createOrganizationController(
    request: Request,
): Promise<CreateOrganizationWithOwnerResult> {
    const orgIdHeader = request.headers.get('x-org-id');
    const normalizedOrgId = orgIdHeader?.trim() ?? '';
    if (!normalizedOrgId) {
        throw new ValidationError(ORG_ID_REQUIRED_MESSAGE);
    }

    const body = await readJson<OrganizationCreateInput>(request);
    const payload = organizationCreateSchema.parse(body);

    const resourceAttributes = {
        tenantId: normalizedOrgId,
        slug: payload.slug,
        regionCode: payload.regionCode,
        ...(payload.dataResidency ? { dataResidency: payload.dataResidency } : {}),
        ...(payload.dataClassification ? { dataClassification: payload.dataClassification } : {}),
    };

    const { authorization, session } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { organization: ['create'] },
            expectedResidency: payload.dataResidency,
            expectedClassification: payload.dataClassification,
            auditSource: AUDIT_SOURCE.create,
            action: 'org.organization.create',
            resourceType: 'org.organization',
            resourceAttributes,
        },
    );

    const { email } = requireSessionUser(session);
    if (!email || email.trim().length === 0) {
        throw new ValidationError('Authenticated user email is required to create an organization.');
    }

    const displayName =
        typeof session.user.name === 'string' && session.user.name.trim().length > 0
            ? session.user.name.trim()
            : undefined;

    return createOrganizationWithOwner(
        authorization,
        {
            actor: {
                userId: authorization.userId,
                email,
                displayName,
            },
            organization: {
                slug: payload.slug,
                name: payload.name,
                regionCode: payload.regionCode,
                tenantId: authorization.orgId,
                dataResidency: payload.dataResidency ?? authorization.dataResidency,
                dataClassification: payload.dataClassification ?? authorization.dataClassification,
            },
        },
    );
}
