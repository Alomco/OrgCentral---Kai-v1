import {
    buildTelemetryMetadata,
    invalidateEligibilityCaches,
} from '../helpers/people-orchestration.helpers';
import type { OrchestrationAuthorization, UpdateEligibilityInput } from '../people-orchestration.types';
import type { PeopleOrchestrationRuntime } from '../people-orchestration.deps';

export async function updateEligibilityOperation(
    runtime: PeopleOrchestrationRuntime,
    parsed: UpdateEligibilityInput,
): Promise<void> {
    const { authorization } = parsed as { authorization: OrchestrationAuthorization };
    await runtime.ensureOrgAccess(authorization);

    const metadata = buildTelemetryMetadata('eligibility.update', authorization, {
        leaveTypes: parsed.eligibleLeaveTypes.length,
        year: parsed.year,
    });

    await runtime.execute(authorization, 'hr.people.orchestration.eligibility.update', metadata, async () => {
        const profileResult = await runtime.deps.peopleService.getEmployeeProfile({
            authorization,
            payload: { profileId: parsed.profileId },
        });
        const employeeId = profileResult.profile?.employeeNumber;
        if (!employeeId) {
            throw new Error('Employee number is required to update leave eligibility.');
        }

        await runtime.deps.peopleService.updateEmployeeProfile({
            authorization,
            payload: {
                profileId: parsed.profileId,
                profileUpdates: { eligibleLeaveTypes: parsed.eligibleLeaveTypes },
            },
        });

        await runtime.deps.leaveService.ensureEmployeeBalances({
            authorization,
            employeeId,
            year: parsed.year,
            leaveTypes: parsed.eligibleLeaveTypes,
        });

        await invalidateEligibilityCaches(authorization);
    });
}
