import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';

import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import { getOrganization as getOrganizationUseCaseImpl } from '@/server/use-cases/org/organization/get-organization';
import type { GetOrganizationResult } from '@/server/use-cases/org/organization/get-organization';
import { updateOrganizationProfile as updateOrganizationProfileUseCaseImpl } from '@/server/use-cases/org/organization/update-profile';
import type {
    UpdateOrganizationProfileResult,
} from '@/server/use-cases/org/organization/update-profile';

const contactInfoSchema = z
    .object({
        name: z.string().trim().min(1).max(120),
        email: z.email().max(254),
        phone: z.string().trim().min(1).max(64).optional(),
    })
    .strict();

const contactDetailsSchema = z
    .object({
        primaryBusinessContact: contactInfoSchema.optional(),
        accountsFinanceContact: contactInfoSchema.optional(),
    })
    .strict();

const AUDIT_SOURCE = {
    get: 'api:org:organization:get',
    updateProfile: 'api:org:organization:update-profile',
} as const;

const updateOrganizationProfileSchema = z
    .object({
        name: z.string().trim().min(1).max(120).optional(),
        address: z.string().trim().min(1).max(200).nullable().optional(),
        phone: z.string().trim().min(1).max(64).nullable().optional(),
        website: z.string().trim().min(1).max(2048).nullable().optional(),
        companyType: z.string().trim().min(1).max(120).nullable().optional(),
        industry: z.string().trim().min(1).max(120).nullable().optional(),
        employeeCountRange: z.string().trim().min(1).max(120).nullable().optional(),
        incorporationDate: z.string().trim().min(4).max(32).nullable().optional(),
        registeredOfficeAddress: z.string().trim().min(1).max(250).nullable().optional(),
        contactDetails: contactDetailsSchema.nullable().optional(),
    })
    .strict();

export async function getOrganizationController(
    request: Request,
    orgId: string,
): Promise<GetOrganizationResult> {
    const normalizedOrgId = orgId.trim();
    if (!normalizedOrgId) {
        throw new ValidationError('Organization id is required.');
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { organization: ['read'] },
            auditSource: AUDIT_SOURCE.get,
            action: 'org.organization.read',
            resourceType: 'org.organization',
            resourceAttributes: { orgId: normalizedOrgId },
        },
    );

    const repository = new PrismaOrganizationRepository();
    return getOrganizationUseCaseImpl(
        { organizationRepository: repository },
        {
            authorization,
            orgId: normalizedOrgId,
        },
    );
}

export async function updateOrganizationProfileController(
    request: Request,
    orgId: string,
): Promise<UpdateOrganizationProfileResult> {
    const normalizedOrgId = orgId.trim();
    if (!normalizedOrgId) {
        throw new ValidationError('Organization id is required.');
    }

    const body = await readJson(request);
    const updates = updateOrganizationProfileSchema.parse(body);

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { organization: ['update'] },
            auditSource: AUDIT_SOURCE.updateProfile,
            action: 'org.organization.update',
            resourceType: 'org.organization',
            resourceAttributes: { orgId: normalizedOrgId },
        },
    );

    const repository = new PrismaOrganizationRepository();
    return updateOrganizationProfileUseCaseImpl(
        { organizationRepository: repository },
        {
            authorization,
            orgId: normalizedOrgId,
            updates,
        },
    );
}
