import { headers } from 'next/headers';

import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import { getOrganization } from '@/server/use-cases/org/organization/get-organization';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { OrganizationData } from '@/server/types/leave-types';
import type { OrgContext } from './org-context';
import { cacheOrgRead } from './org-cache';

export interface OrgProfile {
    organization: OrganizationData;
}

export async function getOrgProfile(context: OrgContext): Promise<OrgProfile> {
    const headerStore = await headers();
    const session = await getSessionContext(
        {},
        {
            headers: headerStore,
            orgId: context.orgId,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:org-profile',
        },
    );

    const scopedContext: OrgContext = {
        orgId: session.authorization.orgId,
        residency: session.authorization.dataResidency,
        classification: session.authorization.dataClassification,
    };

    return cacheOrgRead(scopedContext, 'org:profile', async () => {
        const organizationRepository = new PrismaOrganizationRepository();
        const result = await getOrganization(
            { organizationRepository },
            { authorization: session.authorization, orgId: session.authorization.orgId },
        );
        return { organization: result.organization };
    });
}
