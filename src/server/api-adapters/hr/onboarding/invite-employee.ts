import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { onboardingInviteSchema } from '@/server/types/hr-onboarding-schemas';
import { sendOnboardingInvite } from '@/server/use-cases/hr/onboarding/send-onboarding-invite';
import {
    getInvitationDeliveryFailureMessage,
    isInvitationDeliverySuccessful,
} from '@/server/use-cases/notifications/invitation-email.helpers';
import { sendInvitationEmail } from '@/server/use-cases/notifications/send-invitation-email';
import { getInvitationEmailDependencies } from '@/server/use-cases/notifications/invitation-email.provider';
import { buildInvitationRequestSecurityContext } from '@/server/use-cases/shared/request-metadata';
import { readJson } from '@/server/api-adapters/http/request-utils';
import {
    resolveOnboardingControllerDependencies,
    type OnboardingControllerDependencies,
} from '@/server/services/hr/onboarding/onboarding-controller-dependencies';

export interface InviteEmployeeControllerResult {
    success: true;
    token: string;
    emailDelivered?: boolean;
    invitationUrl?: string;
    message?: string;
}

export async function inviteEmployeeController(
    request: Request,
    dependencies?: OnboardingControllerDependencies,
): Promise<InviteEmployeeControllerResult> {
    const payload = onboardingInviteSchema.parse(await readJson(request));
    const resolved = resolveOnboardingControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: request.headers,
        requiredPermissions: { member: ['invite'] },
        auditSource: 'api:hr:onboarding:invite',
        action: 'invite',
        resourceType: 'hr.onboarding',
        resourceAttributes: {
            email: payload.email,
            employeeNumber: payload.employeeNumber,
        },
    });

    const requestContext = buildInvitationRequestSecurityContext({
        authorization,
        headers: request.headers,
        action: 'hr.onboarding.invite',
        targetEmail: payload.email,
    });

    const result = await sendOnboardingInvite(
        {
            profileRepository: resolved.profileRepository,
            invitationRepository: resolved.invitationRepository,
            organizationRepository: resolved.organizationRepository,
        },
        {
            authorization,
            email: payload.email,
            displayName: payload.displayName,
            employeeNumber: payload.employeeNumber,
            jobTitle: payload.jobTitle,
            employmentType: payload.employmentType,
            eligibleLeaveTypes: payload.eligibleLeaveTypes,
            onboardingTemplateId: payload.onboardingTemplateId,
            roles: payload.roles,
            request: requestContext,
        },
    );

    let emailDelivered = false;
    let invitationUrl: string | undefined;
    let message: string | undefined;

    try {
        const emailDependencies = getInvitationEmailDependencies();
        const emailResult = await sendInvitationEmail(emailDependencies, {
            authorization,
            invitationToken: result.token,
        });
        emailDelivered = isInvitationDeliverySuccessful(emailResult.delivery);
        invitationUrl = emailResult.invitationUrl;
        message = emailDelivered
            ? 'Invitation created. Email sent.'
            : `Invitation created, but email delivery failed. ${getInvitationDeliveryFailureMessage(emailResult.delivery)} Share the invite link with the employee.`;
    } catch {
        message = 'Invitation created, but email delivery failed (unexpected error). Share the invite link with the employee.';
    }

    return { success: true, token: result.token, emailDelivered, invitationUrl, message };
}
