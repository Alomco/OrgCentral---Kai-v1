import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { InvitationOnboardingData } from '@/server/invitations/onboarding-data';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IMentorAssignmentRepository } from '@/server/repositories/contracts/hr/onboarding/mentor-assignment-repository-contract';
import type { IProvisioningTaskRepository } from '@/server/repositories/contracts/hr/onboarding/provisioning-task-repository-contract';
import type { IOnboardingWorkflowTemplateRepository, IOnboardingWorkflowRunRepository } from '@/server/repositories/contracts/hr/onboarding/workflow-template-repository-contract';
import type { IEmailSequenceTemplateRepository, IEmailSequenceEnrollmentRepository, IEmailSequenceDeliveryRepository } from '@/server/repositories/contracts/hr/onboarding/email-sequence-repository-contract';
import type { IDocumentTemplateAssignmentRepository } from '@/server/repositories/contracts/hr/onboarding/document-template-assignment-repository-contract';
import type { IDocumentTemplateRepository } from '@/server/repositories/contracts/records/document-template-repository-contract';
import type { IOnboardingMetricDefinitionRepository, IOnboardingMetricResultRepository } from '@/server/repositories/contracts/hr/onboarding/onboarding-metric-repository-contract';
import type { ProvisioningTaskType } from '@/server/types/hr/provisioning-tasks';
import { ensureMetricDefinition, normalizeSequenceSteps } from './apply-onboarding-automation.helpers';
import { assertOrgAccessWithAbac } from '@/server/security/guards';

export interface ApplyOnboardingAutomationDependencies {
    employeeProfileRepository: IEmployeeProfileRepository;
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
    now?: () => Date;
}

export interface ApplyOnboardingAutomationInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
    invitationToken: string;
    targetEmail: string;
    payload: InvitationOnboardingData;
}

export interface ApplyOnboardingAutomationResult {
    mentorAssigned: boolean;
    workflowRunId?: string;
    emailSequenceEnrollmentId?: string;
    provisioningTaskIds: string[];
    documentAssignmentIds: string[];
    metricsRecorded: string[];
}

const DEFAULT_PROVISIONING_TASKS: ProvisioningTaskType[] = ['ACCOUNT', 'EQUIPMENT', 'ACCESS'];
const ONBOARDING_INVITE_SOURCE = 'onboarding-invite';

