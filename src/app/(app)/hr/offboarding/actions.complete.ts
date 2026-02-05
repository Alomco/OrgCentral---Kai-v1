'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { PrismaOffboardingRepository } from '@/server/repositories/prisma/hr/offboarding';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people/prisma-employee-profile-repository';
import { PrismaChecklistInstanceRepository } from '@/server/repositories/prisma/hr/onboarding';
import { createUserSessionRepository } from '@/server/repositories/providers/auth/user-session-repository-provider';
import { getMembershipService } from '@/server/services/org/membership/membership-service.provider';
import { completeOffboarding } from '@/server/use-cases/hr/offboarding';

import {
    EMPLOYEES_PATH,
    OFFBOARDING_PATH,
    completeSchema,
    readFormString,
    type OffboardingActionState,
} from './actions.shared';

export async function completeOffboardingAction(
    _previous: OffboardingActionState,
    formData: FormData,
): Promise<OffboardingActionState> {
    const parsed = completeSchema.safeParse({
        offboardingId: readFormString(formData, 'offboardingId'),
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid request.' };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            requiredPermissions: { [HR_RESOURCE.HR_OFFBOARDING]: ['complete'] },
            auditSource: 'ui:hr:offboarding:complete',
            action: HR_ACTION.COMPLETE,
            resourceType: HR_RESOURCE.HR_OFFBOARDING,
            resourceAttributes: { offboardingId: parsed.data.offboardingId },
        });
    } catch {
        return { status: 'error', message: 'Not authorized to complete offboarding.' };
    }

    try {
        const offboardingRepository = new PrismaOffboardingRepository();
        const employeeProfileRepository = new PrismaEmployeeProfileRepository();
        const checklistInstanceRepository = new PrismaChecklistInstanceRepository();
        const userSessionRepository = createUserSessionRepository();
        const membershipService = getMembershipService();

        await completeOffboarding(
            {
                offboardingRepository,
                employeeProfileRepository,
                checklistInstanceRepository,
                userSessionRepository,
                membershipService,
            },
            {
                authorization: session.authorization,
                offboardingId: parsed.data.offboardingId,
            },
        );

        revalidatePath(OFFBOARDING_PATH);
        revalidatePath(EMPLOYEES_PATH);

        return { status: 'success', message: 'Offboarding completed.' };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to complete offboarding.',
        };
    }
}
