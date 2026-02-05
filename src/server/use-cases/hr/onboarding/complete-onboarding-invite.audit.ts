import { recordAuditEvent } from '@/server/logging/audit-logger';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface OnboardingInviteAuditInput {
    authorization: RepositoryAuthorizationContext;
    organization: { id: string; dataResidency: DataResidencyZone; dataClassification: DataClassificationLevel };
    request?: { ipAddress?: string; userAgent?: string };
    membership: { alreadyMember: boolean };
    creation: { contractCreated?: boolean; checklistInstanceId?: string };
    automation: {
        mentorAssigned: boolean;
        workflowRunId?: string;
        emailSequenceEnrollmentId?: string;
        provisioningTaskIds: string[];
        documentAssignmentIds: string[];
        metricsRecorded: string[];
    };
}

export async function recordOnboardingInviteAcceptedAudit(
    input: OnboardingInviteAuditInput,
): Promise<void> {
    await recordAuditEvent({
        orgId: input.organization.id,
        userId: input.authorization.userId,
        eventType: 'AUTH',
        action: 'hr.onboarding.invitation.accepted',
        resource: 'hr.onboarding.invitation',
        resourceId: input.organization.id,
        residencyZone: input.organization.dataResidency,
        classification: input.organization.dataClassification,
        auditSource: input.authorization.auditSource,
        payload: {
            alreadyMember: input.membership.alreadyMember,
            contractCreated: Boolean(input.creation.contractCreated),
            checklistCreated: Boolean(input.creation.checklistInstanceId),
            mentorAssigned: input.automation.mentorAssigned,
            workflowRunId: input.automation.workflowRunId,
            emailSequenceEnrollmentId: input.automation.emailSequenceEnrollmentId,
            provisioningTaskCount: input.automation.provisioningTaskIds.length,
            documentAssignmentCount: input.automation.documentAssignmentIds.length,
            metricsRecorded: input.automation.metricsRecorded,
            ipAddress: input.request?.ipAddress,
            userAgent: input.request?.userAgent,
        },
    });
}
