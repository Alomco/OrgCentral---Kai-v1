import { resolveBillingService } from '@/server/services/billing/billing-service.provider';
import { buildOnboardingServiceDependencies } from '@/server/repositories/providers/hr/onboarding-service-dependencies';
import { buildOnboardingAutomationRepositoryDependencies } from '@/server/repositories/providers/hr/onboarding-automation-repository-dependencies';
import { buildOnboardingWorkflowDependencies } from '@/server/repositories/providers/hr/onboarding-workflow-repository-dependencies';
import { buildEmailSequenceDependencies } from '@/server/repositories/providers/hr/onboarding-email-sequence-repository-dependencies';
import { buildOnboardingMetricsDependencies } from '@/server/repositories/providers/hr/onboarding-metrics-repository-dependencies';
import { buildPeopleServiceDependencies } from '@/server/repositories/providers/hr/people-service-dependencies';
import { buildMembershipRepositoryDependencies } from '@/server/repositories/providers/org/membership-service-dependencies';
import { buildOrganizationServiceDependencies } from '@/server/repositories/providers/org/organization-service-dependencies';
import { buildUserServiceDependencies } from '@/server/repositories/providers/org/user-service-dependencies';
import { buildDocumentTemplateDependencies } from '@/server/repositories/providers/records/document-template-repository-provider';
import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IOnboardingInvitationRepository } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { CompleteOnboardingInviteDependencies } from '@/server/use-cases/hr/onboarding/complete-onboarding-invite';

const { profileRepo: profileRepository, contractRepo: employmentContractRepository } = buildPeopleServiceDependencies();
const {
    checklistTemplateRepository,
    checklistInstanceRepository,
    onboardingInvitationRepository: invitationRepository,
} = buildOnboardingServiceDependencies();
const { organizationRepository } = buildOrganizationServiceDependencies();
const { userRepository } = buildUserServiceDependencies();
const { membershipRepository } = buildMembershipRepositoryDependencies();
const billingService = resolveBillingService() ?? undefined;
const { mentorAssignmentRepository, provisioningTaskRepository, documentTemplateAssignmentRepository } =
    buildOnboardingAutomationRepositoryDependencies();
const { workflowTemplateRepository, workflowRunRepository } = buildOnboardingWorkflowDependencies();
const { templateRepository: emailSequenceTemplateRepository, enrollmentRepository: emailSequenceEnrollmentRepository, deliveryRepository: emailSequenceDeliveryRepository } =
    buildEmailSequenceDependencies();
const { definitionRepository: onboardingMetricDefinitionRepository, resultRepository: onboardingMetricResultRepository } =
    buildOnboardingMetricsDependencies();
const { documentTemplateRepository } = buildDocumentTemplateDependencies();

export interface ResolvedOnboardingControllerDependencies {
    session: GetSessionDependencies;
    profileRepository: IEmployeeProfileRepository;
    invitationRepository: IOnboardingInvitationRepository;
    organizationRepository: IOrganizationRepository;
    userRepository: IUserRepository;
}

export type OnboardingControllerDependencies = Partial<ResolvedOnboardingControllerDependencies>;

export const defaultOnboardingControllerDependencies: ResolvedOnboardingControllerDependencies = {
    session: {},
    profileRepository,
    invitationRepository,
    organizationRepository,
    userRepository,
};

export function resolveOnboardingControllerDependencies(
    overrides?: OnboardingControllerDependencies,
): ResolvedOnboardingControllerDependencies {
    if (!overrides) {
        return defaultOnboardingControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultOnboardingControllerDependencies.session,
        profileRepository: overrides.profileRepository ?? defaultOnboardingControllerDependencies.profileRepository,
        invitationRepository: overrides.invitationRepository ?? defaultOnboardingControllerDependencies.invitationRepository,
        organizationRepository: overrides.organizationRepository ?? defaultOnboardingControllerDependencies.organizationRepository,
        userRepository: overrides.userRepository ?? defaultOnboardingControllerDependencies.userRepository,
    };
}

export function getChecklistInstanceRepository() {
    return checklistInstanceRepository;
}

export function getChecklistTemplateRepository() {
    return checklistTemplateRepository;
}

export function getOnboardingInvitationRepository() {
    return invitationRepository;
}

export function getCompleteOnboardingInviteDependencies(): CompleteOnboardingInviteDependencies {
    return {
        onboardingInvitationRepository: invitationRepository,
        organizationRepository,
        employeeProfileRepository: profileRepository,
        membershipRepository,
        billingService,
        employmentContractRepository,
        checklistTemplateRepository,
        checklistInstanceRepository,
        mentorAssignmentRepository,
        provisioningTaskRepository,
        workflowTemplateRepository,
        workflowRunRepository,
        emailSequenceTemplateRepository,
        emailSequenceEnrollmentRepository,
        emailSequenceDeliveryRepository,
        documentTemplateAssignmentRepository,
        documentTemplateRepository,
        onboardingMetricDefinitionRepository,
        onboardingMetricResultRepository,
    };
}
