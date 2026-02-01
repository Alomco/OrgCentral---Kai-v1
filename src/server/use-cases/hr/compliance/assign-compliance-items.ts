import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceAssignmentServiceContract } from '@/server/services/hr/compliance/compliance-assignment.service.provider';
import { assertNonEmpty, assertNonEmptyArray } from '@/server/use-cases/shared/validators';
import { invalidateComplianceItemsCache } from './shared/cache-helpers';
import { recordAuditEvent } from '@/server/logging/audit-logger';

export interface AssignComplianceItemsInput {
    authorization: RepositoryAuthorizationContext;
    templateId: string;
    templateItemIds: string[];
    userIds: string[];
}

export interface AssignComplianceItemsDependencies {
    assignmentService: ComplianceAssignmentServiceContract;
}

export async function assignComplianceItems(
    deps: AssignComplianceItemsDependencies,
    input: AssignComplianceItemsInput,
): Promise<void> {
    assertNonEmpty(input.templateId, 'templateId');
    assertNonEmptyArray(input.userIds, 'userIds');
    assertNonEmptyArray(input.templateItemIds, 'templateItemIds');

    await deps.assignmentService.assignCompliancePack({
        authorization: input.authorization,
        templateId: input.templateId,
        templateItemIds: input.templateItemIds,
        userIds: input.userIds,
    });

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: 'hr.compliance.assignment.created',
        resource: 'hr.compliance.assignment',
        resourceId: input.templateId,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        payload: {
            templateId: input.templateId,
            templateItemCount: input.templateItemIds.length,
            targetUserCount: input.userIds.length,
        },
    });

    await invalidateComplianceItemsCache(input.authorization);
}
