'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { PrismaOffboardingRepository } from '@/server/repositories/prisma/hr/offboarding';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people/prisma-employee-profile-repository';
import { cancelOffboarding } from '@/server/use-cases/hr/offboarding';

import {
    EMPLOYEES_PATH,
    OFFBOARDING_PATH,
    cancelSchema,
    readFormString,
    type OffboardingActionState,
} from './actions.shared';

export async function cancelOffboardingAction(
    _previous: OffboardingActionState,
    formData: FormData,
): Promise<OffboardingActionState> {
    const parsed = cancelSchema.safeParse({
        offboardingId: readFormString(formData, 'offboardingId'),
        reason: readFormString(formData, 'reason') || undefined,
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid request.' };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            requiredPermissions: { [HR_RESOURCE.HR_OFFBOARDING]: ['cancel'] },
            auditSource: 'ui:hr:offboarding:cancel',
            action: HR_ACTION.CANCEL,
            resourceType: HR_RESOURCE.HR_OFFBOARDING,
            resourceAttributes: { offboardingId: parsed.data.offboardingId },
        });
    } catch {
        return { status: 'error', message: 'Not authorized to cancel offboarding.' };
    }

    try {
        const offboardingRepository = new PrismaOffboardingRepository();
        const employeeProfileRepository = new PrismaEmployeeProfileRepository();

        await cancelOffboarding(
            { offboardingRepository, employeeProfileRepository },
            {
                authorization: session.authorization,
                offboardingId: parsed.data.offboardingId,
                reason: parsed.data.reason,
            },
        );

        revalidatePath(OFFBOARDING_PATH);
        revalidatePath(EMPLOYEES_PATH);

        return { status: 'success', message: 'Offboarding cancelled.' };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to cancel offboarding.',
        };
    }
}
