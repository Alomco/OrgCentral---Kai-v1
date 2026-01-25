'use server';

import { headers } from 'next/headers';

import { ValidationError } from '@/server/errors';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import { withOrgContext } from '@/server/security/guards';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { generateEmployeeNumber } from '@/server/use-cases/shared/builders';

export interface GenerateEmployeeIdResult {
    employeeNumber: string;
}

const profileRepository = new PrismaEmployeeProfileRepository();
const MAX_ATTEMPTS = 6;

export async function generateNextEmployeeId(): Promise<GenerateEmployeeIdResult> {
    const headerStore = await headers();
    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.ONBOARDING_SEND,
            auditSource: 'ui:hr:onboarding:employee-id',
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE_TYPE.ONBOARDING_INVITE,
            resourceAttributes: { scope: 'identity', intent: 'generate' },
        },
    );

    const employeeNumber = await withOrgContext(
        {
            orgId: authorization.orgId,
            userId: authorization.userId,
            auditSource: authorization.auditSource,
            expectedClassification: authorization.dataClassification,
            expectedResidency: authorization.dataResidency,
            action: 'hr.onboarding.employee-id.generate',
            resourceType: HR_RESOURCE_TYPE.ONBOARDING_INVITE,
        },
        async () => {
            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
                const candidate = generateEmployeeNumber('EMP');
                const existing = await profileRepository.findByEmployeeNumber(
                    authorization.orgId,
                    candidate,
                );
                if (!existing) {
                    return candidate;
                }
            }
            throw new ValidationError('Unable to generate a unique employee number.');
        },
    );

    return { employeeNumber };
}
