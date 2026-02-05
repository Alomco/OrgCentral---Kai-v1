'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { PrismaOffboardingRepository } from '@/server/repositories/prisma/hr/offboarding';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people/prisma-employee-profile-repository';
import {
    PrismaChecklistTemplateRepository,
    PrismaChecklistInstanceRepository,
    PrismaProvisioningTaskRepository,
    PrismaOnboardingWorkflowTemplateRepository,
    PrismaOnboardingWorkflowRunRepository,
    PrismaEmailSequenceTemplateRepository,
    PrismaEmailSequenceEnrollmentRepository,
    PrismaEmailSequenceDeliveryRepository,
    PrismaOnboardingMetricDefinitionRepository,
    PrismaOnboardingMetricResultRepository,
} from '@/server/repositories/prisma/hr/onboarding';
import { createUserSessionRepository } from '@/server/repositories/providers/auth/user-session-repository-provider';
import { getMembershipService } from '@/server/services/org/membership/membership-service.provider';
import { startOffboarding } from '@/server/use-cases/hr/offboarding';

import {
    EMPLOYEES_PATH,
    OFFBOARDING_PATH,
    readFormString,
    startSchema,
    type OffboardingActionState,
    type OffboardingMode,
} from './actions.shared';

export async function startOffboardingAction(
    _previous: OffboardingActionState,
    formData: FormData,
): Promise<OffboardingActionState> {
    const parsed = startSchema.safeParse({
        profileId: readFormString(formData, 'profileId'),
        mode: readFormString(formData, 'mode') as OffboardingMode,
        templateId: readFormString(formData, 'templateId') || undefined,
        reason: readFormString(formData, 'reason'),
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Check the form fields and try again.' };
    }

    let session: Awaited<ReturnType<typeof getSessionContext>>;
    try {
        const headerStore = await headers();
        session = await getSessionContext({}, {
            headers: headerStore,
            requiredPermissions: { [HR_RESOURCE.HR_OFFBOARDING]: ['create'] },
            auditSource: 'ui:hr:offboarding:start',
            action: HR_ACTION.CREATE,
            resourceType: HR_RESOURCE.HR_OFFBOARDING,
            resourceAttributes: { profileId: parsed.data.profileId, mode: parsed.data.mode },
        });
    } catch {
        return { status: 'error', message: 'Not authorized to start offboarding.' };
    }

    try {
        const offboardingRepository = new PrismaOffboardingRepository();
        const employeeProfileRepository = new PrismaEmployeeProfileRepository();
        const checklistTemplateRepository = new PrismaChecklistTemplateRepository();
        const checklistInstanceRepository = new PrismaChecklistInstanceRepository();
        const provisioningTaskRepository = new PrismaProvisioningTaskRepository();
        const workflowTemplateRepository = new PrismaOnboardingWorkflowTemplateRepository();
        const workflowRunRepository = new PrismaOnboardingWorkflowRunRepository();
        const emailSequenceTemplateRepository = new PrismaEmailSequenceTemplateRepository();
        const emailSequenceEnrollmentRepository = new PrismaEmailSequenceEnrollmentRepository();
        const emailSequenceDeliveryRepository = new PrismaEmailSequenceDeliveryRepository();
        const onboardingMetricDefinitionRepository = new PrismaOnboardingMetricDefinitionRepository();
        const onboardingMetricResultRepository = new PrismaOnboardingMetricResultRepository();
        const userSessionRepository = createUserSessionRepository();
        const membershipService = getMembershipService();

        await startOffboarding(
            {
                offboardingRepository,
                employeeProfileRepository,
                checklistTemplateRepository,
                checklistInstanceRepository,
                provisioningTaskRepository,
                workflowTemplateRepository,
                workflowRunRepository,
                emailSequenceTemplateRepository,
                emailSequenceEnrollmentRepository,
                emailSequenceDeliveryRepository,
                onboardingMetricDefinitionRepository,
                onboardingMetricResultRepository,
                userSessionRepository,
                membershipService,
            },
            {
                authorization: session.authorization,
                profileId: parsed.data.profileId,
                mode: parsed.data.mode,
                templateId: parsed.data.templateId,
                reason: parsed.data.reason,
            },
        );

        revalidatePath(EMPLOYEES_PATH);
        revalidatePath(`/hr/employees/${parsed.data.profileId}`);
        revalidatePath(OFFBOARDING_PATH);

        return { status: 'success', message: 'Offboarding started.' };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to start offboarding.',
        };
    }
}
