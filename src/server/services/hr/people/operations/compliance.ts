import {
    buildTelemetryMetadata,
    invalidateComplianceAssignmentCaches,
} from '../helpers/people-orchestration.helpers';
import type { AssignCompliancePackInput, OrchestrationAuthorization } from '../people-orchestration.types';
import type { PeopleOrchestrationRuntime } from '../people-orchestration.deps';

export async function assignCompliancePackOperation(
    runtime: PeopleOrchestrationRuntime,
    parsed: AssignCompliancePackInput,
): Promise<void> {
    const { authorization } = parsed as { authorization: OrchestrationAuthorization };
    await runtime.ensureOrgAccess(authorization);

    const metadata = buildTelemetryMetadata('compliance.assign', authorization, {
        targetCount: parsed.userIds.length,
        templateCount: parsed.templateItemIds.length,
        templateId: parsed.templateId,
    });

    await runtime.execute(authorization, 'hr.people.orchestration.compliance.assign', metadata, async () => {
        if (!runtime.deps.complianceAssignmentService) {
            throw new Error('Compliance assignment service is not configured.');
        }

        await runtime.deps.complianceAssignmentService.assignCompliancePack({
            authorization,
            templateId: parsed.templateId,
            userIds: parsed.userIds,
            templateItemIds: parsed.templateItemIds,
        });

        await invalidateComplianceAssignmentCaches(authorization);
    });
}
