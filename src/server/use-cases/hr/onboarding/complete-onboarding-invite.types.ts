import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { IOnboardingInvitationRepository } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { IMentorAssignmentRepository } from '@/server/repositories/contracts/hr/onboarding/mentor-assignment-repository-contract';
import type { IProvisioningTaskRepository } from '@/server/repositories/contracts/hr/onboarding/provisioning-task-repository-contract';
import type { IOnboardingWorkflowTemplateRepository, IOnboardingWorkflowRunRepository } from '@/server/repositories/contracts/hr/onboarding/workflow-template-repository-contract';
import type { IEmailSequenceTemplateRepository, IEmailSequenceEnrollmentRepository, IEmailSequenceDeliveryRepository } from '@/server/repositories/contracts/hr/onboarding/email-sequence-repository-contract';
import type { IDocumentTemplateAssignmentRepository } from '@/server/repositories/contracts/hr/onboarding/document-template-assignment-repository-contract';
import type { IDocumentTemplateRepository } from '@/server/repositories/contracts/records/document-template-repository-contract';
import type { IOnboardingMetricDefinitionRepository, IOnboardingMetricResultRepository } from '@/server/repositories/contracts/hr/onboarding/onboarding-metric-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { IMembershipRepository } from '@/server/repositories/contracts/org/membership';
import type { BillingServiceContract } from '@/server/services/billing/billing-service.provider';
import type { CreateEmployeeProfileTransactionRunner } from '@/server/use-cases/hr/people/create-employee-profile';

export interface CompleteOnboardingInviteInput {
    inviteToken: string;
    userId: string;
    actorEmail: string;
    request?: {
        ipAddress?: string;
        userAgent?: string;
    };
}

export interface CompleteOnboardingInviteDependencies {
    onboardingInvitationRepository: IOnboardingInvitationRepository;
    organizationRepository: IOrganizationRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
    membershipRepository: IMembershipRepository;
    billingService?: BillingServiceContract;
    employmentContractRepository?: IEmploymentContractRepository;
    checklistTemplateRepository?: IChecklistTemplateRepository;
    checklistInstanceRepository?: IChecklistInstanceRepository;
    transactionRunner?: CreateEmployeeProfileTransactionRunner;
    mentorAssignmentRepository: IMentorAssignmentRepository;
    provisioningTaskRepository: IProvisioningTaskRepository;
    workflowTemplateRepository: IOnboardingWorkflowTemplateRepository;
    workflowRunRepository: IOnboardingWorkflowRunRepository;
    emailSequenceTemplateRepository: IEmailSequenceTemplateRepository;
    emailSequenceEnrollmentRepository: IEmailSequenceEnrollmentRepository;
    emailSequenceDeliveryRepository: IEmailSequenceDeliveryRepository;
    documentTemplateAssignmentRepository: IDocumentTemplateAssignmentRepository;
    documentTemplateRepository: IDocumentTemplateRepository;
    onboardingMetricDefinitionRepository: IOnboardingMetricDefinitionRepository;
    onboardingMetricResultRepository: IOnboardingMetricResultRepository;
}

export interface CompleteOnboardingInviteResult {
    success: true;
    organizationId: string;
    organizationName: string;
    employeeNumber: string;
    profileId: string;
    roles: string[];
    alreadyMember: boolean;
    contractCreated?: boolean;
    checklistInstanceId?: string;
    workflowRunId?: string;
    emailSequenceEnrollmentId?: string;
    provisioningTaskIds?: string[];
    documentAssignmentIds?: string[];
    metricsRecorded?: string[];
}