export async function applyOnboardingAutomation(
    deps: ApplyOnboardingAutomationDependencies,
    input: ApplyOnboardingAutomationInput,
): Promise<ApplyOnboardingAutomationResult> {
    await assertOrgAccessWithAbac({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        auditSource: input.authorization.auditSource,
        correlationId: input.authorization.correlationId,
        action: 'hr.onboarding.automation.apply',
        resourceType: 'hr.onboarding',
        resourceAttributes: { employeeId: input.employeeId, userId: input.authorization.userId },
    });

    const now = deps.now ?? (() => new Date());
    const provisioningTaskIds: string[] = [];
    const documentAssignmentIds: string[] = [];
    const metricsRecorded: string[] = [];

    let mentorAssigned = false;
    if (input.payload.mentorEmployeeNumber) {
        const mentorProfile = await deps.employeeProfileRepository.findByEmployeeNumber(
            input.authorization.orgId,
            input.payload.mentorEmployeeNumber,
        );
        if (mentorProfile?.userId) {
            await deps.mentorAssignmentRepository.createAssignment({
                orgId: input.authorization.orgId,
                employeeId: input.employeeId,
                mentorOrgId: input.authorization.orgId,
                mentorUserId: mentorProfile.userId,
                reason: 'onboarding',
                metadata: { source: ONBOARDING_INVITE_SOURCE },
                dataClassification: input.authorization.dataClassification,
                residencyTag: input.authorization.dataResidency,
                auditSource: input.authorization.auditSource,
                correlationId: input.authorization.correlationId,
                createdBy: input.authorization.userId,
            });
            mentorAssigned = true;
        }
    }

    let workflowRunId: string | undefined;
    if (input.payload.workflowTemplateId) {
        const template = await deps.workflowTemplateRepository.getTemplate(
            input.authorization.orgId,
            input.payload.workflowTemplateId,
        );
        if (template) {
            const run = await deps.workflowRunRepository.createRun({
                orgId: input.authorization.orgId,
                employeeId: input.employeeId,
                templateId: template.id,
                metadata: { source: ONBOARDING_INVITE_SOURCE, templateVersion: template.version },
                dataClassification: input.authorization.dataClassification,
                residencyTag: input.authorization.dataResidency,
                auditSource: input.authorization.auditSource,
                correlationId: input.authorization.correlationId,
                createdBy: input.authorization.userId,
            });
            workflowRunId = run.id;
        }
    }

    let emailSequenceEnrollmentId: string | undefined;
    if (input.payload.emailSequenceTemplateId) {
        const template = await deps.emailSequenceTemplateRepository.getTemplate(
            input.authorization.orgId,
            input.payload.emailSequenceTemplateId,
        );
        if (template) {
            const enrollment = await deps.emailSequenceEnrollmentRepository.createEnrollment({
                orgId: input.authorization.orgId,
                templateId: template.id,
                employeeId: input.employeeId,
                invitationToken: input.invitationToken,
                targetEmail: input.targetEmail,
                startedAt: now(),
                metadata: { source: ONBOARDING_INVITE_SOURCE },
                dataClassification: input.authorization.dataClassification,
                residencyTag: input.authorization.dataResidency,
                auditSource: input.authorization.auditSource,
                correlationId: input.authorization.correlationId,
                createdBy: input.authorization.userId,
            });
            emailSequenceEnrollmentId = enrollment.id;

            const steps = normalizeSequenceSteps(template.steps);
            for (const step of steps) {
                await deps.emailSequenceDeliveryRepository.createDelivery({
                    orgId: input.authorization.orgId,
                    enrollmentId: enrollment.id,
                    stepKey: step.key,
                    scheduledAt: step.scheduledAt,
                    metadata: step.metadata,
                    dataClassification: input.authorization.dataClassification,
                    residencyTag: input.authorization.dataResidency,
                    auditSource: input.authorization.auditSource,
                    correlationId: input.authorization.correlationId,
                    createdBy: input.authorization.userId,
                });
            }
        }
    }

    const provisioningTypes = (input.payload.provisioningTaskTypes ?? []).filter((value) => value.length > 0);
    const taskTypes = provisioningTypes.length > 0 ? provisioningTypes : DEFAULT_PROVISIONING_TASKS;

    for (const taskType of taskTypes) {
        const task = await deps.provisioningTaskRepository.createTask({
            orgId: input.authorization.orgId,
            employeeId: input.employeeId,
            requestedByUserId: input.authorization.userId,
            taskType: taskType as ProvisioningTaskType,
            instructions: 'Provision onboarding resources',
            metadata: { source: ONBOARDING_INVITE_SOURCE },
            dataClassification: input.authorization.dataClassification,
            residencyTag: input.authorization.dataResidency,
            auditSource: input.authorization.auditSource,
            correlationId: input.authorization.correlationId,
            createdBy: input.authorization.userId,
        });
        provisioningTaskIds.push(task.id);
    }

    for (const templateId of input.payload.documentTemplateIds ?? []) {
        const template = await deps.documentTemplateRepository.getTemplate(
            input.authorization.orgId,
            templateId,
        );
        if (!template) {
            continue;
        }
        const assignment = await deps.documentTemplateAssignmentRepository.createAssignment({
            orgId: input.authorization.orgId,
            employeeId: input.employeeId,
            templateId: template.id,
            status: 'PENDING',
            metadata: { source: ONBOARDING_INVITE_SOURCE },
            dataClassification: input.authorization.dataClassification,
            residencyTag: input.authorization.dataResidency,
            auditSource: input.authorization.auditSource,
            correlationId: input.authorization.correlationId,
            createdBy: input.authorization.userId,
        });
        documentAssignmentIds.push(assignment.id);
    }

    const metricDefinition = await ensureMetricDefinition(deps, input.authorization, 'onboarding.invite.accepted', 'Invite accepted');
    if (metricDefinition) {
        await deps.onboardingMetricResultRepository.createResult({
            orgId: input.authorization.orgId,
            employeeId: input.employeeId,
            metricId: metricDefinition.id,
            value: 1,
            valueText: 'accepted',
            source: 'SYSTEM',
            measuredAt: now(),
            metadata: { source: ONBOARDING_INVITE_SOURCE },
            dataClassification: input.authorization.dataClassification,
            residencyTag: input.authorization.dataResidency,
            auditSource: input.authorization.auditSource,
            correlationId: input.authorization.correlationId,
            createdBy: input.authorization.userId,
        });
        metricsRecorded.push(metricDefinition.key);
    }

    return {
        mentorAssigned,
        workflowRunId,
        emailSequenceEnrollmentId,
        provisioningTaskIds,
        documentAssignmentIds,
        metricsRecorded,
    };
}

